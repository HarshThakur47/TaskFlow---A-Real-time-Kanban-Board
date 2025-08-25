import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X } from 'lucide-react';
import { createCard } from '../../store/slices/boardSlice';
import { closeCreateCardModal } from '../../store/slices/uiSlice';
import { addNotification } from '../../store/slices/uiSlice';

const CreateCardModal = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  const dispatch = useDispatch();
  const { showCreateCardModal, selectedListId } = useSelector((state) => state.ui);
  const { currentLists, loading } = useSelector((state) => state.board);

  const selectedList = currentLists.find(list => list._id === selectedListId);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      dispatch(addNotification({ 
        type: 'error', 
        message: 'Card title is required' 
      }));
      return;
    }

    const cardData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      listId: selectedListId
    };

    const result = await dispatch(createCard(cardData));
    
    if (createCard.fulfilled.match(result)) {
      dispatch(closeCreateCardModal());
      setFormData({ title: '', description: '' });
      dispatch(addNotification({ 
        type: 'success', 
        message: 'Card created successfully!' 
      }));
    }
  };

  const handleClose = () => {
    dispatch(closeCreateCardModal());
    setFormData({ title: '', description: '' });
  };

  if (!showCreateCardModal || !selectedList) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Create New Card
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
              Adding to: <span className="font-medium">{selectedList.title}</span>
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="cardTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Card Title *
              </label>
              <input
                type="text"
                id="cardTitle"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="Enter card title"
                maxLength={200}
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="cardDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="cardDescription"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input resize-none"
                rows={4}
                placeholder="Enter card description"
                maxLength={2000}
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
                {loading ? 'Creating...' : 'Create Card'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCardModal;
