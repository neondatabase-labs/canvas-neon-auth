import React, { useReducer } from 'react';

import { useZero, useQuery } from '@rocicorp/zero/react';

import { PostIt, PostItColor, PostItsState } from '@/types';
import { generateId, getRandomPosition } from '@/utils/helpers';
import { useUserId } from '@/contexts/auth-context';
import { PostItsContext, PostItsAction } from '@/contexts/post-its-context';

import type { Schema } from '@/schema';

// Initial state
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
    default:
      return state;
  }
}

export function PostItsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(postItsReducer, initialState);
  const z = useZero<Schema>();
  const userId = useUserId();

  const [userCursors] = useQuery(z.query.user_cursors.where("user_id", "IS NOT", userId || 'anonymous').where("updated_at", ">", Date.now() - 1000 * 60 * 5));

  // Actions
  const addPostIt = () => {
    if (!userId) return false; // Don't allow adding post-its without authenticated user
    
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
      created_at: postIt.created_at || Date.now(),
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
    if (!userId) return; // Don't update cursor if no authenticated user
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