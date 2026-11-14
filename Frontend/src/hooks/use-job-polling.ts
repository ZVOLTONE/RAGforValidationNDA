import { useEffect, useState } from 'react';

import { ApiError, errorMessage, getJob } from '@/services/api';
import type { AnalysisJob } from '@/types';

const POLL_START_MS = 2500;
const POLL_MAX_MS = 10_000;
const RETRY_MS = 5000;

/**
 * Polling status pekerjaan (PRD §7.2): 2,5 detik dengan backoff bertahap,
 * berhenti pada status akhir (completed/failed).
 */
export function useJobPolling(jobId: string) {
  const [job, setJob] = useState<AnalysisJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(0);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let delay = POLL_START_MS;

    const tick = async () => {
      try {
        const next = await getJob(jobId);
        if (!active) return;
        setJob(next);
        setError(null);
        setLoading(false);
        if (next.status === 'completed' || next.status === 'failed') return;
        delay = Math.min(Math.round(delay * 1.35), POLL_MAX_MS);
        timer = setTimeout(tick, delay);
      } catch (cause) {
        if (!active) return;
        setLoading(false);
        setError(errorMessage(cause));
        if (cause instanceof ApiError && cause.code === 'unauthorized') return;
        timer = setTimeout(tick, RETRY_MS);
      }
    };

    tick();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [jobId, token]);

  return {
    job,
    error,
    loading,
    retry: () => {
      setLoading(true);
      setToken((value) => value + 1);
    },
  };
}
