'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { messaging } from '../../firebase-config';
import { getToken, onMessage, deleteToken } from 'firebase/messaging';
import { ToastContainer, toast } from 'react-toastify';
import { Bell, X, Check, Mail, AlertTriangle } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

export default function NotificationClient() {
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const notificationSound = useMemo(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      return audio;
    }
    return null;
  }, []);

  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
      setNotifications(stored);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to send token to server
  const registerToken = useCallback(async (currentToken) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.id;

      if (!userId || !currentToken) {
        throw new Error('User ID or token missing');
      }

      const response = await fetch('http://localhost:8085/api/register-admin-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fcmToken: currentToken,
          userId: userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register token');
      }

      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('Failed to register token:', error);
      toast.error('Failed to enable notifications');
      setIsSubscribed(false);
      return false;
    }
  }, []);

  const unregisterToken = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_fcm_token');
      if (!token) return;

      // Delete token from Firebase
      await deleteToken(messaging);
      
      // Remove from local storage
      localStorage.removeItem('admin_fcm_token');
      
      // TODO: Call backend to remove token
      setIsSubscribed(false);
      return true;
    } catch (error) {
      console.error('Failed to unregister token:', error);
      toast.error('Failed to disable notifications');
      return false;
    }
  }, []);

  const handleMessage = useCallback((payload) => {
    const { title, body } = payload.notification;
    const newNotification = {
      id: Date.now(),
      title: title || 'New Notification',
      body: body || '',
      time: new Date().toLocaleString(),
      read: false,
      data: payload.data || {},
    };

    // Play sound if enabled
    if (notificationSound) {
      notificationSound.currentTime = 0;
      notificationSound.play().catch((e) => 
        console.warn('Sound playback failed:', e)
      );
    }

    // Show toast
    
        toast.info(`${title}: ${body}`, {
      position: 'top-right',
      autoClose: 5000,
      onClick: () => setSidebarOpen(true),
    });

    // Update state and storage
    setNotifications((prev) => {
      const updated = [newNotification, ...prev].slice(0, 100); // Limit to 100 notifications
      localStorage.setItem('admin_notifications', JSON.stringify(updated));
      return updated;
    });
  }, [notificationSound]);

  const initializeNotifications = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      setError('Push notifications not supported in this browser');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker Registered');

      const currentToken = await getToken(messaging, {
        vapidKey:"BFeBBpUyxnCf54AL_Z16F357mX3oYFetAsdoMNhMrBmd1rPSFbpfFidAmq4Ho2NKNeSLe_7ogKudgk6lx8w5mts",
        serviceWorkerRegistration: registration,
      });

      if (currentToken) {
        const storedToken = localStorage.getItem('admin_fcm_token');
        if (storedToken !== currentToken) {
          localStorage.setItem('admin_fcm_token', currentToken);
          await registerToken(currentToken);
        }
        console.log('FCM Token:', currentToken);
      } else {
        console.warn('No FCM token retrieved');
        setError('Notification permission not granted');
      }

      // Listen for messages
      const unsubscribe = onMessage(messaging, handleMessage);
      return unsubscribe;
    } catch (err) {
      console.error('Notification initialization failed:', err);
      setError('Failed to initialize notifications');
      return () => {};
    }
  }, [handleMessage, registerToken]);

  // Initialize notifications on mount
  useEffect(() => {
    initializeNotifications();

    // Token refresh interval (every 55 minutes)
    const refreshInterval = setInterval(async () => {
      try {
        const newToken = await getToken(messaging, {
          vapidKey:"BFeBBpUyxnCf54AL_Z16F357mX3oYFetAsdoMNhMrBmd1rPSFbpfFidAmq4Ho2NKNeSLe_7ogKudgk6lx8w5mts",
        });

        const storedToken = localStorage.getItem('admin_fcm_token');
        if (newToken && newToken !== storedToken) {
          localStorage.setItem('admin_fcm_token', newToken);
          await registerToken(newToken);
        }
      } catch (err) {
        console.error('Token refresh failed:', err);
      }
    }, 55 * 60 * 1000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [initializeNotifications]);

  const handleNotificationClick = useCallback((notification) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      );
      localStorage.setItem('admin_notifications', JSON.stringify(updated));
      return updated;
    });

    // TODO: Handle navigation based on notification data
    if (notification.data?.url) {
      // window.location.href = notification.data.url;
    }
  }, []);

  const handleClearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('admin_notifications');
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
  )}, []);

  const toggleNotifications = useCallback(async () => {
    if (isSubscribed) {
      await unregisterToken();
    } else {
      const token = localStorage.getItem('admin_fcm_token') || 
                   await getToken(messaging, {
                     vapidKey: "BFeBBpUyxnCf54AL_Z16F357mX3oYFetAsdoMNhMrBmd1rPSFbpfFidAmq4Ho2NKNeSLe_7ogKudgk6lx8w5mts",
                   });
      if (token) {
        await registerToken(token);
      }
    }
  }, [isSubscribed, registerToken, unregisterToken]);

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
    [notifications]
  );

  if (loading) {
    return (
      <div className="fixed top-4 right-4 z-50 p-2">
        <Bell className="w-6 h-6 text-gray-400 animate-pulse" />
      </div>
    );
  }

  return (
    <>
      
        <div className="fixed top-16 right-4 z-50">
        <button
          className="relative p-2 bg-white shadow-lg rounded-full hover:bg-gray-100 transition-colors"
          onClick={() => setSidebarOpen(true)}
          aria-label="Notifications"
        >
          <Bell className="w-6 h-6 text-gray-800" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notification Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
  sidebarOpen ? 'translate-x-0' : 'translate-x-full'
}`}
        aria-hidden={!sidebarOpen}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleNotifications}
              className="text-sm px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
            >
              {isSubscribed ? 'Disable' : 'Enable'}
            </button>
            <button 
              onClick={() => setSidebarOpen(false)}
              aria-label="Close notifications"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="flex justify-between items-center px-4 mt-2">
          <p className="text-sm text-gray-500">
            {notifications.length} notification{notifications.length !== 1 && 's'}
          </p>
          <div className="flex gap-4">
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
              disabled={unreadCount === 0}
            >
              Mark all as read
            </button>
            <button
              onClick={handleClearAll}
              className="text-sm text-red-600 hover:underline disabled:text-gray-400"
              disabled={notifications.length === 0}
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-120px)]">
          {notifications.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <Mail className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <ul>
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`border-b hover:bg-gray-50 transition-colors ${
                    notification.read ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <button
                    className="w-full text-left p-4"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      <div className="pt-0.5">
                        {notification.read ? (
                          <Check className="w-4 h-4 text-gray-400" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-gray-900">
                            {notification.title}
                          </h4>
                          <time className="text-xs text-gray-400">
                            {notification.time}
                          </time>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.body}
                        </p>
                        {notification.data?.type && (
                          <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                            {notification.data.type}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ToastContainer 
        position="top-right" 
        autoClose={5000}
        closeOnClick
        pauseOnHover
        theme="light"
        style={{ zIndex: 99999 }}
      />
    </>
  );
}