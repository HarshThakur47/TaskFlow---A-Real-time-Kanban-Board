import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus, Trash2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { openCreateCardModal } from '../store/slices/uiSlice';
import { deleteList } from '../store/slices/boardSlice';
import Card from './Card';

const List = ({ list, socket }) => {
  const dispatch = useDispatch();

  const handleDeleteList = () => {
    if (window.confirm(`Delete list "${list.title}"?`)) {
      dispatch(deleteList(list._id));
    }
  };

  return (
    <div className="list-container group">
      
      {/* This class handles your borders and glassmorphism! */}
      <div className="list-glass-bg"></div>
      
      <div className="relative z-10 p-4 flex flex-col max-h-[calc(100vh-12rem)]">
        <div className="flex items-center justify-between mb-4 px-1 group/header">
          <h3 className="font-bold text-gray-900 dark:text-white tracking-wide">{list.title}</h3>
          <button onClick={handleDeleteList} className="btn-icon opacity-0 group-hover/header:opacity-100">
            <Trash2 className="h-4 w-4 text-red-500" />
          </button>
        </div>
        
        <Droppable droppableId={list._id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex-1 overflow-y-auto space-y-3 px-1 pb-2 scrollbar-hide ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
            >
              {list.cards?.map((card, index) => (
                <Card key={card._id} card={card} index={index} socket={socket} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        <button onClick={() => dispatch(openCreateCardModal({ listId: list._id }))} className="mt-2 w-full py-2.5 px-4 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-2xl transition-all flex items-center justify-center space-x-2">
          <Plus className="h-4 w-4" /><span>Add a card</span>
        </button>
      </div>
    </div>
  );
};

export default List;