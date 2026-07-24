import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import creditCardService from '../services/creditCardService';
import authService from '../services/authService';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [creditCard, setCreditCard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalDue, setTotalDue] = useState(0);
  const [minimumPayment, setMinimumPayment] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch credit card details
      const cardResponse = await creditCardService.getCardDetails();
      if (cardResponse.success && cardResponse.card) {
        setCreditCard(cardResponse.card);
        
        // Calculate available balance (Credit Limit - Outstanding)
        const available = cardResponse.card.creditLimit - cardResponse.card.currentOutstanding;
        setAvailableBalance(available);
      }

      // Fetch transactions
      const txResponse = await creditCardService.getTransactions();
      if (txResponse.success) {
        setTransactions(txResponse.transactions);
        
        // Calculate total due
        const due = txResponse.transactions
          .filter(tx => tx.paymentStatus === 'pending')
          .reduce((sum, tx) => sum + tx.amount, 0);
        setTotalDue(due);
        
        // Minimum payment (5% or ₹500)
        setMinimumPayment(Math.max(500, due * 0.05));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount).replace('₹', '₹');
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Header />
      
      <main className="container">
        <div className="dashboard-header">
          <div>
            <h1 className="welcome-title">Welcome, {user?.businessName}</h1>
            <p className="user-email">{user?.email}</p>
          </div>
          <button className="logout-btn" onClick={() => {
            authService.logout();
            navigate('/');
          }}>Logout</button>
        </div>

        {/* Credit Card Summary - SIMPLE with Limit and Available */}
        <div className="credit-card-summary">
          <h2>Your Credit Card</h2>
          
          <div className="card-balances-simple">
            <div className="balance-item">
              <span className="balance-label">Credit Limit</span>
              <span className="balance-value">{formatCurrency(creditCard?.creditLimit || 100000)}</span>
            </div>
            <div className="balance-item">
              <span className="balance-label">Available Balance</span>
              <span className="balance-value success">{formatCurrency(availableBalance)}</span>
            </div>
            <div className="balance-item">
              <span className="balance-label">Outstanding</span>
              <span className="balance-value highlight">{formatCurrency(creditCard?.currentOutstanding || 0)}</span>
            </div>
          </div>
        </div>

        {/* Payment Summary - SIMPLE without explanations */}
        <div className="payment-summary">
          <h2>Current Bill</h2>
          <div className="bill-details">
            <div className="bill-row">
              <span>Total Due:</span>
              <span className="amount">{formatCurrency(totalDue)}</span>
            </div>
            <div className="bill-row">
              <span>Minimum Payment:</span>
              <span className="amount warning">{formatCurrency(minimumPayment)}</span>
            </div>
            <div className="bill-row">
              <span>Due Date:</span>
              <span className="date">{formatDate(creditCard?.nextDueDate)}</span>
            </div>
          </div>
          
          {totalDue > 0 && (
            <button className="pay-now-btn" onClick={() => navigate('/payment')}>
              Pay Now
            </button>
          )}
        </div>
             
             {/* Recent Transactions */}
          <div className="recent-transactions">
            <div className="section-header">
              <h2>Recent Transactions</h2>
              <div>
                <button className="statements-btn" onClick={() => navigate('/statements')}>
                  📄 Statements
                </button>
                <button className="view-all-btn" onClick={() => navigate('/transactions')}>
                  View All
                </button>
              </div>
            </div>
            
            <div className="transactions-list">
              {transactions.slice(0, 5).map(tx => (
                <div key={tx._id} className="transaction-item">
                  <div className="transaction-icon">
                    {tx.type === 'purchase' ? '🛍️' : '💰'}
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-description">{tx.description}</div>
                    <div className="transaction-date">{formatDate(tx.createdAt)}</div>
                  </div>
                  <div className="transaction-amount">
                    <span className={tx.type === 'purchase' ? 'debit' : 'credit'}>
                      {tx.type === 'purchase' ? '-' : '+'} {formatCurrency(tx.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
      
      </main>

      <Footer />
    </div>
  );
};

export default CustomerDashboard;