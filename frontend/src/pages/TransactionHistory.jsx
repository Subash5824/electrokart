import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import creditCardService from '../services/creditCardService';
import './TransactionHistory.css';

const TransactionHistory = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalPayments: 0,
    pendingCount: 0
  });

  useEffect(() => {
    fetchTransactions();
  }, [page, filter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await creditCardService.getTransactions(page, 20);
      
      let filteredTransactions = response.transactions;
      if (filter !== 'all') {
        filteredTransactions = response.transactions.filter(t => t.type === filter);
      }
      
      setTransactions(filteredTransactions);
      setTotalPages(response.pages || 1);

      // Calculate stats
      const totalSpent = filteredTransactions
        .filter(t => t.type === 'purchase' && t.status === 'approved')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalPayments = filteredTransactions
        .filter(t => t.type === 'payment')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const pendingCount = filteredTransactions
        .filter(t => t.status === 'pending')
        .length;

      setStats({ totalSpent, totalPayments, pendingCount });

    } catch (error) {
      console.error('Error fetching transactions:', error);
      alert('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'approved': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'declined': return 'status-declined';
      default: return '';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'purchase': return '🛍️';
      case 'payment': return '💰';
      case 'interest': return '📈';
      case 'fee': return '⚠️';
      default: return '💳';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && page === 1) {
    return (
      <div className="transaction-page">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading transactions...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="transaction-page">
      <Header />
      
      <main className="container">
        <div className="transaction-header">
          <h1 className="page-title">Transaction History</h1>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💳</div>
            <div className="stat-content">
              <span className="stat-label">Total Spent</span>
              <span className="stat-value text-highlight">₹{stats.totalSpent.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <span className="stat-label">Total Payments</span>
              <span className="stat-value text-success">₹{stats.totalPayments.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <span className="stat-label">Pending</span>
              <span className="stat-value text-glow">{stats.pendingCount}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filter === 'purchase' ? 'active' : ''}`}
              onClick={() => setFilter('purchase')}
            >
              Purchases
            </button>
            <button 
              className={`filter-btn ${filter === 'payment' ? 'active' : ''}`}
              onClick={() => setFilter('payment')}
            >
              Payments
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="transactions-list">
          {transactions.length === 0 ? (
            <div className="no-transactions">
              <div className="no-data-icon">📭</div>
              <h3>No transactions found</h3>
              <p>Your transaction history will appear here</p>
              <button className="shop-now-btn" onClick={() => navigate('/products')}>
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              {transactions.map(tx => (
                <div key={tx._id} className="transaction-item">
                  <div className="transaction-icon">
                    {getTypeIcon(tx.type)}
                  </div>
                  
                  <div className="transaction-info">
                    <div className="transaction-main">
                      <span className="transaction-description">{tx.description}</span>
                      <span className={`transaction-amount ${
                        tx.type === 'payment' ? 'text-success' : 'text-error'
                      }`}>
                        {tx.type === 'payment' ? '+' : '-'} ₹{tx.amount}
                      </span>
                    </div>
                    
                    <div className="transaction-details">
                      <span className="transaction-date">{formatDate(tx.createdAt)}</span>
                      <span className="transaction-id">ID: {tx.transactionId}</span>
                      <span className={`transaction-status ${getStatusClass(tx.status)}`}>
                        {tx.status}
                      </span>
                    </div>
                    
                    {tx.productDetails && (
                      <div className="product-details">
                        <span className="product-name">{tx.productDetails.productName}</span>
                        <span className="product-qty">Qty: {tx.productDetails.quantity}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="page-btn"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    ← Previous
                  </button>
                  <span className="page-info">Page {page} of {totalPages}</span>
                  <button 
                    className="page-btn"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TransactionHistory;