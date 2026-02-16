import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { X, User, Mail, LogOut, Shield } from 'lucide-react';
import { closeUserProfileModal } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/userSlice';

const UserProfileModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showUserProfileModal } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.user);

  const handleClose = () => {
    dispatch(closeUserProfileModal());
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(closeUserProfileModal());
    navigate('/login');
  };

  if (!showUserProfileModal || !user) return null;

  const initial = user.username ? user.username[0].toUpperCase() : 'U';

  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={handleClose}>
      <div className="modal-content bg-white rounded-lg shadow-xl w-full max-w-sm m-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-primary-600 p-6 text-center relative">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-3xl font-bold text-primary-600">{initial}</span>
          </div>
          <h2 className="text-xl font-bold text-white">{user.username}</h2>
          <p className="text-primary-100 text-sm">Member</p>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-gray-700 p-2 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Username</p>
                <p className="font-medium">{user.username}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-gray-700 p-2 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">{user.email || 'No email provided'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-700 p-2 bg-gray-50 rounded-lg">
              <Shield className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">User ID</p>
                <p className="font-mono text-xs text-gray-600 truncate max-w-[200px]">{user._id || user.id}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-red-50 text-red-600 py-3 rounded-lg hover:bg-red-100 transition-colors mt-6"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;