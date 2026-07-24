import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../utils/formatters';
import './TransactionList.css';

const TransactionList = ({ transactions, limit = 5, showViewAll = true }) => {
  const displayTransactions = transactions.slice(0, limit);

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'text-green-500';
      case 'pending': return 'text-bank-warning';
      case 'declined': return 'text-red-500';
      default: return 'text-bank-muted';
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

  if (!transactions || transactions.length === 0) {
    return (
      <div className="transaction-list-empty">
        <p>No transactions found</p>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      <div className="transaction-list-header">
        <h3>Recent Transactions</h3>
        {showViewAll && (
          <Link to="/transactions" className="view-all-link">
            View All →
          </Link>
        )}
      </div>

      <div className="transaction-items">
        {displayTransactions.map((tx) => (
          <div key={tx._id} className="transaction-item">
            <div className="transaction-icon">{getTypeIcon(tx.type)}</div>
            
            <div className="transaction-details">
              <div className="transaction-main">
                <span className="transaction-desc">{tx.description}</span>
                <span className={`transaction-amount ${
                  tx.type === 'payment' ? 'text-green-500' : 'text-bank-warning'
                }`}>
                  {tx.type === 'payment' ? '-' : '+'} {formatCurrency(tx.amount)}
                </span>
              </div>
              
              <div className="transaction-meta">
                <span className="transaction-date">{formatDate(tx.createdAt)}</span>
                <span className={`transaction-status ${getStatusColor(tx.status)}`}>
                  {tx.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;