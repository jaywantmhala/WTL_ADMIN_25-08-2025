// Firebase configuration for WorldTripLink Admin Panel
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDkjWKfdoAbbKa73p4o9iujY5pjVqBITfA",
  authDomain: "worldtriplink-7f96c.firebaseapp.com",
  projectId: "worldtriplink-7f96c",
  storageBucket: "worldtriplink-7f96c.firebasestorage.app",
  messagingSenderId: "1011976253850",
  appId: "1:1011976253850:web:fbc6a5c5b3b7f1b6700a23",
  measurementId: "G-78XDPRCSR1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging = null;
if (typeof window !== 'undefined') {
  messaging = getMessaging(app);
}

// VAPID key for web push notifications
const VAPID_KEY = "BKxvxhk5f8L9pQfRiCoHkTtlDUi_OvVF9tnSllVoIGOHvSdqy_MqJOI4LtFZjNqx8kYjYjYjYjYjYjYjYjYjYjY"; // Replace with your actual VAPID key

/**
 * Request notification permission and get FCM token for admin
 */
export const requestAdminNotificationPermission = async () => {
  try {
    if (!messaging) {
      console.warn('Firebase messaging not available (likely SSR)');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Admin notification permission granted.');
      
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY
      });
      
      if (token) {
        console.log('Admin FCM Token:', token);
        return token;
      } else {
        console.log('No registration token available for admin.');
        return null;
      }
    } else {
      console.log('Unable to get permission to notify admin.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving admin token:', error);
    return null;
  }
};

/**
 * Register admin FCM token with backend
 */
export const registerAdminTokenWithBackend = async (token) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fcm/register/admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Admin FCM token registered successfully with backend');
      return true;
    } else {
      console.error('Failed to register admin FCM token with backend:', result.message);
      return false;
    }
  } catch (error) {
    console.error('Error registering admin FCM token with backend:', error);
    return false;
  }
};

/**
 * Setup foreground message listener for admin
 */
export const setupAdminForegroundMessageListener = (callback) => {
  if (!messaging) {
    console.warn('Firebase messaging not available for admin foreground listener');
    return () => {};
  }

  return onMessage(messaging, (payload) => {
    console.log('Admin message received in foreground:', payload);
    
    // Show notification with admin-specific styling
    if (payload.notification) {
      const { title, body } = payload.notification;
      
      // Create custom notification for admin panel
      if ('serviceWorker' in navigator && 'Notification' in window) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            body: body,
            icon: '/images/admin-logo.png',
            badge: '/images/admin-badge.png',
            data: payload.data,
            actions: [
              {
                action: 'assign',
                title: 'Assign Booking'
              },
              {
                action: 'view',
                title: 'View Details'
              },
              {
                action: 'close',
                title: 'Close'
              }
            ],
            requireInteraction: true,
            tag: payload.data?.type || 'admin-notification'
          });
        });
      }
    }
    
    // Call custom callback if provided
    if (callback) {
      callback(payload);
    }
  });
};

/**
 * Initialize FCM for admin panel
 */
export const initializeAdminFCM = async () => {
  try {
    // Request permission and get token
    const token = await requestAdminNotificationPermission();
    
    if (token) {
      // Register token with backend
      await registerAdminTokenWithBackend(token);
      
      // Setup foreground message listener
      const unsubscribe = setupAdminForegroundMessageListener((payload) => {
        // Handle admin foreground messages
        console.log('Admin foreground message received:', payload);
        
        // Dispatch custom events for admin notifications
        window.dispatchEvent(new CustomEvent('admin-fcm-message', { 
          detail: payload 
        }));
        
        // Show desktop notification if supported
        if (payload.notification && 'Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: '/images/admin-logo.png',
            data: payload.data
          });
          
          notification.onclick = () => {
            handleAdminNotificationClick(payload.data);
            notification.close();
          };
        }
      });
      
      return { token, unsubscribe };
    }
    
    return { token: null, unsubscribe: null };
  } catch (error) {
    console.error('Error initializing admin FCM:', error);
    return { token: null, unsubscribe: null };
  }
};

/**
 * Handle admin notification click events
 */
export const handleAdminNotificationClick = (data) => {
  console.log('Admin notification clicked with data:', data);
  
  // Handle different admin notification types
  switch (data?.type) {
    case 'new_booking':
      // Navigate to booking assignment page
      if (data.bookingId) {
        window.location.href = `/booking/${data.bookingId}`;
      } else {
        window.location.href = '/dashboard';
      }
      break;
      
    case 'booking_update':
      // Navigate to booking details
      if (data.bookingId) {
        window.location.href = `/booking/${data.bookingId}`;
      }
      break;
      
    case 'driver_status':
      // Navigate to driver management
      window.location.href = '/fleet/drivers';
      break;
      
    case 'vendor_status':
      // Navigate to vendor management
      window.location.href = '/vendors';
      break;
      
    default:
      // Default action - go to dashboard
      window.location.href = '/dashboard';
  }
};

/**
 * Send test notification to admin
 */
export const sendTestAdminNotification = async () => {
  try {
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    
    if (!token) {
      throw new Error('No FCM token available');
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fcm/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        token,
        title: 'Admin Test Notification',
        body: 'This is a test notification for the admin panel'
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Test admin notification sent successfully');
      return true;
    } else {
      console.error('Failed to send test admin notification:', result.message);
      return false;
    }
  } catch (error) {
    console.error('Error sending test admin notification:', error);
    return false;
  }
};

/**
 * Play notification sound for admin
 */
export const playAdminNotificationSound = () => {
  try {
    const audio = new Audio('/sounds/admin-notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Could not play notification sound:', e));
  } catch (error) {
    console.log('Notification sound not available:', error);
  }
};

export { messaging, app };