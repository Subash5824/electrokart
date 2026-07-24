import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import bankerService from '../services/bankerService';
import './BankerDashboard.css';

const BankerDashboard = () => {
  const navigate = useNavigate();
  const [banker, setBanker] = useState(null);
  const [stats, setStats] = useState(null);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [declineModal, setDeclineModal] = useState({ open: false, txId: null });
  const [declineReason, setDeclineReason] = useState('');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('bankerToken');
    if (!token) {
      navigate('/banker/login');
      return;
    }
    setBanker(JSON.parse(localStorage.getItem('banker') || '{}'));
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, pendingData, customersData] = await Promise.all([
        bankerService.getStats().catch(() => ({ success: false, stats: null })),
        bankerService.getPendingTransactions().catch(() => ({ transactions: [] })),
        bankerService.getCustomers().catch(() => ({ customers: [] }))
      ]);

      if (statsData.success) setStats(statsData.stats);
      setPendingTransactions(pendingData.transactions || []);
      setCustomers(customersData.customers || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleApprove = async (transactionId) => {
    setActionLoading(transactionId);
    try {
      await bankerService.approveTransaction(transactionId, 'Approved by banker');
      showNotification('Transaction approved successfully!');
      fetchData();
    } catch (error) {
      showNotification(error?.message || 'Error approving transaction', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineSubmit = async () => {
    if (!declineReason.trim()) {
      showNotification('Please enter a decline reason', 'error');
      return;
    }
    setActionLoading(declineModal.txId);
    try {
      await bankerService.declineTransaction(declineModal.txId, declineReason);
      showNotification('Transaction declined.');
      setDeclineModal({ open: false, txId: null });
      setDeclineReason('');
      fetchData();
    } catch (error) {
      showNotification(error?.message || 'Error declining transaction', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveCard = async (userId, customerName) => {
    if (!window.confirm(`Approve credit card for ${customerName}?`)) return;
    setActionLoading(userId);
    try {
      await bankerService.approveCreditCard(userId);
      showNotification('Credit card approved successfully!');
      fetchData();
    } catch (error) {
      showNotification(error?.message || 'Error approving card', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlockCard = async (userId, customerName) => {
    const reason = window.prompt(`Enter reason for blocking ${customerName}'s card:`);
    if (!reason) return;
    setActionLoading(userId);
    try {
      await bankerService.blockCustomerCard(userId, reason);
      showNotification('Card blocked successfully.');
      fetchData();
    } catch (error) {
      showNotification(error?.message || 'Error blocking card', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    bankerService.logout();
    navigate('/banker/login');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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

  const filteredCustomers = customers.filter(c =>
    c.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  );

  const totalOutstanding = customers.reduce((sum, c) =>
    sum + (c.creditCard?.currentOutstanding || 0), 0);

  const totalCreditLimit = customers.reduce((sum, c) =>
    sum + (c.creditCard?.creditLimit || 0), 0);

  const utilizationRate = totalCreditLimit > 0
    ? ((totalOutstanding / totalCreditLimit) * 100).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="bd-loading">
        <div className="bd-loading-spinner"></div>
        <p>Loading banker dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bd-wrapper">
      {/* Notification Toast */}
      {notification && (
        <div className={`bd-toast bd-toast-${notification.type}`}>
          <span>{notification.type === 'success' ? '✓' : '⚠'}</span>
          {notification.message}
        </div>
      )}

      {/* Decline Modal */}
      {declineModal.open && (
        <div className="bd-modal-overlay" onClick={() => setDeclineModal({ open: false, txId: null })}>
          <div className="bd-modal" onClick={e => e.stopPropagation()}>
            <h3>Decline Transaction</h3>
            <p>Please provide a reason for declining this transaction:</p>
            <textarea
              value={declineReason}
              onChange={e => setDeclineReason(e.target.value)}
              placeholder="Enter reason..."
              rows={4}
              className="bd-modal-textarea"
              autoFocus
            />
            <div className="bd-modal-actions">
              <button
                className="bd-modal-cancel"
                onClick={() => { setDeclineModal({ open: false, txId: null }); setDeclineReason(''); }}
              >
                Cancel
              </button>
              <button
                className="bd-modal-confirm"
                onClick={handleDeclineSubmit}
                disabled={actionLoading === declineModal.txId}
              >
                {actionLoading === declineModal.txId ? 'Processing...' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="bd-sidebar">
        <div className="bd-sidebar-logo">
          <span className="bd-logo-icon">⚡</span>
          <div>
            <p className="bd-logo-name">ElectroKart</p>
            <p className="bd-logo-sub">Banking Portal</p>
          </div>
        </div>

        <nav className="bd-nav">
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'pending', icon: '⏳', label: 'Pending', badge: pendingTransactions.length },
            { id: 'customers', icon: '👥', label: 'Customers', badge: customers.length },
            { id: 'analytics', icon: '📈', label: 'Analytics' },
          ].map(tab => (
            <button
              key={tab.id}
              className={`bd-nav-item ${activeTab === tab.id ? 'bd-nav-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="bd-nav-icon">{tab.icon}</span>
              <span className="bd-nav-label">{tab.label}</span>
              {tab.badge > 0 && <span className="bd-nav-badge">{tab.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="bd-sidebar-profile">
          <div className="bd-profile-avatar">
            {banker?.name?.charAt(0) || 'B'}
          </div>
          <div className="bd-profile-info">
            <p className="bd-profile-name">{banker?.name}</p>
            <p className="bd-profile-role">{banker?.role}</p>
          </div>
          <button className="bd-logout-btn" onClick={handleLogout} title="Logout">⏻</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="bd-main">
        {/* Top Bar */}
        <div className="bd-topbar">
          <div>
            <h1 className="bd-topbar-title">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'pending' && 'Pending Approvals'}
              {activeTab === 'customers' && 'Customer Management'}
              {activeTab === 'analytics' && 'Analytics & Reports'}
            </h1>
            <p className="bd-topbar-date">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button className="bd-refresh-btn" onClick={fetchData}>
            🔄 Refresh
          </button>
        </div>

        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Grid */}
            <div className="bd-stats-grid">
              {[
                {
                  icon: '👥',
                  label: 'Total Customers',
                  value: stats?.totalCustomers || customers.length,
                  color: 'blue',
                  trend: '+12%'
                },
                {
                  icon: '💳',
                  label: 'Active Cards',
                  value: stats?.activeCards || 0,
                  color: 'green',
                  trend: '+5%'
                },
                {
                  icon: '⏳',
                  label: 'Pending Transactions',
                  value: pendingTransactions.length,
                  color: 'yellow',
                  trend: pendingTransactions.length > 0 ? '⚠ Needs attention' : '✓ Clear'
                },
                {
                  icon: '📋',
                  label: 'Pending Card Approvals',
                  value: stats?.pendingApprovals || 0,
                  color: 'purple',
                  trend: stats?.pendingApprovals > 0 ? '⚠ Action needed' : '✓ All approved'
                },
                {
                  icon: '📈',
                  label: "Today's Transactions",
                  value: stats?.todayTransactions || 0,
                  color: 'cyan',
                  trend: 'Today'
                },
                {
                  icon: '💰',
                  label: 'Total Transaction Volume',
                  value: formatCurrency(stats?.totalTransactionVolume || 0),
                  color: 'gold',
                  isAmount: true,
                  trend: 'Approved'
                }
              ].map((stat, i) => (
                <div key={i} className={`bd-stat-card bd-stat-${stat.color}`}>
                  <div className="bd-stat-icon">{stat.icon}</div>
                  <div className="bd-stat-content">
                    <p className="bd-stat-label">{stat.label}</p>
                    <p className="bd-stat-value">{stat.value}</p>
                    <p className="bd-stat-trend">{stat.trend}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Credit Portfolio Summary */}
            <div className="bd-portfolio-section">
              <h2 className="bd-section-title">📊 Credit Portfolio Summary</h2>
              <div className="bd-portfolio-grid">
                <div className="bd-portfolio-card">
                  <p className="bd-portfolio-label">Total Credit Limit Issued</p>
                  <p className="bd-portfolio-value bd-portfolio-blue">{formatCurrency(totalCreditLimit)}</p>
                </div>
                <div className="bd-portfolio-card">
                  <p className="bd-portfolio-label">Total Outstanding Balance</p>
                  <p className="bd-portfolio-value bd-portfolio-red">{formatCurrency(totalOutstanding)}</p>
                </div>
                <div className="bd-portfolio-card">
                  <p className="bd-portfolio-label">Available Credit (Customers)</p>
                  <p className="bd-portfolio-value bd-portfolio-green">{formatCurrency(totalCreditLimit - totalOutstanding)}</p>
                </div>
                <div className="bd-portfolio-card">
                  <p className="bd-portfolio-label">Portfolio Utilization Rate</p>
                  <div>
                    <p className="bd-portfolio-value bd-portfolio-yellow">{utilizationRate}%</p>
                    <div className="bd-utilization-bar">
                      <div
                        className="bd-utilization-fill"
                        style={{
                          width: `${Math.min(100, utilizationRate)}%`,
                          background: utilizationRate > 70 ? 'var(--error)' : utilizationRate > 40 ? 'var(--highlight)' : 'var(--success)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Pending Transactions Preview */}
            {pendingTransactions.length > 0 && (
              <div className="bd-section-card">
                <div className="bd-section-header">
                  <h2 className="bd-section-title">⏳ Recent Pending Transactions</h2>
                  <button className="bd-view-all-btn" onClick={() => setActiveTab('pending')}>
                    View All →
                  </button>
                </div>
                <div className="bd-recent-txns">
                  {pendingTransactions.slice(0, 5).map(tx => (
                    <div key={tx._id} className="bd-recent-tx-item">
                      <div className="bd-tx-icon">🛒</div>
                      <div className="bd-tx-info">
                        <p className="bd-tx-name">{tx.user?.businessName || 'Unknown'}</p>
                        <p className="bd-tx-desc">{tx.description}</p>
                      </div>
                      <div className="bd-tx-right">
                        <p className="bd-tx-amount">{formatCurrency(tx.amount)}</p>
                        <p className="bd-tx-date">{formatDate(tx.createdAt)}</p>
                      </div>
                      <div className="bd-tx-actions">
                        <button
                          className="bd-approve-btn"
                          onClick={() => handleApprove(tx._id)}
                          disabled={actionLoading === tx._id}
                        >
                          {actionLoading === tx._id ? '...' : '✓'}
                        </button>
                        <button
                          className="bd-decline-btn"
                          onClick={() => setDeclineModal({ open: true, txId: tx._id })}
                          disabled={actionLoading === tx._id}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== PENDING TRANSACTIONS TAB ===== */}
        {activeTab === 'pending' && (
          <div className="bd-section-card">
            <div className="bd-section-header">
              <h2 className="bd-section-title">Transactions Awaiting Approval</h2>
              <span className="bd-count-badge">{pendingTransactions.length} pending</span>
            </div>

            {pendingTransactions.length === 0 ? (
              <div className="bd-empty-state">
                <span className="bd-empty-icon">✅</span>
                <h3>All Clear!</h3>
                <p>No pending transactions to review at this time.</p>
              </div>
            ) : (
              <div className="bd-table-wrapper">
                <table className="bd-table">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Description</th>
                      <th>Date</th>
                      <th>Credit Card</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTransactions.map(tx => (
                      <tr key={tx._id}>
                        <td className="bd-tx-id-cell">#{tx.transactionId || tx._id?.slice(-8).toUpperCase()}</td>
                        <td>
                          <div className="bd-customer-cell">
                            <div className="bd-customer-mini-avatar">
                              {tx.user?.businessName?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="bd-cell-name">{tx.user?.businessName}</p>
                              <p className="bd-cell-sub">{tx.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="bd-amount-cell">{formatCurrency(tx.amount)}</td>
                        <td className="bd-desc-cell">{tx.description}</td>
                        <td className="bd-date-cell">{formatDate(tx.createdAt)}</td>
                        <td>
                          {tx.creditCard && (
                            <div>
                              <p className="bd-cell-small">Avail: {formatCurrency(tx.creditCard.availableBalance)}</p>
                              <p className="bd-cell-small bd-green">Limit: {formatCurrency(tx.creditCard.creditLimit)}</p>
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="bd-action-group">
                            <button
                              className="bd-btn-approve"
                              onClick={() => handleApprove(tx._id)}
                              disabled={actionLoading === tx._id}
                            >
                              {actionLoading === tx._id ? '...' : '✓ Approve'}
                            </button>
                            <button
                              className="bd-btn-decline"
                              onClick={() => setDeclineModal({ open: true, txId: tx._id })}
                              disabled={actionLoading === tx._id}
                            >
                              ✕ Decline
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===== CUSTOMERS TAB ===== */}
        {activeTab === 'customers' && (
          <div className="bd-section-card">
            <div className="bd-section-header">
              <h2 className="bd-section-title">Customer Management</h2>
              <div className="bd-search-box">
                <span>🔍</span>
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bd-search-input"
                />
              </div>
            </div>

            <div className="bd-table-wrapper">
              <table className="bd-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Credit Limit</th>
                    <th>Outstanding</th>
                    <th>Available</th>
                    <th>Card Status</th>
                    <th>Account Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map(customer => {
                    const card = customer.creditCard;
                    const outstandingPct = card && card.creditLimit > 0
                      ? ((card.currentOutstanding / card.creditLimit) * 100).toFixed(0)
                      : 0;

                    return (
                      <tr key={customer._id}>
                        <td>
                          <div className="bd-customer-cell">
                            <div className="bd-customer-mini-avatar">
                              {customer.businessName?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="bd-cell-name">{customer.businessName}</p>
                              <p className="bd-cell-sub">ID: {customer._id?.slice(-8).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <p className="bd-cell-small">{customer.email}</p>
                          <p className="bd-cell-small">{customer.phone}</p>
                        </td>
                        <td className="bd-blue-cell">{card ? formatCurrency(card.creditLimit) : '—'}</td>
                        <td>
                          {card ? (
                            <div>
                              <p className="bd-red-cell">{formatCurrency(card.currentOutstanding)}</p>
                              <div className="bd-mini-progress">
                                <div
                                  className="bd-mini-progress-fill"
                                  style={{
                                    width: `${outstandingPct}%`,
                                    background: outstandingPct > 70 ? 'var(--error)' : outstandingPct > 40 ? 'var(--highlight)' : 'var(--success)'
                                  }}
                                />
                              </div>
                              <p className="bd-cell-tiny">{outstandingPct}% used</p>
                            </div>
                          ) : '—'}
                        </td>
                        <td className="bd-green-cell">{card ? formatCurrency(card.availableBalance) : '—'}</td>
                        <td>
                          {card ? (
                            <span className={`bd-card-status bd-card-${card.status}`}>
                              {card.status === 'active' ? '🟢' : card.status === 'blocked' ? '🔴' : '⚫'} {card.status}
                            </span>
                          ) : (
                            <span className="bd-card-status bd-card-none">No Card</span>
                          )}
                        </td>
                        <td>
                          <span className={`bd-status-badge bd-status-${customer.accountStatus || 'pending'}`}>
                            {customer.isCreditApproved ? '✓ Active' : '⏳ Pending'}
                          </span>
                        </td>
                        <td>
                          <div className="bd-action-group bd-action-col">
                            <Link
                              to={`/banker/customer/${customer._id}`}
                              className="bd-btn-view"
                            >
                              👁 Details
                            </Link>
                            {!customer.isCreditApproved && card && (
                              <button
                                className="bd-btn-approve-card"
                                onClick={() => handleApproveCard(customer._id, customer.businessName)}
                                disabled={actionLoading === customer._id}
                              >
                                {actionLoading === customer._id ? '...' : '✓ Approve'}
                              </button>
                            )}
                            {customer.isCreditApproved && card && card.status !== 'blocked' && (
                              <button
                                className="bd-btn-block"
                                onClick={() => handleBlockCard(customer._id, customer.businessName)}
                                disabled={actionLoading === customer._id}
                              >
                                {actionLoading === customer._id ? '...' : '🚫 Block'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredCustomers.length === 0 && (
                <div className="bd-empty-state">
                  <span className="bd-empty-icon">🔍</span>
                  <p>No customers match your search.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== ANALYTICS TAB ===== */}
        {activeTab === 'analytics' && (
          <div>
            <div className="bd-analytics-grid">
              {/* Card Status Distribution */}
              <div className="bd-analytics-card">
                <h3 className="bd-analytics-title">💳 Card Status Distribution</h3>
                {(() => {
                  const active = customers.filter(c => c.creditCard?.status === 'active').length;
                  const blocked = customers.filter(c => c.creditCard?.status === 'blocked').length;
                  const expired = customers.filter(c => c.creditCard?.status === 'expired').length;
                  const noCard = customers.filter(c => !c.creditCard).length;
                  const total = customers.length || 1;

                  return (
                    <div className="bd-distribution">
                      {[
                        { label: 'Active', count: active, color: 'var(--success)', pct: ((active/total)*100).toFixed(0) },
                        { label: 'Blocked', count: blocked, color: 'var(--error)', pct: ((blocked/total)*100).toFixed(0) },
                        { label: 'Expired', count: expired, color: 'var(--text-gray)', pct: ((expired/total)*100).toFixed(0) },
                        { label: 'No Card', count: noCard, color: 'var(--highlight)', pct: ((noCard/total)*100).toFixed(0) },
                      ].map((item, i) => (
                        <div key={i} className="bd-dist-row">
                          <div className="bd-dist-label">
                            <span className="bd-dist-dot" style={{ background: item.color }}></span>
                            <span>{item.label}</span>
                          </div>
                          <div className="bd-dist-bar-wrap">
                            <div className="bd-dist-bar">
                              <div className="bd-dist-bar-fill" style={{ width: `${item.pct}%`, background: item.color }}></div>
                            </div>
                          </div>
                          <div className="bd-dist-count">
                            <span className="bd-dist-num" style={{ color: item.color }}>{item.count}</span>
                            <span className="bd-dist-pct">({item.pct}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Credit Utilization */}
              <div className="bd-analytics-card">
                <h3 className="bd-analytics-title">📊 Credit Utilization</h3>
                <div className="bd-utilization-detail">
                  <div className="bd-util-circle-wrap">
                    <svg viewBox="0 0 100 100" className="bd-util-circle">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10"/>
                      <circle
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke={utilizationRate > 70 ? 'var(--error)' : utilizationRate > 40 ? 'var(--highlight)' : 'var(--success)'}
                        strokeWidth="10"
                        strokeDasharray={`${utilizationRate * 2.51} 251`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                      <text x="50" y="45" textAnchor="middle" fill="white" fontSize="14" fontWeight="700">
                        {utilizationRate}%
                      </text>
                      <text x="50" y="60" textAnchor="middle" fill="#9CA3AF" fontSize="7">
                        utilized
                      </text>
                    </svg>
                  </div>
                  <div className="bd-util-stats">
                    <div className="bd-util-stat">
                      <span className="bd-util-label">Total Limit</span>
                      <span className="bd-util-value bd-blue-cell">{formatCurrency(totalCreditLimit)}</span>
                    </div>
                    <div className="bd-util-stat">
                      <span className="bd-util-label">Used</span>
                      <span className="bd-util-value bd-red-cell">{formatCurrency(totalOutstanding)}</span>
                    </div>
                    <div className="bd-util-stat">
                      <span className="bd-util-label">Available</span>
                      <span className="bd-util-value bd-green-cell">{formatCurrency(totalCreditLimit - totalOutstanding)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* High-Risk Accounts */}
              <div className="bd-analytics-card bd-analytics-wide">
                <h3 className="bd-analytics-title">⚠️ High Utilization Accounts (&gt;70%)</h3>
                {(() => {
                  const highRisk = customers.filter(c => {
                    const card = c.creditCard;
                    return card && card.creditLimit > 0 &&
                      (card.currentOutstanding / card.creditLimit) > 0.7;
                  });

                  return highRisk.length === 0 ? (
                    <div className="bd-no-risk">
                      <span>✅</span>
                      <p>No high-utilization accounts at this time.</p>
                    </div>
                  ) : (
                    <div className="bd-risk-list">
                      {highRisk.map(c => {
                        const pct = ((c.creditCard.currentOutstanding / c.creditCard.creditLimit) * 100).toFixed(0);
                        return (
                          <div key={c._id} className="bd-risk-item">
                            <div className="bd-risk-info">
                              <p className="bd-risk-name">{c.businessName}</p>
                              <p className="bd-risk-email">{c.email}</p>
                            </div>
                            <div className="bd-risk-bar-wrap">
                              <div className="bd-risk-bar">
                                <div className="bd-risk-bar-fill" style={{ width: `${pct}%` }}></div>
                              </div>
                              <span className="bd-risk-pct">{pct}% used</span>
                            </div>
                            <div className="bd-risk-amounts">
                              <p className="bd-red-cell">{formatCurrency(c.creditCard.currentOutstanding)} due</p>
                              <p className="bd-blue-cell">of {formatCurrency(c.creditCard.creditLimit)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Summary Report */}
              <div className="bd-analytics-card bd-analytics-wide">
                <h3 className="bd-analytics-title">📋 Summary Report</h3>
                <div className="bd-report-grid">
                  {[
                    { label: 'Total Registered Customers', value: customers.length, icon: '👥' },
                    { label: 'Credit Approved Customers', value: customers.filter(c => c.isCreditApproved).length, icon: '✅' },
                    { label: 'Pending Card Applications', value: customers.filter(c => !c.isCreditApproved && c.creditCard).length, icon: '⏳' },
                    { label: 'Active Credit Cards', value: customers.filter(c => c.creditCard?.status === 'active').length, icon: '💳' },
                    { label: 'Blocked Cards', value: customers.filter(c => c.creditCard?.status === 'blocked').length, icon: '🚫' },
                    { label: 'Customers With No Card', value: customers.filter(c => !c.creditCard).length, icon: '📭' },
                    { label: 'Total Outstanding (All)', value: formatCurrency(totalOutstanding), icon: '💰', isAmount: true },
                    { label: 'Total Credit Issued', value: formatCurrency(totalCreditLimit), icon: '🏦', isAmount: true },
                  ].map((item, i) => (
                    <div key={i} className="bd-report-item">
                      <span className="bd-report-icon">{item.icon}</span>
                      <div>
                        <p className="bd-report-label">{item.label}</p>
                        <p className={`bd-report-value ${item.isAmount ? 'bd-blue-cell' : ''}`}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BankerDashboard;