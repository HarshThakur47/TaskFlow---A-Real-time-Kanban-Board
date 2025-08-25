import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Plus, MoreHorizontal } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { openCreateCardModal } from '../store/slices/uiSlice';
import Card from './Card';

const List = ({ list, socket }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const handleAddCard = () => {
    dispatch(openCreateCardModal({ listId: list._id }));
  };

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-gray-100 rounded-lg p-4">
        {/* List Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{list.title}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {list.cards?.length || 0}
            </span>
            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
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
