import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Moon, Sun } from 'lucide-react';
import { openUserProfileModal } from '../store/slices/uiSlice';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const location = useLocation();
  const dispatch = useDispatch();
  
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <nav className="sticky top-0 z-40 bg-white/70 dark:bg-surface-darkElevated/70 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex-shrink-0 flex items-center group">
              <div className="bg-primary-600 p-2 rounded-xl group-hover:bg-primary-700 transition-colors shadow-sm">
                <Layout className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                TaskFlow
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {isAuthenticated && user ? (
              <button 
                onClick={() => dispatch(openUserProfileModal())}
                className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-600 text-white font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900"
              >
                {user.username ? user.username[0].toUpperCase() : 'U'}
              </button>
            ) : (
              location.pathname !== '/login' && location.pathname !== '/register' && (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium px-3 py-2 rounded-md transition-colors">
                    Log in
                  </Link>
                  <Link to="/register" className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-full font-medium transition-colors shadow-sm hover:shadow-md">
                    Sign up
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;