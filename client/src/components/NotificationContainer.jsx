import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { removeNotification } from '../store/slices/uiSlice';

const NotificationContainer = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.ui.notifications);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />;
      default:
        return <Info className="h-5 w-5 text-primary-500 dark:text-primary-400" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50/80 dark:bg-green-900/40 border-green-200/50 dark:border-green-800/50';
      case 'error':
        return 'bg-red-50/80 dark:bg-red-900/40 border-red-200/50 dark:border-red-800/50';
      default:
        return 'bg-primary-50/80 dark:bg-primary-900/40 border-primary-200/50 dark:border-primary-800/50';
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-800 dark:text-green-300';
      case 'error':
        return 'text-red-800 dark:text-red-300';
      default:
        return 'text-primary-800 dark:text-primary-300';
    }
  };

  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.autoClose !== false) {
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, 5000);
        return () => clearTimeout(timer);
      }
    });
  }, [notifications, dispatch]);

  return (
    <div className="fixed top-20 right-4 z-[150] space-y-3 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-center p-4 rounded-2xl border shadow-glass dark:shadow-glass-dark backdrop-blur-xl max-w-sm animate-fade-in pointer-events-auto transition-theme ${getBgColor(notification.type)}`}
        >
          <div className="flex-shrink-0 mr-3">
            {getIcon(notification.type)}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-bold tracking-wide ${getTextColor(notification.type)}`}>
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => dispatch(removeNotification(notification.id))}
            className="flex-shrink-0 ml-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors bg-white/20 dark:bg-black/20 p-1 rounded-full"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;