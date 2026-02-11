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

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    background: ''
  });

  useEffect(() => {
    if (currentBoard) {
      setFormData({
        title: currentBoard.title,
        description: currentBoard.description || '',
        background: currentBoard.background || '#0079bf'
      });
    }
  }, [currentBoard]);

  const backgroundColors = [
    '#0079bf', '#d29034', '#519839', '#b04632', 
    '#89609e', '#cd5a91', '#4bbf6b', '#29cce5'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    await dispatch(updateBoard({
      boardId: currentBoard._id,
      data: formData
    }));
    
    dispatch(closeBoardSettingsModal());
    dispatch(addNotification({ type: 'success', message: 'Board updated' }));
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure? This will delete the board and ALL its cards permanently.')) {
      await dispatch(deleteBoard(currentBoard._id));
      dispatch(closeBoardSettingsModal());
      navigate('/dashboard');
      dispatch(addNotification({ type: 'success', message: 'Board deleted' }));
    }
  };

  if (!showBoardSettingsModal || !currentBoard) return null;

  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => dispatch(closeBoardSettingsModal())}>
      <div className="modal-content bg-white rounded-lg shadow-xl w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Board Settings</h2>
            <button onClick={() => dispatch(closeBoardSettingsModal())} className="p-2 text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Background Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Background</label>
              <div className="grid grid-cols-4 gap-2">
                {backgroundColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, background: color })}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      formData.background === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Board Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                rows={3}
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Board
              </button>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => dispatch(closeBoardSettingsModal())}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BoardSettingsModal;