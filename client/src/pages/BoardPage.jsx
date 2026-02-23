import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
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

  useEffect(() => { dispatch(fetchBoard(boardId)); }, [dispatch, boardId]);

  useEffect(() => {
    if (error) { dispatch(addNotification({ type: 'error', message: error })); navigate('/dashboard'); }
  }, [error, dispatch, navigate]);

  useEffect(() => {
    if (currentBoard && user) {
      const token = localStorage.getItem('token');
      if (!token) return;
      const socketInstance = new SocketManager().connect(token);
      socketInstance.on('connect', () => socketInstance.emit('join-board', boardId));
      socketInstance.on('board:update', (data) => dispatch(updateBoardFromSocket(data)));
      setSocket(socketInstance);
      return () => socketInstance.disconnect();
    }
  }, [currentBoard, user, boardId, dispatch]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    dispatch(moveCardOptimistic({ cardId: draggableId, sourceListId: source.droppableId, destinationListId: destination.droppableId, newPosition: destination.index }));
    dispatch(moveCard({ cardId: draggableId, sourceListId: source.droppableId, destinationListId: destination.droppableId, newPosition: destination.index }));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (!currentBoard) return null;

  const boardColor = currentBoard.background || '#6366f1';

  return (
    <div className="h-[calc(100vh-4rem)] p-2 sm:p-4 lg:p-6 overflow-hidden">
      <div className="w-full h-full relative rounded-3xl animate-fade-in flex flex-col shadow-2xl">
        
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/40 backdrop-blur-3xl rounded-3xl pointer-events-none z-0">
          <div className="absolute inset-0 rounded-3xl opacity-60 dark:opacity-80"
            style={{ background: `radial-gradient(ellipse at top center, ${boardColor}30 0%, transparent 70%), radial-gradient(ellipse at bottom, ${boardColor}15 0%, transparent 80%)` }}
          ></div>
        </div>

        <div className="relative z-10 flex flex-col h-full overflow-hidden rounded-3xl">
          <div className="glass-header">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{currentBoard.title}</h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm font-medium text-gray-800 dark:text-gray-200 bg-white/50 dark:bg-gray-800/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 dark:border-gray-700/50">
                    <Users className="h-4 w-4" /><span>{currentBoard.members?.length || 1}</span>
                  </div>
                  <button onClick={() => dispatch(openAddMemberModal())} className="bg-white/70 hover:bg-white text-primary-600 dark:bg-gray-800/80 dark:text-primary-400 px-4 py-1.5 rounded-full font-bold shadow-sm backdrop-blur-md">Invite</button>
                  <button onClick={() => dispatch(openBoardSettingsModal())} className="btn-icon"><Settings className="h-5 w-5" /></button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex space-x-6 p-6 items-start h-full">
                {currentLists.map((list) => <List key={list._id} list={list} socket={socket} />)}
                <div className="flex-shrink-0 w-80">
                  <button onClick={() => dispatch(openCreateListModal())} className="w-full p-4 bg-white/30 dark:bg-gray-800/30 hover:bg-white/50 dark:hover:bg-gray-800/50 backdrop-blur-md border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl transition-colors duration-300 text-left">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400"><Plus className="h-5 w-5" /><span className="font-semibold">Add another list</span></div>
                  </button>
                </div>
              </div>
            </DragDropContext>
          </div>
        </div>

        {/* Foreground Border */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none z-20" style={{ border: `3px solid ${boardColor}`, boxShadow: `inset 0 0 100px ${boardColor}30` }}></div>
      </div>
    </div>
  );
};

export default BoardPage;