"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getMessaging, getToken, onMessage, type Messaging } from "firebase/messaging";
import { config, firebaseApp } from "../config";
import { authenticatedFetch } from "../utils/auth/authenticatedFetch";

const VAPID_KEY = config.firebaseVapIdKey;

interface NotificationState {
  isSupported: boolean;
  permission: NotificationPermission | "unsupported";
  token: string | null;
  error: string | null;
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
  });

  const messagingRef = useRef<Messaging | null>(null);

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

      onMessage(messagingRef.current, (payload) => {
        if (payload.notification) {
          new Notification(payload.notification.title ?? "VigilArt", {
            body: payload.notification.body,
            icon: "/vigilart_w.png",
          });
        }
      });
    } catch (err) {
      console.error("Failed to initialise Firebase Messaging:", err);
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "Failed to initialise messaging",
      }));
    }
  }, []);

  const registerToken = useCallback(async (fcmToken: string) => {
    try {
      await authenticatedFetch("/notifications/devices", {
        method: "POST",
        body: JSON.stringify({ token: fcmToken, platform: "WEB" }),
      });
    } catch (err) {
      console.error("Failed to register device token:", err);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!messagingRef.current || !VAPID_KEY) {
      setState((s) => ({
        ...s,
        error: "Messaging not initialised or VAPID key missing",
      }));
      return;
    }

    try {
      const permission = await Notification.requestPermission();

      setState((s) => ({ ...s, permission }));
      if (permission !== "granted")
        return;

      const swRegistration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

      const token = await getToken(messagingRef.current, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swRegistration,
      });

      setState((s) => ({ ...s, token }));
      await registerToken(token);
    } catch (err) {
      console.error("Failed to get FCM token:", err);
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "Failed to get token",
      }));
    }
  }, [registerToken]);

  return {
    ...state,
    requestPermission,
  };
}
