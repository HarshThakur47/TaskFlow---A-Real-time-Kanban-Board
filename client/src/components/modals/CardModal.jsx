import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, MessageSquare, Edit3, Trash2, Send } from 'lucide-react';
import { closeCardModal } from '../../store/slices/uiSlice';
import { updateCard, addComment, deleteCard } from '../../store/slices/boardSlice';

const CardModal = () => {
  const dispatch = useDispatch();
  const { showCardModal, selectedCard: initialSelectedCard } = useSelector((state) => state.ui);
  const { currentLists } = useSelector((state) => state.board);
  const { user: currentUser } = useSelector((state) => state.user);
  
  const [isEditing, setIsEditing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editData, setEditData] = useState({ title: '', description: '' });

  const selectedCard = useMemo(() => {
    if (!initialSelectedCard) return null;
    for (const list of currentLists) {
      const found = list.cards.find(c => c._id === initialSelectedCard._id);
      if (found) return found;
    }
    return initialSelectedCard;
  }, [currentLists, initialSelectedCard]);

  useEffect(() => {
    if (selectedCard && !isEditing) setEditData({ title: selectedCard.title, description: selectedCard.description || '' });
  }, [selectedCard, isEditing]);

  const handleClose = () => { dispatch(closeCardModal()); setIsEditing(false); setCommentText(''); };

  const handleSave = async () => {
    if (!editData.title.trim()) return;
    await dispatch(updateCard({ cardId: selectedCard._id, data: editData }));
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      await dispatch(deleteCard({ cardId: selectedCard._id, listId: selectedCard.list })); handleClose();
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await dispatch(addComment({ cardId: selectedCard._id, text: commentText }));
    setCommentText('');
  };

  if (!showCardModal || !selectedCard) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 md:p-8 flex-1 overflow-y-auto scrollbar-hide">
          <div className="modal-header mb-8">
            <h2 className="modal-title">Card Details</h2>
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-900 p-1.5 rounded-full">
              {!isEditing && (
                <>
                  <button onClick={() => setIsEditing(true)} className="btn-close hover:text-primary-600"><Edit3 className="h-4 w-4" /></button>
                  <button onClick={handleDelete} className="btn-close hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </>
              )}
              <button onClick={handleClose} className="btn-close"><X className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="space-y-8">
            {isEditing ? (
              <div className="space-y-4 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="form-group mb-0">
                  <label className="form-label">Title</label>
                  <input type="text" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} className="form-input bg-white dark:bg-gray-800" />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Description</label>
                  <textarea value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} className="form-input bg-white dark:bg-gray-800 resize-none" rows={4} />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">Cancel</button>
                  <button onClick={handleSave} className="px-5 py-2.5 font-bold bg-primary-600 text-white rounded-full hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition-all">Save Changes</button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{selectedCard.title}</h3>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <h4 className="form-label uppercase tracking-wider !text-xs !mb-2">Description</h4>
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{selectedCard.description || <span className="italic text-gray-400">No description provided.</span>}</p>
                </div>
              </div>
            )}

            <div className="pt-6">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center bg-gray-100 dark:bg-gray-800 w-max px-4 py-2 rounded-full">
                <MessageSquare className="h-4 w-4 mr-2 text-primary-500" />
                Comments <span className="ml-2 bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full text-xs">{selectedCard.comments?.length || 0}</span>
              </h4>
              
              <form onSubmit={handleAddComment} className="mb-8 flex gap-3 relative">
                <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment..." className="form-input pr-14" />
                <button type="submit" disabled={!commentText.trim()} className="absolute right-2 top-2 p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-all shadow-md">
                  <Send className="h-4 w-4" />
                </button>
              </form>

              <div className="space-y-5">
                {selectedCard.comments?.slice().reverse().map((comment, index) => {
                  let username = comment.user?.username || (comment.user === currentUser?.id ? currentUser.username : 'Unknown');
                  return (
                    <div key={index} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-inner">
                        {username[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-800 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">{username}</span>
                          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;