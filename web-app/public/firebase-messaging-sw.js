// This file MUST live at /public/firebase-messaging-sw.js
// so it is served from the root of the domain.

importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDJCGVrYiuE8fQad4BvY0SY-NS42k17iDs",
  authDomain: "vigilart-6ce9f.firebaseapp.com",
  projectId: "vigilart-6ce9f",
  storageBucket: "vigilart-6ce9f.firebasestorage.app",
  messagingSenderId: "328618687898",
  appId: "1:328618687898:web:e91fb220af554979924e23",
  measurementID: "G-DLHMT5KM7J"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? "VigilArt";
  const options = {
    body: payload.notification?.body ?? "",
    icon: "/vigilart_w.png",
  };

  self.registration.showNotification(title, options);
});
