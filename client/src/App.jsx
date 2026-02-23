import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store } from './store';

// Components
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import BoardPage from './pages/BoardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationContainer from './components/NotificationContainer';

// Modals
import CreateBoardModal from './components/modals/CreateBoardModal';
import CreateListModal from './components/modals/CreateListModal';
import CreateCardModal from './components/modals/CreateCardModal';
import CardModal from './components/modals/CardModal';
import AddMemberModal from './components/modals/AddMemberModal';
import BoardSettingsModal from './components/modals/BoardSettingsModal';
import UserProfileModal from './components/modals/UserProfileModal';

function AppContent() {
  const { theme } = useSelector((state) => state.ui);

  // Apply dark mode class to HTML root smoothly
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Router>
      {/* Global Background with transition */}
      <div className="min-h-screen bg-surface-light dark:bg-surface-dark transition-theme duration-500 ease-in-out text-gray-900 dark:text-gray-100">
        <Navbar />
        <NotificationContainer />
        
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/board/:boardId" 
            element={
              <ProtectedRoute>
                <BoardPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        {/* Modals */}
        <CreateBoardModal />
        <CreateListModal />
        <CreateCardModal />
        <CardModal />
        <AddMemberModal />
        <BoardSettingsModal />
        <UserProfileModal />
      </div>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;