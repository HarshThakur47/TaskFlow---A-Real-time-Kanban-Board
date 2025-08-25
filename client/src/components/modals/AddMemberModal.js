import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X } from 'lucide-react';
import { closeAddMemberModal } from '../../store/slices/uiSlice';
import { addNotification } from '../../store/slices/uiSlice';

const AddMemberModal = () => {
  const [email, setEmail] = useState('');

  const dispatch = useDispatch();
  const { showAddMemberModal } = useSelector((state) => state.ui);
  const { currentBoard, loading } = useSelector((state) => state.board);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      dispatch(addNotification({ 
        type: 'error', 
        message: 'Email is required' 
      }));
      return;
    }

    // TODO: Implement add member functionality
    dispatch(addNotification({ 
      type: 'success', 
      message: 'Member added successfully!' 
    }));
    handleClose();
  };

  const handleClose = () => {
    dispatch(closeAddMemberModal());
    setEmail('');
  };

  if (!showAddMemberModal) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Add Member
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4">
            <span className="text-sm text-gray-600">
              Adding member to: <span className="font-medium">{currentBoard?.title}</span>
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="memberEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="memberEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="Enter member's email address"
                required
                autoFocus
              />
              <p className="mt-1 text-xs text-gray-500">
                The user will receive an invitation to join this board
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
