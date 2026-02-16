import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Plus, Users, Settings } from 'lucide-react';
import { openCreateListModal, openAddMemberModal, openBoardSettingsModal } from '../store/slices/uiSlice';
import { addNotification } from '../store/slices/uiSlice';
import List from '../components/List';
import SocketManager from '../utils/SocketManager';
import { fetchBoard, updateBoardFromSocket, moveCardOptimistic, moveCard } from '../store/slices/boardSlice';


const BoardPage = () => {
  const { boardId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentBoard, currentLists, loading, error } = useSelector((state) => state.board);
  const { user } = useSelector((state) => state.user);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    dispatch(fetchBoard(boardId));
  }, [dispatch, boardId]);

  useEffect(() => {
    if (error) {
      dispatch(addNotification({ type: 'error', message: error }));
      navigate('/dashboard');
    }
  }, [error, dispatch, navigate]);

  // Socket.IO setup - FIXED
  useEffect(() => {
    if (currentBoard && user) {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        return;
      }
      
      const socketManager = new SocketManager();
      const socketInstance = socketManager.connect(token);
      
      socketInstance.on('connect', () => {
        console.log('Connected to socket server');
        socketInstance.emit('join-board', boardId);
      });

      socketInstance.on('board:update', (data) => {
        dispatch(updateBoardFromSocket(data));
      });

      socketInstance.on('error', (error) => {
        dispatch(addNotification({ type: 'error', message: error.message }));
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [currentBoard, user, boardId, dispatch]);

const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceListId = source.droppableId;
    const destinationListId = destination.droppableId;
    const newPosition = destination.index;

    dispatch(moveCardOptimistic({
      cardId: draggableId,
      sourceListId,
      destinationListId,
      newPosition
    }));

    dispatch(moveCard({
      cardId: draggableId,
      sourceListId,
      destinationListId,
      newPosition
    }));
  };

  const handleCreateList = () => {
    dispatch(openCreateListModal());
  };

  const handleAddMember = () => {
    dispatch(openAddMemberModal());
  };

  // NEW
  const handleSettings = () => {
    dispatch(openBoardSettingsModal());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Board not found</h2>
          <p className="text-gray-600 mb-4">The board you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
    className="min-h-screen transition-colors duration-300 ease-in-out"
    style={{ backgroundColor: currentBoard.background || '#f9fafb' }}
    >
      {/* Board Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {currentBoard.title}
              </h1>
              {currentBoard.description && (
                <p className="text-sm text-gray-600">
                  {currentBoard.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{currentBoard.members?.length || 1} members</span>
              </div>
              
              <button
                onClick={handleAddMember}
                className="btn btn-secondary text-sm"
              >
                Add Member
              </button>
              
              <button 
                onClick={handleSettings} // NEW
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex space-x-6 p-6 min-h-[calc(100vh-4rem)]">
            {currentLists.map((list) => (
              <List key={list._id} list={list} socket={socket} />
            ))}
            
            {/* Add List Button */}
            <div className="flex-shrink-0 w-80">
              <button
                onClick={handleCreateList}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-2 text-gray-600 hover:text-primary-600">
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Add another list</span>
                </div>
              </button>
            </div>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default BoardPage;
