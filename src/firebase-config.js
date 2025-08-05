// src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBehR8nGZTrhZYzoLLa78j1EhUPdZErxtU",
  authDomain: "fir-c0834.firebaseapp.com",
  projectId: "fir-c0834",
  storageBucket: "fir-c0834.appspot.com",
  messagingSenderId: "48134677482",
  appId: "1:48134677482:web:0863de9a73035ce7c50893",
  measurementId: "G-S7YLGC8CBM"
};

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

export { messaging };

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then(function(registration) {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch(function(err) {
      console.error('Service Worker registration failed:', err);
    });
}


export const getTokenFromFCM = async () => {
  const messaging = getMessaging(app);
  const token = await getToken(messaging, { vapidKey: 'BFeBBpUyxnCf54AL_Z16F357mX3oYFetAsdoMNhMrBmd1rPSFbpfFidAmq4Ho2NKNeSLe_7ogKudgk6lx8w5mts' });
  return token;
};

export const messagingPromise = Promise.resolve(messaging);


export async function requestFCMPermissionAndRegister(userId) {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const fcmToken = await getToken(messaging, {
        vapidKey: 'BFeBBpUyxnCf54AL_Z16F357mX3oYFetAsdoMNhMrBmd1rPSFbpfFidAmq4Ho2NKNeSLe_7ogKudgk6lx8w5mts'
      });
      console.log('FCM Token:', fcmToken);
      await axios.post('/api/fcm/register-token', {
        userId,
        token: fcmToken
      });
    }
  } catch (err) {
    console.error('FCM token error:', err);
  }
}

export function setupForegroundNotificationHandler() {
  onMessage((payload) => {
    console.log('Foreground Notification:', payload);
    const { title, body } = payload.notification;
    new Notification(title, { body });
  });
}


