import { useUser } from '@stackframe/react';

import Canvas from '@/components/canvas';
import Toolbar from '@/components/toolbar';
import ActiveUsers from '@/components/active-users';
import { PostItsProvider } from '@/contexts/post-its-provider';

function App() {
  useUser({or: "redirect"});

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