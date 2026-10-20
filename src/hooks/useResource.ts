import { useState, useEffect, useCallback, useRef } from 'react';

interface ResourceState<T> {
  key: string | null;
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface Resource<T> {
  /** Data for the current key only; never another city's data. */
  data: T | null;
  /** Error from the latest attempt. May be set while `data` holds an older successful result. */
  error: string | null;
  /** True while a request for the current key is in flight. */
  loading: boolean;
  reload: () => void;
}

/**
 * Load `fetcher` for `key` (e.g. a city id). Changing the key aborts the old
 * request and clears data that belonged to the previous key, so a slow
 * response for one city can never be shown under another. A failed reload
 * keeps the last good data for the same key and reports the error alongside it.
 */
export function useResource<T>(key: string | null, fetcher: (signal: AbortSignal) => Promise<T>): Resource<T> {
  const [state, setState] = useState<ResourceState<T>>({ key: null, data: null, error: null, loading: false });
  const [nonce, setNonce] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (key === null) return;
    const controller = new AbortController();
    setState(prev => ({ key, data: prev.key === key ? prev.data : null, error: null, loading: true }));
    fetcherRef.current(controller.signal).then(
      data => {
        if (!controller.signal.aborted) setState({ key, data, error: null, loading: false });
      },
      (err: unknown) => {
        if (controller.signal.aborted || (err as { name?: string })?.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : 'Request failed.';
        setState(prev => ({ key, data: prev.key === key ? prev.data : null, error: message, loading: false }));
      },
    );
    return () => controller.abort();
  }, [key, nonce]);

  const reload = useCallback(() => setNonce(n => n + 1), []);
  const isCurrent = state.key === key;
  return {
    data: isCurrent ? state.data : null,
    error: isCurrent ? state.error : null,
    loading: key !== null && (!isCurrent || state.loading),
    reload,
  };
}
