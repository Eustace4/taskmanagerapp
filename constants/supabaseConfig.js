import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsegjxlazxkcqrkhgwzx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZWdqeGxhenhrY3Fya2hnd3p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NzkwODEsImV4cCI6MjA2NjU1NTA4MX0.SoKwIINwxJ25cagBVF5ZSSHc9RPCj2CTkusOOeYDpxg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
