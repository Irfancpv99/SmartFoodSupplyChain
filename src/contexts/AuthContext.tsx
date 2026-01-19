import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = 'admin' | 'school_admin' | 'vendor';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  roles: AppRole[];
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function for retry with exponential backoff
const retryWithBackoff = async <T,>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: unknown;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i === maxRetries - 1) break;
      const delay = baseDelay * Math.pow(2, i);
      console.warn(`Retry attempt ${i + 1}/${maxRetries} after ${delay}ms`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const rolesCacheRef = useRef<{ userId: string; roles: AppRole[] } | null>(null);

  const fetchRoles = async (userId: string, useCache: boolean = true) => {
    // Use cached roles if available and cache is enabled
    if (useCache && rolesCacheRef.current?.userId === userId) {
      console.log('Using cached roles for user:', userId);
      setRoles(rolesCacheRef.current.roles);
      return;
    }

    try {
      const result = await retryWithBackoff(async () => {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);
        
        if (error) throw error;
        return data;
      });

      const fetchedRoles = result ? result.map(r => r.role as AppRole) : [];
      setRoles(fetchedRoles);
      // Update cache
      rolesCacheRef.current = { userId, roles: fetchedRoles };
      console.log('Successfully fetched roles for user:', userId, fetchedRoles);
    } catch (error) {
      console.error('Error fetching roles after retries:', error);
      // Fall back to cached roles if available
      if (rolesCacheRef.current?.userId === userId) {
        console.warn('Using cached roles as fallback');
        setRoles(rolesCacheRef.current.roles);
      } else {
        console.warn('No cached roles available, setting empty roles array');
        setRoles([]);
      }
    }
  };

  const refreshRoles = async () => {
    if (user) {
      console.log('Refreshing roles for user:', user.id);
      try {
        await fetchRoles(user.id, false); // Don't use cache on refresh
      } catch (error) {
        console.error('Failed to refresh roles:', error);
        throw error; // Propagate error for better handling in callers
      }
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Set isLoading to false immediately to unblock UI
        setIsLoading(false);
        
        if (session?.user) {
          // Fetch roles asynchronously in the background
          // Don't block authentication on role fetching
          fetchRoles(session.user.id).catch(error => {
            console.error('Background role fetch failed:', error);
            // User can still navigate, just without roles temporarily
          });
        } else {
          setRoles([]);
          rolesCacheRef.current = null; // Clear cache on logout
        }
      }
    );

    // THEN check current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Set isLoading to false immediately
      setIsLoading(false);
      
      if (session?.user) {
        // Fetch roles asynchronously in the background
        fetchRoles(session.user.id).catch(error => {
          console.error('Initial role fetch failed:', error);
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRoles([]);
    rolesCacheRef.current = null; // Clear cache on logout
  };

  const hasRole = (role: AppRole) => roles.includes(role);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        roles,
        signIn,
        signUp,
        signOut,
        hasRole,
        refreshRoles,
      }}
    >
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
