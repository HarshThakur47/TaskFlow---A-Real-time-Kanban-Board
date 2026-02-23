import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X } from 'lucide-react';
import { createList } from '../../store/slices/boardSlice';
import { closeCreateListModal, addNotification } from '../../store/slices/uiSlice';

const CreateListModal = () => {
  const [title, setTitle] = useState('');
  const dispatch = useDispatch();
  const { showCreateListModal } = useSelector((state) => state.ui);
  const { currentBoard, loading } = useSelector((state) => state.board);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return dispatch(addNotification({ type: 'error', message: 'Title is required' }));
    
    const result = await dispatch(createList({ boardId: currentBoard._id, title: title.trim() }));
    if (createList.fulfilled.match(result)) {
      dispatch(closeCreateListModal()); setTitle('');
      dispatch(addNotification({ type: 'success', message: 'List created!' }));
    }
  };

  if (!showCreateListModal) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={() => dispatch(closeCreateListModal())}>
      <div className="modal-content max-w-sm p-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h2 className="modal-title">New List</h2>
          <button onClick={() => dispatch(closeCreateListModal())} className="btn-icon"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="form-input" 
              placeholder="List Title..." 
              required 
              autoFocus 
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating...' : 'Create List'}
          </button>
        </form>
        
      </div>
    </div>
  );
};

export default CreateListModal;