import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
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
import BoardSettingsModal from './components/modals/BoardSettingsModal'; // NEW

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
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
        <BoardSettingsModal /> {/* NEW */}
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