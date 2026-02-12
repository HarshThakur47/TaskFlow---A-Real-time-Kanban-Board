import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X } from 'lucide-react';
import { closeAddMemberModal, addNotification } from '../../store/slices/uiSlice';
import { addMember } from '../../store/slices/boardSlice'; // Import the new action

const AddMemberModal = () => {
  const [email, setEmail] = useState('');

  const dispatch = useDispatch();
  const { showAddMemberModal } = useSelector((state) => state.ui);
  const { currentBoard, loading } = useSelector((state) => state.board);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      dispatch(addNotification({ type: 'error', message: 'Email is required' }));
      return;
    }

    // --- FIX: Dispatch the actual action ---
    const result = await dispatch(addMember({ 
      boardId: currentBoard._id, 
      email 
    }));

    if (addMember.fulfilled.match(result)) {
      dispatch(addNotification({ type: 'success', message: 'Member added successfully!' }));
      handleClose();
    } else {
      dispatch(addNotification({ type: 'error', message: result.payload || 'Failed to add member' }));
    }
  };

  const handleClose = () => {
    dispatch(closeAddMemberModal());
    setEmail('');
  };

  if (!showAddMemberModal) return null;

  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleClose}>
      <div className="modal-content bg-white rounded-lg shadow-xl w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Add Member</h2>
            <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
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
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Enter member's email address"
                required
                autoFocus
              />
              <p className="mt-1 text-xs text-gray-500">
                The user will be added immediately.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button type="button" onClick={handleClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
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