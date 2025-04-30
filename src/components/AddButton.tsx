import React from 'react';
import { usePostIts } from '../context/PostItsContext';
import { Plus } from 'lucide-react';
import { getColorClass } from '../utils/helpers';

const AddButton: React.FC = () => {
  const { addPostIt, state } = usePostIts();
  
  const colorClass = getColorClass(state.selectedColor).split(' ')[0];
  
  return (
    <button
      className={`absolute bottom-8 right-8 z-50 flex items-center justify-center 
                 ${colorClass} hover:scale-105 shadow-lg hover:shadow-xl rounded-full 
                 w-14 h-14 transition-all duration-200`}
      onClick={addPostIt}
      title="Add new post-it"
    >
      <Plus className="text-neutral-600" size={24} />
    </button>
  );
};

export default AddButton;