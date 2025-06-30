import { supabase } from './services/supabase';

// Test script to diagnose authentication issues
async function testAuth() {
  const email = 'alexleontaridis230708@gmail.com';
  
  console.log('=== Auth Diagnostic Test ===');
  console.log('Testing email:', email);
  
  // Test 1: Check if we can send a password reset email
  console.log('\n1. Testing password reset...');
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5180'
    });
    
    if (error) {
      console.log('❌ Password reset failed:', error.message);
      console.log('This suggests the user does not exist in Supabase auth.users table');
    } else {
      console.log('✅ Password reset email sent successfully');
      console.log('This confirms the user exists in Supabase auth.users table');
    }
  } catch (err) {
    console.log('❌ Error during password reset test:', err);
  }
  
  // Test 2: Check current session
  console.log('\n2. Checking current session...');
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    console.log('✅ User is currently logged in:', session.user.email);
  } else {
    console.log('ℹ️ No active session found');
  }
  
  // Test 3: List all auth users (this might not work with anon key)
  console.log('\n3. Testing user lookup...');
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.log('❌ Cannot list users (requires admin privileges):', error.message);
    } else {
      const user = data.users.find(u => u.email === email);
      if (user) {
        console.log('✅ User found in auth system:', {
          id: user.id,
          email: user.email,
          confirmed: user.email_confirmed_at ? 'Yes' : 'No',
          created: user.created_at
        });
      } else {
        console.log('❌ User not found in auth system');
      }
    }
  } catch (err) {
    console.log('❌ Error listing users:', err);
  }
  
  console.log('\n=== Diagnostic Complete ===');
  console.log('\nRecommendations:');
  console.log('1. If password reset failed: Create a new account with signup');
  console.log('2. If password reset succeeded: Use the reset link to set a new password');
  console.log('3. Check your Supabase dashboard > Authentication > Users to see if the user exists');
}

// Run the test
testAuth().catch(console.error); 