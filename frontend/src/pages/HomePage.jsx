import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [heroImageError, setHeroImageError] = useState(false);
  
  // Sample products data - WITH REAL MONGODB IDS (ALL 8 PRODUCTS)
  const products = [
    {
      id: '69bbf55cabbf4f6fd7628ca0',
      name: '20W Fast Charger',
      price: 350,
      mrp: 699,
      image: '/images/charger.jpg',
      category: 'Chargers'
    },
    {
      id: '69bbf55cabbf4f6fd7628ca1',
      name: 'Silicone Phone Case',
      price: 120,
      mrp: 299,
      image: '/images/case.jpg',
      category: 'Cases'
    },
    {
      id: '69bbf55cabbf4f6fd7628ca2',
      name: 'USB-C Cable 2m',
      price: 180,
      mrp: 399,
      image: '/images/cable.jpg',
      category: 'Cables'
    },
    {
      id: '69bbf55cabbf4f6fd7628ca3',
      name: '10000mAh Power Bank',
      price: 890,
      mrp: 1999,
      image: '/images/powerbank.jpg',
      category: 'Power Banks'
    },
    {
      id: '69bbf55cabbf4f6fd7628ca4',
      name: 'Wireless Charger',
      price: 550,
      mrp: 1299,
      image: '/images/wireless.jpg',
      category: 'Chargers'
    },
    {
      id: '69bbf55cabbf4f6fd7628ca5',
      name: 'Tempered Glass',
      price: 45,
      mrp: 199,
      image: '/images/glass.jpg',
      category: 'Accessories'
    },
    {
      id: '69bbf55cabbf4f6fd7628ca6',
      name: 'Type-C to HDMI',
      price: 650,
      mrp: 1499,
      image: '/images/hdmi.jpg',
      category: 'Cables'
    },
    {
      id: '69bbf55cabbf4f6fd7628ca7',
      name: 'Mobile Holder',
      price: 90,
      mrp: 299,
      image: '/images/holder.jpg',
      category: 'Accessories'
    }
  ];

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleShopNow = () => {
    navigate('/products');
  };

  const handleContactSales = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const categories = [
    { name: 'Chargers', icon: '🔋', count: '3+ Products' },
    { name: 'Cases', icon: '📱', count: '1+ Products' },
    { name: 'Cables', icon: '🔌', count: '2+ Products' },
    { name: 'Power Banks', icon: '⚡', count: '1+ Products' },
    { name: 'Accessories', icon: '🎧', count: '2+ Products' }
  ];

  return (
    <div className="homepage">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-split">
            <div className="hero-left">
              <h1 className="hero-title">
                ElectroKart <span className="gradient-text">Wholesale</span> Gadgets
              </h1>
              
              <p className="hero-description">
                India's largest B2B marketplace for mobile accessories. 
                Bulk orders at factory prices.
              </p>

              <div className="hero-features">
                <div className="feature-item">
                  <span className="feature-icon">📦</span>
                  <div className="feature-text">
                    Min 100 pieces
                    <small>Order quantity</small>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">⚡</span>
                  <div className="feature-text">
                    Fast Delivery
                    <small>PAN India</small>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">💳</span>
                  <div className="feature-text">
                    Secure Payment
                    <small>Credit Card</small>
                  </div>
                </div>
              </div>

              <div className="hero-badges">
                <span className="badge">🔥 8+ Products</span>
                <span className="badge">⭐ 500+ Sellers</span>
                <span className="badge">🚚 Free Shipping*</span>
              </div>

              <div className="hero-buttons">
                <button className="btn-primary" onClick={handleShopNow}>
                  Shop Now
                </button>
                <button className="btn-secondary" onClick={handleContactSales}>
                  Contact Sales
                </button>
              </div>
            </div>

            <div className="hero-right">
              <div className="hero-image-wrapper">
                <div className="image-glow"></div>
                {!heroImageError ? (
                  <img 
                    src="/images/logo.png" 
                    alt="Mobile Accessories"
                    className="hero-image"
                    onError={() => setHeroImageError(true)}
                  />
                ) : (
                  <div className="image-fallback">
                    <span className="fallback-icon">📱</span>
                    <span>Mobile Accessories</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Browse from wide range of products</p>
          </div>
          <div className="categories-grid">
            {categories.map((cat, index) => (
              <div key={index} className="category-card">
                <div className="category-icon">{cat.icon}</div>
                <h3>{cat.name}</h3>
                <p>{cat.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle">Most popular wholesale items</p>
          </div>
          <div className="products-grid">
            {products.map(product => (
              <div 
                key={product.id} 
                onClick={() => handleProductClick(product.id)} 
                style={{ cursor: 'pointer' }}
                className="product-card-wrapper"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Free Shipping</h3>
              <p>On orders above 1000 pieces</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💎</div>
              <h3>Best Prices</h3>
              <p>Factory direct pricing</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Payments</h3>
              <p>100% secure transactions</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to start wholesale?</h2>
            <p className="cta-subtitle">Join 5000+ businesses already growing with us</p>
            <button 
              className="cta-button"
              onClick={handleRegisterClick}
            >
              Create Business Account
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;