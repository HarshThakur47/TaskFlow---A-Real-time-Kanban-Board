import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Plus, Trash2 } from 'lucide-react'; // Changed icon
import { useDispatch } from 'react-redux';
import { openCreateCardModal } from '../store/slices/uiSlice';
import { deleteList } from '../store/slices/boardSlice'; // Import delete action
import Card from './Card';

const List = ({ list, socket }) => {
  const dispatch = useDispatch();

  const handleAddCard = () => {
    dispatch(openCreateCardModal({ listId: list._id }));
  };

  const handleDeleteList = () => {
    if (window.confirm(`Delete list "${list.title}" and all its cards?`)) {
      dispatch(deleteList(list._id));
    }
  };

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-gray-100 rounded-lg p-4">
        {/* List Header */}
        <div className="flex items-center justify-between mb-4 group">
          <h3 className="font-semibold text-gray-900">{list.title}</h3>
          <button 
            onClick={handleDeleteList}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
            title="Delete List"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        
        {/* Cards Container */}
        <Droppable droppableId={list._id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-[200px] space-y-2 ${
                snapshot.isDraggingOver ? 'bg-primary-50' : ''
              }`}
            >
              {list.cards?.map((card, index) => (
                <Card key={card._id} card={card} index={index} socket={socket} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Add Card Button */}
        <button
          onClick={handleAddCard}
          className="w-full mt-4 p-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-white rounded transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add a card</span>
        </button>
      </div>
    </div>
  );
};

export default List;
