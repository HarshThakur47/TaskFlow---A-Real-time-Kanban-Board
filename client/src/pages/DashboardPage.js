import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Calendar } from 'lucide-react';
import { fetchBoards } from '../store/slices/boardSlice';
import { addNotification } from '../store/slices/uiSlice';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { boards, loading, error } = useSelector((state) => state.board);
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      dispatch(addNotification({ type: 'error', message: error }));
    }
  }, [error, dispatch]);

  const handleBoardClick = (boardId) => {
    navigate(`/board/${boardId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.username}!
        </h1>
        <p className="mt-2 text-gray-600">
          Manage your projects and collaborate with your team
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Create New Board Card */}
        <div className="card p-6 border-2 border-dashed border-gray-300 hover:border-primary-400 transition-colors cursor-pointer">
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Plus className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Create New Board
            </h3>
            <p className="text-sm text-gray-500">
              Start organizing your tasks and projects
            </p>
          </div>
        </div>

        {/* Board Cards */}
        {boards.map((board) => (
          <div
            key={board._id}
            onClick={() => handleBoardClick(board._id)}
            className="card p-6 hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                {board.title}
              </h3>
            </div>
            
            {board.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {board.description}
              </p>
            )}
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{board.members?.length || 1} members</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(board.updatedAt)}</span>
              </div>
            </div>
            
            {/* Owner/Member indicator */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {board.owner?._id === user?.id ? 'Owner' : 'Member'}
                </span>
                {board.owner?._id === user?.id && (
                  <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                    Owner
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {boards.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Plus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No boards yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first board to start organizing your tasks and collaborating with your team.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
