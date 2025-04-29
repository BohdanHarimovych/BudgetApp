"use client";

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { User, Session, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";

type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
};

type AuthContextType = AuthState & {
  signOut: () => Promise<void>;
  supabase: SupabaseClient;
};

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);
  const router = useRouter();
  const supabase = getSupabaseClient();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("[Auth] Initializing auth state");
        
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (session) {
          console.log("[Auth] Initial session found:", session.user.email);
          setState(current => ({
            ...current,
            user: session.user,
            session: session,
            isLoading: false,
          }));
        } else {
          console.log("[Auth] No initial session found");
          setState(current => ({
            ...current,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error("[Auth] Initialization error:", error);
        setState(current => ({
          ...current,
          error: error as Error,
          isLoading: false,
        }));
      }
    };

    initializeAuth();
  }, [supabase]);

  // Listen for auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Auth] Auth state changed: ${event}`, session?.user?.email);

      if (event === 'SIGNED_IN') {
        console.log("[Auth] User signed in, updating state");
        setState(current => ({
          ...current,
          user: session?.user ?? null,
          session: session,
          isLoading: false,
        }));
        router.refresh();
      }

      if (event === 'SIGNED_OUT') {
        console.log("[Auth] User signed out, clearing state");
        setState(current => ({
          ...current,
          user: null,
          session: null,
          isLoading: false,
        }));
        router.refresh();
        window.location.href = "/";
      }

      if (event === 'TOKEN_REFRESHED') {
        console.log("[Auth] Token refreshed, updating session");
        setState(current => ({
          ...current,
          session: session,
        }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const signOut = useCallback(async () => {
    try {
      setState(current => ({ ...current, isLoading: true }));
      await supabase.auth.signOut();
    } catch (error) {
      console.error("[Auth] Sign out error:", error);
      setState(current => ({
        ...current,
        error: error as Error,
        isLoading: false,
      }));
    }
  }, [supabase, setState]);

  const value = useMemo(
    () => ({
      ...state,
      signOut,
      supabase,
    }),
    [state, signOut, supabase]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 