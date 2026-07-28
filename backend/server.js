const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// Import configuration
const connectDB = require("./config/db");
const config = require("./config/config");
const logger = require("./config/logger");

// Import middleware
const {
  notFound,
  errorHandler,
  validationError,
  duplicateKeyError,
  castError,
} = require("./middleware/errorMiddleware");

// Import routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cardRoutes = require("./routes/cardRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const billingRoutes = require("./routes/billingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const bankerRoutes = require("./routes/bankerRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Import utils
const { scheduleBilling } = require("./utils/billingScheduler");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://electrokart.vercel.app",
    "https://electrokart-75mh.onrender.com",
    "https://electrokart-git-main-subash5824s-projects.vercel.app",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// ===== ✅ ADD THIS DEBUG SECTION =====
console.log("🔍 Checking route imports:");
console.log("📁 Auth routes:", authRoutes ? "✅ Loaded" : "❌ Failed");
console.log("📁 Product routes:", productRoutes ? "✅ Loaded" : "❌ Failed");
console.log("📁 Order routes:", orderRoutes ? "✅ Loaded" : "❌ Failed");
// ... add more if needed

// ===== ✅ ROUTES =====
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/banker", bankerRoutes);
app.use("/api/notifications", notificationRoutes);

// Test route
app.get("/test", (req, res) => {
  res.json({ success: true, message: "Backend is reachable!" });
});

// Debug routes
app.get("/debug-routes", (req, res) => {
  const routes = [];
  app._router.stack.forEach((layer) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(", ").toUpperCase();
      routes.push(`${methods} ${layer.route.path}`);
    }
  });
  res.json({ routes });
});

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ElectroKart API is running",
    version: "1.0.0",
    environment: config.nodeEnv,
  });
});

// Apply error middleware
app.use(validationError);
app.use(duplicateKeyError);
app.use(castError);
app.use(notFound);
app.use(errorHandler);

// Start billing scheduler
scheduleBilling();

// Start server
const PORT = config.port || 5000;
app.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT}`);
  logger.info(`✅ Environment: ${config.nodeEnv}`);
  logger.info(`✅ API URL: http://localhost:${PORT}`);
});

module.exports = app;
