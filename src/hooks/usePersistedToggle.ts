import { useCallback, useState } from 'react';

/**
 * Boolean state persisted to localStorage. Reads synchronously on first client render
 * so callers can use the stored value in mount effects (e.g. the initial data fetch).
 */
export function usePersistedToggle(key: string, defaultValue: boolean): [boolean, (value: boolean) => void] {
  const [value, setValue] = useState<boolean>(() => {
    if (typeof window === 'undefined') return defaultValue;
    const stored = window.localStorage.getItem(key);
    return stored === null ? defaultValue : stored === 'true';
  });

  const update = useCallback((next: boolean) => {
    setValue(next);
    window.localStorage.setItem(key, String(next));
  }, [key]);

  return [value, update];
}
