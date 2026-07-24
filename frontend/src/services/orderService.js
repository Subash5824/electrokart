import api from './api';

const orderService = {
  // Create new order
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Create order error:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Failed to create order' };
    }
  },

  // Get user orders
  getUserOrders: async () => {
    try {
      const response = await api.get('/orders/myorders');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default orderService;