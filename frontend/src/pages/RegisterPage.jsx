import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import authService from '../services/authService';
import cartService from '../services/cartService'; // ADD THIS IMPORT
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    businessName: '',
    email: '',
    phone: '',
    gstNumber: '',
    
    // Step 2
    password: '',
    confirmPassword: '',
    
    // Step 3
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

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

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.businessName) newErrors.businessName = 'Business name is required';
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = 'Invalid Indian phone number';
    
    if (!formData.gstNumber) newErrors.gstNumber = 'GST number is required';
    else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(formData.gstNumber)) {
      newErrors.gstNumber = 'Invalid GST format';
    }
    
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
    else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const validateStep3 = () => {
    const newErrors = {};
    
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.pincode) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Invalid pincode';
    
    return newErrors;
  };

  const handleNext = () => {
    let stepErrors = {};
    if (step === 1) stepErrors = validateStep1();
    else if (step === 2) stepErrors = validateStep2();
    
    if (Object.keys(stepErrors).length === 0) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      setErrors(stepErrors);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const step3Errors = validateStep3();
    
    if (Object.keys(step3Errors).length > 0) {
      setErrors(step3Errors);
      return;
    }
    
    setLoading(true);
    setServerError('');
    
    try {
      // Call backend API
      const response = await authService.register({
        businessName: formData.businessName,
        email: formData.email,
        phone: formData.phone,
        gstNumber: formData.gstNumber,
        password: formData.password,
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        }
      });
      
      // After successful registration
if (response.success) {
  const pendingItem = localStorage.getItem('pendingCartItem');
  if (pendingItem) {
    const item = JSON.parse(pendingItem);
    // Add to cart logic here
    cartService.addToCart(item.product, item.quantity);
    localStorage.removeItem('pendingCartItem');
    navigate('/cart');
  } else {
    navigate('/login');
  }
}
    } catch (error) {
      console.error('Registration error:', error);
      setServerError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <Header />
      
      <main className="container">
        <div className="auth-container">
          <div className="auth-card register-card">
            <div className="auth-header">
              <h1>Create Business Account</h1>
              <p>Join 5000+ businesses on ElectroKart</p>
            </div>

            {serverError && (
              <div className="error-alert">
                ⚠️ {serverError}
              </div>
            )}

            {/* Progress Steps */}
            <div className="progress-steps">
              <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                <span className="step-number">1</span>
                <span className="step-label">Business</span>
              </div>
              <div className={`step-line ${step > 1 ? 'active' : ''}`}></div>
              <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                <span className="step-number">2</span>
                <span className="step-label">Security</span>
              </div>
              <div className={`step-line ${step > 2 ? 'active' : ''}`}></div>
              <div className={`step ${step >= 3 ? 'active' : ''}`}>
                <span className="step-number">3</span>
                <span className="step-label">Address</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Step 1: Business Details */}
              {step === 1 && (
                <div className="form-step">
                  <div className="form-group">
                    <label>Business Name *</label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="Enter your business name"
                      className={errors.businessName ? 'error' : ''}
                    />
                    {errors.businessName && <span className="error-message">{errors.businessName}</span>}
                  </div>

                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="business@example.com"
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="9876543210"
                        className={errors.phone ? 'error' : ''}
                      />
                      {errors.phone && <span className="error-message">{errors.phone}</span>}
                    </div>

                    <div className="form-group">
                      <label>GST Number *</label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        placeholder="22AAAAA0000A1Z5"
                        className={errors.gstNumber ? 'error' : ''}
                      />
                      {errors.gstNumber && <span className="error-message">{errors.gstNumber}</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Password */}
              {step === 2 && (
                <div className="form-step">
                  <div className="form-group">
                    <label>Password *</label>
                    <div className="password-input">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className={errors.password ? 'error' : ''}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    {errors.password && <span className="error-message">{errors.password}</span>}
                  </div>

                  <div className="form-group">
                    <label>Confirm Password *</label>
                    <div className="password-input">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className={errors.confirmPassword ? 'error' : ''}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                  </div>

                  <div className="password-hint">
                    <p>Password must:</p>
                    <ul>
                      <li>Be at least 6 characters long</li>
                      <li>Include letters and numbers</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 3: Address */}
              {step === 3 && (
                <div className="form-step">
                  <div className="form-group">
                    <label>Business Address *</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Street address, building, area"
                      rows="3"
                      className={errors.address ? 'error' : ''}
                    />
                    {errors.address && <span className="error-message">{errors.address}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Mumbai"
                        className={errors.city ? 'error' : ''}
                      />
                      {errors.city && <span className="error-message">{errors.city}</span>}
                    </div>

                    <div className="form-group">
                      <label>State *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Maharashtra"
                        className={errors.state ? 'error' : ''}
                      />
                      {errors.state && <span className="error-message">{errors.state}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="400001"
                      maxLength="6"
                      className={errors.pincode ? 'error' : ''}
                    />
                    {errors.pincode && <span className="error-message">{errors.pincode}</span>}
                  </div>
                </div>
              )}

              {/* Form Navigation */}
              <div className="form-navigation">
                {step > 1 && (
                  <button type="button" onClick={handleBack} className="nav-btn back-btn" disabled={loading}>
                    ← Back
                  </button>
                )}
                
                {step < 3 ? (
                  <button type="button" onClick={handleNext} className="nav-btn next-btn" disabled={loading}>
                    Continue →
                  </button>
                ) : (
                  <button type="submit" className="nav-btn submit-btn" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                )}
              </div>
            </form>

            <div className="auth-footer">
              <p>Already have an account? <Link to="/login">Login</Link></p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegisterPage;