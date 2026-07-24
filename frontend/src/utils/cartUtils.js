// cartUtils.js - All cart-related calculations and helper functions

/**
 * Calculate total price for a single product based on quantity
 * @param {number} price - Price per piece
 * @param {number} quantity - Number of pieces
 * @returns {number} Total price
 */
export const calculateItemTotal = (price, quantity) => {
  return price * quantity;
};

/**
 * Calculate total pieces in cart
 * @param {Array} items - Cart items array
 * @returns {number} Total pieces count
 */
export const calculateTotalPieces = (items) => {
  return items.reduce((total, item) => total + item.quantity, 0);
};

/**
 * Calculate total amount for all cart items
 * @param {Array} items - Cart items array
 * @returns {number} Total amount
 */
export const calculateTotalAmount = (items) => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

/**
 * Apply bulk discount based on total pieces
 * @param {number} totalPieces - Total pieces in cart
 * @param {number} totalAmount - Total amount before discount
 * @returns {Object} Discount info
 */
export const applyBulkDiscount = (totalPieces, totalAmount) => {
  let discountPercent = 0;
  let discountAmount = 0;

  if (totalPieces >= 1000) {
    discountPercent = 10;
  } else if (totalPieces >= 500) {
    discountPercent = 7;
  } else if (totalPieces >= 250) {
    discountPercent = 5;
  } else if (totalPieces >= 100) {
    discountPercent = 2;
  }

  discountAmount = (totalAmount * discountPercent) / 100;
  const finalAmount = totalAmount - discountAmount;

  return {
    discountPercent,
    discountAmount,
    finalAmount,
    hasDiscount: discountPercent > 0
  };
};

/**
 * Calculate shipping charges based on total pieces
 * @param {number} totalPieces - Total pieces in cart
 * @returns {number} Shipping charges
 */
export const calculateShipping = (totalPieces) => {
  if (totalPieces >= 1000) {
    return 0; // Free shipping
  } else if (totalPieces >= 500) {
    return 150; // ₹150 shipping
  } else if (totalPieces >= 100) {
    return 250; // ₹250 shipping
  }
  return 0;
};

/**
 * Calculate tax amount (GST 18%)
 * @param {number} amount - Amount to calculate tax on
 * @returns {number} Tax amount
 */
export const calculateTax = (amount) => {
  const GST_RATE = 0.18; // 18% GST
  return amount * GST_RATE;
};

/**
 * Get cart summary with all calculations
 * @param {Array} items - Cart items array
 * @returns {Object} Complete cart summary
 */
export const getCartSummary = (items) => {
  const totalPieces = calculateTotalPieces(items);
  const subtotal = calculateTotalAmount(items);
  const discount = applyBulkDiscount(totalPieces, subtotal);
  const shipping = calculateShipping(totalPieces);
  const tax = calculateTax(discount.finalAmount);
  const grandTotal = discount.finalAmount + shipping + tax;

  return {
    items,
    totalPieces,
    subtotal,
    discount,
    shipping,
    tax,
    grandTotal,
    itemCount: items.length
  };
};

/**
 * Format price in Indian Rupees
 * @param {number} price - Price to format
 * @returns {string} Formatted price
 */
export const formatPrice = (price) => {  // ← This export was missing
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

/**
 * Validate cart minimum and maximum
 * @param {Array} items - Cart items
 * @returns {Object} Validation result
 */
export const validateCart = (items) => {  // ← This export was missing
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
 * Save cart to localStorage
 * @param {Object} cart - Cart object to save
 */
export const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem('electrokart_cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart:', error);
  }
};

/**
 * Load cart from localStorage
 * @returns {Object} Cart object or null
 */
export const loadCartFromStorage = () => {
  try {
    const cart = localStorage.getItem('electrokart_cart');
    return cart ? JSON.parse(cart) : null;
  } catch (error) {
    console.error('Error loading cart:', error);
    return null;
  }
};

/**
 * Clear cart from localStorage
 */
export const clearCartFromStorage = () => {
  try {
    localStorage.removeItem('electrokart_cart');
  } catch (error) {
    console.error('Error clearing cart:', error);
  }
};