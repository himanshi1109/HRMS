import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const response = await notificationService.getMyNotifications();
      if (response?.success && response?.data) {
        setNotifications(response.data);
      }
      const countRes = await notificationService.getUnreadCount();
      if (countRes?.success && typeof countRes?.data === 'number') {
        setUnreadCount(countRes.data);
      } else if (countRes?.success && typeof countRes?.data?.count === 'number') {
        setUnreadCount(countRes.data.count);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      
      // Setup periodic polling for notifications (every 2 minutes)
      const interval = setInterval(fetchNotifications, 2 * 60 * 1000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      const response = await notificationService.markAsRead(id);
      if (response?.success) {
        setNotifications((prev) =>
          prev.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response?.success) {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
export default NotificationContext;
