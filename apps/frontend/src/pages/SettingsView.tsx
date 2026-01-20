import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePreferencesStore } from '@/store/preferencesStore';

export function SettingsView() {
  const { emailNotifications, isLoading, isSaving, fetchPreferences, updateEmailNotifications } =
    usePreferencesStore();

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const handleToggle = async () => {
    try {
      await updateEmailNotifications(!emailNotifications);
    } catch {
      // Error already logged in store
    }
  };

  return (
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center font-body text-sm text-secondary hover:text-accent-primary mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to overview
          </Link>

          <h1 className="font-display text-5xl font-bold text-primary mb-3 tracking-tight">
            Settings
          </h1>
          <p className="font-body text-secondary">Manage your preferences</p>
        </div>

        {/* Notifications Section */}
        <div className="bg-secondary rounded-xl shadow-ocean p-8 border border-border-subtle">
          <h2 className="font-display text-2xl font-bold text-primary mb-6">Notifications</h2>

          <div className="flex items-center justify-between py-4">
            <div>
              <h3 className="font-body font-semibold text-primary">Email notifications</h3>
              <p className="font-body text-sm text-secondary mt-1">
                Receive an email reminder 24 hours before a note deadline
              </p>
            </div>
            {isLoading ? (
              <div className="w-11 h-6 bg-tertiary rounded-full animate-pulse" />
            ) : (
              <button
                onClick={handleToggle}
                disabled={isSaving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  emailNotifications ? 'bg-accent-primary' : 'bg-tertiary'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                role="switch"
                aria-checked={emailNotifications}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                    emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
