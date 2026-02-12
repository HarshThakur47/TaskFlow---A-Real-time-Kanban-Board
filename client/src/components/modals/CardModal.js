import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, MessageSquare, Edit3, Trash2, Send } from 'lucide-react';
import { closeCardModal } from '../../store/slices/uiSlice';
import { updateCard, addComment, deleteCard } from '../../store/slices/boardSlice';

const CardModal = () => {
  const dispatch = useDispatch();
  // Get the initial "snapshot" (snapshot ID) from UI state
  const { showCardModal, selectedCard: initialSelectedCard } = useSelector((state) => state.ui);
  // Get the LIVE lists from Board state (which receives Socket updates)
  const { currentLists } = useSelector((state) => state.board);
  
  const [isEditing, setIsEditing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editData, setEditData] = useState({
    title: '',
    description: ''
  });

  // --- THE FIX: Find the Live Card ---
  // Instead of using initialSelectedCard directly, we search for the matching card 
  // in the currentLists. This ensures that when the socket updates the list, 
  // this variable updates instantly.
  const selectedCard = useMemo(() => {
    if (!initialSelectedCard) return null;
    
    // Search for the card in the live lists
    for (const list of currentLists) {
      const found = list.cards.find(c => c._id === initialSelectedCard._id);
      if (found) return found;
    }
    
    // Fallback if not found (e.g., just deleted)
    return initialSelectedCard;
  }, [currentLists, initialSelectedCard]);

  // Update form data only when opening or switching cards
  useEffect(() => {
    if (selectedCard && !isEditing) {
      setEditData({
        title: selectedCard.title,
        description: selectedCard.description || ''
      });
    }
  }, [selectedCard, isEditing]);

  const handleClose = () => {
    dispatch(closeCardModal());
    setIsEditing(false);
    setCommentText('');
  };

  const handleSave = async () => {
    if (!editData.title.trim()) return;
    
    await dispatch(updateCard({
      cardId: selectedCard._id,
      data: editData
    }));
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      await dispatch(deleteCard({
        cardId: selectedCard._id,
        listId: selectedCard.list
      }));
      handleClose();
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    await dispatch(addComment({
      cardId: selectedCard._id,
      text: commentText
    }));
    setCommentText('');
  };

  if (!showCardModal || !selectedCard) return null;

  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleClose}>
      <div className="modal-content bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold text-gray-900">Card Details</h2>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <>
                  <button onClick={() => setIsEditing(true)} className="p-2 text-gray-400 hover:text-primary-600 transition-colors" title="Edit">
                    <Edit3 className="h-5 w-5" />
                  </button>
                  <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </>
              )}
              <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Title & Description Edit Mode */}
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none"
                    maxLength={200}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                    rows={4}
                    maxLength={2000}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Cancel</button>
                  <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-900">{selectedCard.title}</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{selectedCard.description || 'No description provided.'}</p>
                </div>
              </>
            )}

            {/* Comments Section */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Comments ({selectedCard.comments?.length || 0})
              </h4>
              
              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="mb-6 flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <button type="submit" disabled={!commentText.trim()} className="p-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50">
                  <Send className="h-5 w-5" />
                </button>
              </form>

              {/* Comment List */}
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {/* We reverse the array to show newest comments first */}
                {selectedCard.comments?.slice().reverse().map((comment, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                      {comment.user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900">{comment.user?.username}</span>
                        <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm text-gray-600">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;