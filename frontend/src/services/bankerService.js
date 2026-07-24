import api from './api';

// Create a separate API instance for banker (different base URL if needed)
const bankerApi = api;

const bankerService = {
  // Banker login
  login: async (email, password) => {
    try {
      const response = await bankerApi.post('/banker/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('bankerToken', response.data.token);
        localStorage.setItem('banker', JSON.stringify(response.data.banker));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get banker dashboard stats
  getStats: async () => {
    try {
      const response = await bankerApi.get('/banker/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get pending transactions
  getPendingTransactions: async () => {
    try {
      const response = await bankerApi.get('/banker/pending-transactions');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Approve transaction
  approveTransaction: async (transactionId, comments) => {
    try {
      const response = await bankerApi.post('/banker/approve-transaction', { transactionId, comments });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Decline transaction
  declineTransaction: async (transactionId, reason) => {
    try {
      const response = await bankerApi.post('/banker/decline-transaction', { transactionId, reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all customers
  getCustomers: async () => {
    try {
      const response = await bankerApi.get('/banker/customers');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get customer details
  getCustomerDetails: async (customerId) => {
    try {
      const response = await bankerApi.get(`/banker/customer/${customerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Approve credit card
  approveCreditCard: async (userId) => {
    try {
      const response = await bankerApi.put(`/banker/approve-card/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Block customer card
  blockCustomerCard: async (userId, reason) => {
    try {
      const response = await bankerApi.put(`/banker/block-card/${userId}`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all notifications
  getAllNotifications: async () => {
    try {
      const response = await bankerApi.get('/notifications/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('bankerToken');
    localStorage.removeItem('banker');
  },

  // Check if logged in
  isAuthenticated: () => {
    return !!localStorage.getItem('bankerToken');
  },

  // Get current banker
  getCurrentBanker: () => {
    const banker = localStorage.getItem('banker');
    return banker ? JSON.parse(banker) : null;
  }
};

export default bankerService;