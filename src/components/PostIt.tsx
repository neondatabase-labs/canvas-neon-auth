import React, { useState, useRef, useEffect } from 'react';
import { usePostIts } from '../context/PostItsContext';
import { getColorClass, getUserId } from '../utils/helpers';
import { Trash } from 'lucide-react';
import { PostItColor } from '../types';

interface PostItProps {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  content: string;
  color: string;
  created_by: string;
  onClick: () => void;
}

const PostIt: React.FC<PostItProps> = ({ id, position, size, zIndex, content: initialContent, color, created_by, onClick }) => {
  const { updatePostIt, deletePostIt } = usePostIts();
  const [pos, setPos] = useState(position);
  const [sz, setSz] = useState(size);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const postItRef = useRef<HTMLDivElement>(null);

  // Track previous values
  const prevDragging = useRef(isDragging);

  // Check if current user is the creator
  const isCreator = created_by === getUserId();

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        content.length,
        content.length
      );
    }
  }, [isEditing, content]);

  useEffect(() => {
    if (isDragging) {
      // console.log("isDragging", isDragging);
      const handleMouseMove = (e: MouseEvent) => {
        if (!isCreator) return; // Prevent dragging if not creator
        if (isDragging) {
          const dx = e.clientX - dragStart.x;
          const dy = e.clientY - dragStart.y;
          setPos({
            x: pos.x + dx,
            y: pos.y + dy
          });
          setDragStart({ x: e.clientX, y: e.clientY });
        }
      };

      const handleMouseUp = () => {
        if (!isCreator) return; // Prevent updates if not creator
        if (isDragging) {
          // console.log("updatePostIt", id);
          updatePostIt({
            id,
            position: pos,
            size: sz,
            zIndex,
            content,
            color: color as PostItColor,
            created_by,
          });
        } else {
          updatePostIt({
            id,
            position: pos,
            size: sz,
            zIndex,
            content,
            color: color as PostItColor,
            created_by,
          });
        }
        setIsDragging(false);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, pos, sz, id, zIndex, content, color, created_by, updatePostIt, isCreator]);

  useEffect(() => {
    if (prevDragging.current && !isDragging) {
      updatePostIt({
        id,
        position: pos,
        size: sz,
        zIndex,
        content,
        color: color as PostItColor,
        created_by,
      });
    }
    prevDragging.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    if (!isDragging) setPos(position);
  }, [position, isDragging]);

  useEffect(() => {
    setSz(size);
  }, [size]);

  useEffect(() => {
    if (!isEditing) setContent(initialContent);
  }, [initialContent, isEditing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isCreator) return; // Prevent dragging if not creator
    e.stopPropagation();
    onClick();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!isCreator) return; // Prevent editing if not creator
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isCreator) return;
    const newContent = e.target.value;
    setContent(newContent);
    
    updatePostIt({
      id,
      position: pos,
      size: sz,
      zIndex,
      content: newContent,
      color: color as PostItColor,
      created_by,
    });
  };

  const handleBlur = () => {
    if (!isCreator) return;
    setIsEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    if (!isCreator) return; // Prevent deletion if not creator
    e.stopPropagation();
    deletePostIt(id);
  };

  const colorClasses = getColorClass(color);
  const cursorClass = !isCreator ? 'cursor-not-allowed' : isDragging ? 'cursor-grabbing' : 'cursor-grab';
  const opacity = isCreator || isHovered ? 1 : 0.5;

  return (
    <div
      ref={postItRef}
      className={`post-it absolute shadow-md border-2 rounded-md p-3 transition-shadow duration-200 
                  ${colorClasses} ${cursorClass}
                  ${showControls && isCreator ? 'shadow-lg' : ''}`}
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${sz.width}px`,
        height: `${sz.height}px`,
        zIndex: zIndex,
        opacity,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => { setShowControls(true); setIsHovered(true); }}
      onMouseLeave={() => { setShowControls(false); setIsHovered(false); }}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          className={`w-full h-full resize-none bg-transparent p-1 focus:outline-none ${!isCreator ? 'cursor-not-allowed' : ''}`}
          value={content}
          onChange={handleContentChange}
          onBlur={handleBlur}
          readOnly={!isCreator}
        />
      ) : (
        <div className="w-full h-full overflow-auto p-1 whitespace-pre-wrap break-words">
          {content}
        </div>
      )}
      {isCreator && (
        <div 
          className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize opacity-60 hover:opacity-100"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23666' d='M10 14L14 10M6 14L14 6M2 14L14 2'/%3E%3C/svg%3E")`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>
      )}
      {showControls && isCreator && (
        <button
          className="absolute top-1 right-1 bg-white/80 hover:bg-white rounded-full p-1
                    text-neutral-400 hover:text-red-500 transition-colors duration-150"
          onClick={handleDelete}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Trash size={14} />
        </button>
      )}
    </div>
  );
};

export default PostIt;