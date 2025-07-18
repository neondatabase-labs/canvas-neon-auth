export interface PostIt {
  id: string;
  content: string;
  color: PostItColor;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  created_by: string;
  created_at?: number;
  updated_at?: number;
}

export type PostItColor = 'yellow' | 'pink' | 'blue' | 'green';

export interface User {
  id: string;
  name: string;
  avatar: string;
  isActive: boolean;
}

export interface PostItsState {
  postIts: PostIt[];
  selectedColor: PostItColor;
  zoomLevel: number;
  history: {
    past: PostIt[][];
    future: PostIt[][];
  };
}

export type PostItsAction = 
  | { type: 'ADD_POSTIT'; payload: PostIt }
  | { type: 'UPDATE_POSTIT'; payload: PostIt }
  | { type: 'DELETE_POSTIT'; payload: string }
  | { type: 'SET_COLOR'; payload: PostItColor }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'UNDO' }
  | { type: 'REDO' };