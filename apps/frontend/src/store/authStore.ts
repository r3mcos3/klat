import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/config/supabase';
import api from '@/services/api';
import type { User, Session } from '@supabase/supabase-js';

// Check if running in mock mode
const isMockMode = import.meta.env.VITE_MOCK_MODE === 'true';

// Mock user and session for development
const createMockUser = (email: string): User => ({
  id: 'mock-user-1',
  email,
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as User);

const createMockSession = (email: string): Session => ({
  access_token: 'mock-token-12345',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: createMockUser(email),
} as Session);

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
    (set) => ({
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

          // In mock mode, check localStorage for persisted mock session
          if (isMockMode) {
            console.log('[AUTH] Running in MOCK MODE');
            // Session will be restored from persist middleware
            set({
              isInitialized: true,
              isLoading: false,
            });
            return;
          }

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

          // Mock mode: call mock API
          if (isMockMode) {
            console.log('[AUTH] Mock login attempt for:', email);
            try {
              const response = await api.post('/auth/login', { email, password });
              console.log('[AUTH] Mock login response:', response.data);
              if (response.data?.data?.session) {
                const mockSession = createMockSession(email);
                set({
                  user: mockSession.user,
                  session: mockSession,
                  isLoading: false,
                });
                return;
              }
              throw new Error('Invalid credentials');
            } catch (err) {
              const axiosError = err as { response?: { data?: { error?: string } }; message?: string };
              console.error('[AUTH] Mock login error:', axiosError.response?.data || axiosError.message);
              throw new Error(axiosError.response?.data?.error || 'Login failed');
            }
          }

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

          // Mock mode: call mock API
          if (isMockMode) {
            const response = await api.post('/auth/register', { email, password });
            if (response.data?.data?.session) {
              const mockSession = createMockSession(email);
              set({
                user: mockSession.user,
                session: mockSession,
                isLoading: false,
              });
              return;
            }
            throw new Error('Registration failed');
          }

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

          // Mock mode: just clear state
          if (isMockMode) {
            set({
              user: null,
              session: null,
              isLoading: false,
            });
            return;
          }

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
