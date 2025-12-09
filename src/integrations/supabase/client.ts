import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const SUPABASE_URL = "https://hdyuuykxujqjrpthswbi.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkeXV1eWt4dWpxanJwdGhzd2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1Njc1NTEsImV4cCI6MjA3MjE0MzU1MX0.bmuf49YIB6ryd2Q7h9vo5UO-4fSaQ0M2U28beGye3Qk"

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})