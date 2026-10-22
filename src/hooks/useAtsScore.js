import { useEffect, useRef, useState } from 'react';
import { apiUrl, authFetch } from '../config/api';

/**
 * Fetches the real ATS report from the backend.
 *
 * Two modes:
 *  - { jobDescription, targetRole, companyName }  -> POST /api/resume/score (debounced while typing)
 *  - { targetId }                                  -> GET  /api/resume/score/target/:id
 *
 * Returns { status: 'idle'|'loading'|'success'|'error', report, error, refresh }.
 * Stale responses are ignored, so fast typing never shows an old score.
 */
export function useAtsScore({ jobDescription = '', targetRole = '', companyName = '', targetId = null, enabled = true, debounceMs = 700 } = {}) {
  const [state, setState] = useState({ status: 'idle', report: null, error: null });
  const [nonce, setNonce] = useState(0);
  const requestId = useRef(0);

  const hasInput = Boolean(targetId) || jobDescription.trim().length > 0;

  useEffect(() => {
    if (!enabled || !hasInput) {
      setState({ status: 'idle', report: null, error: null });
      return undefined;
    }

    const id = ++requestId.current;
    const controller = new AbortController();
    setState((s) => ({ ...s, status: 'loading', error: null }));

    const timer = setTimeout(async () => {
      try {
        const res = targetId
          ? await authFetch(apiUrl(`/api/resume/score/target/${targetId}`), { signal: controller.signal })
          : await authFetch(apiUrl('/api/resume/score'), {
              method: 'POST',
              signal: controller.signal,
              body: JSON.stringify({ jobDescription, targetRole, companyName })
            });
        const body = await res.json().catch(() => ({}));
        if (id !== requestId.current) return;
        if (!res.ok || !body.success) {
          throw new Error(body.error || `Could not score resume (${res.status})`);
        }
        setState({ status: 'success', report: body.data, error: null });
      } catch (err) {
        if (err.name === 'AbortError' || id !== requestId.current) return;
        setState({ status: 'error', report: null, error: err.message || 'Could not score resume' });
      }
    }, targetId ? 0 : debounceMs);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [jobDescription, targetRole, companyName, targetId, enabled, hasInput, debounceMs, nonce]);

  return { ...state, refresh: () => setNonce((n) => n + 1) };
}
