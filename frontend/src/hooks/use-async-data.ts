import { useCallback, useEffect, useRef, useState } from 'react';

import { errorMessage } from '@/services/api';

export interface AsyncDataState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
}

interface AsyncSnapshot<T> {
  key: string;
  token: number;
  data: T | null;
  error: string | null;
  loading: boolean;
}

/**
 * Pemuat data sederhana dengan status loading/error dan reload manual.
 * `key` menentukan kapan data harus diambil ulang.
 */
export function useAsyncData<T>(key: string, loader: () => Promise<T>): AsyncDataState<T> {
  const loaderRef = useRef(loader);
  const [token, setToken] = useState(0);
  const [snapshot, setSnapshot] = useState<AsyncSnapshot<T>>({
    key,
    token: -1,
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  useEffect(() => {
    let active = true;
    loaderRef
      .current()
      .then((result) => {
        if (!active) return;
        setSnapshot({ key, token, data: result, error: null, loading: false });
      })
      .catch((cause) => {
        if (!active) return;
        setSnapshot({ key, token, data: null, error: errorMessage(cause), loading: false });
      });
    return () => {
      active = false;
    };
  }, [key, token]);

  const reload = useCallback(() => setToken((value) => value + 1), []);

  const current = snapshot.key === key;
  return {
    data: current ? snapshot.data : null,
    error: current ? snapshot.error : null,
    loading: !current || snapshot.token !== token || snapshot.loading,
    reload,
  };
}
