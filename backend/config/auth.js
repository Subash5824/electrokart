module.exports = {
  // Password configuration
  password: {
    minLength: 6,
    hashRounds: 10,
    resetTokenExpire: 3600000 // 1 hour in milliseconds
  },
  
  // Token configuration
  token: {
    type: 'Bearer',
    headerName: 'Authorization',
    cookieName: 'token'
  },
  
  // Rate limiting for auth attempts
  rateLimit: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000 // 15 minutes
  },
  
  // Roles and permissions
  roles: {
    user: ['view_own', 'purchase', 'pay'],
    banker: ['view_customers', 'approve_transactions', 'view_reports'],
    manager: ['view_customers', 'approve_transactions', 'block_cards', 'view_reports'],
    admin: ['all']
  }
};