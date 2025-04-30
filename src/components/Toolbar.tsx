import React from 'react';
import { usePostIts } from '../context/PostItsContext';
import { getColorTabClass } from '../utils/helpers';
import { PostItColor } from '../types';
import { Undo, Redo, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const Toolbar: React.FC = () => {
  const { state, setColor, undo, redo, setZoom } = usePostIts();
  
  const colors: PostItColor[] = ['yellow', 'pink', 'blue', 'green'];
  
  const zoomIn = () => {
    setZoom(Math.min(state.zoomLevel + 0.1, 2));
  };
  
  const zoomOut = () => {
    setZoom(Math.max(state.zoomLevel - 0.1, 0.5));
  };
  
  const resetZoom = () => {
    setZoom(1);
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 
                    bg-white/90 backdrop-blur-sm shadow-lg rounded-full px-4 py-2 
                    flex items-center space-x-4 border border-neutral-200">
      <div className="flex items-center space-x-2">
        {colors.map((color) => (
          <button
            key={color}
            className={getColorTabClass(color, state.selectedColor === color)}
            onClick={() => setColor(color)}
            title={`${color.charAt(0).toUpperCase() + color.slice(1)} post-it`}
          />
        ))}
      </div>
      
      <div className="h-8 w-px bg-neutral-200"></div>
      
      <div className="flex items-center space-x-2">
        <button
          className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 
                    disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
          onClick={undo}
          disabled={state.history.past.length === 0}
          title="Undo"
        >
          <Undo size={18} />
        </button>
        <button
          className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 
                    disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
          onClick={redo}
          disabled={state.history.future.length === 0}
          title="Redo"
        >
          <Redo size={18} />
        </button>
      </div>
      
      <div className="h-8 w-px bg-neutral-200"></div>
      
      <div className="flex items-center space-x-2">
        <button
          className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors duration-150"
          onClick={zoomOut}
          title="Zoom out"
        >
          <ZoomOut size={18} />
        </button>
        <button
          className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors duration-150"
          onClick={resetZoom}
          title="Reset zoom"
        >
          <RotateCcw size={16} />
        </button>
        <button
          className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors duration-150"
          onClick={zoomIn}
          title="Zoom in"
        >
          <ZoomIn size={18} />
        </button>
        <span className="text-xs font-medium text-neutral-500 ml-1 w-10 text-center">
          {Math.round(state.zoomLevel * 100)}%
        </span>
      </div>
    </div>
  );
};

export default Toolbar;