import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // Get order details from navigation state
    if (location.state) {
      setOrderDetails(location.state);
    } else {
      // If no state, redirect to home
      navigate('/');
    }
  }, [location, navigate]);

  if (!orderDetails) {
    return (
      <div className="order-confirmation">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading order details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="order-confirmation">
      <Header />
      
      <main className="container">
        <div className="confirmation-card">
          <div className="success-icon">✅</div>
          
          <h1 className="confirmation-title">Order Placed Successfully!</h1>
          
          <p className="order-number">
            Order ID: <strong>{orderDetails.orderId}</strong>
          </p>
          
          <div className="order-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-items">
              {orderDetails.items?.map(item => (
                <div key={item.id} className="summary-item">
                  <span className="item-name">{item.name} x {item.quantity}</span>
                  <span className="item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            
            <div className="total-row">
              <span>Total Amount:</span>
              <span className="total-price">₹{orderDetails.total?.toLocaleString()}</span>
            </div>
            
            <div className="payment-method">
              <span>Payment Method:</span>
              <span className="payment-badge">
                {orderDetails.paymentMethod === 'card' ? 'Credit/Debit Card' : orderDetails.paymentMethod}
              </span>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className="btn-primary"
              onClick={() => navigate('/dashboard')}
            >
              View Dashboard
            </button>
            <button 
              className="btn-secondary"
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;