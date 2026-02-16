const express = require('express');
const { body, validationResult } = require('express-validator');
const Card = require('../models/Card');
const List = require('../models/List');
const Board = require('../models/Board');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Helper function to fetch board data for broadcast
const getBoardData = async (boardId) => {
  const board = await Board.findById(boardId)
    .populate('owner', 'username avatar')
    .populate('members', 'username avatar');

  const lists = await List.find({ board: boardId })
    .populate({
      path: 'cards',
      populate: [
        { path: 'assignees', select: 'username avatar' },
        { path: 'comments.user', select: 'username avatar' }
      ]
    })
    .sort({ position: 1 });

  return { board, lists };
};

// ============================================================================
// SPECIFIC ROUTES (MUST BE DEFINED BEFORE GENERIC /:id ROUTES)
// ============================================================================

// @route   PUT /api/cards/move
// @desc    Move a card (Drag & Drop)
router.put('/move', [
  body('cardId').isMongoId(),
  body('sourceListId').isMongoId(),
  body('destinationListId').isMongoId(),
  body('newPosition').isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { cardId, sourceListId, destinationListId, newPosition } = req.body;

    const card = await Card.findById(cardId);
    if (!card) return res.status(404).json({ message: 'Card not found' });

    const board = await Board.findById(card.board);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const isOwner = board.owner.toString() === req.user._id.toString();
    const isMember = board.members.some(m => m.toString() === req.user._id.toString());
    if (!isOwner && !isMember) return res.status(403).json({ message: 'Access denied' });

    const oldListId = card.list; 
    const oldPosition = card.position;

    // 1. Update the card itself
    card.list = destinationListId;
    card.position = newPosition;
    await card.save();

    // 2. Remove from Source List (Shift others up)
    if (sourceListId === destinationListId) {
      // Moving within same list
      if (oldPosition < newPosition) {
        // Moved down: Shift items between old and new UP (decrement)
        await Card.updateMany(
          { 
            list: sourceListId, 
            position: { $gt: oldPosition, $lte: newPosition }, 
            _id: { $ne: cardId } 
          },
          { $inc: { position: -1 } }
        );
      } else if (oldPosition > newPosition) {
        // Moved up: Shift items between new and old DOWN (increment)
        await Card.updateMany(
          { 
            list: sourceListId, 
            position: { $gte: newPosition, $lt: oldPosition }, 
            _id: { $ne: cardId } 
          },
          { $inc: { position: 1 } }
        );
      }
    } else {
      // Moving to different list
      
      // A. Fix Source List: Shift items below the old position UP
      await Card.updateMany(
        { 
          list: sourceListId, 
          position: { $gt: oldPosition } 
        },
        { $inc: { position: -1 } }
      );

      // B. Fix Destination List: Shift items at/below new position DOWN
      await Card.updateMany(
        { 
          list: destinationListId, 
          position: { $gte: newPosition }, 
          _id: { $ne: cardId } 
        },
        { $inc: { position: 1 } }
      );
      
      // Update List Arrays
      await List.findByIdAndUpdate(sourceListId, { $pull: { cards: cardId } });
      await List.findByIdAndUpdate(destinationListId, { $push: { cards: cardId } });
    }

    // Broadcast
    const io = req.app.get('io');
    if (io) {
      const { board: b, lists: l } = await getBoardData(board._id);
      io.to(board._id.toString()).emit('board:update', { board: b, lists: l, action: 'card:moved' });
      res.json({ board: b, lists: l });
    } else {
      const { board: b, lists: l } = await getBoardData(board._id);
      res.json({ board: b, lists: l });
    }

  } catch (error) {
    console.error('Move card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================================================
// GENERIC ROUTES (DEFINED AFTER)
// ============================================================================

// @route   POST /api/cards
// @desc    Create a new card
router.post('/', [
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('listId').isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, description, listId } = req.body;

    const list = await List.findById(listId);
    if (!list) return res.status(404).json({ message: 'List not found' });

    const board = await Board.findById(list.board);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const isOwner = board.owner.toString() === req.user._id.toString();
    const isMember = board.members.some(m => m.toString() === req.user._id.toString());
    if (!isOwner && !isMember) return res.status(403).json({ message: 'Access denied' });

    const lastCard = await Card.findOne({ list: listId }).sort({ position: -1 });
    const position = lastCard ? lastCard.position + 1 : 0;

    const card = new Card({
      title,
      description: description || '',
      list: listId,
      board: list.board,
      position
    });

    await card.save();
    
    list.cards.push(card._id);
    await list.save();

    const io = req.app.get('io');
    if (io) {
      const { board: b, lists: l } = await getBoardData(board._id);
      io.to(board._id.toString()).emit('board:update', { board: b, lists: l, action: 'card:created' });
    }

    res.status(201).json(card);
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/cards/:id
// @desc    Update a card
router.put('/:id', [
  body('title').optional().trim().isLength({ min: 1, max: 200 })
], async (req, res) => {
  try {
    const { title, description, dueDate, assignees, labels } = req.body;
    
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ message: 'Card not found' });

    const board = await Board.findById(card.board);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const isOwner = board.owner.toString() === req.user._id.toString();
    const isMember = board.members.some(m => m.toString() === req.user._id.toString());
    if (!isOwner && !isMember) return res.status(403).json({ message: 'Access denied' });

    if (title !== undefined) card.title = title;
    if (description !== undefined) card.description = description;
    if (dueDate !== undefined) card.dueDate = dueDate;
    if (assignees !== undefined) card.assignees = assignees;
    if (labels !== undefined) card.labels = labels;

    await card.save();

    const io = req.app.get('io');
    if (io) {
      const { board: b, lists: l } = await getBoardData(board._id);
      io.to(board._id.toString()).emit('board:update', { board: b, lists: l, action: 'card:updated' });
    }

    res.json(card);
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/cards/:id
// @desc    Delete a card
router.delete('/:id', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ message: 'Card not found' });

    const board = await Board.findById(card.board);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const isOwner = board.owner.toString() === req.user._id.toString();
    const isMember = board.members.some(m => m.toString() === req.user._id.toString());
    if (!isOwner && !isMember) return res.status(403).json({ message: 'Access denied' });

    await List.findByIdAndUpdate(card.list, { $pull: { cards: card._id } });
    await Card.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    if (io) {
      const { board: b, lists: l } = await getBoardData(board._id);
      io.to(board._id.toString()).emit('board:update', { board: b, lists: l, action: 'card:deleted' });
    }

    res.json({ message: 'Card deleted' });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/cards/:id/comments
// @desc    Add comment
router.post('/:id/comments', [
  body('text').trim().isLength({ min: 1, max: 1000 })
], async (req, res) => {
  try {
    const { text } = req.body;
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ message: 'Card not found' });

    const board = await Board.findById(card.board);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const isOwner = board.owner.toString() === req.user._id.toString();
    const isMember = board.members.some(m => m.toString() === req.user._id.toString());
    if (!isOwner && !isMember) return res.status(403).json({ message: 'Access denied' });

    card.comments.push({ user: req.user._id, text });
    await card.save();

    // --- KEY FIX: Populate the user details so the frontend has them immediately ---
    await card.populate({
      path: 'comments.user',
      select: 'username avatar'
    });

    const io = req.app.get('io');
    if (io) {
      const { board: b, lists: l } = await getBoardData(board._id);
      io.to(board._id.toString()).emit('board:update', { board: b, lists: l, action: 'comment:added' });
    }

    res.json(card);
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;