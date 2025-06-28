import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage';
import PromptForge from './components/PromptForge';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/app" element={<PromptForge />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;