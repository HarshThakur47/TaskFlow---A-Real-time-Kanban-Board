import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X } from 'lucide-react';
import { closeAddMemberModal, addNotification } from '../../store/slices/uiSlice';
import { addMember } from '../../store/slices/boardSlice';

const AddMemberModal = () => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const { showAddMemberModal } = useSelector((state) => state.ui);
  const { currentBoard, loading } = useSelector((state) => state.board);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return dispatch(addNotification({ type: 'error', message: 'Email is required' }));

    const result = await dispatch(addMember({ boardId: currentBoard._id, email }));

    if (addMember.fulfilled.match(result)) {
      dispatch(addNotification({ type: 'success', message: 'Member added successfully!' })); handleClose();
    } else {
      dispatch(addNotification({ type: 'error', message: result.payload || 'Failed to add member' }));
    }
  };

  const handleClose = () => { dispatch(closeAddMemberModal()); setEmail(''); };

  if (!showAddMemberModal) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content max-w-sm p-8" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header mb-4">
          <h2 className="modal-title text-xl">Invite Member</h2>
          <button onClick={handleClose} className="btn-close"><X className="h-4 w-4" /></button>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Adding to: <span className="text-primary-600 dark:text-primary-400 font-bold">{currentBoard?.title}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" placeholder="User's email address" required autoFocus />
            <p className="mt-2 text-xs font-medium text-gray-400 dark:text-gray-500 pl-2">The user will be added immediately.</p>
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Adding...' : 'Add Member'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;