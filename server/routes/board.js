import express from 'express';
import { authMiddleware } from './auth.js';
import Board from '../models/Board.js';

const router = express.Router();

// Get user's board
router.get('/', authMiddleware, async (req, res) => {
  try {
    let board = await Board.findOne({ user: req.user });
    
    // If not found for whatever reason, create it
    if (!board) {
      board = new Board({
        user: req.user,
        data: {
          tasks: {},
          columns: {
            "todo": { id: "todo", title: "To Do", taskIds: [] },
            "in-progress": { id: "in-progress", title: "In Progress", taskIds: [] },
            "completed": { id: "completed", title: "Done", taskIds: [] }
          },
          columnOrder: ["todo", "in-progress", "completed"]
        }
      });
      await board.save();
    }
    
    res.json(board.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user's board completely
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { boardData } = req.body;
    let board = await Board.findOne({ user: req.user });
    
    if (!board) {
       board = new Board({ user: req.user, data: boardData });
    } else {
       board.data = boardData;
    }
    
    await board.save();
    res.json(board.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete all user data (Reset feature)
router.delete('/reset', authMiddleware, async (req, res) => {
  try {
    let board = await Board.findOne({ user: req.user });
    if(board) {
       board.data = {
          tasks: {},
          columns: {
            "todo": { id: "todo", title: "To Do", taskIds: [] },
            "in-progress": { id: "in-progress", title: "In Progress", taskIds: [] },
            "completed": { id: "completed", title: "Done", taskIds: [] }
          },
          columnOrder: ["todo", "in-progress", "completed"]
       };
       await board.save();
       res.json(board.data);
    } else {
       res.status(404).json({ message: 'Board not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
