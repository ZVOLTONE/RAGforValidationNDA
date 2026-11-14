import { useCallback, useEffect, useRef, useState } from 'react';

import { errorMessage } from '@/services/api';

export interface AsyncDataState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
}

/**
 * Pemuat data sederhana dengan status loading/error dan reload manual.
 * `key` menentukan kapan data harus diambil ulang.
 */
export function useAsyncData<T>(key: string, loader: () => Promise<T>): AsyncDataState<T> {
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    loaderRef
      .current()
      .then((result) => {
        if (!active) return;
        setData(result);
        setLoading(false);
      })
      .catch((cause) => {
        if (!active) return;
        setError(errorMessage(cause));
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [key, token]);

  const reload = useCallback(() => setToken((value) => value + 1), []);

  return { data, error, loading, reload };
}
