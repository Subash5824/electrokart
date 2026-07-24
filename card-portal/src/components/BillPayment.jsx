import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';
import './BillPayment.css';

const BillPayment = ({ bill, card, onPaymentSuccess }) => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState(bill?.minimumPayment || '');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      if (onPaymentSuccess) {
        onPaymentSuccess({
          amount: parseFloat(amount),
          method: paymentMethod,
          date: new Date()
        });
      }
      alert(`Payment of ${formatCurrency(parseFloat(amount))} processed successfully!`);
      navigate('/dashboard');
    }, 2000);
  };

  if (!bill) {
    return (
      <div className="bill-payment-empty">
        <p>No active bill to pay</p>
      </div>
    );
  }

  return (
    <div className="bill-payment">
      <h3 className="payment-title">Make a Payment</h3>

      <form onSubmit={handleSubmit}>
        {/* Amount Input */}
        <div className="form-group">
          <label className="form-label">Payment Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="form-input"
            min="100"
            max={bill.statementBalance}
            step="100"
            required
          />
        </div>

        {/* Quick Amount Selector */}
        <div className="quick-amounts">
          <button
            type="button"
            className="amount-btn"
            onClick={() => handleAmountSelect(bill.minimumPayment)}
          >
            Min: {formatCurrency(bill.minimumPayment)}
          </button>
          <button
            type="button"
            className="amount-btn"
            onClick={() => handleAmountSelect(bill.statementBalance)}
          >
            Full: {formatCurrency(bill.statementBalance)}
          </button>
        </div>

        {/* Payment Method */}
        <div className="form-group">
          <label className="form-label">Payment Method</label>
          <div className="payment-methods">
            <label className={`method-option ${paymentMethod === 'upi' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="upi"
                checked={paymentMethod === 'upi'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="method-icon">📱</span>
              <span className="method-name">UPI</span>
            </label>

            <label className={`method-option ${paymentMethod === 'netbanking' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="netbanking"
                checked={paymentMethod === 'netbanking'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="method-icon">🏦</span>
              <span className="method-name">Net Banking</span>
            </label>

            <label className={`method-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="method-icon">💳</span>
              <span className="method-name">Debit Card</span>
            </label>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="payment-summary">
          <div className="summary-row">
            <span>Payment Amount:</span>
            <span className="summary-value">{formatCurrency(parseFloat(amount || 0))}</span>
          </div>
          {card && (
            <div className="summary-row">
              <span>New Balance:</span>
              <span className="summary-value">
                {formatCurrency(card.currentOutstanding - parseFloat(amount || 0))}
              </span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="pay-btn"
          disabled={loading || !amount}
        >
          {loading ? 'Processing...' : `Pay ${formatCurrency(parseFloat(amount || 0))}`}
        </button>
      </form>
    </div>
  );
};

export default BillPayment;