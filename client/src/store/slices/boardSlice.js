import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// Async thunks
export const fetchBoards = createAsyncThunk(
  'board/fetchBoards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/boards`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch boards');
    }
  }
);

export const fetchBoard = createAsyncThunk(
  'board/fetchBoard',
  async (boardId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/boards/${boardId}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch board');
    }
  }
);

export const createBoard = createAsyncThunk(
  'board/createBoard',
  async (boardData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/boards`, boardData, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create board');
    }
  }
);

export const createList = createAsyncThunk(
  'board/createList',
  async ({ boardId, title }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/boards/${boardId}/lists`, { title }, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create list');
    }
  }
);

export const createCard = createAsyncThunk(
  'board/createCard',
  async (cardData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/cards`, cardData, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create card');
    }
  }
);

export const moveCard = createAsyncThunk(
  'board/moveCard',
  async (moveData, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/cards/move`, moveData, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to move card');
    }
  }
);

const initialState = {
  boards: [],
  currentBoard: null,
  currentLists: [],
  loading: false,
  error: null,
};

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBoard: (state) => {
      state.currentBoard = null;
      state.currentLists = [];
    },
    // Real-time updates from Socket.IO
    updateBoardFromSocket: (state, action) => {
      const { board, lists } = action.payload;
      state.currentBoard = board;
      state.currentLists = lists;
    },
    // Optimistic updates for drag and drop
    moveCardOptimistic: (state, action) => {
      const { cardId, sourceListId, destinationListId, newPosition } = action.payload;
      
      // Find the card in the source list
      const sourceList = state.currentLists.find(list => list._id === sourceListId);
      const destinationList = state.currentLists.find(list => list._id === destinationListId);
      
      if (sourceList && destinationList) {
        // Remove card from source list
        const cardIndex = sourceList.cards.findIndex(card => card._id === cardId);
        if (cardIndex !== -1) {
          const [card] = sourceList.cards.splice(cardIndex, 1);
          
          // Update card's list and position
          card.list = destinationListId;
          card.position = newPosition;
          
          // Insert card into destination list at new position
          destinationList.cards.splice(newPosition, 0, card);
          
          // Update positions of other cards in destination list
          destinationList.cards.forEach((c, index) => {
            if (c._id !== cardId) {
              c.position = index;
            }
          });
        }
      }
    },
    addListOptimistic: (state, action) => {
      const newList = action.payload;
      state.currentLists.push(newList);
    },
    addCardOptimistic: (state, action) => {
      const { card, listId } = action.payload;
      const list = state.currentLists.find(l => l._id === listId);
      if (list) {
        list.cards.push(card);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch boards
      .addCase(fetchBoards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = action.payload;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch single board
      .addCase(fetchBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBoard = action.payload.board;
        state.currentLists = action.payload.lists;
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create board
      .addCase(createBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.boards.unshift(action.payload);
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create list
      .addCase(createList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createList.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLists.push(action.payload);
      })
      .addCase(createList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create card
      .addCase(createCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCard.fulfilled, (state, action) => {
        state.loading = false;
        const list = state.currentLists.find(l => l._id === action.payload.list);
        if (list) {
          list.cards.push(action.payload);
        }
      })
      .addCase(createCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Move card
      .addCase(moveCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveCard.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBoard = action.payload.board;
        state.currentLists = action.payload.lists;
      })
      .addCase(moveCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearCurrentBoard, 
  updateBoardFromSocket,
  moveCardOptimistic,
  addListOptimistic,
  addCardOptimistic
} = boardSlice.actions;

export default boardSlice.reducer;
