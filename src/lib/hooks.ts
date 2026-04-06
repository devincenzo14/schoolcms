import { useEffect, useRef, useCallback } from "react";

/**
 * Calls the provided fetch function on mount and whenever the tab regains focus,
 * with a minimum interval to avoid excessive refetching.
 */
export function useRefreshData(fetchFn: () => void, intervalMs = 5000) {
  const lastFetch = useRef(0);
  const stableFetch = useCallback(fetchFn, [fetchFn]);

  useEffect(() => {
    // Initial fetch
    lastFetch.current = Date.now();
    stableFetch();

    const onFocus = () => {
      if (Date.now() - lastFetch.current > intervalMs) {
        lastFetch.current = Date.now();
        stableFetch();
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") onFocus();
    });
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [stableFetch, intervalMs]);
}

/** fetch() wrapper that bypasses cache */
export function apiFetch(url: string, options?: RequestInit) {
  return fetch(url, { cache: "no-store", ...options });
}
