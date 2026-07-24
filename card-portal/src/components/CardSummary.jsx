import React from 'react';
import { formatCurrency } from '../utils/formatters';
import './CardSummary.css';

const CardSummary = ({ card }) => {
  if (!card) return null;

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'status-active';
      case 'blocked': return 'status-blocked';
      default: return 'status-pending';
    }
  };

  return (
    <div className="card-summary">
      <div className="summary-header">
        <h3>Credit Card Summary</h3>
        <span className={`status-badge ${getStatusColor(card.status)}`}>
          {card.status}
        </span>
      </div>

      <div className="summary-grid">
        <div className="summary-item">
          <span className="summary-label">Current Balance</span>
          <span className="summary-value accent">{formatCurrency(card.currentOutstanding || 0)}</span>
        </div>

        <div className="summary-item">
          <span className="summary-label">Available Credit</span>
          <span className="summary-value success">{formatCurrency(card.availableBalance || 0)}</span>
        </div>

        <div className="summary-item">
          <span className="summary-label">Credit Limit</span>
          <span className="summary-value">{formatCurrency(card.creditLimit || 0)}</span>
        </div>

        <div className="summary-item">
          <span className="summary-label">Card Number</span>
          <span className="summary-value card-number">
            {card.cardNumber?.replace(/(\d{4})/g, '$1 ')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CardSummary;