
import React from 'react';
import ChatInterface from './components/ChatInterface';
import { Header } from './components/Header';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="flex flex-col h-screen font-sans bg-dark-bg text-dark-text antialiased">
      <Header />
      <main className="flex-1 overflow-hidden">
        <ChatInterface />
      </main>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#2a2a2a',
            color: '#e0e0e0',
          },
        }}
      />
    </div>
  );
}

export default App;
