import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import cardService from '../services/cardService';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [banker, setBanker] = useState(null);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCards: 0,
    pendingTransactions: 0,
    pendingApprovals: 0
  });
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cardService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    const currentBanker = cardService.getCurrentUser();
    setBanker(currentBanker);
    fetchBankerData();
  }, []);

  const fetchBankerData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsResponse = await cardService.getStats();
      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }

      // Fetch pending transactions
      const pendingResponse = await cardService.getPendingTransactions();
      if (pendingResponse.success) {
        setPendingTransactions(pendingResponse.transactions || []);
      }

      // Fetch customers
      const customersResponse = await cardService.getCustomers();
      if (customersResponse.success) {
        setCustomers(customersResponse.customers || []);
      }

    } catch (error) {
      console.error('Error fetching banker data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (transactionId) => {
    if (window.confirm('Approve this transaction?')) {
      try {
        await cardService.approveTransaction(transactionId, 'Approved by banker');
        alert('Transaction approved');
        fetchBankerData(); // Refresh data
      } catch (error) {
        alert('Error approving transaction');
      }
    }
  };

  const handleDecline = async (transactionId) => {
    const reason = prompt('Enter reason for declining:');
    if (reason) {
      try {
        await cardService.declineTransaction(transactionId, reason);
        alert('Transaction declined');
        fetchBankerData();
      } catch (error) {
        alert('Error declining transaction');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading banker dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Banker Dashboard</h1>
          <p>Welcome back, {banker?.name || 'Banker'}</p>
        </div>
        <div className="header-actions">
          <Link to="/settings" className="settings-btn">Settings</Link>
          <button 
            onClick={() => {
              cardService.logout();
              navigate('/login');
            }}
            className="logout-btn"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Total Customers</p>
          <p className="stat-value">{stats.totalCustomers}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Active Cards</p>
          <p className="stat-value green">{stats.activeCards}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Pending Transactions</p>
          <p className="stat-value warning">{pendingTransactions.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Pending Approvals</p>
          <p className="stat-value accent">{stats.pendingApprovals}</p>
        </div>
      </div>

      {/* Pending Transactions Section */}
      <div className="transactions-section">
        <h2>Pending Transactions</h2>
        
        {pendingTransactions.length === 0 ? (
          <p className="no-data">No pending transactions</p>
        ) : (
          <div className="transactions-list">
            {pendingTransactions.map(tx => (
              <div key={tx._id} className="transaction-item">
                <div className="transaction-info">
                  <div>
                    <p className="customer-name">{tx.user?.businessName}</p>
                    <p className="transaction-desc">{tx.description}</p>
                  </div>
                  <p className="transaction-amount">{formatCurrency(tx.amount)}</p>
                </div>
                <div className="transaction-footer">
                  <p className="transaction-date">{formatDate(tx.createdAt)}</p>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleApprove(tx._id)}
                      className="approve-btn"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleDecline(tx._id)}
                      className="decline-btn"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customers List - UPDATED with correct amount display */}
      <div className="customers-section">
        <h2>Customers</h2>
        
        <div className="table-container">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Outstanding</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => {
                // Get outstanding amount from credit card
                const outstandingAmount = customer.creditCard?.currentOutstanding || 0;
                
                return (
                  <tr key={customer._id}>
                    <td>{customer.businessName}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone}</td>
                    {/* FIXED: This now shows the real outstanding amount */}
                    <td className="amount">
                      {formatCurrency(outstandingAmount)}
                    </td>
                    <td>
                      <span className={`status-badge ${customer.accountStatus}`}>
                        {customer.accountStatus}
                      </span>
                    </td>
                    <td>
                      <Link to={`/customer/${customer._id}`} className="view-btn">
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;