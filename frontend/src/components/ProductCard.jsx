import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuantitySelector from './QuantitySelector';
import cartService from '../services/cartService';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(100);
  const [imageError, setImageError] = useState(false);

  const productData = product || {
    id: 1,
    name: '20W Fast Charger',
    price: 350,
    mrp: 699,
    image: '/images/charger.jpg',
    category: 'Chargers'
  };

  const handleQuantityChange = (newQty) => {
    setQuantity(newQty);
  };

 const handleAddToCart = (e) => {
  e.stopPropagation(); // Prevent triggering the card click
  
  // Check if user is logged in
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;
  
  if (!isLoggedIn) {
    // Save the intended product to localStorage to add after login
    localStorage.setItem('pendingCartItem', JSON.stringify({
      product: productData,
      quantity: quantity
    }));
    // Redirect to LOGIN page (not register)
    navigate('/login');
    return;
  }
  
  // User is logged in, add to cart directly
  const cart = cartService.getCart();
  
  // Check if product already in cart
  const existingItem = cart.find(item => item.id === productData.id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: productData.id,
      name: productData.name,
      price: productData.price,
      quantity: quantity,
      image: productData.image,
      category: productData.category
    });
  }
  
  cartService.saveCart(cart);
  alert(`Added ${quantity} pieces of ${productData.name} to cart`);
  
  // Optional: Show cart count update
  window.dispatchEvent(new Event('cartUpdated'));
};

  const handleCardClick = () => {
    console.log('Navigating to product:', productData.id);
    navigate(`/product/${productData.id}`);
  };

  const savings = productData.mrp - productData.price;
  const savingsPercent = productData.mrp > 0 ? ((savings / productData.mrp) * 100).toFixed(0) : 0;

  return (
    <div className="product-card" onClick={handleCardClick}>
      <div className="product-image-container">
        {!imageError ? (
          <img 
            src={productData.image}
            alt={productData.name}
            className="product-image"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="image-placeholder">
            <span>📱</span>
            <span>{productData.category}</span>
          </div>
        )}
      </div>

      <div className="product-details">
        <h3 className="product-title">{productData.name}</h3>
        <p className="product-category">{productData.category}</p>

        <div className="price-section">
          <span className="wholesale-price">₹{productData.price}/piece</span>
          <span className="mrp">MRP: ₹{productData.mrp}</span>
          <span className="savings">Save {savingsPercent}%</span>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <QuantitySelector 
            minQty={100}
            maxQty={5000}
            step={10}
            onQuantityChange={handleQuantityChange}
          />
        </div>

        <div className="total-price">
          Total: <span className="text-highlight">₹{productData.price * quantity}</span>
        </div>

        <button 
          className="btn-primary add-to-cart-btn"
          onClick={handleAddToCart}
        >
          Add to Cart ({quantity} pieces)
        </button>
      </div>
    </div>
  );
};

export default ProductCard;