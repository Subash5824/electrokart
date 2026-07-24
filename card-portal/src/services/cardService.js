import api from './api';

const cardService = {
  // Login for bankers
  login: async (email, password) => {
    try {
      console.log('🔐 Logging in as:', email);
      
      const response = await api.post('/banker/login', { 
        email: email.trim(), 
        password: password.trim() 
      });
      
      console.log('✅ Login response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('cardToken', response.data.token);
        localStorage.setItem('cardUser', JSON.stringify(response.data.banker));
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Login error:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('cardToken');
    localStorage.removeItem('cardUser');
  },

  // Get current logged in user (banker)
  getCurrentUser: () => {
    const user = localStorage.getItem('cardUser');
    return user ? JSON.parse(user) : null;
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('cardToken');
  },

  // ===== BANKER SPECIFIC FUNCTIONS =====
  
  // Get dashboard statistics
  getStats: async () => {
    try {
      const response = await api.get('/banker/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get pending transactions
  getPendingTransactions: async () => {
    try {
      const response = await api.get('/banker/pending-transactions');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
      throw error.response?.data || error.message;
    }
  },

  // Approve transaction
  approveTransaction: async (transactionId, comments) => {
    try {
      const response = await api.post('/banker/approve-transaction', {
        transactionId,
        comments
      });
      return response.data;
    } catch (error) {
      console.error('Error approving transaction:', error);
      throw error.response?.data || error.message;
    }
  },

  // Decline transaction
  declineTransaction: async (transactionId, reason) => {
    try {
      const response = await api.post('/banker/decline-transaction', {
        transactionId,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error declining transaction:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get all customers
  getCustomers: async () => {
    try {
      const response = await api.get('/banker/customers');
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get customer details
  getCustomerDetails: async (customerId) => {
    try {
      const response = await api.get(`/banker/customer/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer details:', error);
      throw error.response?.data || error.message;
    }
  },

  // Block customer card
  blockCustomerCard: async (userId, reason) => {
    try {
      const response = await api.put(`/banker/block-card/${userId}`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error blocking card:', error);
      throw error.response?.data || error.message;
    }
  },

  // Approve credit card
  approveCreditCard: async (userId) => {
    try {
      const response = await api.put(`/banker/approve-card/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error approving card:', error);
      throw error.response?.data || error.message;
    }
  }
};

export default cardService;