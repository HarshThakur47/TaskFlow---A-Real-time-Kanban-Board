import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { MessageSquare, Users, Calendar } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { openCardModal } from '../store/slices/uiSlice';

const Card = ({ card, index, socket }) => {
  const dispatch = useDispatch();

  const handleCardClick = () => dispatch(openCardModal(card));

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const diffDays = Math.ceil(Math.abs(new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleCardClick}
          style={provided.draggableProps.style}
          className={`kanban-card ${snapshot.isDragging ? 'is-dragging' : ''}`}
        >
          <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 leading-snug line-clamp-2">
            {card.title}
          </h4>
          
          {card.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{card.description}</p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <div className="flex items-center space-x-3">
              {card.comments?.length > 0 && (
                <div className="flex items-center space-x-1.5 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                  <MessageSquare className="h-3.5 w-3.5" /><span>{card.comments.length}</span>
                </div>
              )}
            </div>

            {card.dueDate && (
              <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-md ${isOverdue ? 'bg-red-50 text-red-600' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                <Calendar className="h-3 w-3" /><span>{formatDate(card.dueDate)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default Card;