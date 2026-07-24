import api from './api';

const paymentService = {
  // Get Razorpay key
  getRazorpayKey: async () => {
    try {
      const response = await api.get('/payments/get-key');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create Razorpay order
  createRazorpayOrder: async (amount, currency = 'INR') => {
    try {
      const response = await api.post('/payments/create-order', { amount, currency });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Verify payment
  verifyPayment: async (paymentData, orderDetails) => {
    try {
      const response = await api.post('/payments/verify', {
        ...paymentData,
        orderDetails
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Make UPI payment
  makeUPIPayment: async (upiId, amount, orderId) => {
    try {
      const response = await api.post('/payments/upi', {
        upiId,
        amount,
        orderId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Make Netbanking payment
  makeNetbankingPayment: async (bankCode, amount, orderId) => {
    try {
      const response = await api.post('/payments/netbanking', {
        bankCode,
        amount,
        orderId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Make Credit payment (ElectroKart Credit)
  makeCreditPayment: async (amount, orderId) => {
    try {
      const response = await api.post('/payments/credit', {
        amount,
        orderId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 👇 ADD THIS NEW FUNCTION 👇
  // Make a credit card payment (update balance)
  makePayment: async (amount, paymentMethod) => {
    try {
      const response = await api.post('/payments/make-payment', {
        amount,
        paymentMethod
      });
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
  }
};

export default paymentService;