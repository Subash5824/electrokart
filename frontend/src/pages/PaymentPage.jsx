import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import creditCardService from '../services/creditCardService';
import paymentService from '../services/paymentService';
import authService from '../services/authService';
import './PaymentPage.css';

const PaymentPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [creditCard, setCreditCard] = useState(null);
  const [currentBill, setCurrentBill] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('payment');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const currentUser = authService.getCurrentUser();
    
    if (!token || !currentUser) {
      navigate('/login');
      return;
    }
    
    setUser(currentUser);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get card details
      const cardResponse = await creditCardService.getCardDetails();
      if (cardResponse.success && cardResponse.card) {
        setCreditCard(cardResponse.card);
      }
      
      // Get current bill
      try {
        const billResponse = await creditCardService.getCurrentBill();
        if (billResponse.success && billResponse.bill) {
          setCurrentBill(billResponse.bill);
          setAmount(billResponse.bill.minimumPayment?.toString() || '');
        }
      } catch (e) {
        console.log('No bill available');
      }

      // Get payment history
      try {
        const historyResponse = await paymentService.getPaymentHistory();
        if (historyResponse.success) {
          setPaymentHistory(historyResponse.payments || []);
        }
      } catch (e) {
        console.log('No payment history');
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount.toString());
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const paymentAmount = parseFloat(amount);
    
    if (!amount || isNaN(paymentAmount) || paymentAmount <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }
    
    if (creditCard && paymentAmount > creditCard.currentOutstanding) {
      setError(`Amount exceeds outstanding balance of ${formatCurrency(creditCard.currentOutstanding)}`);
      return;
    }

    if (paymentAmount < 100) {
      setError('Minimum payment amount is ₹100');
      return;
    }
    
    setProcessing(true);
    setError('');
    
    try {
      const response = await paymentService.makePayment(paymentAmount, paymentMethod);
      
      if (response.success) {
        setSuccessData(response.payment);
        setSuccess(true);
        
        // Update local credit card data
        if (creditCard) {
          setCreditCard({
            ...creditCard,
            currentOutstanding: response.payment.newOutstanding,
            availableBalance: response.payment.newAvailable
          });
        }
      } else {
        setError(response.message || 'Payment failed. Please try again.');
      }
      
    } catch (error) {
      setError(error.message || error || 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMaskedCardNumber = (cardNumber) => {
    if (!cardNumber) return '•••• •••• •••• ••••';
    const cleaned = cardNumber.replace(/\s/g, '');
    return `•••• •••• •••• ${cleaned.slice(-4)}`;
  };

  const getPaymentStatusColor = (amount, outstanding) => {
    if (!outstanding || outstanding === 0) return 'var(--success)';
    const ratio = amount / outstanding;
    if (ratio >= 1) return 'var(--success)';
    if (ratio >= 0.5) return 'var(--highlight)';
    return 'var(--error)';
  };

  if (loading) {
    return (
      <div className="payment-page">
        <Header />
        <div className="pp-loading-container">
          <div className="pp-loading-spinner"></div>
          <p>Loading payment details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (success && successData) {
    return (
      <div className="payment-page">
        <Header />
        <div className="pp-success-overlay">
          <div className="pp-success-card">
            <div className="pp-success-icon-ring">
              <div className="pp-success-checkmark">✓</div>
            </div>
            <h2>Payment Successful!</h2>
            <p className="pp-success-subtitle">Your payment has been processed</p>

            <div className="pp-success-details">
              <div className="pp-success-row">
                <span>Amount Paid</span>
                <span className="pp-success-amount">{formatCurrency(successData.amount)}</span>
              </div>
              <div className="pp-success-row">
                <span>Payment Method</span>
                <span>{successData.paymentMethod?.toUpperCase()}</span>
              </div>
              <div className="pp-success-row">
                <span>Payment Type</span>
                <span className={successData.paymentType === 'full' ? 'pp-badge-success' : 'pp-badge-partial'}>
                  {successData.paymentType === 'full' ? '✓ Full Payment' : 'Partial Payment'}
                </span>
              </div>
              <div className="pp-success-row">
                <span>Previous Outstanding</span>
                <span className="pp-amount-red">{formatCurrency(successData.previousOutstanding)}</span>
              </div>
              <div className="pp-success-row">
                <span>New Outstanding</span>
                <span className={successData.newOutstanding === 0 ? 'pp-amount-green' : 'pp-amount-yellow'}>
                  {formatCurrency(successData.newOutstanding)}
                </span>
              </div>
              <div className="pp-success-row">
                <span>Available Credit</span>
                <span className="pp-amount-green">{formatCurrency(successData.newAvailable)}</span>
              </div>
            </div>

            <div className="pp-success-actions">
              <button className="pp-btn-primary" onClick={() => {
                setSuccess(false);
                fetchData();
                setAmount('');
              }}>
                Make Another Payment
              </button>
              <button className="pp-btn-secondary" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const outstandingPercent = creditCard 
    ? Math.min(100, (creditCard.currentOutstanding / (creditCard.creditLimit || 1)) * 100) 
    : 0;

  return (
    <div className="payment-page">
      <Header />
      
      <main className="pp-container">
        {/* Page Header */}
        <div className="pp-page-header">
          <div>
            <h1 className="pp-page-title">💳 Credit Card Payment</h1>
            <p className="pp-page-subtitle">Manage your credit card payments securely</p>
          </div>
          <button className="pp-btn-back" onClick={() => navigate('/dashboard')}>
            ← Dashboard
          </button>
        </div>

        {/* Customer Info Bar */}
        {user && (
          <div className="pp-customer-bar">
            <div className="pp-customer-info">
              <div className="pp-customer-avatar">
                {user.businessName?.charAt(0) || user.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="pp-customer-name">{user.businessName || user.name}</p>
                <p className="pp-customer-id">Customer ID: {user.customerId || user._id?.slice(-8).toUpperCase() || 'N/A'}</p>
              </div>
            </div>
            {creditCard && (
              <div className="pp-card-chip">
                <span className="pp-card-chip-number">{getMaskedCardNumber(creditCard.cardNumber)}</span>
                <span className={`pp-card-status-badge pp-status-${creditCard.status}`}>
                  {creditCard.status?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Credit Summary Cards */}
        {creditCard && (
          <div className="pp-summary-grid">
            <div className="pp-summary-card pp-card-outstanding">
              <div className="pp-summary-icon">💰</div>
              <div className="pp-summary-content">
                <p className="pp-summary-label">Outstanding Amount</p>
                <p className="pp-summary-value pp-red">{formatCurrency(creditCard.currentOutstanding)}</p>
                <div className="pp-progress-bar">
                  <div 
                    className="pp-progress-fill pp-fill-red" 
                    style={{ width: `${outstandingPercent}%` }}
                  ></div>
                </div>
                <p className="pp-progress-text">{outstandingPercent.toFixed(1)}% of credit used</p>
              </div>
            </div>
            
            <div className="pp-summary-card pp-card-minimum">
              <div className="pp-summary-icon">⚠️</div>
              <div className="pp-summary-content">
                <p className="pp-summary-label">Minimum Due Amount</p>
                <p className="pp-summary-value pp-yellow">
                  {currentBill ? formatCurrency(currentBill.minimumPayment) : '₹0.00'}
                </p>
                {currentBill?.dueDate && (
                  <p className="pp-due-date">
                    Due: {new Date(currentBill.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
            
            <div className="pp-summary-card pp-card-available">
              <div className="pp-summary-icon">✅</div>
              <div className="pp-summary-content">
                <p className="pp-summary-label">Available Credit Limit</p>
                <p className="pp-summary-value pp-green">{formatCurrency(creditCard.availableBalance)}</p>
                <p className="pp-summary-meta">Total Limit: {formatCurrency(creditCard.creditLimit)}</p>
              </div>
            </div>

            {currentBill && (
              <div className="pp-summary-card pp-card-status">
                <div className="pp-summary-icon">📊</div>
                <div className="pp-summary-content">
                  <p className="pp-summary-label">Payment Status</p>
                  <p className={`pp-payment-status-badge pp-status-${currentBill.paymentStatus}`}>
                    {currentBill.paymentStatus === 'paid' ? '✓ Paid' 
                      : currentBill.paymentStatus === 'partial' ? '⟳ Partial' 
                      : '● Unpaid'}
                  </p>
                  {currentBill.statementBalance > 0 && (
                    <p className="pp-summary-meta">Statement: {formatCurrency(currentBill.statementBalance)}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="pp-tabs">
          <button 
            className={`pp-tab ${activeTab === 'payment' ? 'pp-tab-active' : ''}`}
            onClick={() => setActiveTab('payment')}
          >
            💳 Make Payment
          </button>
          <button 
            className={`pp-tab ${activeTab === 'history' ? 'pp-tab-active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📋 Transaction History
            {paymentHistory.length > 0 && <span className="pp-tab-badge">{paymentHistory.length}</span>}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'payment' && (
          <div className="pp-payment-section">
            <div className="pp-payment-grid">
              {/* Payment Form */}
              <div className="pp-form-card">
                <h2 className="pp-section-title">Payment Details</h2>

                {error && (
                  <div className="pp-error-msg">
                    <span className="pp-error-icon">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Amount Input */}
                  <div className="pp-field-group">
                    <label className="pp-label">Payment Amount (₹)</label>
                    <div className="pp-input-wrapper">
                      <span className="pp-input-prefix">₹</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value);
                          setError('');
                        }}
                        placeholder="Enter amount"
                        min="100"
                        step="1"
                        max={creditCard?.currentOutstanding}
                        required
                        className="pp-amount-input"
                      />
                    </div>
                    {amount && creditCard && (
                      <div className="pp-amount-feedback">
                        <div 
                          className="pp-amount-meter"
                          style={{ 
                            '--meter-color': getPaymentStatusColor(parseFloat(amount), creditCard.currentOutstanding)
                          }}
                        >
                          <div 
                            className="pp-amount-meter-fill" 
                            style={{ 
                              width: `${Math.min(100, (parseFloat(amount) / creditCard.currentOutstanding) * 100)}%`,
                              background: getPaymentStatusColor(parseFloat(amount), creditCard.currentOutstanding)
                            }}
                          ></div>
                        </div>
                        <span>
                          Paying {creditCard.currentOutstanding > 0 
                            ? `${((parseFloat(amount || 0) / creditCard.currentOutstanding) * 100).toFixed(0)}%` 
                            : '0%'} of outstanding
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="pp-quick-amounts">
                    <p className="pp-quick-label">Quick Select:</p>
                    <div className="pp-quick-btns">
                      {currentBill && (
                        <>
                          <button
                            type="button"
                            className={`pp-quick-btn ${amount === currentBill.minimumPayment?.toString() ? 'pp-quick-active' : ''}`}
                            onClick={() => handleAmountSelect(currentBill.minimumPayment)}
                          >
                            <span className="pp-quick-tag">Min Due</span>
                            <span className="pp-quick-val">{formatCurrency(currentBill.minimumPayment)}</span>
                          </button>
                          <button
                            type="button"
                            className={`pp-quick-btn ${amount === currentBill.statementBalance?.toString() ? 'pp-quick-active' : ''}`}
                            onClick={() => handleAmountSelect(currentBill.statementBalance)}
                          >
                            <span className="pp-quick-tag">Statement</span>
                            <span className="pp-quick-val">{formatCurrency(currentBill.statementBalance)}</span>
                          </button>
                        </>
                      )}
                      {creditCard && creditCard.currentOutstanding > 0 && (
                        <button
                          type="button"
                          className={`pp-quick-btn pp-quick-btn-highlight ${amount === creditCard.currentOutstanding?.toString() ? 'pp-quick-active' : ''}`}
                          onClick={() => handleAmountSelect(creditCard.currentOutstanding)}
                        >
                          <span className="pp-quick-tag">Full Outstanding</span>
                          <span className="pp-quick-val">{formatCurrency(creditCard.currentOutstanding)}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="pp-field-group">
                    <label className="pp-label">Payment Method</label>
                    <div className="pp-methods">
                      {[
                        { id: 'upi', icon: '📱', label: 'UPI', desc: 'Google Pay, PhonePe, etc.' },
                        { id: 'netbanking', icon: '🏦', label: 'Net Banking', desc: 'Direct bank transfer' },
                        { id: 'card', icon: '💳', label: 'Debit Card', desc: 'Visa, Mastercard, RuPay' }
                      ].map(method => (
                        <label 
                          key={method.id} 
                          className={`pp-method-card ${paymentMethod === method.id ? 'pp-method-active' : ''}`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <span className="pp-method-icon">{method.icon}</span>
                          <div className="pp-method-info">
                            <p className="pp-method-name">{method.label}</p>
                            <p className="pp-method-desc">{method.desc}</p>
                          </div>
                          {paymentMethod === method.id && <span className="pp-method-check">✓</span>}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="pp-pay-btn"
                    disabled={processing || !amount || parseFloat(amount) <= 0}
                  >
                    {processing ? (
                      <span className="pp-btn-loading">
                        <span className="pp-spinner"></span>
                        Processing Payment...
                      </span>
                    ) : (
                      <span>Pay {amount ? formatCurrency(parseFloat(amount)) : 'Now'} →</span>
                    )}
                  </button>
                </form>

                <div className="pp-secure-badge">
                  <span>🔒</span>
                  <p>256-bit SSL encrypted secure payment by ElectroKart Banking</p>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="pp-summary-panel">
                <h2 className="pp-section-title">Payment Summary</h2>
                
                {/* Current Bill Details */}
                {currentBill ? (
                  <div className="pp-bill-detail">
                    <div className="pp-bill-month">
                      {new Date(currentBill.cycleYear, currentBill.cycleMonth).toLocaleString('en-IN', { month: 'long', year: 'numeric' })} Statement
                    </div>
                    <div className="pp-bill-rows">
                      <div className="pp-bill-row">
                        <span>Previous Balance</span>
                        <span>{formatCurrency(currentBill.previousBalance)}</span>
                      </div>
                      <div className="pp-bill-row">
                        <span>Total Purchases</span>
                        <span className="pp-amount-red">+{formatCurrency(currentBill.totalPurchases)}</span>
                      </div>
                      <div className="pp-bill-row">
                        <span>Total Payments</span>
                        <span className="pp-amount-green">-{formatCurrency(currentBill.totalPayments)}</span>
                      </div>
                      {currentBill.interestCharged > 0 && (
                        <div className="pp-bill-row">
                          <span>Interest Charged</span>
                          <span className="pp-amount-red">+{formatCurrency(currentBill.interestCharged)}</span>
                        </div>
                      )}
                      <div className="pp-bill-row pp-bill-total">
                        <span>Statement Balance</span>
                        <span className="pp-amount-red">{formatCurrency(currentBill.statementBalance)}</span>
                      </div>
                      <div className="pp-bill-row">
                        <span>Minimum Due</span>
                        <span className="pp-amount-yellow">{formatCurrency(currentBill.minimumPayment)}</span>
                      </div>
                      <div className="pp-bill-row">
                        <span>Due Date</span>
                        <span className={new Date(currentBill.dueDate) < new Date() ? 'pp-amount-red' : ''}>
                          {currentBill.dueDate ? new Date(currentBill.dueDate).toLocaleDateString('en-IN', { 
                            day: 'numeric', month: 'short', year: 'numeric' 
                          }) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pp-no-bill">
                    <span>📄</span>
                    <p>No active bill found. Bills are generated on the 1st of each month.</p>
                  </div>
                )}

                {/* After Payment Preview */}
                {amount && creditCard && parseFloat(amount) > 0 && (
                  <div className="pp-preview-section">
                    <h3>After Payment Preview</h3>
                    <div className="pp-preview-cards">
                      <div className="pp-preview-item">
                        <span>New Outstanding</span>
                        <span className="pp-amount-green">
                          {formatCurrency(Math.max(0, creditCard.currentOutstanding - parseFloat(amount)))}
                        </span>
                      </div>
                      <div className="pp-preview-item">
                        <span>New Available Credit</span>
                        <span className="pp-amount-green">
                          {formatCurrency(creditCard.creditLimit - Math.max(0, creditCard.currentOutstanding - parseFloat(amount)))}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info Note */}
                <div className="pp-info-note">
                  <p>💡 Interest of 3% per month applies on unpaid outstanding balance after due date.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction History Tab */}
        {activeTab === 'history' && (
          <div className="pp-history-section">
            <h2 className="pp-section-title">Payment Transaction History</h2>
            
            {paymentHistory.length === 0 ? (
              <div className="pp-no-history">
                <span className="pp-no-history-icon">📭</span>
                <h3>No Payment History</h3>
                <p>Your payment transactions will appear here once you make a payment.</p>
              </div>
            ) : (
              <div className="pp-history-table-wrapper">
                <table className="pp-history-table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Payment ID</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((payment, index) => (
                      <tr key={payment._id || index}>
                        <td>{formatDate(payment.paymentDate || payment.createdAt)}</td>
                        <td className="pp-tx-id">#{payment._id?.slice(-8).toUpperCase()}</td>
                        <td className="pp-tx-amount">{formatCurrency(payment.amount)}</td>
                        <td>{payment.paymentMethod?.toUpperCase()}</td>
                        <td>
                          <span className={`pp-type-badge pp-type-${payment.paymentType}`}>
                            {payment.paymentType === 'full' ? '✓ Full' : '⟳ Partial'}
                          </span>
                        </td>
                        <td>
                          <span className={`pp-status-pill pp-status-${payment.status}`}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PaymentPage;