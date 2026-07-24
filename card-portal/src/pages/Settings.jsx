import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import cardService from '../services/cardService';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);

  useEffect(() => {
    if (!cardService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchCardDetails();
  }, []);

  const fetchCardDetails = async () => {
    try {
      const response = await cardService.getCardDetails();
      setCard(response.card);
    } catch (error) {
      console.error('Error fetching card:', error);
    }
  };

  const handleBlockCard = async () => {
    setLoading(true);
    try {
      await cardService.blockCard();
      alert('Card blocked successfully. Please contact your banker to unblock.');
      navigate('/dashboard');
    } catch (error) {
      alert('Error blocking card: ' + error.message);
    } finally {
      setLoading(false);
      setShowBlockConfirm(false);
    }
  };

  const handleLogoutAll = () => {
    cardService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-bank-accent">Settings</h1>
          <p className="text-bank-muted mt-1">Manage your card and account</p>
        </div>
        <Link to="/dashboard" className="btn-secondary">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Card Information */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Card Information</h2>
          
          {card && (
            <div className="space-y-4">
              <div>
                <p className="text-bank-muted text-sm">Card Number</p>
                <p className="font-mono text-lg">{card.cardNumber?.replace(/(\d{4})/g, '$1 ')}</p>
              </div>
              
              <div>
                <p className="text-bank-muted text-sm">Card Type</p>
                <p className="text-lg capitalize">{card.cardType}</p>
              </div>
              
              <div>
                <p className="text-bank-muted text-sm">Expiry Date</p>
                <p className="text-lg">{new Date(card.expiryDate).toLocaleDateString('en-IN', { month: '2-digit', year: '2-digit' })}</p>
              </div>
              
              <div>
                <p className="text-bank-muted text-sm">Status</p>
                <p className={`text-lg font-semibold ${
                  card.status === 'active' ? 'text-green-500' : 'text-bank-warning'
                }`}>
                  {card.status?.toUpperCase()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Account Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
          
          <div className="space-y-4">
            <button className="w-full p-4 bg-bank-bg rounded-lg text-left hover:bg-bank-card transition-all">
              <p className="font-medium">Change Password</p>
              <p className="text-sm text-bank-muted">Update your login password</p>
            </button>
            
            <button className="w-full p-4 bg-bank-bg rounded-lg text-left hover:bg-bank-card transition-all">
              <p className="font-medium">Update Contact Information</p>
              <p className="text-sm text-bank-muted">Change email or phone number</p>
            </button>
            
            <button className="w-full p-4 bg-bank-bg rounded-lg text-left hover:bg-bank-card transition-all">
              <p className="font-medium">Notification Preferences</p>
              <p className="text-sm text-bank-muted">Manage email and SMS alerts</p>
            </button>
            
            <button 
              className="w-full p-4 bg-bank-warning/10 rounded-lg text-left hover:bg-bank-warning/20 transition-all"
              onClick={() => setShowBlockConfirm(true)}
            >
              <p className="font-medium text-bank-warning">Block Card</p>
              <p className="text-sm text-bank-muted">Permanently block your credit card</p>
            </button>
            
            <button 
              className="w-full p-4 bg-red-500/10 rounded-lg text-left hover:bg-red-500/20 transition-all"
              onClick={handleLogoutAll}
            >
              <p className="font-medium text-red-500">Logout from all devices</p>
              <p className="text-sm text-bank-muted">Sign out everywhere</p>
            </button>
          </div>
        </div>

        {/* Support */}
        <div className="card md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-bank-bg rounded-lg text-center">
              <div className="text-3xl mb-2">📞</div>
              <p className="font-medium">24/7 Support</p>
              <p className="text-sm text-bank-muted">Call us anytime</p>
              <p className="text-bank-accent font-semibold mt-2">1800-123-4567</p>
            </div>
            
            <div className="p-4 bg-bank-bg rounded-lg text-center">
              <div className="text-3xl mb-2">✉️</div>
              <p className="font-medium">Email Us</p>
              <p className="text-sm text-bank-muted">support@electrokart.com</p>
            </div>
            
            <div className="p-4 bg-bank-bg rounded-lg text-center">
              <div className="text-3xl mb-2">💬</div>
              <p className="font-medium">Live Chat</p>
              <p className="text-sm text-bank-muted">Chat with our team</p>
            </div>
          </div>
        </div>
      </div>

      {/* Block Card Confirmation Modal */}
      {showBlockConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md">
            <h3 className="text-xl font-bold mb-4">Block Credit Card?</h3>
            <p className="text-bank-muted mb-6">
              Are you sure you want to block your credit card? This action cannot be undone.
              You will need to contact your banker to unblock the card.
            </p>
            <div className="flex gap-4">
              <button
                className="btn-primary flex-1"
                onClick={handleBlockCard}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Yes, Block Card'}
              </button>
              <button
                className="btn-secondary flex-1"
                onClick={() => setShowBlockConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;