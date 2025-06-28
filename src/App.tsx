import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage';
import PromptForge from './components/PromptForge';
import PromptChainCanvas from './components/PromptChainCanvas';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/app" element={<PromptForge />} />
          <Route path="/canvas" element={<PromptChainCanvas />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;