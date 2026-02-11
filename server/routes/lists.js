const express = require('express');
const List = require('../models/List');
const Card = require('../models/Card');
const Board = require('../models/Board');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// Helper function to fetch full board data for socket broadcast
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

// @route   PUT /api/lists/:id
// @desc    Update a list (title)
router.put('/:id', async (req, res) => {
  try {
    const { title } = req.body;
    const list = await List.findByIdAndUpdate(
      req.params.id,
      { title },
      { new: true }
    );
    
    // Broadcast update
    const io = req.app.get('io');
    const { board, lists } = await getBoardData(list.board);
    io.to(list.board.toString()).emit('board:update', {
      board,
      lists,
      action: 'list:updated'
    });

    res.json(list);
  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/lists/:id
// @desc    Delete a list and its cards
router.delete('/:id', async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const boardId = list.board.toString();

    // Delete all cards in the list
    await Card.deleteMany({ list: req.params.id });
    
    // Delete the list
    await List.findByIdAndDelete(req.params.id);

    // Broadcast update
    const io = req.app.get('io');
    const { board, lists } = await getBoardData(boardId);
    
    io.to(boardId).emit('board:update', {
      board,
      lists,
      action: 'list:deleted'
    });

    res.json({ message: 'List deleted successfully', listId: req.params.id });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;