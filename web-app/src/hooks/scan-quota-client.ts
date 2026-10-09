import type { ScanQuota } from "@vigilart/shared/types";
import { ScanQuotaSchema } from "@vigilart/shared/schemas/scan-quota";

export interface ScanQuotaState {
  userId: string | null;
  quota: ScanQuota | null;
  loading: boolean;
  error: string | null;
}

type Fetcher = (url: string, options: RequestInit) => Promise<Response>;

export const createScanQuotaLoader = (
  fetcher: Fetcher,
  publish: (state: ScanQuotaState) => void,
  timeoutMs = 15_000,
) => {
  let generation = 0;
  let controller: AbortController | null = null;

  const cancel = () => {
    generation += 1;
    controller?.abort();
    controller = null;
  };

  const refresh = async (userId: string | null) => {
    cancel();
    const requestId = generation;
    publish({ userId, quota: null, loading: !!userId, error: null });
    if (!userId) return;

    const requestController = new AbortController();
    controller = requestController;
    const { signal } = requestController;
    let rejectAborted: () => void = () => {};
    const aborted = new Promise<never>((_resolve, reject) => {
      rejectAborted = () => reject(new Error("Scan quota request aborted"));
      signal.addEventListener("abort", rejectAborted, { once: true });
    });
    const timeout = setTimeout(() => requestController.abort(), timeoutMs);

    try {
      // Bound the complete operation, including cookie refresh and JSON parsing.
      const quota = await Promise.race([
        (async () => {
          const result = await fetcher(`/reports/user/${encodeURIComponent(userId)}/scan-quota`, {
            method: "GET", signal,
          });
          if (!result.ok) throw new Error("Scan quota request failed");
          const body = await result.json();
          return ScanQuotaSchema.parse(body.data);
        })(),
        aborted,
      ]);
      if (requestId === generation) {
        publish({ userId, quota, loading: false, error: null });
      }
    } catch {
      if (requestId === generation) {
        publish({ userId, quota: null, loading: false, error: "Scan quota unavailable" });
      }
    } finally {
      clearTimeout(timeout);
      signal.removeEventListener("abort", rejectAborted);
      if (requestId === generation) controller = null;
    }
  };

  return { refresh, cancel };
};
