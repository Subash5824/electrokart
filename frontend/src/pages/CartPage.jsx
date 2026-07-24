import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import cartService from '../services/cartService';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  // Load cart on component mount
  useEffect(() => {
    loadCart();
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCart();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const loadCart = () => {
    const items = cartService.getCart();
    setCartItems(items);
  };

  // Calculate totals
  const totalPieces = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Validate cart (minimum 100 pieces)
  const isValidCart = totalPieces >= 100 && totalPieces <= 5000;
  
  // Calculate discount based on bulk
  let discountPercent = 0;
  if (totalPieces >= 1000) discountPercent = 10;
  else if (totalPieces >= 500) discountPercent = 7;
  else if (totalPieces >= 250) discountPercent = 5;
  else if (totalPieces >= 100) discountPercent = 2;
  
  const discountAmount = (subtotal * discountPercent) / 100;
  const afterDiscount = subtotal - discountAmount;
  
  // Shipping
  let shipping = 0;
  if (totalPieces >= 1000) shipping = 0;
  else if (totalPieces >= 500) shipping = 150;
  else shipping = 250;
  
  // Tax (18% GST)
  const tax = afterDiscount * 0.18;
  const total = afterDiscount + shipping + tax;

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity >= 100 && newQuantity <= 5000) {
      cartService.updateQuantity(id, newQuantity);
      loadCart(); // Reload cart to reflect changes
    }
  };

  const handleRemoveItem = (id) => {
    if (window.confirm('Remove this item from cart?')) {
      cartService.removeItem(id);
      loadCart();
    }
  };

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'KART10') {
      setCouponApplied(true);
      alert('Coupon applied successfully!');
    } else {
      alert('Invalid coupon code');
    }
  };

  const handleCheckout = () => {
    if (!isValidCart) {
      alert(`Total pieces must be between 100 and 5000. Current: ${totalPieces}`);
      return;
    }
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  return (
    <div className="cart-page">
      <Header />
      
      <main className="container">
        <h1 className="page-title">Your Wholesale Cart</h1>
        
        {/* Cart Validation Warning */}
        {cartItems.length > 0 && !isValidCart && (
          <div className="cart-warning">
            ⚠️ Total pieces must be between 100 and 5000. Current: {totalPieces}
          </div>
        )}

        <div className="cart-layout">
          {/* Cart Items Section */}
          <div className="cart-items-section">
            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">🛒</div>
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added any products yet</p>
                <button 
                  className="btn-primary shop-now-btn"
                  onClick={handleContinueShopping}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="cart-header">
                  <span className="cart-header-item">Product</span>
                  <span className="cart-header-price">Price</span>
                  <span className="cart-header-quantity">Quantity</span>
                  <span className="cart-header-total">Total</span>
                  <span className="cart-header-action"></span>
                </div>

                {cartItems.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-product">
                      <img 
                        src={item.image || '/images/placeholder.jpg'} 
                        alt={item.name}
                        className="cart-item-image"
                        onError={(e) => e.target.src = '/images/placeholder.jpg'}
                      />
                      <div className="cart-item-details">
                        <h3>{item.name}</h3>
                        <p>{item.category || 'Mobile Accessories'}</p>
                      </div>
                    </div>
                    
                    <div className="cart-item-price">
                      ₹{item.price}
                    </div>
                    
                    <div className="cart-item-quantity">
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity - 10)}
                        disabled={item.quantity <= 100}
                        className="qty-btn"
                      >-</button>
                      <input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 100)}
                        min="100"
                        max="5000"
                        step="10"
                        className="qty-input"
                      />
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity + 10)}
                        disabled={item.quantity >= 5000}
                        className="qty-btn"
                      >+</button>
                    </div>
                    
                    <div className="cart-item-total">
                      <span className="text-highlight">₹{item.price * item.quantity}</span>
                    </div>
                    
                    <div className="cart-item-action">
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="remove-btn"
                        title="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Order Summary Section */}
          {cartItems.length > 0 && (
            <div className="order-summary">
              <h2>Order Summary</h2>
              
              <div className="summary-row">
                <span>Total Pieces:</span>
                <span className="text-highlight">{totalPieces}</span>
              </div>
              
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              
              {discountPercent > 0 && (
                <div className="summary-row discount">
                  <span>Bulk Discount ({discountPercent}%):</span>
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
                <span className="text-highlight">₹{total.toFixed(2)}</span>
              </div>

              {/* Coupon Code */}
              <div className="coupon-section">
                <input 
                  type="text" 
                  placeholder="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="coupon-input"
                />
                <button 
                  onClick={handleApplyCoupon}
                  className="coupon-btn"
                  disabled={couponApplied}
                >
                  Apply
                </button>
              </div>

              {/* Checkout Button */}
              <button 
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={!isValidCart}
              >
                Proceed to Checkout
              </button>

              {/* MOQ Info */}
              <div className="moq-info">
                <p>📦 Minimum Order: <span className="text-glow">100 pieces</span></p>
                <p>📦 Maximum Order: <span className="text-glow">5000 pieces</span></p>
                <p>📦 Bulk Discounts:</p>
                <ul>
                  <li>100+ pieces: 2% off</li>
                  <li>250+ pieces: 5% off</li>
                  <li>500+ pieces: 7% off</li>
                  <li>1000+ pieces: 10% off + Free Shipping</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;