import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { PostIt, PostItColor, PostItsState } from '../types';
import { generateId, getRandomPosition, getUserId } from '../utils/helpers';
import { useZero, useQuery } from '@rocicorp/zero/react';
import type { Schema } from '../schema';

// Define database post-it type
type DBPostIt = {
  id: string;
  content: string;
  color: string;
  position_x: number;
  position_y: number;
  size_width: number;
  size_height: number;
  z_index: number;
  created_at: number;
  updated_at: number;
  created_by: string;
};

// PostItsAction type definition
type PostItsAction =
  | { type: 'ADD_POSTIT'; payload: PostIt }
  | { type: 'UPDATE_POSTIT'; payload: PostIt }
  | { type: 'UPDATE_ALL_POSTITS'; payload: PostIt[] }
  | { type: 'DELETE_POSTIT'; payload: string }
  | { type: 'SET_COLOR'; payload: PostItColor }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'UNDO' }
  | { type: 'REDO' };

const initialState: PostItsState = {
  postIts: [],
  selectedColor: 'yellow',
  zoomLevel: 1,
  history: {
    past: [],
    future: []
  }
};

function postItsReducer(state: PostItsState, action: PostItsAction): PostItsState {
  switch (action.type) {
    case 'ADD_POSTIT': {
      const newPostIts = [...state.postIts, action.payload];
      return {
        ...state,
        postIts: newPostIts,
        history: {
          past: [...state.history.past, state.postIts],
          future: []
        }
      };
    }
    case 'UPDATE_POSTIT': {
      const index = state.postIts.findIndex(p => p.id === action.payload.id);
      if (index === -1) return state;

      const updatedPostIts = [...state.postIts];
      updatedPostIts[index] = action.payload;

      return {
        ...state,
        postIts: updatedPostIts,
        history: {
          past: [...state.history.past, state.postIts],
          future: []
        }
      };
    }
    case 'DELETE_POSTIT': {
      const filteredPostIts = state.postIts.filter(p => p.id !== action.payload);
      return {
        ...state,
        postIts: filteredPostIts,
        history: {
          past: [...state.history.past, state.postIts],
          future: []
        }
      };
    }
    case 'SET_COLOR': {
      return {
        ...state,
        selectedColor: action.payload
      };
    }
    case 'SET_ZOOM': {
      return {
        ...state,
        zoomLevel: action.payload
      };
    }
    case 'UNDO': {
      if (state.history.past.length === 0) return state;
      
      const previous = state.history.past[state.history.past.length - 1];
      const newPast = state.history.past.slice(0, state.history.past.length - 1);
      
      return {
        ...state,
        postIts: previous,
        history: {
          past: newPast,
          future: [state.postIts, ...state.history.future]
        }
      };
    }
    case 'REDO': {
      if (state.history.future.length === 0) return state;
      
      const next = state.history.future[0];
      const newFuture = state.history.future.slice(1);
      
      return {
        ...state,
        postIts: next,
        history: {
          past: [...state.history.past, state.postIts],
          future: newFuture
        }
      };
    }
    case 'UPDATE_ALL_POSTITS': {
      return {
        ...state,
        postIts: action.payload,
        history: {
          past: [...state.history.past, state.postIts],
          future: []
        }
      };
    }
    default:
      return state;
  }
}

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

const PostItsContext = createContext<PostItsContextType | undefined>(undefined);

export function PostItsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(postItsReducer, initialState);
  const z = useZero<Schema>();
  // const [postIts] = useQuery(z.query.post_its, {
  //   ttl: "forever",
  // });
  const [userCursors] = useQuery(z.query.user_cursors.where("user_id", "IS NOT", getUserId()).where("updated_at", ">", Date.now() - 1000 * 60 * 5));

  // Actions
  const addPostIt = () => {
    const userId = getUserId();
    const newPostIt: PostIt = {
      id: generateId(),
      content: 'New note',
      color: state.selectedColor,
      position: getRandomPosition(200, 200),
      size: { width: 200, height: 200 },
      zIndex: Math.max(...state.postIts.map(p => p.zIndex), 0) + 1,
      created_by: userId
    };
    
    // Add to local state
    dispatch({ type: 'ADD_POSTIT', payload: newPostIt });

    // Persist to Zero database
    z.mutate.post_its.insert({
      id: newPostIt.id,
      content: newPostIt.content,
      color: newPostIt.color,
      position_x: newPostIt.position.x,
      position_y: newPostIt.position.y,
      size_width: newPostIt.size.width,
      size_height: newPostIt.size.height,
      z_index: newPostIt.zIndex,
      created_at: Date.now(),
      updated_at: Date.now(),
      created_by: userId
    });

    return true;
  };

  const updatePostIt = (postIt: PostIt & { created_at?: number }) => {

    // Update local state
    dispatch({ type: 'UPDATE_POSTIT', payload: postIt });

    // Persist to Zero database
    z.mutate.post_its.update({
      id: postIt.id,
      content: postIt.content,
      position_x: postIt.position.x,
      position_y: postIt.position.y,
      size_width: postIt.size.width,
      size_height: postIt.size.height,
      z_index: postIt.zIndex,
      created_at: (postIt as any).created_at || Date.now(),
      updated_at: Date.now(),
      created_by: postIt.created_by,
      color: postIt.color,
    });

    return true;
  };

  const deletePostIt = (id: string) => {
    // Update local state
    dispatch({ type: 'DELETE_POSTIT', payload: id });

    // Delete from Zero database
    z.mutate.post_its.delete({ id });
    return true;
  };

  const setColor = (color: PostItColor) => {
    dispatch({ type: 'SET_COLOR', payload: color });
  };

  const setZoom = (level: number) => {
    dispatch({ type: 'SET_ZOOM', payload: level });
  };

  const undo = () => {
    dispatch({ type: 'UNDO' });
  };

  const redo = () => {
    dispatch({ type: 'REDO' });
  };

  // Cursor position update
  const setCursorPosition = (x: number, y: number) => {
    const userId = getUserId();
    const now = Date.now();
    z.mutate.user_cursors.upsert({
      user_id: userId,
      x,
      y,
      updated_at: now,
    });
  };

  return (
    <PostItsContext.Provider
      value={{
        dispatch,
        addPostIt,
        updatePostIt,
        deletePostIt,
        setColor,
        setZoom,
        undo,
        redo,
        setCursorPosition,
        userCursors,
        state,
      }}
    >
      {children}
    </PostItsContext.Provider>
  );
}

export function usePostIts() {
  const context = useContext(PostItsContext);
  if (context === undefined) {
    throw new Error('usePostIts must be used within a PostItsProvider');
  }
  return context;
}