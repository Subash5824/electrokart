import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bankerService from '../services/bankerService';
import './BankerLogin.css';

const BankerLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    try {
      const response = await bankerService.login(formData.email, formData.password);
      if (response.success) {
        navigate('/banker/dashboard');
      } else {
        setErrors({ general: response.message || 'Login failed' });
      }
    } catch (error) {
      setErrors({ general: error.message || 'Invalid credentials' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="banker-login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Banker Portal</h1>
            <p>ElectroKart Banking System</p>
          </div>

          {errors.general && (
            <div className="error-alert">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="banker@electrokart.com"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login to Banker Dashboard'}
            </button>
          </form>

          <div className="login-footer">
            <p>Secure access for authorized personnel only</p>
            <p className="demo-credentials">
              Demo: admin@bank.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankerLogin;