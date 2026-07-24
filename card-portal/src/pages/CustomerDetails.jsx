import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import cardService from '../services/cardService';
import './CustomerDetails.css';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cardService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const response = await cardService.getCustomerDetails(id);
      if (response.success) {
        setCustomer(response.customer);
        setTransactions(response.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockCard = async () => {
    if (window.confirm('Are you sure you want to block this customer\'s card?')) {
      try {
        await cardService.blockCustomerCard(id, 'Blocked by banker');
        alert('Card blocked successfully');
        fetchCustomerDetails();
      } catch (error) {
        alert('Error blocking card');
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
    return <div className="loading">Loading customer details...</div>;
  }

  if (!customer) {
    return <div className="error">Customer not found</div>;
  }

  return (
    <div className="customer-details-page">
      <header className="page-header">
        <div>
          <h1>Customer Details</h1>
          <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
        </div>
        <button 
          className="block-card-btn"
          onClick={handleBlockCard}
          disabled={customer.accountStatus === 'blocked'}
        >
          {customer.accountStatus === 'blocked' ? 'Card Blocked' : 'Block Card'}
        </button>
      </header>

      {/* Customer Information */}
      <div className="customer-info-section">
        <h2>Business Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Business Name</label>
            <span>{customer.businessName}</span>
          </div>
          <div className="info-item">
            <label>Email</label>
            <span>{customer.email}</span>
          </div>
          <div className="info-item">
            <label>Phone</label>
            <span>{customer.phone}</span>
          </div>
          <div className="info-item">
            <label>GST Number</label>
            <span>{customer.gstNumber}</span>
          </div>
          <div className="info-item">
            <label>Account Status</label>
            <span className={`status-badge ${customer.accountStatus}`}>
              {customer.accountStatus}
            </span>
          </div>
          <div className="info-item">
            <label>Member Since</label>
            <span>{formatDate(customer.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Credit Card Information */}
      <div className="credit-card-section">
        <h2>Credit Card Details</h2>
        {customer.creditCard ? (
          <div className="card-details">
            <div className="card-info-grid">
              <div className="card-item">
                <label>Card Number</label>
                <span className="card-number">
                  {customer.creditCard.cardNumber.replace(/(\d{4})/g, '$1 ')}
                </span>
              </div>
              <div className="card-item">
                <label>Card Type</label>
                <span className="card-type">{customer.creditCard.cardType}</span>
              </div>
              <div className="card-item">
                <label>Status</label>
                <span className={`card-status ${customer.creditCard.status}`}>
                  {customer.creditCard.status}
                </span>
              </div>
              <div className="card-item">
                <label>Expiry Date</label>
                <span>{formatDate(customer.creditCard.expiryDate)}</span>
              </div>
            </div>

            <div className="balance-section">
              <div className="balance-card">
                <label>Credit Limit</label>
                <span className="limit">{formatCurrency(customer.creditCard.creditLimit)}</span>
              </div>
              <div className="balance-card">
                <label>Current Outstanding</label>
                <span className="outstanding">{formatCurrency(customer.creditCard.currentOutstanding)}</span>
              </div>
              <div className="balance-card">
                <label>Available Balance</label>
                <span className="available">{formatCurrency(customer.creditCard.availableBalance)}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="no-card">No credit card assigned to this customer</p>
        )}
      </div>

      {/* Transaction History */}
      <div className="transactions-section">
        <h2>Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="no-transactions">No transactions found</p>
        ) : (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx._id}>
                  <td>{formatDate(tx.createdAt)}</td>
                  <td>{tx.description}</td>
                  <td className={tx.type === 'purchase' ? 'debit' : 'credit'}>
                    {tx.type === 'purchase' ? '-' : '+'} {formatCurrency(tx.amount)}
                  </td>
                  <td>
                    <span className={`tx-status ${tx.status}`}>{tx.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CustomerDetails;