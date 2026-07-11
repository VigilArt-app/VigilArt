const fs = require('fs');
const path = require('path');

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '';
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '';
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '';
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '';
const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '';

const swContent = `// This file MUST live at /public/firebase-messaging-sw.js
// so it is served from the root of the domain.

importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "${apiKey}",
  authDomain: "${authDomain}",
  projectId: "${projectId}",
  storageBucket: "${storageBucket}",
  messagingSenderId: "${messagingSenderId}",
  appId: "${appId}",
  measurementId: "${measurementId}"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? "VigilArt";
  const options = {
    body: payload.notification?.body ?? "",
    icon: "/vigilart_b.png",
  };

  self.registration.showNotification(title, options);
});
`;

const outputPath = path.join(__dirname, '..', 'public', 'firebase-messaging-sw.js');
fs.writeFileSync(outputPath, swContent);
console.log('firebase-messaging-sw.js generated successfully.');
