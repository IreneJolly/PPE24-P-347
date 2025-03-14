import { createClient } from '@supabase/supabase-js';

// This client has admin privileges and can bypass RLS for debugging purposes
// IMPORTANT: This should only be used for development and debugging
// In production environments, always use proper permissions and RLS policies
const adminClient = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false
        }
      }
    )
  : null;

export async function adminQueryWithoutRLS(table: string, query: (sb: any) => any) {
  if (!adminClient) {
    console.error('Admin client not initialized! Missing environment variables.');
    return { data: null, error: new Error('Admin client not initialized') };
  }
  
  try {
    // Use the service role key to bypass RLS
    return await query(adminClient.from(table));
  } catch (error) {
    console.error(`Error in admin query to ${table}:`, error);
    return { data: null, error };
  }
}

export default adminClient; 