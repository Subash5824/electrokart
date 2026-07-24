import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0); // Start with 0
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status and get cart count on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    // Get cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalItems);
    }
  }, []);

  // Sample product data for search
  const allProducts = [
    { id: 1, name: '20W Fast Charger', category: 'Chargers' },
    { id: 2, name: 'Silicone Phone Case', category: 'Cases' },
    { id: 3, name: 'USB-C Cable 2m', category: 'Cables' },
    { id: 4, name: '10000mAh Power Bank', category: 'Power Banks' },
    { id: 5, name: 'Wireless Charger', category: 'Chargers' },
    { id: 6, name: 'Tempered Glass', category: 'Accessories' },
    { id: 7, name: 'Type-C to HDMI', category: 'Cables' },
    { id: 8, name: 'Mobile Holder', category: 'Accessories' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const handleContactClick = (e) => {
    e.preventDefault();
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo Section */}
        <div className="logo-section">
          <Link to="/" className="logo-link" onClick={handleMobileLinkClick}>
            <img 
              src="/images/logo.png" 
              alt="ElectroKart" 
              className="logo-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/placeholder.jpg';
              }}
            />
            <span className="logo-text">ElectroKart</span>
          </Link>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-container">
            <span className="search-icon">🔍</span>
            <input 
              type="text"
              className="search-input"
              placeholder="Search 5000+ products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button type="submit" className="search-btn">Search</button>
          </form>
        </div>

        {/* Desktop Navigation */}
        <nav className={`nav-section ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="nav-links">
            <Link to="/" className="nav-link" onClick={handleMobileLinkClick}>Home</Link>
            <Link to="/products" className="nav-link" onClick={handleMobileLinkClick}>Products</Link>
            <a href="/" className="nav-link" onClick={handleContactClick}>Contact</a>
          </div>

          {/* Actions */}
          <div className="actions-section">
            <Link to="/cart" className="cart-link" onClick={handleMobileLinkClick}>
              🛒 Cart
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            <div className="auth-buttons">
              {isLoggedIn ? (
                <Link to="/dashboard">
                  <button className="btn-outline">Dashboard</button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <button className="btn-outline">Login</button>
                  </Link>
                  <Link to="/register">
                    <button className="btn-solid">Register</button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-link" onClick={handleMobileLinkClick}>Home</Link>
          <Link to="/products" className="mobile-link" onClick={handleMobileLinkClick}>Products</Link>
          <a href="/" className="mobile-link" onClick={handleContactClick}>Contact</a>
          <Link to="/cart" className="mobile-link" onClick={handleMobileLinkClick}>
            Cart {cartCount > 0 ? `(${cartCount})` : ''}
          </Link>
          <div className="mobile-auth">
            {isLoggedIn ? (
              <Link to="/dashboard" onClick={handleMobileLinkClick}>
                <button className="mobile-register">Dashboard</button>
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={handleMobileLinkClick}>
                  <button className="mobile-login">Login</button>
                </Link>
                <Link to="/register" onClick={handleMobileLinkClick}>
                  <button className="mobile-register">Register</button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;