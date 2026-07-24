import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import QuantitySelector from '../components/QuantitySelector';
import cartService from '../services/cartService';
import './ProductsPage.css';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(100);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [mainImageError, setMainImageError] = useState(false);

  // All products with REAL MongoDB IDs
  const allProducts = {
    '69bbf55cabbf4f6fd7628ca0': {
      id: '69bbf55cabbf4f6fd7628ca0',
      name: '20W Fast Charger',
      price: 350,
      mrp: 699,
      image: '/images/charger.jpg',
      category: 'Chargers',
      brand: 'Anker',
      stock: 5000,
      moq: 100,
      maxOrder: 5000,
      stepSize: 10,
      description: 'High-speed 20W USB-C charger compatible with iPhone, Samsung, and Android devices. Fast charging capability with built-in safety features.',
      specifications: [
        { label: 'Input', value: '100-240V AC' },
        { label: 'Output', value: '20W (USB-C)' },
        { label: 'Compatibility', value: 'iPhone, Samsung, Android' },
        { label: 'Box Quantity', value: '50 pieces/carton' },
        { label: 'Weight', value: '50g' },
        { label: 'Warranty', value: '12 months' }
      ],
      bulkPricing: [
        { quantity: 100, price: 350 },
        { quantity: 500, price: 325 },
        { quantity: 1000, price: 300 },
        { quantity: 2500, price: 275 }
      ],
      reviews: [
        { user: 'TechShop Mumbai', rating: 5, comment: 'Excellent quality, fast shipping' },
        { user: 'MobileStore Delhi', rating: 4, comment: 'Good product, customers love it' }
      ]
    },
    '69bbf55cabbf4f6fd7628ca1': {
      id: '69bbf55cabbf4f6fd7628ca1',
      name: 'Silicone Phone Case',
      price: 120,
      mrp: 299,
      image: '/images/case.jpg',
      category: 'Cases',
      brand: 'Spigen',
      stock: 10000,
      moq: 100,
      maxOrder: 5000,
      stepSize: 10,
      description: 'Premium silicone phone case with shock absorption and scratch protection. Available in multiple colors.',
      specifications: [
        { label: 'Material', value: 'Liquid Silicone' },
        { label: 'Compatibility', value: 'iPhone 14/15/16' },
        { label: 'Box Quantity', value: '100 pieces/carton' },
        { label: 'Weight', value: '30g' },
        { label: 'Warranty', value: '6 months' }
      ],
      bulkPricing: [
        { quantity: 100, price: 120 },
        { quantity: 500, price: 110 },
        { quantity: 1000, price: 100 },
        { quantity: 2500, price: 90 }
      ],
      reviews: [
        { user: 'MobileShop Pune', rating: 5, comment: 'Great quality cases' }
      ]
    },
    '69bbf55cabbf4f6fd7628ca2': {
      id: '69bbf55cabbf4f6fd7628ca2',
      name: 'USB-C Cable 2m',
      price: 180,
      mrp: 399,
      image: '/images/cable.jpg',
      category: 'Cables',
      brand: 'Belkin',
      stock: 15000,
      moq: 100,
      maxOrder: 5000,
      stepSize: 10,
      description: 'Durable USB-C to USB-C cable with fast charging support. Braided design for extra durability.',
      specifications: [
        { label: 'Length', value: '2 meters' },
        { label: 'Material', value: 'Nylon Braided' },
        { label: 'Box Quantity', value: '100 pieces/carton' }
      ],
      bulkPricing: [
        { quantity: 100, price: 180 },
        { quantity: 500, price: 165 },
        { quantity: 1000, price: 150 },
        { quantity: 2500, price: 135 }
      ],
      reviews: []
    },
    '69bbf55cabbf4f6fd7628ca3': {
      id: '69bbf55cabbf4f6fd7628ca3',
      name: '10000mAh Power Bank',
      price: 890,
      mrp: 1999,
      image: '/images/powerbank.jpg',
      category: 'Power Banks',
      brand: 'Xiaomi',
      stock: 3000,
      moq: 100,
      maxOrder: 5000,
      stepSize: 10,
      description: 'High-capacity power bank with dual USB ports. Supports fast charging for all devices.',
      specifications: [
        { label: 'Capacity', value: '10000mAh' },
        { label: 'Output', value: '5V/2.4A' },
        { label: 'Box Quantity', value: '20 pieces/carton' }
      ],
      bulkPricing: [
        { quantity: 100, price: 890 },
        { quantity: 500, price: 850 },
        { quantity: 1000, price: 800 },
        { quantity: 2500, price: 750 }
      ],
      reviews: []
    },
    '69bbf55cabbf4f6fd7628ca4': {
      id: '69bbf55cabbf4f6fd7628ca4',
      name: 'Wireless Charger',
      price: 550,
      mrp: 1299,
      image: '/images/wireless.jpg',
      category: 'Chargers',
      brand: 'Anker',
      stock: 2000,
      moq: 100,
      maxOrder: 5000,
      stepSize: 10,
      description: '15W fast wireless charging pad. Works with all Qi-enabled devices.',
      specifications: [
        { label: 'Output', value: '15W' },
        { label: 'Compatibility', value: 'Qi-enabled devices' },
        { label: 'Box Quantity', value: '50 pieces/carton' }
      ],
      bulkPricing: [
        { quantity: 100, price: 550 },
        { quantity: 500, price: 520 },
        { quantity: 1000, price: 490 },
        { quantity: 2500, price: 450 }
      ],
      reviews: []
    },
    '69bbf55cabbf4f6fd7628ca5': {
      id: '69bbf55cabbf4f6fd7628ca5',
      name: 'Tempered Glass',
      price: 45,
      mrp: 199,
      image: '/images/glass.jpg',
      category: 'Accessories',
      brand: 'Generic',
      stock: 20000,
      moq: 100,
      maxOrder: 5000,
      stepSize: 10,
      description: '9H hardness tempered glass screen protector. Bubble-free installation.',
      specifications: [
        { label: 'Hardness', value: '9H' },
        { label: 'Thickness', value: '0.33mm' },
        { label: 'Box Quantity', value: '200 pieces/carton' }
      ],
      bulkPricing: [
        { quantity: 100, price: 45 },
        { quantity: 500, price: 40 },
        { quantity: 1000, price: 35 },
        { quantity: 2500, price: 30 }
      ],
      reviews: []
    },
    '69bbf55cabbf4f6fd7628ca6': {
      id: '69bbf55cabbf4f6fd7628ca6',
      name: 'Type-C to HDMI',
      price: 650,
      mrp: 1499,
      image: '/images/hdmi.jpg',
      category: 'Cables',
      brand: 'Baseus',
      stock: 1500,
      moq: 100,
      maxOrder: 5000,
      stepSize: 10,
      description: '4K USB-C to HDMI adapter for laptops and phones. Plug and play.',
      specifications: [
        { label: 'Resolution', value: '4K' },
        { label: 'Compatibility', value: 'USB-C devices' },
        { label: 'Box Quantity', value: '50 pieces/carton' }
      ],
      bulkPricing: [
        { quantity: 100, price: 650 },
        { quantity: 500, price: 600 },
        { quantity: 1000, price: 550 },
        { quantity: 2500, price: 500 }
      ],
      reviews: []
    },
    '69bbf55cabbf4f6fd7628ca7': {
      id: '69bbf55cabbf4f6fd7628ca7',
      name: 'Mobile Holder',
      price: 90,
      mrp: 299,
      image: '/images/holder.jpg',
      category: 'Accessories',
      brand: 'Generic',
      stock: 5000,
      moq: 100,
      maxOrder: 5000,
      stepSize: 10,
      description: 'Adjustable phone stand for desk. Compatible with all phones.',
      specifications: [
        { label: 'Material', value: 'Aluminum' },
        { label: 'Adjustable', value: 'Yes' },
        { label: 'Box Quantity', value: '100 pieces/carton' }
      ],
      bulkPricing: [
        { quantity: 100, price: 90 },
        { quantity: 500, price: 80 },
        { quantity: 1000, price: 70 },
        { quantity: 2500, price: 60 }
      ],
      reviews: []
    }
  };

  useEffect(() => {
    setLoading(true);
    
    // Find product by ID
    const foundProduct = allProducts[id];
    
    if (foundProduct) {
      setProduct(foundProduct);
      setQuantity(foundProduct.moq || 100);
    } else {
      setProduct(null);
    }
    
    setLoading(false);
  }, [id]);

  const handleQuantityChange = (newQty) => {
    setQuantity(newQty);
  };

  const handleAddToCart = () => {
    const isLoggedIn = cartService.isLoggedIn();
    
    if (!isLoggedIn) {
      localStorage.setItem('pendingCartItem', JSON.stringify({
        product: product,
        quantity: quantity
      }));
      navigate('/register');
      return;
    }
    
    cartService.addToCart(product, quantity);
    alert(`Added ${quantity} pieces of ${product.name} to cart`);
  };

  const handleBuyNow = () => {
    const isLoggedIn = cartService.isLoggedIn();
    
    if (!isLoggedIn) {
      localStorage.setItem('pendingCartItem', JSON.stringify({
        product: product,
        quantity: quantity
      }));
      navigate('/register');
      return;
    }
    
    cartService.addToCart(product, quantity);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="product-page">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-page">
        <Header />
        <div className="error-container">
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist or has been removed.</p>
          <button className="btn-primary" onClick={() => navigate('/products')}>
            Browse Products
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate current price based on quantity
  const getCurrentPrice = () => {
    const tier = product.bulkPricing
      .sort((a, b) => b.quantity - a.quantity)
      .find(t => quantity >= t.quantity);
    return tier ? tier.price : product.bulkPricing[0].price;
  };

  const currentPrice = getCurrentPrice();
  const totalPrice = currentPrice * quantity;
  const savings = product.mrp - currentPrice;
  const savingsPercent = ((savings / product.mrp) * 100).toFixed(0);

  return (
    <div className="product-page">
      <Header />
      
      <main className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span className="breadcrumb-link" onClick={() => navigate('/')}>Home</span> / 
          <span className="breadcrumb-link" onClick={() => navigate('/products')}>Products</span> / 
          <span className="breadcrumb-current">{product.name}</span>
        </div>

        {/* Product Main Section */}
        <div className="product-main">
          {/* Product Image */}
          <div className="product-image-section">
            <div className="main-image">
              {!mainImageError ? (
                <img 
                  src={product.image}
                  alt={product.name}
                  onError={() => setMainImageError(true)}
                />
              ) : (
                <div className="image-placeholder-large">
                  <span>📱</span>
                  <span>{product.category}</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info">
            <h1 className="product-name">{product.name}</h1>
            <p className="product-category">{product.category} | Brand: {product.brand}</p>
            
            <div className="product-rating">
              <span className="stars">{'★'.repeat(4)}</span>
              <span className="rating-count">({product.reviews.length} reviews)</span>
            </div>

            <div className="price-section">
              <span className="current-price">₹{currentPrice}/piece</span>
              <span className="mrp">MRP: ₹{product.mrp}</span>
              <span className="savings">Save {savingsPercent}%</span>
            </div>

            <div className="stock-info">
              <span className="in-stock">✓ In Stock: {product.stock.toLocaleString()} pieces</span>
            </div>

            {/* Quantity Selector */}
            <QuantitySelector 
              minQty={product.moq}
              maxQty={product.maxOrder}
              step={product.stepSize}
              onQuantityChange={handleQuantityChange}
            />

            {/* Bulk Pricing Table */}
            <div className="bulk-pricing">
              <h3>Bulk Pricing</h3>
              <table>
                <thead>
                  <tr>
                    <th>Quantity</th>
                    <th>Price per piece</th>
                    <th>You Save</th>
                  </tr>
                </thead>
                <tbody>
                  {product.bulkPricing.map(tier => (
                    <tr key={tier.quantity} className={quantity >= tier.quantity ? 'active-tier' : ''}>
                      <td>{tier.quantity}+ pieces</td>
                      <td className="text-highlight">₹{tier.price}</td>
                      <td className="text-success">Save ₹{product.mrp - tier.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Price */}
            <div className="total-price-section">
              <span className="total-label">Total Amount:</span>
              <span className="total-amount text-highlight">₹{totalPrice.toLocaleString()}</span>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button 
                className="btn-primary add-to-cart-btn"
                onClick={handleAddToCart}
              >
                Add to Cart ({quantity} pieces)
              </button>
              <button 
                className="btn-buy-now"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>

            {/* MOQ Info */}
            <div className="moq-info">
              <p>📋 Minimum Order: <span className="text-glow">{product.moq} pieces</span></p>
              <p>📦 Maximum Order: <span className="text-glow">{product.maxOrder} pieces</span></p>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="product-tabs">
          <div className="tab-headers">
            <button 
              className={activeTab === 'description' ? 'active' : ''}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button 
              className={activeTab === 'specifications' ? 'active' : ''}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button 
              className={activeTab === 'reviews' ? 'active' : ''}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({product.reviews.length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="description-tab">
                <p>{product.description}</p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="specifications-tab">
                <table>
                  <tbody>
                    {product.specifications.map((spec, index) => (
                      <tr key={index}>
                        <td className="spec-label">{spec.label}</td>
                        <td className="spec-value">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-tab">
                {product.reviews.length > 0 ? (
                  product.reviews.map((review, index) => (
                    <div key={index} className="review-item">
                      <div className="review-header">
                        <span className="review-user">{review.user}</span>
                        <span className="review-rating">{'★'.repeat(review.rating)}</span>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="no-reviews">No reviews yet</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductPage;