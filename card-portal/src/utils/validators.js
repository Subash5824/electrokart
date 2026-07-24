// Validation utilities for the card portal
export const validateEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[6-9]\d{9}$/;
  return re.test(phone);
};

export const validateAmount = (amount) => {
  return amount > 0 && amount <= 1000000;
};

export const validatePinCode = (pincode) => {
  const re = /^\d{6}$/;
  return re.test(pincode);
};