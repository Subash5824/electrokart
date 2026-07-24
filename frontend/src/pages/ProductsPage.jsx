import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import './ProductsPage.css';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sample all products - MAKE SURE THIS HAS ALL PRODUCTS
  const allProducts = [
  { id: '69bbf55cabbf4f6fd7628ca0', name: '20W Fast Charger', price: 350, mrp: 699, image: '/images/charger.jpg', category: 'Chargers' },
  { id: '69bbf55cabbf4f6fd7628ca1', name: 'Silicone Phone Case', price: 120, mrp: 299, image: '/images/case.jpg', category: 'Cases' },
  { id: '69bbf55cabbf4f6fd7628ca2', name: 'USB-C Cable 2m', price: 180, mrp: 399, image: '/images/cable.jpg', category: 'Cables' },
  { id: '69bbf55cabbf4f6fd7628ca3', name: '10000mAh Power Bank', price: 890, mrp: 1999, image: '/images/powerbank.jpg', category: 'Power Banks' },
  { id: '69bbf55cabbf4f6fd7628ca4', name: 'Wireless Charger', price: 550, mrp: 1299, image: '/images/wireless.jpg', category: 'Chargers' },
  { id: '69bbf55cabbf4f6fd7628ca5', name: 'Tempered Glass', price: 45, mrp: 199, image: '/images/glass.jpg', category: 'Accessories' },
  { id: '69bbf55cabbf4f6fd7628ca6', name: 'Type-C to HDMI', price: 650, mrp: 1499, image: '/images/hdmi.jpg', category: 'Cables' },
  { id: '69bbf55cabbf4f6fd7628ca7', name: 'Mobile Holder', price: 90, mrp: 299, image: '/images/holder.jpg', category: 'Accessories' }
];
  console.log('All products count:', allProducts.length); // Debug log

  useEffect(() => {
    if (searchQuery) {
      const filtered = allProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
      console.log('Filtered products:', filtered.length);
    } else {
      setFilteredProducts(allProducts);
    }
  }, [searchQuery]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="products-page">
      <Header />
      
      <main className="container">
        <h1 className="page-title">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
        </h1>
        
        {searchQuery && (
          <p className="search-results-info">
            Found {filteredProducts.length} products
          </p>
        )}

        <div className="products-grid">
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              onClick={() => handleProductClick(product.id)}
              style={{ cursor: 'pointer' }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="no-results">
            <h3>No products found</h3>
            <p>Try searching with different keywords</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductsPage;