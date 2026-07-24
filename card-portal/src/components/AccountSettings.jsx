import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AccountSettings.css';

const AccountSettings = ({ user, card, onUpdate, onBlockCard }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [formData, setFormData] = useState({
    businessName: user?.businessName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onUpdate) {
      onUpdate(formData);
    }
    alert('Profile updated successfully!');
  };

  const handleBlockCard = () => {
    if (onBlockCard) {
      onBlockCard();
    }
    setShowBlockConfirm(false);
  };

  return (
    <div className="account-settings">
      <div className="settings-tabs">
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile Settings
        </button>
        <button
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
        <button
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button
          className={`tab-btn ${activeTab === 'card' ? 'active' : ''}`}
          onClick={() => setActiveTab('card')}
        >
          Card Management
        </button>
      </div>

      <div className="tab-content">
        {/* Profile Settings Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSubmit} className="settings-form">
            <h3>Profile Information</h3>
            
            <div className="form-group">
              <label>Business Name</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="form-input"
                rows="3"
              />
            </div>

            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </form>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="security-settings">
            <h3>Security Settings</h3>
            
            <div className="security-item">
              <div>
                <h4>Change Password</h4>
                <p>Update your account password</p>
              </div>
              <button className="action-btn">Change</button>
            </div>

            <div className="security-item">
              <div>
                <h4>Two-Factor Authentication</h4>
                <p>Add an extra layer of security</p>
              </div>
              <button className="action-btn">Enable</button>
            </div>

            <div className="security-item">
              <div>
                <h4>Login History</h4>
                <p>View recent login activity</p>
              </div>
              <button className="action-btn">View</button>
            </div>

            <div className="security-item">
              <div>
                <h4>Devices</h4>
                <p>Manage trusted devices</p>
              </div>
              <button className="action-btn">Manage</button>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="notification-settings">
            <h3>Notification Preferences</h3>
            
            <div className="notification-item">
              <div>
                <h4>Email Notifications</h4>
                <p>Receive updates via email</p>
              </div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>

            <div className="notification-item">
              <div>
                <h4>SMS Alerts</h4>
                <p>Get transaction alerts on phone</p>
              </div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>

            <div className="notification-item">
              <div>
                <h4>Payment Reminders</h4>
                <p>Remind me before due date</p>
              </div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>

            <div className="notification-item">
              <div>
                <h4>Marketing Updates</h4>
                <p>Receive offers and promotions</p>
              </div>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
            </div>

            <button className="save-btn">Save Preferences</button>
          </div>
        )}

        {/* Card Management Tab */}
        {activeTab === 'card' && (
          <div className="card-management">
            <h3>Card Management</h3>
            
            <div className="card-info">
              <h4>Card Details</h4>
              <p><span className="label">Card Number:</span> {card?.cardNumber?.replace(/(\d{4})/g, '$1 ')}</p>
              <p><span className="label">Card Type:</span> {card?.cardType}</p>
              <p><span className="label">Expiry:</span> {new Date(card?.expiryDate).toLocaleDateString()}</p>
              <p><span className="label">Status:</span> <span className={`status-${card?.status}`}>{card?.status}</span></p>
            </div>

            <div className="card-actions">
              <button className="action-btn" onClick={() => setShowBlockConfirm(true)}>
                Block Card
              </button>
              <button className="action-btn">Report Lost/Stolen</button>
              <button className="action-btn">Request New Card</button>
            </div>
          </div>
        )}
      </div>

      {/* Block Card Confirmation Modal */}
      {showBlockConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Block Credit Card?</h3>
            <p>Are you sure you want to block your credit card? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowBlockConfirm(false)}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleBlockCard}>
                Yes, Block Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;