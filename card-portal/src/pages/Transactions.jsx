import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import cardService from '../services/cardService';
import TransactionList from '../components/TransactionList';
import './Transactions.css';

const Transactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!cardService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // This would be a banker endpoint to get all transactions
      const response = await cardService.getPendingTransactions();
      setTransactions(response.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.status === filter);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="transactions-page">
      <header className="page-header">
        <h1>All Transactions</h1>
        <Link to="/dashboard" className="back-btn">← Back to Dashboard</Link>
      </header>

      <div className="filter-section">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Approved
        </button>
        <button 
          className={`filter-btn ${filter === 'declined' ? 'active' : ''}`}
          onClick={() => setFilter('declined')}
        >
          Declined
        </button>
      </div>

      <TransactionList transactions={filteredTransactions} />
    </div>
  );
};

export default Transactions;