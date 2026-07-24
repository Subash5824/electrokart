import React from 'react';
import './CreditCardInfo.css';

const CreditCardInfo = ({ card, userName }) => {
  if (!card) return null;

  const formatCardNumber = (number) => {
    if (!number) return '**** **** **** ****';
    return number.replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatDate = (date) => {
    if (!date) return '**/**';
    const d = new Date(date);
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear().toString().slice(-2)}`;
  };

  return (
    <div className={`credit-card ${card.status}`}>
      <div className="card-chip">💳</div>
      <div className="card-number">{formatCardNumber(card.cardNumber)}</div>
      <div className="card-details">
        <div className="card-holder">
          <span className="label">Card Holder</span>
          <span className="value">{userName || card.user?.businessName || 'Business Name'}</span>
        </div>
        <div className="card-expiry">
          <span className="label">Expires</span>
          <span className="value">{formatDate(card.expiryDate)}</span>
        </div>
      </div>
      <div className="card-type">{card.cardType?.toUpperCase()}</div>
      {card.status === 'blocked' && <div className="card-blocked">BLOCKED</div>}
    </div>
  );
};

export default CreditCardInfo;