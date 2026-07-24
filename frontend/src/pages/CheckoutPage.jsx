import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import authService from '../services/authService';
import orderService from '../services/orderService';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Cart items - Get from localStorage
  const [cartItems, setCartItems] = useState([]);

  // Card details form state
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });

  const [errors, setErrors] = useState({});

  // Check if user is logged in and load cart
  useEffect(() => {
    const token = localStorage.getItem('token');
    const currentUser = authService.getCurrentUser();
    
    if (!token || !currentUser) {
      alert('Please login to continue with checkout');
      navigate('/login');
      return;
    }
    
    setUser(currentUser);
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (parsedCart.length === 0) {
        alert('Your cart is empty');
        navigate('/products');
        return;
      }
      
      // Convert IDs to strings
      const fixedCart = parsedCart.map(item => ({
        ...item,
        id: item.id.toString()
      }));
      
      setCartItems(fixedCart);
      console.log('Cart loaded:', fixedCart);
    } else {
      alert('Your cart is empty');
      navigate('/products');
      return;
    }
    
    setLoading(false);
  }, []);

  // Calculate totals
  const totalPieces = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Discount based on bulk
  let discountPercent = 0;
  if (totalPieces >= 1000) discountPercent = 10;
  else if (totalPieces >= 500) discountPercent = 7;
  else if (totalPieces >= 250) discountPercent = 5;
  else if (totalPieces >= 100) discountPercent = 2;
  
  const discountAmount = (subtotal * discountPercent) / 100;
  const afterDiscount = subtotal - discountAmount;
  
  // Shipping
  const shipping = totalPieces >= 1000 ? 0 : (totalPieces >= 500 ? 150 : 250);
  
  // Tax (18% GST)
  const tax = afterDiscount * 0.18;
  const grandTotal = afterDiscount + shipping + tax;

  // Handle card input changes
  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setCardDetails({
        ...cardDetails,
        [name]: formatted.substring(0, 19)
      });
    } 
    else if (name === 'expiry') {
      let formatted = value.replace(/\D/g, '');
      if (formatted.length >= 2) {
        formatted = formatted.substring(0, 2) + '/' + formatted.substring(2, 4);
      }
      setCardDetails({
        ...cardDetails,
        [name]: formatted
      });
    }
    else if (name === 'cvv') {
      setCardDetails({
        ...cardDetails,
        [name]: value.replace(/\D/g, '').substring(0, 3)
      });
    }
    else {
      setCardDetails({
        ...cardDetails,
        [name]: value
      });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Validate card details
  const validateCardDetails = () => {
    const newErrors = {};
    
    const cardNumberClean = cardDetails.cardNumber.replace(/\s/g, '');
    if (!cardDetails.cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(cardNumberClean)) {
      newErrors.cardNumber = 'Invalid card number (must be 16 digits)';
    }
    
    if (!cardDetails.cardName) {
      newErrors.cardName = 'Name on card is required';
    } else if (cardDetails.cardName.length < 3) {
      newErrors.cardName = 'Enter full name as on card';
    }
    
    if (!cardDetails.expiry) {
      newErrors.expiry = 'Expiry date is required';
    } else {
      const [month, year] = cardDetails.expiry.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (!month || !year || month < 1 || month > 12) {
        newErrors.expiry = 'Invalid expiry date';
      } else if (parseInt(year) < currentYear || 
                (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiry = 'Card has expired';
      }
    }
    
    if (!cardDetails.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3}$/.test(cardDetails.cvv)) {
      newErrors.cvv = 'CVV must be 3 digits';
    }
    
    return newErrors;
  };

// Handle payment submission - FINAL VERSION
const handlePlaceOrder = async () => {
  const cardErrors = validateCardDetails();
  
  if (Object.keys(cardErrors).length > 0) {
    setErrors(cardErrors);
    return;
  }
  
  setProcessing(true);
  
  try {
    // Mock payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Prepare order data - DON'T send orderNumber
    const orderData = {
      items: cartItems.map(item => ({
        product: item.id, // Send as is
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.price * item.quantity
      })),
      totalPieces,
      subtotal,
      discount: {
        percent: discountPercent,
        amount: discountAmount
      },
      shipping,
      tax,
      total: grandTotal,
      paymentMethod: 'card',
      cardLast4: cardDetails.cardNumber.replace(/\s/g, '').slice(-4)
      // DO NOT include orderNumber - let backend generate it
    };

    console.log('Sending order data:', orderData);

    // Save order
    const orderResponse = await orderService.createOrder(orderData);
    
    if (orderResponse.success) {
      localStorage.removeItem('cart');
      navigate('/order-confirmation', {
        state: {
          orderId: orderResponse.order.orderNumber,
          total: grandTotal,
          items: cartItems,
          paymentMethod: 'card'
        }
      });
    } else {
      alert('Failed to save order: ' + orderResponse.message);
      setProcessing(false);
    }
    
  } catch (error) {
    console.error('Order creation error:', error);
    alert('Error saving order. Please try again.');
    setProcessing(false);
  }
};
  if (loading) {
    return (
      <div className="checkout-page">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading checkout...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Header />
      
      <main className="container">
        <h1 className="page-title">Checkout</h1>
        
        {/* Checkout Steps */}
        <div className="checkout-steps">
          <div className="step completed">
            <span className="step-number">✓</span>
            <span className="step-label">Business Details</span>
          </div>
          <div className="step-line active"></div>
          <div className="step completed">
            <span className="step-number">✓</span>
            <span className="step-label">Shipping</span>
          </div>
          <div className="step-line active"></div>
          <div className="step active">
            <span className="step-number">3</span>
            <span className="step-label">Payment</span>
          </div>
        </div>

        {/* User Info Summary */}
        <div className="user-info-summary">
          <p>
            <strong>{user?.businessName}</strong> | {user?.email} | {user?.phone}
          </p>
          <p className="text-muted">Using saved business details</p>
        </div>

        <div className="checkout-layout">
          {/* Payment Form */}
          <div className="checkout-form">
            <div className="form-step">
              <h2>Payment Details</h2>
              
              {/* Credit Card Form */}
              <div className="credit-card-form">
                <div className="form-group">
                  <label>Card Number *</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={handleCardInputChange}
                    className={errors.cardNumber ? 'error' : ''}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                  />
                  {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
                </div>

                <div className="form-group">
                  <label>Name on Card *</label>
                  <input
                    type="text"
                    name="cardName"
                    value={cardDetails.cardName}
                    onChange={handleCardInputChange}
                    className={errors.cardName ? 'error' : ''}
                    placeholder="John Doe"
                  />
                  {errors.cardName && <span className="error-message">{errors.cardName}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry (MM/YY) *</label>
                    <input
                      type="text"
                      name="expiry"
                      value={cardDetails.expiry}
                      onChange={handleCardInputChange}
                      className={errors.expiry ? 'error' : ''}
                      placeholder="MM/YY"
                      maxLength="5"
                    />
                    {errors.expiry && <span className="error-message">{errors.expiry}</span>}
                  </div>

                  <div className="form-group">
                    <label>CVV *</label>
                    <input
                      type="password"
                      name="cvv"
                      value={cardDetails.cvv}
                      onChange={handleCardInputChange}
                      className={errors.cvv ? 'error' : ''}
                      placeholder="123"
                      maxLength="3"
                    />
                    {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  className="btn-primary place-order-btn"
                  onClick={handlePlaceOrder}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : `Pay ₹${grandTotal.toLocaleString()}`}
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary-sidebar">
            <h3>Order Summary</h3>
            
            <div className="summary-items">
              {cartItems.map(item => (
                <div key={item.id} className="summary-item">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    onError={(e) => e.target.src = '/images/placeholder.jpg'}
                  />
                  <div className="item-details">
                    <p className="item-name">{item.name}</p>
                    <p className="item-qty">Qty: {item.quantity}</p>
                    <p className="item-price">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="summary-row">
                <span>Total Pieces:</span>
                <span>{totalPieces}</span>
              </div>
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              {discountPercent > 0 && (
                <div className="summary-row discount">
                  <span>Discount ({discountPercent}%):</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Shipping:</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
              <div className="summary-row">
                <span>GST (18%):</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Grand Total:</span>
                <span className="text-highlight">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="secure-payment">
              <p>🔒 Secure Payment</p>
              <p>Your data is encrypted and secure</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;