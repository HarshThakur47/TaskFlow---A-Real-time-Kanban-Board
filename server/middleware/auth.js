const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const boardAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const Board = require('../models/Board');
    
    console.log('BoardAccess middleware - Board ID:', id);
    console.log('BoardAccess middleware - User ID:', req.user._id);
    
    const board = await Board.findById(id);
    
    console.log('BoardAccess middleware - Board found:', board ? 'Yes' : 'No');
    
    if (!board) {
      console.log('BoardAccess middleware - Board not found');
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user is owner or member
    const isOwner = board.owner.toString() === req.user._id.toString();
    const isMember = board.members.some(member => member.toString() === req.user._id.toString());
    
    console.log('BoardAccess middleware - Is owner:', isOwner);
    console.log('BoardAccess middleware - Is member:', isMember);
    
    if (!isOwner && !isMember) {
      console.log('BoardAccess middleware - Access denied');
      return res.status(403).json({ message: 'Access denied' });
    }

    req.board = board;
    next();
  } catch (error) {
    console.error('Board access middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { auth, boardAccess };
