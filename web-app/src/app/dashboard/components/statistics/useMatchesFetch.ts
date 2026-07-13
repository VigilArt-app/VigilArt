import { useEffect, useState } from "react";
import type { MatchingPage } from "@vigilart/shared";

interface UseMatchesFetchResult {
  matches: MatchingPage[];
  /** False until the fetch for the current `token` resolves. */
  ready: boolean;
  error: boolean;
}

/**
 * Shared loader for the drill-down modals (pie category + bar report). `token`
 * uniquely identifies the current selection; the fetch re-runs whenever it
 * changes and is a no-op while it's null (modal closed). `fetcher` is called
 * fresh each run, so it always sees the latest arguments.
 */
export function useMatchesFetch(
  token: string | null,
  fetcher: () => Promise<MatchingPage[]>
): UseMatchesFetchResult {
  const [matches, setMatches] = useState<MatchingPage[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;
    setReady(false);
    setError(false);

    fetcher()
      .then((result) => {
        if (!cancelled) {
          setMatches(result);
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
    // `token` is the request identity; `fetcher` is intentionally excluded so a
    // new closure each render doesn't retrigger the fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return { matches, ready, error };
}
