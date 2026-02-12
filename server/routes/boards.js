const express = require('express');
const { body, validationResult } = require('express-validator');
const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');
const User = require('../models/User');
const { auth, boardAccess } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Helper function for broadcasting
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

// @route   POST /api/boards
// @desc    Create a new board
router.post('/', [
  body('title').trim().isLength({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const { title, description, background } = req.body;
    const board = new Board({
      title,
      description: description || '',
      background: background || '#0079bf',
      owner: req.user._id
    });
    await board.save();
    
    // Add owner as a member implicitly for easier querying? 
    // Usually owner is separate, but your logic seems to rely on 'owner' field.
    
    const populatedBoard = await Board.findById(board._id)
      .populate('owner', 'username avatar')
      .populate('members', 'username avatar');

    res.status(201).json(populatedBoard);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/boards
// @desc    Get all boards
router.get('/', async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    })
    .populate('owner', 'username avatar')
    .populate('members', 'username avatar')
    .sort({ updatedAt: -1 });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/boards/:id
// @desc    Get single board
router.get('/:id', boardAccess, async (req, res) => {
  try {
    const { board, lists } = await getBoardData(req.params.id);
    res.json({ board, lists });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/boards/:id
// @desc    Update a board
router.put('/:id', boardAccess, async (req, res) => {
  try {
    const { title, description, background } = req.body;
    const board = await Board.findByIdAndUpdate(
      req.params.id,
      { title, description, background },
      { new: true }
    ).populate('owner', 'username avatar').populate('members', 'username avatar');

    // Broadcast
    const io = req.app.get('io');
    if (io) {
       // We only need board info for this update, but let's send full data to be safe
       const fullData = await getBoardData(req.params.id);
       io.to(req.params.id).emit('board:update', { ...fullData, action: 'board:updated' });
    }

    res.json(board);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/boards/:id
// @desc    Delete a board
router.delete('/:id', boardAccess, async (req, res) => {
  try {
    if (req.board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can delete' });
    }
    await Card.deleteMany({ board: req.params.id });
    await List.deleteMany({ board: req.params.id });
    await Board.findByIdAndDelete(req.params.id);
    
    // Optional: Emit a 'board:deleted' event if you want to redirect users currently on the page
    
    res.json({ message: 'Board deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/boards/:id/lists
// @desc    Add a new list
router.post('/:id/lists', boardAccess, [
  body('title').trim().isLength({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const { title } = req.body;
    const lastList = await List.findOne({ board: req.params.id }).sort({ position: -1 });
    const position = lastList ? lastList.position + 1 : 0;

    const list = new List({ title, board: req.params.id, position });
    await list.save();

    // --- BROADCAST THE CHANGE ---
    const io = req.app.get('io');
    if (io) {
      const { board, lists } = await getBoardData(req.params.id);
      io.to(req.params.id).emit('board:update', {
        board,
        lists,
        action: 'list:created'
      });
    }

    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/boards/:id/members
// @desc    Add a new member
router.post('/:id/members', boardAccess, [
  body('email').isEmail()
], async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (req.board.members.includes(user._id)) {
      return res.status(400).json({ message: 'User already a member' });
    }

    req.board.members.push(user._id);
    await req.board.save();

    const updatedBoard = await Board.findById(req.params.id)
      .populate('owner', 'username avatar')
      .populate('members', 'username avatar');

    // --- BROADCAST THE CHANGE ---
    const io = req.app.get('io');
    if (io) {
      const fullData = await getBoardData(req.params.id);
      io.to(req.params.id).emit('board:update', {
        ...fullData,
        action: 'member:added'
      });
    }

    res.json(updatedBoard);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;