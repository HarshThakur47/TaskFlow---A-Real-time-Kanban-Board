import React, { useState, useEffect } from 'react';
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
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (showUserProfileModal) setIsClosing(false);
  }, [showUserProfileModal]);

  const triggerClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      dispatch(closeUserProfileModal());
      setIsClosing(false);
    }, 300);
  };

  const handleLogout = () => {
    triggerClose();
    setTimeout(() => {
      dispatch(logout()); 
      navigate('/login');
    }, 300);
  };

  if (!showUserProfileModal || !user) return null;
  const initial = user.username ? user.username[0].toUpperCase() : 'U';

  return (
    <div 
      className={`modal-overlay ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`} 
      onClick={triggerClose}
    >
      <div 
        className={`modal-content max-w-sm ${isClosing ? 'animate-spring-down' : 'animate-spring-up'}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-8 text-center relative">
          <button onClick={triggerClose} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-all backdrop-blur-md">
            <X className="h-4 w-4" />
          </button>
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md border-4 border-white/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
            <span className="text-4xl font-extrabold text-white">{initial}</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">{user.username}</h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-3">
            {[ 
              { icon: User, label: 'Username', val: user.username }, 
              { icon: Mail, label: 'Email', val: user.email }, 
              { icon: Shield, label: 'User ID', val: user._id || user.id } 
            ].map((item, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                  <item.icon className="h-5 w-5 text-primary-500" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{item.label}</p>
                  <p className="font-medium text-gray-900 dark:text-white truncate">{item.val}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleLogout} className="w-full mt-6 py-4 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-bold rounded-2xl flex items-center justify-center space-x-2 transition-all">
            <LogOut className="h-5 w-5" /> <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;