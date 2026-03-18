import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export function useDataQuery<T>(
  queryKey: string | null,
  fetcher: () => Promise<T>,
  options?: { enabled?: boolean }
) {
  const [data, setData] = useState<T | null>(() => {
    if (queryKey && cache.has(queryKey)) {
      const entry = cache.get(queryKey)!;
      if (Date.now() - entry.timestamp < CACHE_TTL) {
        return entry.data as T;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(!data && options?.enabled !== false && queryKey !== null);
  const [error, setError] = useState<Error | null>(null);

  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const execute = useCallback(async (ignoreCache = false) => {
    if (!queryKey) return;
    
    if (!ignoreCache && cache.has(queryKey)) {
      const entry = cache.get(queryKey)!;
      if (Date.now() - entry.timestamp < CACHE_TTL) {
        if (isMounted.current) {
          setData(entry.data as T);
          setLoading(false);
          setError(null);
        }
        return;
      }
    }

    if (isMounted.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const result = await fetcher();
      cache.set(queryKey, { data: result, timestamp: Date.now() });
      if (isMounted.current) {
        setData(result);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error('Query failed'));
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [queryKey, fetcher]);

  useEffect(() => {
    if (options?.enabled !== false && queryKey) {
      execute();
    }
  }, [queryKey, options?.enabled, execute]);

  return { data, loading, error, refetch: () => execute(true) };
}
