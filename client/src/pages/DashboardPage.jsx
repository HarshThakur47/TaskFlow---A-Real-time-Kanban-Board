import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Calendar } from 'lucide-react';
import { fetchBoards } from '../store/slices/boardSlice';
import { addNotification, openCreateBoardModal } from '../store/slices/uiSlice';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { boards, loading, error } = useSelector((state) => state.board);
  const { user } = useSelector((state) => state.user);

  useEffect(() => { dispatch(fetchBoards()); }, [dispatch]);

  useEffect(() => {
    if (error) { dispatch(addNotification({ type: 'error', message: error })); }
  }, [error, dispatch]);

  const handleBoardClick = (boardId) => navigate(`/board/${boardId}`);
  const handleCreateBoard = () => dispatch(openCreateBoardModal());

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-500 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-500">{user?.username}</span>!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 font-medium">
          Manage your projects and collaborate with your team
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* Create New Board Card */}
        <div 
          onClick={handleCreateBoard}
          className="glass-panel border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 rounded-3xl hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center h-full min-h-[12rem] text-center group"
        >
          <div className="bg-primary-100 dark:bg-primary-900/50 p-3 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
            <Plus className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Create New Board</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Start organizing your tasks</p>
        </div>

        {/* Board Cards with Gradients */}
        {boards.map((board) => {
          // Calculate the exact same colors used in the Board Page
          const boardColor = board.background || '#6366f1';
          const glowColorHeavy = `${boardColor}30`; 
          const glowColorLight = `${boardColor}15`;

          return (
            <div
              key={board._id}
              onClick={() => handleBoardClick(board._id)}
              className="relative glass-panel rounded-3xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group flex flex-col overflow-hidden border"
              style={{ borderColor: `${boardColor}40` }} // Subtle border matching the theme
            >
              {/* The Glowing Gradient Background */}
              <div 
                className="absolute inset-0 pointer-events-none z-0 opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(ellipse at top right, ${glowColorHeavy} 0%, transparent 70%), 
                               radial-gradient(ellipse at bottom left, ${glowColorLight} 0%, transparent 80%)`
                }}
              ></div>

              {/* Foreground Content (Needs z-10 so it sits above the gradient) */}
              <div className="relative z-10 p-6 flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors line-clamp-1 drop-shadow-sm" style={{ textShadow: `0 2px 10px ${glowColorHeavy}` }}>
                    {board.title}
                  </h3>
                </div>
                
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2 flex-grow font-medium">
                  {board.description || <span className="italic text-gray-500">No description provided.</span>}
                </p>
                
                {/* Stats Container with heavy blur to stand out against gradient */}
                <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300 mb-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md p-2.5 rounded-2xl border border-white/30 dark:border-gray-700/50 shadow-sm">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <Users className="h-4 w-4" /><span>{board.members?.length || 1}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 font-bold">
                    <Calendar className="h-4 w-4" /><span>{formatDate(board.updatedAt)}</span>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {board.owner?._id === user?.id ? 'Owner' : 'Member'}
                  </span>
                  {board.owner?._id === user?.id && (
                    <span className="text-xs font-extrabold bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/50 dark:border-gray-600/50 text-gray-900 dark:text-white px-3 py-1.5 rounded-full shadow-sm">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardPage;