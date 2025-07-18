import React, { createContext, useContext } from 'react';

import { PostIt, PostItColor, PostItsState } from '@/types';

// PostItsAction type definition
type PostItsAction =
  | { type: 'ADD_POSTIT'; payload: PostIt }
  | { type: 'UPDATE_POSTIT'; payload: PostIt }
  | { type: 'DELETE_POSTIT'; payload: string }
  | { type: 'SET_COLOR'; payload: PostItColor }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'UNDO' }
  | { type: 'REDO' };

// User cursor type
type UserCursor = {
  user_id: string;
  x: number;
  y: number;
  updated_at: number;
};

type PostItsContextType = {
  dispatch: React.Dispatch<PostItsAction>;
  addPostIt: () => void;
  updatePostIt: (postIt: PostIt) => void;
  deletePostIt: (id: string) => void;
  setColor: (color: PostItColor) => void;
  setZoom: (level: number) => void;
  undo: () => void;
  redo: () => void;
  setCursorPosition: (x: number, y: number) => void;
  userCursors: UserCursor[];
  state: PostItsState;
};

export const PostItsContext = createContext<PostItsContextType | undefined>(undefined);

export function usePostIts() {
  const context = useContext(PostItsContext);
  if (context === undefined) {
    throw new Error('usePostIts must be used within a PostItsProvider');
  }
  return context;
}

export type { PostItsAction, UserCursor, PostItsContextType }; 