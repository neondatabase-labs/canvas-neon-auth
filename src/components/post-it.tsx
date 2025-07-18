import React, { useState, useRef, useEffect, useCallback } from 'react';

import { Trash } from 'lucide-react';

import { usePostIts } from '@/contexts/post-its-context';
import { getColorClass } from '@/utils/helpers';
import { PostItColor } from '@/types';
import { useUserId } from '@/contexts/auth-context';

interface PostItProps {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  content: string;
  color: PostItColor;
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

  // Debouncing refs
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const pendingContentRef = useRef<string>(content);
  const isUpdatingRef = useRef<boolean>(false);
  
  // Current values refs to avoid stale closures
  const currentPosRef = useRef(pos);
  const currentSzRef = useRef(sz);

  // Update refs when values change
  useEffect(() => {
    currentPosRef.current = pos;
    currentSzRef.current = sz;
  }, [pos, sz]);

  // Check if current user is the creator
  const userId = useUserId();
  const isCreator = created_by === userId;

  // Debounced update function - using refs to avoid stale closures
  const debouncedUpdateContent = useCallback(() => {
    if (isUpdatingRef.current) {
      console.log('Update skipped - already updating');
      return;
    }
    
    isUpdatingRef.current = true;
    const now = Date.now();
    lastUpdateTimeRef.current = now;
    
    console.log('Debounced content update for', id);
    updatePostIt({
      id,
      position: currentPosRef.current,
      size: currentSzRef.current,
      zIndex,
      content: pendingContentRef.current,
      color: color as PostItColor,
      created_by,
    });
    
    // Reset flag after a short delay to allow other updates
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 100);
  }, [updatePostIt, id, zIndex, color, created_by]);

  // Content change handler with debouncing
  const handleContentUpdate = useCallback((newContent: string) => {
    if (!isCreator) return;
    
    pendingContentRef.current = newContent;
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // If it's been more than 1 second since last update, update immediately
    if (timeSinceLastUpdate >= 1000) {
      debouncedUpdateContent();
    } else {
      // Otherwise, debounce for 500ms
      debounceTimeoutRef.current = setTimeout(() => {
        debouncedUpdateContent();
      }, 500);
    }
  }, [isCreator, debouncedUpdateContent]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        content.length,
        content.length
      );
    }
  }, [isEditing, content]);

  // Global mouse move handler for dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !isCreator) return;
      
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      const newPos = {
        x: Math.max(0, pos.x + dx),
        y: Math.max(0, pos.y + dy)
      };
      
      setPos(newPos);
      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleGlobalMouseUp = () => {
      if (isDragging && prevDragging.current) {
        // Update in database when drag ends
        console.log('Drag end update for', id);
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

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    // Update previous dragging state
    prevDragging.current = isDragging;

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStart, pos, sz, isCreator, updatePostIt, id, zIndex, content, color, created_by]);

  // Resizing logic
  useEffect(() => {
    const handleResize = (e: MouseEvent) => {
      if (!postItRef.current) return;
      
      const rect = postItRef.current.getBoundingClientRect();
      const newSize = {
        width: Math.max(150, e.clientX - rect.left),
        height: Math.max(100, e.clientY - rect.top)
      };
      setSz(newSize);
    };

    const handleResizeEnd = () => {
      console.log('Resize end update for', id);
      updatePostIt({
        id,
        position: pos,
        size: sz,
        zIndex,
        content,
        color: color as PostItColor,
        created_by,
      });
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', handleResizeEnd);
    };

    const resizeHandle = postItRef.current?.querySelector('.resize-handle');
    
    const handleResizeStart = (e: MouseEvent) => {
      if (!isCreator) return;
      e.preventDefault();
      e.stopPropagation();
      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', handleResizeEnd);
    };

    resizeHandle?.addEventListener('mousedown', handleResizeStart as EventListener);

    return () => {
      resizeHandle?.removeEventListener('mousedown', handleResizeStart as EventListener);
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [pos, sz, isCreator, updatePostIt, id, zIndex, content, color, created_by]);

  useEffect(() => {
    if (!isEditing) setContent(initialContent);
  }, [initialContent, isEditing]);

  // Sync external position/size changes with local state when not dragging
  useEffect(() => {
    if (!isDragging) {
      const currentPos = currentPosRef.current;
      const currentSz = currentSzRef.current;
      const hasPositionChange = currentPos.x !== position.x || currentPos.y !== position.y;
      const hasSizeChange = currentSz.width !== size.width || currentSz.height !== size.height;
      
      if (hasPositionChange || hasSizeChange) {
        console.log('Syncing external change for', id, 'pos:', hasPositionChange, 'size:', hasSizeChange);
        setPos(position);
        setSz(size);
      }
    }
  }, [position.x, position.y, size.width, size.height, isDragging, id]);

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
    
    // Update local state immediately for responsive UI
    setContent(newContent);
    
    // Debounce the database update
    handleContentUpdate(newContent);
  };

  const handleBlur = () => {
    if (!isCreator) return;
    
    // Flush any pending debounced updates immediately
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
      debouncedUpdateContent();
    }
    
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
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
          onClick={handleDelete}
          title="Delete post-it"
        >
          <Trash size={12} />
        </button>
      )}
    </div>
  );
};

export default PostIt;