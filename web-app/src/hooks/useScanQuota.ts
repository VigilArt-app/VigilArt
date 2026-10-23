"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ScanQuota } from "@vigilart/shared/types";
import { useAuth } from "@/src/components/contexts/authContext";
import { authenticatedFetch } from "@/src/utils/auth/authenticatedFetch";
import { createScanQuotaLoader, type ScanQuotaState } from "./scan-quota-client";

interface UseScanQuotaResult {
  quota: ScanQuota | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useScanQuota = (): UseScanQuotaResult => {
  const { user, loading: userLoading } = useAuth();
  const userId = userLoading ? null : user?.id ?? null;
  const [state, setState] = useState<ScanQuotaState>({
    userId: null, quota: null, loading: false, error: null,
  });
  const loader = useMemo(() => createScanQuotaLoader(authenticatedFetch, setState), []);
  const refresh = useCallback(() => loader.refresh(userId), [loader, userId]);

  useEffect(() => {
    void refresh();
    const onFocus = () => { void refresh(); };
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      loader.cancel();
    };
  }, [loader, refresh]);

  // Hide the previous account's data immediately, before effects run.
  const current = state.userId === userId;
  return {
    quota: current ? state.quota : null,
    loading: userLoading || (current ? state.loading : !!userId),
    error: current ? state.error : null,
    refresh,
  };
};
