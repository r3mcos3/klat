import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useAutoLogout } from '@/hooks/useAutoLogout';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider initializes the auth state when the app loads
 * Place this at the root of your app (in App.tsx)
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { initialize, isInitialized } = useAuthStore();

  // Auto-logout after 12 hours of session time
  // Optional: Add inactivityTimeout if you want to logout on inactivity
  // Example: useAutoLogout({ inactivityTimeout: 30 * 60 * 1000 }) // 30 minutes
  useAutoLogout({
    sessionTimeout: 12 * 60 * 60 * 1000, // 12 hours
    debug: false, // Set to true to see debug logs
  });

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
