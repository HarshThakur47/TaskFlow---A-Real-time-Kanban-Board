const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './config.env' });

// Import routes
const authRoutes = require('./routes/auth');
const boardRoutes = require('./routes/boards');
const cardRoutes = require('./routes/cards');
const listRoutes = require('./routes/lists');

// Import models
const User = require('./models/User');
const Board = require('./models/Board');
const List = require('./models/List');
const Card = require('./models/Card');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-frontend-domain.vercel.app'] 
      : ['http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

app.set('io', io);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/lists', listRoutes);

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return next(new Error('Authentication error'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.username}`);

  // Join board room
  socket.on('join-board', async (boardId) => {
    try {
      // Verify user has access to the board
      const board = await Board.findById(boardId);
      if (!board) {
        socket.emit('error', { message: 'Board not found' });
        return;
      }

      const isOwner = board.owner.toString() === socket.user._id.toString();
      const isMember = board.members.some(member => member.toString() === socket.user._id.toString());
      
      if (!isOwner && !isMember) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      socket.join(boardId);
      socket.currentBoard = boardId;
      console.log(`${socket.user.username} joined board: ${boardId}`);
    } catch (error) {
      console.error('Join board error:', error);
      socket.emit('error', { message: 'Server error' });
    }
  });

  // Handle card movement
  socket.on('card:move', async (data) => {
    try {
      const { cardId, sourceListId, destinationListId, newPosition } = data;
      
      if (!socket.currentBoard) {
        socket.emit('error', { message: 'Not in a board' });
        return;
      }

      const card = await Card.findById(cardId);
      if (!card || card.board.toString() !== socket.currentBoard) {
        socket.emit('error', { message: 'Invalid card' });
        return;
      }

      // Update card position and list
      card.list = destinationListId;
      card.position = newPosition;
      await card.save();

      // Update positions of other cards in source list
      if (sourceListId !== destinationListId) {
        await Card.updateMany(
          { 
            list: sourceListId, 
            position: { $gt: card.position },
            _id: { $ne: cardId }
          },
          { $inc: { position: -1 } }
        );
      }

      // Update positions of other cards in destination list
      await Card.updateMany(
        { 
          list: destinationListId, 
          position: { $gte: newPosition },
          _id: { $ne: cardId }
        },
        { $inc: { position: 1 } }
      );

      // Update list cards arrays
      if (sourceListId !== destinationListId) {
        await List.findByIdAndUpdate(sourceListId, {
          $pull: { cards: cardId }
        });
        
        await List.findByIdAndUpdate(destinationListId, {
          $push: { cards: cardId }
        });
      }

      // Get updated board data
      const updatedBoard = await Board.findById(socket.currentBoard)
        .populate('owner', 'username avatar')
        .populate('members', 'username avatar');

      const updatedLists = await List.find({ board: socket.currentBoard })
        .populate({
          path: 'cards',
          populate: [
            { path: 'assignees', select: 'username avatar' },
            { path: 'comments.user', select: 'username avatar' }
          ]
        })
        .sort({ position: 1 });

      // Broadcast to all users in the board room (except sender)
      socket.to(socket.currentBoard).emit('board:update', {
        board: updatedBoard,
        lists: updatedLists,
        action: 'card:moved',
        userId: socket.user._id
      });

    } catch (error) {
      console.error('Card move error:', error);
      socket.emit('error', { message: 'Server error' });
    }
  });

  // Handle list creation
  socket.on('list:create', async (data) => {
    try {
      const { title } = data;
      
      if (!socket.currentBoard) {
        socket.emit('error', { message: 'Not in a board' });
        return;
      }

      // Get the highest position
      const lastList = await List.findOne({ board: socket.currentBoard })
        .sort({ position: -1 });
      const position = lastList ? lastList.position + 1 : 0;

      const list = new List({
        title,
        board: socket.currentBoard,
        position
      });

      await list.save();

      // Get updated board data
      const updatedBoard = await Board.findById(socket.currentBoard)
        .populate('owner', 'username avatar')
        .populate('members', 'username avatar');

      const updatedLists = await List.find({ board: socket.currentBoard })
        .populate({
          path: 'cards',
          populate: [
            { path: 'assignees', select: 'username avatar' },
            { path: 'comments.user', select: 'username avatar' }
          ]
        })
        .sort({ position: 1 });

      // Broadcast to all users in the board room
      io.to(socket.currentBoard).emit('board:update', {
        board: updatedBoard,
        lists: updatedLists,
        action: 'list:created',
        userId: socket.user._id
      });

    } catch (error) {
      console.error('List create error:', error);
      socket.emit('error', { message: 'Server error' });
    }
  });

  // Handle card creation
  socket.on('card:create', async (data) => {
    try {
      const { title, description, listId } = data;
      
      if (!socket.currentBoard) {
        socket.emit('error', { message: 'Not in a board' });
        return;
      }

      const list = await List.findById(listId);
      if (!list || list.board.toString() !== socket.currentBoard) {
        socket.emit('error', { message: 'Invalid list' });
        return;
      }

      // Get the highest position in the list
      const lastCard = await Card.findOne({ list: listId })
        .sort({ position: -1 });
      const position = lastCard ? lastCard.position + 1 : 0;

      const card = new Card({
        title,
        description: description || '',
        list: listId,
        board: socket.currentBoard,
        position
      });

      await card.save();

      // Add card to list
      list.cards.push(card._id);
      await list.save();

      // Populate the card
      await card.populate([
        { path: 'assignees', select: 'username avatar' },
        { path: 'comments.user', select: 'username avatar' }
      ]);

      // Get updated board data
      const updatedBoard = await Board.findById(socket.currentBoard)
        .populate('owner', 'username avatar')
        .populate('members', 'username avatar');

      const updatedLists = await List.find({ board: socket.currentBoard })
        .populate({
          path: 'cards',
          populate: [
            { path: 'assignees', select: 'username avatar' },
            { path: 'comments.user', select: 'username avatar' }
          ]
        })
        .sort({ position: 1 });

      // Broadcast to all users in the board room
      io.to(socket.currentBoard).emit('board:update', {
        board: updatedBoard,
        lists: updatedLists,
        action: 'card:created',
        userId: socket.user._id
      });

    } catch (error) {
      console.error('Card create error:', error);
      socket.emit('error', { message: 'Server error' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.username}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
