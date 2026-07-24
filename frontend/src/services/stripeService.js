import api from './api';

const stripeService = {
  // Create payment intent
  createPaymentIntent: async (amount, currency = 'inr') => {
    try {
      const response = await api.post('/payments/create-payment-intent', {
        amount,
        currency
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Confirm payment (handled by Stripe.js on frontend)
  // This is just for backend confirmation
  confirmPayment: async (paymentIntentId) => {
    try {
      const response = await api.post('/payments/confirm', {
        paymentIntentId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default stripeService;