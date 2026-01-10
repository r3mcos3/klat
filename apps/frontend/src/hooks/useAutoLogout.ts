import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';

interface AutoLogoutOptions {
  /**
   * Maximum session duration in milliseconds (optional)
   * User will be logged out after this duration regardless of activity
   * If not set, there will be no maximum session duration
   */
  sessionTimeout?: number;
  /**
   * Inactivity timeout in milliseconds (optional)
   * User will be logged out after this period of inactivity
   * If not set, there will be no inactivity-based logout
   */
  inactivityTimeout?: number;
  /**
   * Enable debug logging (default: false)
   */
  debug?: boolean;
}

/**
 * Auto-logout hook that handles automatic user logout based on:
 * 1. Optional maximum session duration
 * 2. Optional inactivity timeout
 *
 * The hook tracks user activity (mouse, keyboard, touch events) and
 * automatically logs out the user when timeout conditions are met.
 */
export function useAutoLogout(options: AutoLogoutOptions = {}) {
  const {
    sessionTimeout,
    inactivityTimeout,
    debug = false,
  } = options;

  const { user, logout } = useAuthStore();
  const sessionStartRef = useRef<number>(Date.now());
  const lastActivityRef = useRef<number>(Date.now());
  const sessionTimerRef = useRef<NodeJS.Timeout>();
  const inactivityTimerRef = useRef<NodeJS.Timeout>();

  const log = (message: string, ...args: unknown[]) => {
    if (debug) {
      console.log(`[AutoLogout] ${message}`, ...args);
    }
  };

  const performLogout = async () => {
    log('Performing auto-logout');
    try {
      await logout();
      // Optional: Show a notification to the user
      alert('Your session has expired. Please log in again.');
    } catch (error) {
      console.error('Auto-logout failed:', error);
    }
  };

  const resetInactivityTimer = () => {
    if (!inactivityTimeout || !user) return;

    // Clear existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    lastActivityRef.current = Date.now();
    log('Activity detected, resetting inactivity timer');

    // Set new timer
    inactivityTimerRef.current = setTimeout(() => {
      log('Inactivity timeout reached');
      performLogout();
    }, inactivityTimeout);
  };

  const handleUserActivity = () => {
    resetInactivityTimer();
  };

  useEffect(() => {
    // Only run if user is logged in
    if (!user) {
      log('No user logged in, skipping auto-logout setup');
      return;
    }

    log('Setting up auto-logout', {
      sessionTimeout: sessionTimeout
        ? `${sessionTimeout / 1000 / 60} minutes`
        : 'disabled',
      inactivityTimeout: inactivityTimeout
        ? `${inactivityTimeout / 1000 / 60} minutes`
        : 'disabled',
    });

    // Reset session start time when user logs in
    sessionStartRef.current = Date.now();
    lastActivityRef.current = Date.now();

    // Set up session timeout (maximum duration) if enabled
    if (sessionTimeout) {
      sessionTimerRef.current = setTimeout(() => {
        log('Session timeout reached');
        performLogout();
      }, sessionTimeout);
    }

    // Set up inactivity timeout if enabled
    if (inactivityTimeout) {
      // Add activity listeners
      const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];

      activityEvents.forEach((event) => {
        window.addEventListener(event, handleUserActivity, { passive: true });
      });

      // Start inactivity timer
      resetInactivityTimer();

      // Cleanup function
      return () => {
        log('Cleaning up auto-logout timers and listeners');

        // Clear timers
        if (sessionTimerRef.current) {
          clearTimeout(sessionTimerRef.current);
        }
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
        }

        // Remove event listeners
        activityEvents.forEach((event) => {
          window.removeEventListener(event, handleUserActivity);
        });
      };
    }

    // Cleanup function when no inactivity timeout
    return () => {
      log('Cleaning up auto-logout timers');
      if (sessionTimerRef.current) {
        clearTimeout(sessionTimerRef.current);
      }
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [user, sessionTimeout, inactivityTimeout]);

  // Return session info for debugging/display purposes
  return {
    sessionStart: sessionStartRef.current,
    lastActivity: lastActivityRef.current,
  };
}
