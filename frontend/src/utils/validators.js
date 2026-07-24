// validators.js - All validation functions for the application

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile: starts with 6-9 and 10 digits
  return phoneRegex.test(phone);
};

/**
 * Validate GST number (Indian format)
 * @param {string} gst - GST number to validate
 * @returns {boolean} True if valid GST
 */
export const isValidGST = (gst) => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with strength and message
 */
export const validatePassword = (password) => {
  const result = {
    isValid: false,
    strength: 'weak',
    message: ''
  };

  if (!password || password.length < 6) {
    result.message = 'Password must be at least 6 characters';
    return result;
  }

  // Check strength
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar]
    .filter(Boolean).length;

  if (strengthScore >= 4) {
    result.strength = 'strong';
  } else if (strengthScore >= 3) {
    result.strength = 'medium';
  } else {
    result.strength = 'weak';
  }

  result.isValid = true;
  result.message = 'Password is valid';
  
  return result;
};

/**
 * Validate wholesale quantity rules
 * @param {number} quantity - Quantity to validate
 * @param {number} minQty - Minimum quantity (default 100)
 * @param {number} maxQty - Maximum quantity (default 5000)
 * @param {number} step - Step size (default 10)
 * @returns {Object} Validation result
 */
export const validateQuantity = (quantity, minQty = 100, maxQty = 5000, step = 10) => {
  const result = {
    isValid: false,
    message: ''
  };

  if (!quantity || isNaN(quantity)) {
    result.message = 'Quantity is required';
    return result;
  }

  if (quantity < minQty) {
    result.message = `Minimum order is ${minQty} pieces`;
    return result;
  }

  if (quantity > maxQty) {
    result.message = `Maximum order is ${maxQty} pieces`;
    return result;
  }

  if (quantity % step !== 0) {
    result.message = `Quantity must be in multiples of ${step}`;
    return result;
  }

  result.isValid = true;
  result.message = 'Valid quantity';
  return result;
};

/**
 * Validate cart minimum and maximum
 * @param {Array} items - Cart items
 * @returns {Object} Validation result
 */
export const validateCart = (items) => {
  const result = {
    isValid: false,
    totalPieces: 0,
    message: ''
  };

  if (!items || items.length === 0) {
    result.message = 'Cart is empty';
    return result;
  }

  const totalPieces = items.reduce((sum, item) => sum + item.quantity, 0);
  result.totalPieces = totalPieces;

  if (totalPieces < 100) {
    result.message = `Minimum order is 100 pieces (currently ${totalPieces})`;
    return result;
  }

  if (totalPieces > 5000) {
    result.message = `Maximum order is 5000 pieces (currently ${totalPieces})`;
    return result;
  }

  // Validate each item's quantity
  for (const item of items) {
    if (item.quantity < 100) {
      result.message = `${item.name}: Minimum 100 pieces required`;
      return result;
    }
    if (item.quantity > 5000) {
      result.message = `${item.name}: Maximum 5000 pieces allowed`;
      return result;
    }
    if (item.quantity % 10 !== 0) {
      result.message = `${item.name}: Quantity must be in multiples of 10`;
      return result;
    }
  }

  result.isValid = true;
  result.message = 'Cart is valid';
  return result;
};

/**
 * Validate business registration form
 * @param {Object} data - Form data
 * @returns {Object} Validation errors
 */
export const validateBusinessForm = (data) => {
  const errors = {};

  if (!data.businessName || data.businessName.trim() === '') {
    errors.businessName = 'Business name is required';
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Valid email is required';
  }

  if (!data.phone || !isValidPhone(data.phone)) {
    errors.phone = 'Valid 10-digit phone number is required';
  }

  if (!data.gstNumber || !isValidGST(data.gstNumber)) {
    errors.gstNumber = 'Valid GST number is required';
  }

  if (!data.address || data.address.trim() === '') {
    errors.address = 'Address is required';
  }

  if (!data.city || data.city.trim() === '') {
    errors.city = 'City is required';
  }

  if (!data.state || data.state.trim() === '') {
    errors.state = 'State is required';
  }

  if (!data.pincode || !/^\d{6}$/.test(data.pincode)) {
    errors.pincode = 'Valid 6-digit pincode is required';
  }

  return errors;
};

/**
 * Validate checkout form
 * @param {Object} data - Checkout data
 * @returns {Object} Validation errors
 */
export const validateCheckoutForm = (data) => {
  const errors = {};

  if (!data.fullName || data.fullName.trim() === '') {
    errors.fullName = 'Full name is required';
  }

  if (!data.phone || !isValidPhone(data.phone)) {
    errors.phone = 'Valid phone number is required';
  }

  if (!data.address || data.address.trim() === '') {
    errors.address = 'Delivery address is required';
  }

  if (!data.city || data.city.trim() === '') {
    errors.city = 'City is required';
  }

  if (!data.state || data.state.trim() === '') {
    errors.state = 'State is required';
  }

  if (!data.pincode || !/^\d{6}$/.test(data.pincode)) {
    errors.pincode = 'Valid 6-digit pincode is required';
  }

  return errors;
};