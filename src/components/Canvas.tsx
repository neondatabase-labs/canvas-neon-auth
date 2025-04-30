import React, { useRef, useState, useEffect } from 'react';
import PostIt from './PostIt';
import AddButton from './AddButton';
import { usePostIts } from '../context/PostItsContext';
import { Schema } from '../schema';
import { useZero, useQuery } from '@rocicorp/zero/react';

// Color palette for user cursors
const cursorColors = [
  '#f59e42', // orange
  '#3b82f6', // blue
  '#10b981', // green
  '#f43f5e', // pink
  '#a21caf', // purple
  '#eab308', // yellow
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#ef4444', // red
  '#8b5cf6', // violet
];

function getColorForUser(userId: string) {
  // Simple hash to pick a color
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return cursorColors[Math.abs(hash) % cursorColors.length];
}

const Canvas: React.FC = () => {
  const z = useZero<Schema>();
  const [postIts] = useQuery(z.query.post_its, {
    ttl: "forever",
  });
  const { updatePostIt, setCursorPosition, userCursors, state } = usePostIts();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });

  // Ref to store the latest mouse position
  const latestMouse = useRef({ x: 0, y: 0 });
  // Ref to store the last saved position
  const lastSaved = useRef({ x: 0, y: 0 });

  // Save cursor position every 500ms, but only if moved > 20px from last saved
  useEffect(() => {
    const interval = setInterval(() => {
      const { x, y } = latestMouse.current;
      const { x: lastX, y: lastY } = lastSaved.current;
      if (Math.abs(x - lastX) > 20 || Math.abs(y - lastY) > 20) {
        setCursorPosition(x, y);
        lastSaved.current = { x, y };
      }
    }, 500);
    return () => clearInterval(interval);
  }, [setCursorPosition]);

  // Handle canvas drag for panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.post-it')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    // Always update the latest mouse position
    latestMouse.current = { x: e.clientX, y: e.clientY };
    if (!isDragging) return;
    const dx = (e.clientX - dragStart.x) / state.zoomLevel;
    const dy = (e.clientY - dragStart.y) / state.zoomLevel;
    setCanvasPosition({
      x: canvasPosition.x + dx,
      y: canvasPosition.y + dy
    });
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  // Bring post-it to front on click
  const handlePostItClick = (id: string) => {
    console.log("handlePostItClick", id);
    const postIt = state.postIts.find(p => p.id === id);
    if (!postIt) return;
    
    const maxZIndex = Math.max(...state.postIts.map(p => p.zIndex));
    if (postIt.zIndex < maxZIndex) {
      updatePostIt({
        ...postIt,
        zIndex: maxZIndex + 1
      });
    }
  };

  return (
    <div 
      className="absolute inset-0 overflow-hidden bg-white"
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onMouseLeave={handleCanvasMouseUp}
    >
      {/* Render all user cursors except current user */}
      {userCursors.map((cursor) => {
        const color = getColorForUser(cursor.user_id);
        return (
          <div
            key={cursor.user_id}
            style={{
              position: 'absolute',
              left: cursor.x,
              top: cursor.y,
              zIndex: 9999,
              pointerEvents: 'none',
              transform: 'translate(-30%, -80%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Big SVG cursor */}
            <svg width="48" height="48" viewBox="0 0 48 48" style={{ filter: 'drop-shadow(0 2px 8px #0004)' }}>
              <path
                d="M8 4L40 24L26 28L24 44L18 28L8 4Z"
                fill={color}
                stroke="#fff"
                strokeWidth="2"
                style={{ paintOrder: 'stroke' }}
              />
            </svg>
            {/* User label */}
            <div style={{
              marginTop: 2,
              fontSize: 13,
              fontWeight: 700,
              color,
              background: '#fff',
              borderRadius: 6,
              padding: '2px 8px',
              boxShadow: '0 1px 4px #0002',
              border: `1.5px solid ${color}`,
              userSelect: 'none',
              minWidth: 36,
              textAlign: 'center',
            }}>{cursor.user_id.slice(0, 6)}</div>
          </div>
        );
      })}

      {/* Zoom and panning container */}
      <div 
        ref={canvasRef}
        className="absolute inset-0 transition-transform duration-75"
        style={{
          transform: `scale(${state.zoomLevel}) translate(${canvasPosition.x}px, ${canvasPosition.y}px)`,
          transformOrigin: '0 0'
        }}
      >
        {/* Render all post-its from live query */}
        {(postIts).map((postIt: any) => (
          <PostIt
            key={postIt.id}
            id={postIt.id}
            position={{ x: postIt.position_x, y: postIt.position_y }}
            size={{ width: postIt.size_width, height: postIt.size_height }}
            zIndex={postIt.z_index}
            content={postIt.content}
            color={postIt.color as any}
            created_by={postIt.created_by}
            onClick={() => handlePostItClick(postIt.id)}
          />
        ))}
      </div>
      
      <AddButton />
    </div>
  );
};

export default Canvas;