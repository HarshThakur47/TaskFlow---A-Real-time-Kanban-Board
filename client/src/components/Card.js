import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { MessageSquare, Users, Calendar } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { openCardModal } from '../store/slices/uiSlice';

const Card = ({ card, index, socket }) => {
  const dispatch = useDispatch();

  const handleCardClick = () => {
    dispatch(openCardModal(card));
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
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
          className={`card p-3 cursor-pointer hover:shadow-md transition-shadow ${
            snapshot.isDragging ? 'dragging' : ''
          }`}
        >
          <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
            {card.title}
          </h4>
          
          {card.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {card.description}
            </p>
          )}

          {/* Labels */}
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {card.labels.map((label, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-full"
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
          )}

          {/* Card Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              {/* Comments */}
              {card.comments && card.comments.length > 0 && (
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{card.comments.length}</span>
                </div>
              )}
              
              {/* Assignees */}
              {card.assignees && card.assignees.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{card.assignees.length}</span>
                </div>
              )}
            </div>

            {/* Due Date */}
            {card.dueDate && (
              <div className={`flex items-center space-x-1 ${
                isOverdue ? 'text-red-600' : ''
              }`}>
                <Calendar className="h-3 w-3" />
                <span>{formatDate(card.dueDate)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default Card;
