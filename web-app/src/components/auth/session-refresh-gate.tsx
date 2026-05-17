"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { API_BASE_URL } from "../../config";

type SessionRefreshGateProps = Readonly<{
  enabled: boolean;
  children: React.ReactNode;
}>;

export function SessionRefreshGate({
  enabled,
  children,
}: SessionRefreshGateProps) {
  const router = useRouter();
  const startedRef = useRef(false);
  const [isRefreshing, setIsRefreshing] = useState(enabled);

  useEffect(() => {
    if (!enabled || startedRef.current)
      return;

    startedRef.current = true;

    const refreshSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok)
          throw new Error("Session expired. Please login again.");

        router.refresh();
      } catch {
        router.replace("/login");
      } finally {
        setIsRefreshing(false);
      }
    };

    void refreshSession();
  }, [enabled, router]);

  if (enabled && isRefreshing) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}