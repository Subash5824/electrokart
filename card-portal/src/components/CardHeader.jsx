import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import cardService from '../services/cardService';
import './CardHeader.css';

const CardHeader = ({ title, subtitle }) => {
  const navigate = useNavigate();
  const user = cardService.getCurrentUser();

  const handleLogout = () => {
    cardService.logout();
    navigate('/login');
  };

  return (
    <header className="card-header">
      <div className="header-content">
        <div>
          <h1 className="header-title">{title || 'Credit Card Portal'}</h1>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
        
        <div className="header-actions">
          <span className="user-name">{user?.businessName || 'User'}</span>
          <Link to="/settings" className="header-link">Settings</Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    </header>
  );
};

export default CardHeader;