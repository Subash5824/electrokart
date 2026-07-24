import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import creditCardService from '../services/creditCardService';
import './Notifications.css';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await creditCardService.getNotifications();
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await creditCardService.markNotificationRead(notificationId);
      setNotifications(notifications.map(n => 
        n._id === notificationId 
          ? { ...n, channel: { ...n.channel, inApp: { read: true } } }
          : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Assuming you have this API endpoint
      // await creditCardService.markAllNotificationsRead();
      setNotifications(notifications.map(n => ({
        ...n,
        channel: { ...n.channel, inApp: { read: true } }
      })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'bill_generated': return '📄';
      case 'payment_due': return '⏰';
      case 'payment_received': return '✅';
      case 'interest_charged': return '📈';
      case 'transaction_approval': return '👍';
      case 'transaction_declined': return '❌';
      case 'credit_limit_alert': return '⚠️';
      case 'card_blocked': return '🔒';
      default: return '🔔';
    }
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'urgent': return 'priority-urgent';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      default: return 'priority-low';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.channel?.inApp?.read).length;

  if (loading) {
    return (
      <div className="notifications-page">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading notifications...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <Header />
      
      <main className="container">
        <div className="notifications-header">
          <div className="header-left">
            <h1 className="page-title">Notifications</h1>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount} unread</span>
            )}
          </div>
          
          <div className="header-actions">
            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
                ✓ Mark all as read
              </button>
            )}
            <button className="back-btn" onClick={() => navigate('/dashboard')}>
              ← Back
            </button>
          </div>
        </div>

        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="no-notifications">
              <div className="no-data-icon">🔔</div>
              <h3>No notifications</h3>
              <p>You're all caught up!</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification._id} 
                className={`notification-item ${!notification.channel?.inApp?.read ? 'unread' : ''} ${getPriorityClass(notification.priority)}`}
                onClick={() => !notification.channel?.inApp?.read && handleMarkAsRead(notification._id)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="notification-content">
                  <div className="notification-header">
                    <h3 className="notification-title">{notification.title}</h3>
                    {notification.priority === 'urgent' && (
                      <span className="urgent-tag">URGENT</span>
                    )}
                  </div>
                  
                  <p className="notification-message">{notification.message}</p>
                  
                  <div className="notification-footer">
                    <span className="notification-time">
                      {formatDate(notification.createdAt)}
                    </span>
                    {!notification.channel?.inApp?.read && (
                      <span className="new-badge">New</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Notifications;