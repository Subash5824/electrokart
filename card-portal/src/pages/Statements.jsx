import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import cardService from '../services/cardService';
import './Statements.css';

const Statements = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!cardService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await cardService.getCustomers();
      setCustomers(response.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = [2025, 2026, 2027];

  return (
    <div className="statements-page">
      <header className="page-header">
        <h1>Customer Statements</h1>
        <Link to="/dashboard" className="back-btn">← Back to Dashboard</Link>
      </header>

      <div className="statements-filters">
        <div className="filter-group">
          <label>Select Customer</label>
          <select 
            value={selectedCustomer || ''} 
            onChange={(e) => setSelectedCustomer(e.target.value)}
          >
            <option value="">Choose customer...</option>
            {customers.map(c => (
              <option key={c._id} value={c._id}>{c.businessName}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Month</label>
          <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
            {months.map((m, index) => (
              <option key={index} value={index}>{m}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Year</label>
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <button className="generate-btn" disabled={!selectedCustomer}>
          Generate Statement
        </button>
      </div>

      {selectedCustomer && (
        <div className="statement-preview">
          <p>Statement preview will appear here</p>
        </div>
      )}
    </div>
  );
};

export default Statements;