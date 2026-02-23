import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X } from 'lucide-react';
import { createBoard } from '../../store/slices/boardSlice';
import { closeCreateBoardModal, addNotification } from '../../store/slices/uiSlice';

const CreateBoardModal = () => {
  const [formData, setFormData] = useState({ title: '', description: '', background: '#6366f1' });
  const dispatch = useDispatch();
  const { showCreateBoardModal } = useSelector((state) => state.ui);
  const { loading } = useSelector((state) => state.board);

  const backgroundColors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return dispatch(addNotification({ type: 'error', message: 'Board title is required' }));
    
    const result = await dispatch(createBoard(formData));
    if (createBoard.fulfilled.match(result)) {
      dispatch(closeCreateBoardModal());
      setFormData({ title: '', description: '', background: '#6366f1' });
      dispatch(addNotification({ type: 'success', message: 'Board created!' }));
    }
  };

  if (!showCreateBoardModal) return null;

  return (
    <div className="modal-overlay" onClick={() => dispatch(closeCreateBoardModal())}>
      <div className="modal-content max-w-md p-8" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h2 className="modal-title">Create Board</h2>
          <button onClick={() => dispatch(closeCreateBoardModal())} className="btn-close"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="form-label">Theme Color</label>
            <div className="grid grid-cols-4 gap-3">
              {backgroundColors.map((color) => (
                <button
                  key={color} type="button" onClick={() => setFormData({ ...formData, background: color })}
                  className={`w-full aspect-square rounded-2xl transition-all shadow-sm ${formData.background === color ? 'ring-4 ring-offset-2 dark:ring-offset-gray-800 ring-primary-500 scale-95' : 'hover:scale-105 hover:shadow-md opacity-80'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Board Title</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="form-input" placeholder="e.g. Project Alpha" required autoFocus />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="form-input resize-none" rows={3} placeholder="What is this board for?" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-4">
            {loading ? 'Creating...' : 'Create Board'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBoardModal;