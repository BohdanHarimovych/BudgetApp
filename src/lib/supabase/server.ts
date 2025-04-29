import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function createServerSupabaseClient() {
    const cookieStore = await cookies()

    return createServerClient(
    process.env.SERVER_SUPABASE_URL!,
    process.env.SERVER_SUPABASE_ANON_KEY!,
    {
        cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                )
              } catch {
                // The `setAll` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing
                // user sessions.
              }
            },
          },
    }
  );
}

// Function to check if user is authenticated and redirect if not
export async function requireAuth() {
  const supabase = await createServerSupabaseClient();
  
  // Get and verify user session
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData?.session) {
    redirect('/login');
  }

  // Verify user with getUser()
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('[Server] User verification failed:', userError?.message);
    redirect('/login');
  }
  
  return {
    user,
    supabase
  };
}

// Function to check if user is authenticated and redirect if they are
export async function requireGuest() {
  const supabase = await createServerSupabaseClient();
  
  // Get and verify user session
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData?.session) {
    // Verify user with getUser()
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!userError && user) {
      redirect('/dashboard');
    }
  }
  
  return { supabase };
} 