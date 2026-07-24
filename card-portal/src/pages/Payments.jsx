import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import cardService from '../services/cardService';
import { formatCurrency } from '../utils/formatters';
import './Payments.css';

const Payments = () => {
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [bill, setBill] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!cardService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const cardData = await cardService.getCardDetails();
      setCard(cardData.card);

      try {
        const billData = await cardService.getCurrentBill();
        if (billData.bill) {
          setBill(billData.bill);
          setAmount(billData.bill.minimumPayment.toString());
        }
      } catch (e) {
        console.log('No bill found');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await cardService.makePayment(parseFloat(amount), paymentMethod);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (error) {
      alert('Payment failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="card max-w-md text-center">
          <div className="text-6xl mb-4 text-green-500">✅</div>
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-bank-muted mb-4">
            Your payment of {formatCurrency(parseFloat(amount))} has been processed.
          </p>
          <p className="text-sm text-bank-muted mb-6">Redirecting to dashboard...</p>
          <div className="w-16 h-16 border-4 border-bank-accent border-t-transparent 
                        rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-bank-accent">Make a Payment</h1>
          <p className="text-bank-muted mt-1">Pay your credit card bill</p>
        </div>
        <Link to="/dashboard" className="btn-secondary">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Payment Form */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
          
          <form onSubmit={handleSubmit}>
            {/* Amount */}
            <div className="mb-6">
              <label className="label-text">Payment Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field"
                min="100"
                required
              />
            </div>

            {/* Quick Amount Selector */}
            {bill && (
              <div className="mb-6">
                <p className="text-bank-muted text-sm mb-2">Quick select:</p>
                <div className="flex gap-3 flex-wrap">
                  <button
                    type="button"
                    className="px-4 py-2 bg-bank-card rounded-lg hover:bg-bank-border"
                    onClick={() => handleAmountSelect(bill.minimumPayment)}
                  >
                    Min: {formatCurrency(bill.minimumPayment)}
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-bank-card rounded-lg hover:bg-bank-border"
                    onClick={() => handleAmountSelect(bill.statementBalance)}
                  >
                    Full: {formatCurrency(bill.statementBalance)}
                  </button>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="mb-6">
              <label className="label-text">Payment Method</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-bank-bg rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-bank-accent"
                  />
                  <span className="text-2xl">📱</span>
                  <div>
                    <p className="font-medium">UPI</p>
                    <p className="text-sm text-bank-muted">Pay using Google Pay, PhonePe, etc.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-bank-bg rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="netbanking"
                    checked={paymentMethod === 'netbanking'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-bank-accent"
                  />
                  <span className="text-2xl">🏦</span>
                  <div>
                    <p className="font-medium">Net Banking</p>
                    <p className="text-sm text-bank-muted">Pay from your bank account</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-bank-bg rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-bank-accent"
                  />
                  <span className="text-2xl">💳</span>
                  <div>
                    <p className="font-medium">Debit Card</p>
                    <p className="text-sm text-bank-muted">Pay using your debit card</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !amount}
              className="btn-primary w-full"
            >
              {loading ? 'Processing...' : `Pay ${formatCurrency(parseFloat(amount || 0))}`}
            </button>
          </form>
        </div>

        {/* Payment Summary */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
          
          {card && (
            <div className="space-y-4">
              <div className="p-4 bg-bank-bg rounded-lg">
                <p className="text-bank-muted text-sm mb-1">Current Balance</p>
                <p className="text-2xl font-bold text-bank-accent">
                  {formatCurrency(card.currentOutstanding)}
                </p>
              </div>

              <div className="p-4 bg-bank-bg rounded-lg">
                <p className="text-bank-muted text-sm mb-1">Available Credit</p>
                <p className="text-2xl font-bold text-green-500">
                  {formatCurrency(card.availableBalance)}
                </p>
              </div>

              {bill && (
                <>
                  <div className="border-t border-bank-border pt-4">
                    <p className="text-bank-muted text-sm mb-2">Bill Details</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Statement Balance</span>
                        <span className="font-semibold">{formatCurrency(bill.statementBalance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Minimum Due</span>
                        <span className="font-semibold text-bank-warning">{formatCurrency(bill.minimumPayment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Due Date</span>
                        <span className="font-semibold">{new Date(bill.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="bg-bank-card/50 p-4 rounded-lg">
                <p className="text-sm text-bank-muted">
                  🔒 Secure payment processed by ElectroKart Banking
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payments;