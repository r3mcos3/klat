import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/config/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsInitialized: (isInitialized: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,
      isInitialized: false,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setIsInitialized: (isInitialized) => set({ isInitialized }),

      // Initialize auth state on app load
      initialize: async () => {
        try {
          set({ isLoading: true });

          // Get current session from Supabase
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            set({
              user: session.user,
              session,
              isInitialized: true,
              isLoading: false,
            });
          } else {
            set({
              user: null,
              session: null,
              isInitialized: true,
              isLoading: false,
            });
          }

          // Listen for auth state changes
          supabase.auth.onAuthStateChange((_event, session) => {
            set({
              user: session?.user || null,
              session: session || null,
            });
          });
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          set({
            user: null,
            session: null,
            isInitialized: true,
            isLoading: false,
          });
        }
      },

      // Login with email and password
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });

          const {
            data: { session },
            error,
          } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          if (session) {
            set({
              user: session.user,
              session,
              isLoading: false,
            });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Register new user
      register: async (email: string, password: string) => {
        try {
          set({ isLoading: true });

          const {
            data: { session },
            error,
          } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) throw error;

          if (session) {
            set({
              user: session.user,
              session,
              isLoading: false,
            });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Logout
      logout: async () => {
        try {
          set({ isLoading: true });

          const { error } = await supabase.auth.signOut();

          if (error) throw error;

          set({
            user: null,
            session: null,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist these fields
        session: state.session,
        user: state.user,
      }),
    }
  )
);
