import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Homepage from './components/Homepage';
import PromptForge from './components/PromptForge';
import PromptChainCanvas from './components/PromptChainCanvas';
import Auth from './components/Auth';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/app" 
              element={
                <ProtectedRoute>
                  <PromptForge />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/canvas" 
              element={
                <ProtectedRoute>
                  <PromptChainCanvas />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;