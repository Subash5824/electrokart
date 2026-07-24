const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Database configuration
  database: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/electrokart",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 100000ms
      socketTimeoutMS: 45000,
    },
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || "electrokart_super_secret_key_2026",
    expire: process.env.JWT_EXPIRE || "7d",
    cookieExpire: 7, // days
  },

  // Stripe configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    currency: "inr",
  },

  // Credit card configuration
  creditCard: {
    defaultLimit: 100000,
    minPaymentPercent: 5,
    minPaymentAmount: 500,
    interestRate: 3,
    gracePeriod: 15,
    lateFee: {
      below1000: 100,
      below5000: 250,
      below10000: 500,
      above10000: 1000,
    },
  },

  // Email configuration (for notifications)
  email: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || "noreply@electrokart.com",
  },

  // SMS configuration (for notifications)
  sms: {
    provider: process.env.SMS_PROVIDER || "twilio",
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromNumber: process.env.TWILIO_PHONE_NUMBER,
  },

  // Pagination defaults
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  },

  // Billing cycle configuration
  billing: {
    cycleDay: 1, // 1st of every month
    dueDay: 15, // 15th of every month
    interestCalculation: "daily", // 'daily' or 'monthly'
  },

  // Notification channels
  notifications: {
    email: true,
    sms: false, // Set to true when SMS service is configured
    inApp: true,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || "info",
    file: process.env.LOG_FILE || "logs/app.log",
  },
};
