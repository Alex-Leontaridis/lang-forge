import React, { useState } from 'react';
import { supabase, logAuthAttempt } from '../services/supabase';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        console.log('Attempting login with:', { email, password: password ? '[HIDDEN]' : 'empty' });
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        console.log('Login response:', { data, error });

        if (error) {
          console.error('Login error:', error);
          await logAuthAttempt(email, 'failure', error.message);
          setMessage(error.message);
        } else {
          console.log('Login successful:', data);
          await logAuthAttempt(email, 'success');
          setMessage('Login successful!');
          // Redirect to app after successful login
          window.location.href = '/app';
        }
      } else {
        console.log('Attempting signup with:', { email, password: password ? '[HIDDEN]' : 'empty' });
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        console.log('Signup response:', { data, error });

        if (error) {
          console.error('Signup error:', error);
          await logAuthAttempt(email, 'failure', error.message);
          setMessage(error.message);
        } else {
          console.log('Signup successful:', data);
          await logAuthAttempt(email, 'success');
          setMessage('Sign up successful! Redirecting...');
          // Redirect to app immediately after successful signup
          setTimeout(() => {
            window.location.href = '/app';
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setMessage('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Bird Emoji */}
        <div className="text-center mb-8">
          <span className="text-6xl">🦜</span>
        </div>

        {/* Auth Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          {/* Toggle */}
          <div className="flex mb-8 bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                isLogin
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                !isLogin
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Message */}
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('successful') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth; 