import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X } from 'lucide-react';
import { createList } from '../../store/slices/boardSlice';
import { closeCreateListModal } from '../../store/slices/uiSlice';
import { addNotification } from '../../store/slices/uiSlice';

const CreateListModal = () => {
  const [title, setTitle] = useState('');

  const dispatch = useDispatch();
  const { showCreateListModal } = useSelector((state) => state.ui);
  const { currentBoard, loading } = useSelector((state) => state.board);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      dispatch(addNotification({ 
        type: 'error', 
        message: 'List title is required' 
      }));
      return;
    }

    const result = await dispatch(createList({ 
      boardId: currentBoard._id, 
      title: title.trim() 
    }));
    
    if (createList.fulfilled.match(result)) {
      dispatch(closeCreateListModal());
      setTitle('');
      dispatch(addNotification({ 
        type: 'success', 
        message: 'List created successfully!' 
      }));
    }
  };

  const handleClose = () => {
    dispatch(closeCreateListModal());
    setTitle('');
  };

  if (!showCreateListModal) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Create New List
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="listTitle" className="block text-sm font-medium text-gray-700 mb-2">
                List Title *
              </label>
              <input
                type="text"
                id="listTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="Enter list title"
                maxLength={100}
                required
                autoFocus
              />
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
                {loading ? 'Creating...' : 'Create List'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateListModal;
