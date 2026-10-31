import { useCallback, useState } from 'react';

/**
 * Boolean state persisted to localStorage. Reads synchronously on first client render
 * so callers can use the stored value in mount effects (e.g. the initial data fetch).
 * `override`, when set, replaces the stored value on first render and is persisted.
 */
export function usePersistedToggle(
  key: string,
  defaultValue: boolean,
  override?: boolean
): [boolean, (value: boolean) => void] {
  const [value, setValue] = useState<boolean>(() => {
    if (typeof window === 'undefined') return override ?? defaultValue;
    if (override !== undefined) {
      window.localStorage.setItem(key, String(override));
      return override;
    }
    const stored = window.localStorage.getItem(key);
    return stored === null ? defaultValue : stored === 'true';
  });

  const update = useCallback((next: boolean) => {
    setValue(next);
    window.localStorage.setItem(key, String(next));
  }, [key]);

  return [value, update];
}
