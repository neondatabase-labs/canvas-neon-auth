import React from 'react';
import { usePostIts } from '../context/PostItsContext';

// Color palette and color function (should match Canvas.tsx)
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
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return cursorColors[Math.abs(hash) % cursorColors.length];
}

const ActiveUsers: React.FC = () => {
  const { userCursors } = usePostIts();

  return (
    <div className="absolute top-4 right-4 z-50 flex items-center">
      <div className="flex -space-x-2 mr-2">
        {userCursors.map((user) => (
          <div
            key={user.user_id}
            className="relative group"
          >
            {/* Filled color circle */}
            <span
              className="w-8 h-8 rounded-full border-2 inline-flex items-center justify-center"
              style={{
                background: getColorForUser(user.user_id),
                borderColor: '#fff',
                color: '#fff',
                fontWeight: 700,
                fontSize: 13,
                userSelect: 'none',
              }}
              title={user.user_id}
            >
              {user.user_id.slice(0, 2).toUpperCase()}
            </span>
            {/* Online indicator */}
            <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 border border-white"></span>
          </div>
        ))}
      </div>
      <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-full px-3 py-1 
                    text-xs text-neutral-600 font-medium border border-neutral-200">
        {userCursors.length} Collaborator{userCursors.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default ActiveUsers;