import { useEffect, useRef, useState } from 'react';
import { useDebounce } from './useDebounce';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions<T> {
  value: T;
  onSave: (value: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave<T>({
  value,
  onSave,
  delay = 500,
  enabled = true,
}: UseAutoSaveOptions<T>) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const debouncedValue = useDebounce(value, delay);
  const isFirstRender = useRef(true);
  const previousValue = useRef(value);
  const isSaving = useRef(false);

  useEffect(() => {
    // Skip on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousValue.current = debouncedValue;
      return;
    }

    // Skip if disabled
    if (!enabled) {
      return;
    }

    // Skip if value hasn't changed
    if (previousValue.current === debouncedValue) {
      return;
    }

    // Skip if already saving (prevent concurrent saves)
    if (isSaving.current) {
      return;
    }

    const save = async () => {
      try {
        isSaving.current = true;
        setStatus('saving');
        await onSave(debouncedValue);
        setStatus('saved');
        previousValue.current = debouncedValue;

        // Reset to idle after 2 seconds
        setTimeout(() => setStatus('idle'), 2000);
      } catch (error) {
        console.error('Auto-save error:', error);
        setStatus('error');
      } finally {
        isSaving.current = false;
      }
    };

    save();
  }, [debouncedValue, enabled, onSave]);

  return { status };
}
