import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, MessageSquare, Users, Calendar, Edit3 } from 'lucide-react';
import { closeCardModal } from '../../store/slices/uiSlice';

const CardModal = () => {
  const dispatch = useDispatch();
  const { showCardModal, selectedCard } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.user);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: selectedCard?.title || '',
    description: selectedCard?.description || ''
  });

  const handleClose = () => {
    dispatch(closeCardModal());
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      title: selectedCard?.title || '',
      description: selectedCard?.description || ''
    });
  };

  const handleSave = () => {
    // TODO: Implement card update functionality
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      title: selectedCard?.title || '',
      description: selectedCard?.description || ''
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!showCardModal || !selectedCard) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Card Details
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEdit}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Edit card"
              >
                <Edit3 className="h-5 w-5" />
              </button>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="input"
                  maxLength={200}
                />
              ) : (
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedCard.title}
                </h3>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              {isEditing ? (
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="input resize-none"
                  rows={4}
                  maxLength={2000}
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedCard.description || 'No description provided'}
                </p>
              )}
            </div>

            {/* Labels */}
            {selectedCard.labels && selectedCard.labels.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Labels
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedCard.labels.map((label, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm rounded-full"
                      style={{
                        backgroundColor: label.color + '20',
                        color: label.color,
                        border: `1px solid ${label.color}40`
                      }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Due Date */}
            {selectedCard.dueDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <div className="flex items-center space-x-2 text-gray-700">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(selectedCard.dueDate)}</span>
                </div>
              </div>
            )}

            {/* Assignees */}
            {selectedCard.assignees && selectedCard.assignees.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignees
                </label>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div className="flex flex-wrap gap-2">
                    {selectedCard.assignees.map((assignee) => (
                      <span
                        key={assignee._id}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {assignee.username}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments ({selectedCard.comments?.length || 0})
              </label>
              {selectedCard.comments && selectedCard.comments.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedCard.comments.map((comment, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {comment.user?.username || 'Unknown User'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No comments yet</p>
              )}
            </div>

            {/* Edit Actions */}
            {isEditing && (
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCancel}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
