import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, logAuthAttempt } from '../services/supabase';

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Test Supabase connection
  const testConnection = async () => {
    try {
      const { data, error } = await supabase.from('email_auth_logs').select('count').limit(1);
      console.log('Supabase connection test:', { data, error });
      return !error;
    } catch (err) {
      console.error('Supabase connection test failed:', err);
      return false;
    }
  };

  // Check if user exists in auth
  const checkUserExists = async (email: string) => {
    try {
      // Try to get user by email (this will only work if you have admin privileges)
      // For now, we'll just log the attempt
      console.log('Checking if user exists for email:', email);
      
      // Alternative: try to reset password to see if user exists
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      
      if (error) {
        console.log('User check result:', error.message);
        return false;
      } else {
        console.log('Password reset email sent - user exists');
        return true;
      }
    } catch (err) {
      console.error('Error checking user existence:', err);
      return false;
    }
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!email || !email.includes('@')) {
      setMessage('Please enter your email address first');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage('Password reset email sent! Check your inbox.');
      }
    } catch (error) {
      setMessage('An error occurred while sending reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Test connection first
    const isConnected = await testConnection();
    console.log('Supabase connection status:', isConnected);

    // Basic validation
    if (!email || !email.includes('@')) {
      setMessage('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!password || password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

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
          
          // Provide more helpful error messages
          if (error.message === 'Invalid login credentials') {
            setMessage('Invalid credentials. Please check your email and password. If you recently signed up, try signing up again or use the "Forgot Password" option.');
            
            // Check if user exists
            const userExists = await checkUserExists(email);
            if (!userExists) {
              setMessage('Account not found. Please sign up first or check your email address.');
            }
          } else {
            setMessage(error.message);
          }
        } else {
          console.log('Login successful:', data);
          await logAuthAttempt(email, 'success');
          setMessage('Login successful!');
          // Redirect to dashboard after successful login
          navigate('/dashboard');
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
          
          // Provide more helpful error messages for signup
          if (error.message.includes('already registered')) {
            setMessage('This email is already registered. Please try logging in instead.');
          } else if (error.message.includes('password')) {
            setMessage('Password should be at least 6 characters long.');
          } else {
            setMessage(error.message);
          }
        } else {
          console.log('Signup successful:', data);
          await logAuthAttempt(email, 'success');
          setMessage('Sign up successful! Redirecting...');
          // Redirect to dashboard immediately after successful signup
          setTimeout(() => {
            navigate('/dashboard');
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
        {/* Go back to home button */}
        <div className="text-center mb-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-black transition-colors flex items-center justify-center space-x-2 mx-auto"
          >
            <span>←</span>
            <span>Go back to home</span>
          </button>
        </div>

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
              {isLogin && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="mt-2 text-sm text-gray-600 hover:text-black transition-colors"
                >
                  Forgot Password?
                </button>
              )}
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

          {/* Helpful message */}
          {isLogin && (
            <div className="mt-4 text-center text-sm text-gray-600">
              Don't have an account? <button 
                onClick={() => setIsLogin(false)} 
                className="text-black font-medium hover:underline"
              >
                Sign up here
              </button>
            </div>
          )}
          {!isLogin && (
            <div className="mt-4 text-center text-sm text-gray-600">
              Already have an account? <button 
                onClick={() => setIsLogin(true)} 
                className="text-black font-medium hover:underline"
              >
                Login here
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth; 