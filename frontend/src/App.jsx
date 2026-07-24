import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmation from './pages/OrderConfirmation';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import TransactionHistory from './pages/TransactionHistory';
import Notifications from './pages/Notifications';
import BankerDashboard from './pages/BankerDashboard';
import BankerLogin from './pages/BankerLogin';
import Statements from './pages/Statements';
import PaymentPage from './pages/PaymentPage';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Home */}
        <Route path="/" element={<HomePage />} />
        
        {/* Product routes */}
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        
        {/* Order routes */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} /> {/* Add this */}
        
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Dashboard routes */}
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/transactions" element={<TransactionHistory />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/banker/login" element={<BankerLogin />} />
        <Route path="/banker/dashboard" element={<BankerDashboard />} />
        <Route path="/banker" element={<BankerDashboard />} />
        <Route path="/statements" element={<Statements />} />
        <Route path="/payment" element={<PaymentPage />} />
      </Routes>
    </div>
  );
}

export default App;