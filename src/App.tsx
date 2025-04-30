import React, { useEffect } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import ActiveUsers from './components/ActiveUsers';
import { PostItsProvider } from './context/PostItsContext';
import { getUserId } from './utils/helpers';

function App() {
  useEffect(() => {
    // Get or create user ID
    const userId = getUserId();
    
    // Check if URL already contains user_id
    if (!window.location.pathname.includes('/user_id/')) {
      // Only add user_id to URL if it's not already there
      const basePath = window.location.pathname.endsWith('/') 
        ? window.location.pathname.slice(0, -1) 
        : window.location.pathname;
      
      const newUrl = `${basePath}/user_id/${userId}${window.location.search}`;
      window.history.replaceState(null, '', newUrl);
    }
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-neutral-50">
      <PostItsProvider> 
        <div className="relative h-full w-full">
          <Toolbar />
          <ActiveUsers />
          <Canvas />
        </div>
      </PostItsProvider>
    </div>
  );
}

export default App;