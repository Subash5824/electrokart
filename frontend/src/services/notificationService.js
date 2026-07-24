import api from './api';

const notificationService = {
  // Get user notifications
  getMyNotifications: async () => {
    try {
      const response = await api.get('/notifications/my-notifications');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/read/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/my-notifications');
      const unread = response.data.notifications?.filter(n => !n.channel?.inApp?.read) || [];
      return unread.length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all notifications (for banker)
  getAllNotifications: async (page = 1, limit = 20) => {
    try {
      const response = await api.get(`/notifications/all?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default notificationService;