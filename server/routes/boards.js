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

// @route   POST /api/boards
// @desc    Create a new board
// @access  Private
router.post('/', [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, background } = req.body;

    const board = new Board({
      title,
      description: description || '',
      background: background || '#0079bf',
      owner: req.user._id
    });

    await board.save();

    // Populate the board with owner and members data
    const populatedBoard = await Board.findById(board._id)
      .populate('owner', 'username avatar')
      .populate('members', 'username avatar');

    res.status(201).json(populatedBoard);
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/boards
// @desc    Get all boards for the logged-in user
// @access  Private
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
    console.error('Get boards error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/boards/:id
// @desc    Get a single board with all lists and cards
// @access  Private
router.get('/:id', boardAccess, async (req, res) => {
  try {
    console.log('Fetching board with ID:', req.params.id);
    console.log('User ID:', req.user._id);
    
    const board = await Board.findById(req.params.id)
      .populate('owner', 'username avatar')
      .populate('members', 'username avatar');

    console.log('Found board:', board ? 'Yes' : 'No');

    const lists = await List.find({ board: req.params.id })
      .populate({
        path: 'cards',
        populate: [
          { path: 'assignees', select: 'username avatar' },
          { path: 'comments.user', select: 'username avatar' }
        ]
      })
      .sort({ position: 1 });

    console.log('Found lists count:', lists.length);

    res.json({
      board,
      lists
    });
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/boards/:id
// @desc    Update a board
// @access  Private
router.put('/:id', boardAccess, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, background } = req.body;
    const updateFields = {};

    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (background !== undefined) updateFields.background = background;

    const board = await Board.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    ).populate('owner', 'username avatar')
     .populate('members', 'username avatar');

    res.json(board);
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/boards/:id
// @desc    Delete a board
// @access  Private
router.delete('/:id', boardAccess, async (req, res) => {
  try {
    // Only owner can delete the board
    if (req.board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can delete this board' });
    }

    // Delete all cards in the board
    await Card.deleteMany({ board: req.params.id });
    
    // Delete all lists in the board
    await List.deleteMany({ board: req.params.id });
    
    // Delete the board
    await Board.findByIdAndDelete(req.params.id);

    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/boards/:id/lists
// @desc    Add a new list to a board
// @access  Private
router.post('/:id/lists', boardAccess, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title } = req.body;

    // Get the highest position
    const lastList = await List.findOne({ board: req.params.id })
      .sort({ position: -1 });
    const position = lastList ? lastList.position + 1 : 0;

    const list = new List({
      title,
      board: req.params.id,
      position
    });

    await list.save();

    res.status(201).json(list);
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/boards/:id/members
// @desc    Add a new member to a board
// @access  Private
router.post('/:id/members', boardAccess, [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a member
    if (req.board.members.includes(user._id)) {
      return res.status(400).json({ message: 'User is already a member of this board' });
    }

    // Add user to board members
    req.board.members.push(user._id);
    await req.board.save();

    const updatedBoard = await Board.findById(req.params.id)
      .populate('owner', 'username avatar')
      .populate('members', 'username avatar');

    res.json(updatedBoard);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
