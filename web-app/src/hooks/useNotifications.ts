"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getMessaging, getToken, onMessage, type Messaging } from "firebase/messaging";
import { config } from "../config";
import { firebaseApp } from "../lib/firebase";
import { authenticatedFetch } from "../utils/auth/authenticatedFetch";
import { toast } from "sonner";

const VAPID_KEY = config.firebaseVapIdKey;

interface NotificationState {
  isSupported: boolean;
  permission: NotificationPermission | "unsupported";
  token: string | null;
  error: string | null;
  isEnabled: boolean;
}

/**
 * Hook to manage Firebase Cloud Messaging in the browser.
 *
 * - Checks for notification support
 * - Requests permission and retrieves the FCM device token
 * - Registers the token with the backend
 * - Listens for foreground messages
 */
export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    isSupported: false,
    permission: "unsupported",
    token: null,
    error: null,
    isEnabled: false,
  });

  const messagingRef = useRef<Messaging | null>(null);
  const currentTokenRef = useRef<string | null>(null);
  const enabledRef = useRef(false);

  const syncEnabledState = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;

    setState((s) => ({
      ...s,
      isEnabled: enabled,
    }));
  }, []);

  const unregisterToken = useCallback(async (fcmToken: string) => {
    try {
      const res = await authenticatedFetch(`/notifications/devices/${encodeURIComponent(fcmToken)}`, {
        method: "DELETE",
      });

      if (!res.ok)
        throw new Error("Failed to unregister device token");
    } catch (err) {
      toast.error("Failed to unregister device token");
    }
  }, []);

  const registerToken = useCallback(async (fcmToken: string) => {
    currentTokenRef.current = fcmToken;
    try {
      const res = await authenticatedFetch("/notifications/devices", {
        method: "POST",
        body: JSON.stringify({ token: fcmToken, platform: "WEB" }),
      });

      if (!res.ok)
        throw new Error("Failed to register device token");
    } catch (err) {
      toast.error("Failed to register device token");
    }
  }, []);

  const ensureActiveServiceWorker = useCallback(async () => {
    const swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    if (swRegistration.active)
      return swRegistration;

    await navigator.serviceWorker.ready;

    if (swRegistration.active)
      return swRegistration;

    if (swRegistration.installing || swRegistration.waiting) {
      await new Promise<void>((resolve) => {
        const worker = swRegistration.installing ?? swRegistration.waiting;

        if (!worker) {
          resolve();
          return;
        }

        const handleStateChange = () => {
          if (worker.state === "activated") {
            worker.removeEventListener("statechange", handleStateChange);
            resolve();
          }
        };

        worker.addEventListener("statechange", handleStateChange);
        handleStateChange();
      });
    }

    return swRegistration;
  }, []);

  const registerCurrentToken = useCallback(async () => {
    if (!messagingRef.current || !VAPID_KEY) {
      setState((s) => ({
        ...s,
        error: "Messaging not initialised or VAPID key missing",
      }));
      return false;
    }

    const swRegistration = await ensureActiveServiceWorker();

    if (!swRegistration.active) {
      setState((s) => ({
        ...s,
        error: "Service worker is not active yet",
      }));
      return false;
    }

    const token = await getToken(messagingRef.current, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });

    currentTokenRef.current = token;
    setState((s) => ({ ...s, token }));
    await registerToken(token);
    return true;
  }, [ensureActiveServiceWorker, registerToken]);

  useEffect(() => {
    if (typeof window === "undefined")
      return;
    if (!("Notification" in window) || !("serviceWorker" in navigator))
      return;

    setState((s) => ({
      ...s,
      isSupported: true,
      permission: Notification.permission,
    }));

    try {
      messagingRef.current = getMessaging(firebaseApp);

      const unsubscribe = onMessage(messagingRef.current, (payload) => {
        if (!enabledRef.current || Notification.permission !== "granted")
          return;
        if (payload.notification) {
          new Notification(payload.notification.title ?? "VigilArt", {
            body: payload.notification.body,
            icon: "/VigilArt_logo_white.png",
          });
        }
      });

      return () => unsubscribe();
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "Failed to initialise messaging",
      }));
    }
  }, []);

  const activateNotifications = useCallback(async () => {
    if (Notification.permission !== "granted")
      return false;

    try {
      const hasToken = await registerCurrentToken();
      if (hasToken) {
        syncEnabledState(true);
      }
      return hasToken;
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "Failed to activate notifications",
      }));
      return false;
    }
  }, [registerCurrentToken, syncEnabledState]);

  const requestPermission = useCallback(async () => {
    try {
      const permission = await Notification.requestPermission();

      setState((s) => ({ ...s, permission }));
      if (permission !== "granted")
        return false;

      const hasToken = await registerCurrentToken();
      return hasToken;
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "Failed to get token",
      }));
      return false;
    }
  }, [registerCurrentToken]);

  const enableNotifications = useCallback(async () => {
    const enabled = await requestPermission();

    if (enabled) {
      syncEnabledState(true);
      return true;
    }

    syncEnabledState(false);
    return false;
  }, [requestPermission, syncEnabledState]);

  const disableNotifications = useCallback(async () => {
    syncEnabledState(false);
    const token = currentTokenRef.current;

    setState((s) => ({
      ...s,
      isEnabled: false,
      token: null,
    }));
    currentTokenRef.current = null;

    if (token)
      await unregisterToken(token);
  }, [unregisterToken, syncEnabledState]);

  return {
    ...state,
    requestPermission,
    activateNotifications,
    enableNotifications,
    disableNotifications,
    syncEnabledState,
  };
}
