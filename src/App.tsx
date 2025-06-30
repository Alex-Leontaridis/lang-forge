import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WalkthroughProvider } from './contexts/WalkthroughContext';
import ProtectedRoute from './components/ProtectedRoute';
import Homepage from './components/Homepage';
import Dashboard from './components/Dashboard';
import PromptForge from './components/PromptForge';
import PromptChainCanvas from './components/PromptChainCanvas';
import Auth from './components/Auth';
import Walkthrough from './components/Walkthrough';
import WalkthroughTrigger from './components/WalkthroughTrigger';

function App() {
  return (
    <AuthProvider>
      <WalkthroughProvider>
        <Router>
          <div className="min-h-screen bg-white">
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
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
            
            {/* Walkthrough components */}
            <Walkthrough />
            <WalkthroughTrigger />
          </div>
        </Router>
      </WalkthroughProvider>
    </AuthProvider>
  );
}

export default App;