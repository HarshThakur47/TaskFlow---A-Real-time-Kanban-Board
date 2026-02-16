import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Plus, Menu, User } from 'lucide-react';
import { logout } from '../store/slices/userSlice';
import { openCreateBoardModal, openUserProfileModal } from '../store/slices/uiSlice'; // Import action

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const { sidebarOpen } = useSelector((state) => state.ui);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleCreateBoard = () => {
    dispatch(openCreateBoardModal());
  };

  // NEW: Handler for profile click
  const handleProfileClick = () => {
    dispatch(openUserProfileModal());
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-primary-600">TaskFlow</h1>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleCreateBoard}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Board</span>
            </button>

            <div className="relative">
              <div className="flex items-center space-x-3">
                {/* Made this div clickable with cursor-pointer */}
                <div 
                  onClick={handleProfileClick}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.username}
                  </span>
                </div>
                
                {/* Kept quick logout, or you can remove it since it's in the modal now */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;