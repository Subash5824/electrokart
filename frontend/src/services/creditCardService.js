import api from './api';

const creditCardService = {
  // Get card details
  getCardDetails: async () => {
    try {
      const response = await api.get('/cards/my-card');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Apply for credit card
  applyForCard: async () => {
    try {
      const response = await api.post('/cards/apply');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Block card
  blockCard: async () => {
    try {
      const response = await api.put('/cards/block');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get transaction history
  getTransactions: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/transactions/my-transactions?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create purchase
  createPurchase: async (amount, productDetails) => {
    try {
      const response = await api.post('/transactions/purchase', { amount, productDetails });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get current bill
  getCurrentBill: async () => {
    try {
      const response = await api.get('/billing/current-bill');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get billing history
  getBillingHistory: async () => {
    try {
      const response = await api.get('/billing/history');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Make payment
  makePayment: async (amount, paymentType, paymentMethod) => {
    try {
      const response = await api.post('/payments/make-payment', { amount, paymentType, paymentMethod });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get payment history
  getPaymentHistory: async () => {
    try {
      const response = await api.get('/payments/history');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get notifications
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications/my-notifications');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mark notification as read
  markNotificationRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/read/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default creditCardService;