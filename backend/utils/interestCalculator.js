const calculateInterest = (principal, days, rate = 3) => {
  const monthlyRate = rate / 100;
  const dailyRate = monthlyRate / 30;
  return principal * dailyRate * days;
};

const calculateMinimumPayment = (balance) => {
  return Math.max(500, balance * 0.05);
};

const calculateLateFee = (balance) => {
  if (balance < 1000) return 100;
  if (balance < 5000) return 250;
  if (balance < 10000) return 500;
  return 1000;
};

module.exports = { calculateInterest, calculateMinimumPayment, calculateLateFee };