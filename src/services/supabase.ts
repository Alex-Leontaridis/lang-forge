import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dkwzawdkqvycdoykhtvw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrd3phd2RrcXZ5Y2RveWtodHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODczODcsImV4cCI6MjA2Njg2MzM4N30.nKDVVHIFxNnf27WmuNT650Mf6imYzMmKczojXp0-O98'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Function to log authentication attempts
export const logAuthAttempt = async (email: string, status: 'success' | 'failure', errorMessage?: string) => {
  try {
    const { error } = await supabase
      .from('email_auth_logs')
      .insert({
        user_email: email,
        status: status,
        error_message: errorMessage || null
      })
    
    if (error) {
      console.error('Error logging auth attempt:', error)
    }
  } catch (err) {
    console.error('Error logging auth attempt:', err)
  }
} 