import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X } from 'lucide-react';
import { createBoard } from '../../store/slices/boardSlice';
import { closeCreateBoardModal } from '../../store/slices/uiSlice';
import { addNotification } from '../../store/slices/uiSlice';

const CreateBoardModal = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    background: '#0079bf'
  });

  const dispatch = useDispatch();
  const { showCreateBoardModal } = useSelector((state) => state.ui);
  const { loading } = useSelector((state) => state.board);

  const backgroundColors = [
    '#0079bf', '#d29034', '#519839', '#b04632', 
    '#89609e', '#cd5a91', '#4bbf6b', '#29cce5'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBackgroundSelect = (color) => {
    setFormData({
      ...formData,
      background: color,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      dispatch(addNotification({ 
        type: 'error', 
        message: 'Board title is required' 
      }));
      return;
    }

    const result = await dispatch(createBoard(formData));
    if (createBoard.fulfilled.match(result)) {
      dispatch(closeCreateBoardModal());
      setFormData({ title: '', description: '', background: '#0079bf' });
      dispatch(addNotification({ 
        type: 'success', 
        message: 'Board created successfully!' 
      }));
    }
  };

  const handleClose = () => {
    dispatch(closeCreateBoardModal());
    setFormData({ title: '', description: '', background: '#0079bf' });
  };

  if (!showCreateBoardModal) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Create New Board
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Background Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Background Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {backgroundColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleBackgroundSelect(color)}
                    className={`w-12 h-12 rounded-lg border-2 transition-all ${
                      formData.background === color
                        ? 'border-gray-900 scale-110'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Board Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="Enter board title"
                maxLength={100}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input resize-none"
                rows={3}
                placeholder="Enter board description"
                maxLength={500}
              />
            </div>

            {/* Actions */}
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
                {loading ? 'Creating...' : 'Create Board'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBoardModal;
