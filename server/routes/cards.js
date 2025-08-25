const express = require('express');
const { body, validationResult } = require('express-validator');
const Card = require('../models/Card');
const List = require('../models/List');
const { auth, boardAccess } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// @route   POST /api/cards
// @desc    Create a new card
// @access  Private
router.post('/', [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('listId')
    .isMongoId()
    .withMessage('Valid list ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, listId, boardId } = req.body;

    // Verify list exists and user has access to the board
    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Check board access
    const Board = require('../models/Board');
    const board = await Board.findById(list.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const isOwner = board.owner.toString() === req.user._id.toString();
    const isMember = board.members.some(member => member.toString() === req.user._id.toString());
    
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get the highest position in the list
    const lastCard = await Card.findOne({ list: listId })
      .sort({ position: -1 });
    const position = lastCard ? lastCard.position + 1 : 0;

    const card = new Card({
      title,
      description: description || '',
      list: listId,
      board: list.board,
      position
    });

    await card.save();

    // Add card to list
    list.cards.push(card._id);
    await list.save();

    // Populate the card with necessary data
    await card.populate([
      { path: 'assignees', select: 'username avatar' },
      { path: 'comments.user', select: 'username avatar' }
    ]);

    res.status(201).json(card);
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/cards/:id
// @desc    Update a card
// @access  Private
router.put('/:id', [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, dueDate, assignees, labels } = req.body;
    const updateFields = {};

    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (dueDate !== undefined) updateFields.dueDate = dueDate;
    if (assignees !== undefined) updateFields.assignees = assignees;
    if (labels !== undefined) updateFields.labels = labels;

    const card = await Card.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    ).populate([
      { path: 'assignees', select: 'username avatar' },
      { path: 'comments.user', select: 'username avatar' }
    ]);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check board access
    const Board = require('../models/Board');
    const board = await Board.findById(card.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const isOwner = board.owner.toString() === req.user._id.toString();
    const isMember = board.members.some(member => member.toString() === req.user._id.toString());
    
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(card);
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/cards/:id
// @desc    Delete a card
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check board access
    const Board = require('../models/Board');
    const board = await Board.findById(card.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const isOwner = board.owner.toString() === req.user._id.toString();
    const isMember = board.members.some(member => member.toString() === req.user._id.toString());
    
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove card from list
    await List.findByIdAndUpdate(card.list, {
      $pull: { cards: card._id }
    });

    // Delete the card
    await Card.findByIdAndDelete(req.params.id);

    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/cards/:id/comments
// @desc    Add a comment to a card
// @access  Private
router.post('/:id/comments', [
  body('text')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text } = req.body;

    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check board access
    const Board = require('../models/Board');
    const board = await Board.findById(card.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const isOwner = board.owner.toString() === req.user._id.toString();
    const isMember = board.members.some(member => member.toString() === req.user._id.toString());
    
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Add comment
    card.comments.push({
      user: req.user._id,
      text
    });

    await card.save();

    // Populate the updated card
    await card.populate([
      { path: 'assignees', select: 'username avatar' },
      { path: 'comments.user', select: 'username avatar' }
    ]);

    res.json(card);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/cards/move
// @desc    Move a card (drag and drop)
// @access  Private
router.put('/move', [
  body('cardId')
    .isMongoId()
    .withMessage('Valid card ID is required'),
  body('sourceListId')
    .isMongoId()
    .withMessage('Valid source list ID is required'),
  body('destinationListId')
    .isMongoId()
    .withMessage('Valid destination list ID is required'),
  body('newPosition')
    .isInt({ min: 0 })
    .withMessage('Valid position is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { cardId, sourceListId, destinationListId, newPosition } = req.body;

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check board access
    const Board = require('../models/Board');
    const board = await Board.findById(card.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const isOwner = board.owner.toString() === req.user._id.toString();
    const isMember = board.members.some(member => member.toString() === req.user._id.toString());
    
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
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
    const updatedBoard = await Board.findById(card.board)
      .populate('owner', 'username avatar')
      .populate('members', 'username avatar');

    const updatedLists = await List.find({ board: card.board })
      .populate({
        path: 'cards',
        populate: [
          { path: 'assignees', select: 'username avatar' },
          { path: 'comments.user', select: 'username avatar' }
        ]
      })
      .sort({ position: 1 });

    res.json({
      board: updatedBoard,
      lists: updatedLists
    });
  } catch (error) {
    console.error('Move card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
