import React from 'react';
import './BillSummary.css';

const BillSummary = ({ bill, onPayNow }) => {
  if (!bill) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'paid': return 'status-paid';
      case 'partial': return 'status-partial';
      case 'overdue': return 'status-overdue';
      default: return 'status-unpaid';
    }
  };

  return (
    <div className="bill-summary">
      <h3 className="bill-title">Current Bill Summary</h3>
      
      <div className="bill-amounts">
        <div className="bill-row">
          <span>Previous Balance</span>
          <span>{formatCurrency(bill.previousBalance)}</span>
        </div>
        
        <div className="bill-row">
          <span>New Purchases</span>
          <span className="text-highlight">{formatCurrency(bill.totalPurchases)}</span>
        </div>
        
        <div className="bill-row">
          <span>Payments</span>
          <span className="text-success">-{formatCurrency(bill.totalPayments)}</span>
        </div>
        
        {bill.interestCharged > 0 && (
          <div className="bill-row">
            <span>Interest Charged</span>
            <span className="text-error">{formatCurrency(bill.interestCharged)}</span>
          </div>
        )}
        
        <div className="bill-row total">
          <span>Total Balance</span>
          <span className="text-highlight">{formatCurrency(bill.statementBalance)}</span>
        </div>
      </div>

      <div className="bill-due">
        <div className="due-row">
          <span>Minimum Payment</span>
          <span className="text-glow">{formatCurrency(bill.minimumPayment)}</span>
        </div>
        <div className="due-row">
          <span>Due Date</span>
          <span className={getStatusClass(bill.paymentStatus)}>
            {new Date(bill.dueDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
        </div>
      </div>

      <div className={`payment-status ${getStatusClass(bill.paymentStatus)}`}>
        Status: {bill.paymentStatus.toUpperCase()}
      </div>

      {bill.paymentStatus !== 'paid' && (
        <button className="pay-now-btn" onClick={onPayNow}>
          Pay Now
        </button>
      )}
    </div>
  );
};

export default BillSummary;