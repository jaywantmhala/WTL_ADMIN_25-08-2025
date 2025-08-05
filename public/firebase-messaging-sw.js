// Import Firebase libraries from CDN
importScripts("https://www.gstatic.com/firebasejs/10.12.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.1/firebase-messaging-compat.js");
// Initialize Firebase
firebase.initializeApp({
 apiKey: "AIzaSyBehR8nGZTrhZYzoLLa78j1EhUPdZErxtU",
  authDomain: "fir-c0834.firebaseapp.com",
  projectId: "fir-c0834",
  storageBucket: "fir-c0834.firebasestorage.app",
  messagingSenderId: "48134677482",
  appId: "1:48134677482:web:0863de9a73035ce7c50893",
  measurementId: "G-S7YLGC8CBM"
});

const messaging = firebase.messaging();



// Handle background messages
messaging.onBackgroundMessage(function(payload)  {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
   
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});


