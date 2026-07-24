module.exports = {
  // Transaction types
  TRANSACTION_TYPES: {
    PURCHASE: 'purchase',
    PAYMENT: 'payment',
    INTEREST: 'interest',
    FEE: 'fee',
    REFUND: 'refund'
  },
  
  // Transaction status
  TRANSACTION_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    DECLINED: 'declined',
    COMPLETED: 'completed',
    FAILED: 'failed'
  },
  
  // Card status
  CARD_STATUS: {
    ACTIVE: 'active',
    BLOCKED: 'blocked',
    EXPIRED: 'expired'
  },
  
  // Card types
  CARD_TYPES: {
    VISA: 'visa',
    MASTERCARD: 'mastercard',
    RUPAY: 'rupee'
  },
  
  // Payment status
  PAYMENT_STATUS: {
    UNPAID: 'unpaid',
    PARTIAL: 'partial',
    PAID: 'paid',
    OVERDUE: 'overdue'
  },
  
  // User roles
  USER_ROLES: {
    USER: 'user',
    ADMIN: 'admin'
  },
  
  // Banker roles
  BANKER_ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    OFFICER: 'officer'
  },
  
  // Banker departments
  BANKER_DEPARTMENTS: {
    CREDIT: 'credit',
    APPROVAL: 'approval',
    COLLECTIONS: 'collections',
    SUPPORT: 'support'
  },
  
  // Notification types
  NOTIFICATION_TYPES: {
    BILL_GENERATED: 'bill_generated',
    PAYMENT_DUE: 'payment_due',
    MINIMUM_PAYMENT_DUE: 'minimum_payment_due',
    PAYMENT_RECEIVED: 'payment_received',
    INTEREST_CHARGED: 'interest_charged',
    TRANSACTION_APPROVAL: 'transaction_approval',
    TRANSACTION_DECLINED: 'transaction_declined',
    UNUSUAL_ACTIVITY: 'unusual_activity',
    CREDIT_LIMIT_ALERT: 'credit_limit_alert',
    CARD_BLOCKED: 'card_blocked'
  },
  
  // Notification priorities
  NOTIFICATION_PRIORITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  },
  
  // Permission constants
  PERMISSIONS: {
    VIEW_CUSTOMERS: 'view_customers',
    APPROVE_TRANSACTIONS: 'approve_transactions',
    BLOCK_CARDS: 'block_cards',
    GENERATE_REPORTS: 'generate_reports',
    SEND_NOTIFICATIONS: 'send_notifications',
    MANAGE_BANKERS: 'manage_bankers'
  },
  
  // API endpoints
  API_ENDPOINTS: {
    AUTH: '/api/auth',
    PRODUCTS: '/api/products',
    ORDERS: '/api/orders',
    CARDS: '/api/cards',
    TRANSACTIONS: '/api/transactions',
    BILLING: '/api/billing',
    PAYMENTS: '/api/payments',
    BANKER: '/api/banker',
    NOTIFICATIONS: '/api/notifications'
  },
  
  // HTTP status codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
  },
  
  // Messages
  MESSAGES: {
    AUTH: {
      LOGIN_SUCCESS: 'Login successful',
      LOGOUT_SUCCESS: 'Logout successful',
      REGISTER_SUCCESS: 'Registration successful',
      INVALID_CREDENTIALS: 'Invalid email or password',
      TOKEN_MISSING: 'No token provided',
      TOKEN_INVALID: 'Invalid token',
      TOKEN_EXPIRED: 'Token expired'
    },
    CARD: {
      APPLY_SUCCESS: 'Card application submitted',
      APPROVE_SUCCESS: 'Card approved',
      BLOCK_SUCCESS: 'Card blocked',
      NOT_FOUND: 'Card not found',
      ALREADY_EXISTS: 'Card already exists'
    },
    TRANSACTION: {
      PENDING: 'Transaction pending approval',
      APPROVED: 'Transaction approved',
      DECLINED: 'Transaction declined',
      INSUFFICIENT_BALANCE: 'Insufficient balance'
    },
    PAYMENT: {
      SUCCESS: 'Payment successful',
      FAILED: 'Payment failed',
      PROCESSING: 'Payment processing'
    }
  }
};