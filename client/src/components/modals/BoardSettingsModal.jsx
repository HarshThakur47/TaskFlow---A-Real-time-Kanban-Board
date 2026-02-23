import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { X, Trash2 } from 'lucide-react';
import { updateBoard, deleteBoard } from '../../store/slices/boardSlice';
import { closeBoardSettingsModal, addNotification } from '../../store/slices/uiSlice';

const BoardSettingsModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showBoardSettingsModal } = useSelector((state) => state.ui);
  const { currentBoard } = useSelector((state) => state.board);

  const [formData, setFormData] = useState({ title: '', description: '', background: '' });
  const backgroundColors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

  useEffect(() => {
    if (currentBoard) setFormData({ title: currentBoard.title, description: currentBoard.description || '', background: currentBoard.background || '#6366f1' });
  }, [currentBoard]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    await dispatch(updateBoard({ boardId: currentBoard._id, data: formData }));
    dispatch(closeBoardSettingsModal());
    dispatch(addNotification({ type: 'success', message: 'Board updated' }));
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure? This will delete the board and ALL its cards permanently.')) {
      await dispatch(deleteBoard(currentBoard._id));
      dispatch(closeBoardSettingsModal()); navigate('/dashboard');
      dispatch(addNotification({ type: 'success', message: 'Board deleted' }));
    }
  };

  if (!showBoardSettingsModal || !currentBoard) return null;

  return (
    <div className="modal-overlay" onClick={() => dispatch(closeBoardSettingsModal())}>
      <div className="modal-content max-w-md p-8" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h2 className="modal-title">Board Settings</h2>
          <button onClick={() => dispatch(closeBoardSettingsModal())} className="btn-close"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="form-label">Theme Color</label>
            <div className="grid grid-cols-4 gap-3">
              {backgroundColors.map((color) => (
                <button
                  key={color} type="button" onClick={() => setFormData({ ...formData, background: color })}
                  className={`w-full aspect-square rounded-2xl transition-all shadow-sm ${formData.background === color ? 'ring-4 ring-offset-2 dark:ring-offset-gray-800 ring-primary-500 scale-95' : 'hover:scale-105 opacity-80'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Title</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="form-input" required />
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50 flex flex-col gap-3">
            <button type="submit" className="btn-primary">Save Changes</button>
            <button type="button" onClick={handleDelete} className="w-full py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-bold rounded-full flex items-center justify-center gap-2 transition-all">
              <Trash2 className="h-4 w-4" /> Delete Board
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BoardSettingsModal;