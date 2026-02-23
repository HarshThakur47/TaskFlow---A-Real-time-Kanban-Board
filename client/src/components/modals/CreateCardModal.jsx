import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X } from 'lucide-react';
import { createCard } from '../../store/slices/boardSlice';
import { closeCreateCardModal, addNotification } from '../../store/slices/uiSlice';

const CreateCardModal = () => {
  const [formData, setFormData] = useState({ title: '', description: '' });
  const dispatch = useDispatch();
  const { showCreateCardModal, selectedListId } = useSelector((state) => state.ui);
  const { currentLists, loading } = useSelector((state) => state.board);

  const selectedList = currentLists.find(list => list._id === selectedListId);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return dispatch(addNotification({ type: 'error', message: 'Card title is required' }));

    const result = await dispatch(createCard({ title: formData.title.trim(), description: formData.description.trim(), listId: selectedListId }));
    
    if (createCard.fulfilled.match(result)) {
      dispatch(closeCreateCardModal()); setFormData({ title: '', description: '' });
      dispatch(addNotification({ type: 'success', message: 'Card created successfully!' }));
    }
  };

  const handleClose = () => { dispatch(closeCreateCardModal()); setFormData({ title: '', description: '' }); };

  if (!showCreateCardModal || !selectedList) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content max-w-md p-8" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header mb-4">
          <h2 className="modal-title text-xl">New Card</h2>
          <button onClick={handleClose} className="btn-close"><X className="h-4 w-4" /></button>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Adding to: <span className="text-primary-600 dark:text-primary-400 font-bold">{selectedList.title}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-input" placeholder="Card Title..." required autoFocus />
          </div>
          <div>
            <textarea name="description" value={formData.description} onChange={handleChange} className="form-input resize-none" rows={3} placeholder="Description (Optional)" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? 'Creating...' : 'Create Card'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCardModal;