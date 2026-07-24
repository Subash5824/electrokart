import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import creditCardService from '../services/creditCardService';
import authService from '../services/authService';
import pdfService from '../services/pdfService';
import './Statements.css';

const Statements = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = [2025, 2026, 2027];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const currentUser = authService.getCurrentUser();
    
    if (!token || !currentUser) {
      navigate('/login');
      return;
    }
    
    setUser(currentUser);
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactionsByMonth();
  }, [selectedMonth, selectedYear, transactions]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await creditCardService.getTransactions(1, 100);
      if (response.success) {
        setTransactions(response.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactionsByMonth = () => {
    const filtered = transactions.filter(t => {
      const date = new Date(t.createdAt);
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });
    setFilteredTransactions(filtered);
  };

  const handleViewPDF = () => {
    pdfService.viewStatement(
      user,
      filteredTransactions,
      months[selectedMonth],
      selectedYear
    );
  };

  const handleDownloadPDF = () => {
    pdfService.downloadStatement(
      user,
      filteredTransactions,
      months[selectedMonth],
      selectedYear
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate totals
  const totalPurchases = filteredTransactions
    .filter(t => t.type === 'purchase')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPayments = filteredTransactions
    .filter(t => t.type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="statements-page">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading statements...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="statements-page">
      <Header />
      
      <main className="container">
        <div className="statements-header">
          <h1>Monthly Statements</h1>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
        </div>

        {/* Filters */}
        <div className="filters-card">
          <h2>Select Statement Period</h2>
          <div className="filter-controls">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="filter-select"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>

            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="filter-select"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <div className="action-buttons">
              <button 
                className="btn-view"
                onClick={handleViewPDF}
                disabled={filteredTransactions.length === 0}
              >
                👁️ View Statement
              </button>
              <button 
                className="btn-download"
                onClick={handleDownloadPDF}
                disabled={filteredTransactions.length === 0}
              >
                ⬇️ Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Statement Summary */}
        {filteredTransactions.length > 0 && (
          <div className="summary-card">
            <h2>{months[selectedMonth]} {selectedYear} Summary</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">Opening Balance</span>
                <span className="value">₹0.00</span>
              </div>
              <div className="summary-item">
                <span className="label">Total Purchases</span>
                <span className="value highlight">{formatCurrency(totalPurchases)}</span>
              </div>
              <div className="summary-item">
                <span className="label">Total Payments</span>
                <span className="value success">-{formatCurrency(totalPayments)}</span>
              </div>
              <div className="summary-item">
                <span className="label">Closing Balance</span>
                <span className="value total">{formatCurrency(totalPurchases - totalPayments)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="transactions-card">
          <h2>Transaction History</h2>
          
          {filteredTransactions.length === 0 ? (
            <div className="no-transactions">
              <p>No transactions found for {months[selectedMonth]} {selectedYear}</p>
            </div>
          ) : (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Transaction ID</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Amount (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(tx => (
                  <tr key={tx._id}>
                    <td>{formatDate(tx.createdAt)}</td>
                    <td className="tx-id">{tx.transactionId || '-'}</td>
                    <td>{tx.description}</td>
                    <td>
                      <span className={`type-badge ${tx.type}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={tx.type === 'payment' ? 'payment-amount' : 'purchase-amount'}>
                      {tx.type === 'payment' ? '-' : ''}{formatCurrency(tx.amount)}
                    </td>
                    <td>
                      <span className={`status-badge ${tx.paymentStatus || 'completed'}`}>
                        {tx.paymentStatus || 'completed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Statements;