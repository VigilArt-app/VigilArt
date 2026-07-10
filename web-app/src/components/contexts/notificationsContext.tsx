"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { useNotifications } from "@/src/hooks/useNotifications";
import { useAuth } from "./authContext";

type NotificationsContextValue = ReturnType<typeof useNotifications> & {
  isReady: boolean;
  setNotificationsEnabled: (enabled: boolean) => Promise<boolean>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user } = useAuth();
  const {
    isSupported,
    permission,
    token,
    error,
    isEnabled,
    requestPermission,
    activateNotifications,
    enableNotifications,
    disableNotifications,
    syncEnabledState,
  } = useNotifications();
  const hasActivatedRef = useRef(false);

  useEffect(() => {
    if (!isSupported)
      return;
    if (!user?.notificationsEnabled) {
      hasActivatedRef.current = false;
      if (isEnabled)
        void disableNotifications();
      else
        syncEnabledState(false);
      return;
    }
    if (permission === "granted" && !hasActivatedRef.current) {
      hasActivatedRef.current = true;
      activateNotifications();
      return;
    }
    if (!isEnabled)
      syncEnabledState(false);
  }, [activateNotifications, disableNotifications, isEnabled, isSupported, permission, syncEnabledState, user?.notificationsEnabled]);

  const setNotificationsEnabled = useCallback(async (enabled: boolean) => {
    if (enabled) {
      const allowed = await enableNotifications();
      hasActivatedRef.current = allowed;
      return allowed;
    }

    hasActivatedRef.current = false;
    await disableNotifications();
    return true;
  }, [enableNotifications, disableNotifications]);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      isSupported,
      permission,
      token,
      error,
      isEnabled,
      requestPermission,
      activateNotifications,
      enableNotifications,
      disableNotifications,
      syncEnabledState,
      isReady: isSupported,
      setNotificationsEnabled,
    }),
    [
      disableNotifications,
      activateNotifications,
      enableNotifications,
      error,
      isEnabled,
      isSupported,
      permission,
      requestPermission,
      setNotificationsEnabled,
      syncEnabledState,
      token,
    ]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotificationsSettings() {
  const context = useContext(NotificationsContext);

  if (!context)
    throw new Error("useNotificationsSettings must be used within NotificationsProvider");
  return context;
}