const Banker = require("../models/Banker");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const CreditCard = require("../models/CreditCard");
const Notification = require("../models/Notification");
const BillingCycle = require("../models/BillingCycle"); // ✅ ADDED
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendNotification } = require("../utils/notificationSender");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// @desc    Register a new banker (admin only)
// @route   POST /api/banker/register
// @access  Private/Admin
const registerBanker = async (req, res) => {
  try {
    const { name, email, password, role, department, permissions } = req.body;

    // Check if banker exists
    const bankerExists = await Banker.findOne({ email });
    if (bankerExists) {
      return res.status(400).json({
        success: false,
        message: "Banker already exists",
      });
    }

    // Generate banker ID
    const bankerId = `BNK${Date.now().toString().slice(-8)}`;

    const banker = await Banker.create({
      bankerId,
      name,
      email,
      password,
      role: role || "officer",
      department: department || "approval",
      permissions: permissions || ["view_customers", "approve_transactions"],
      createdBy: req.banker.id,
    });

    res.status(201).json({
      success: true,
      message: "Banker registered successfully",
      banker: {
        id: banker._id,
        bankerId: banker.bankerId,
        name: banker.name,
        email: banker.email,
        role: banker.role,
        department: banker.department,
      },
    });
  } catch (error) {
    console.error("Register banker error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Login banker
// @route   POST /api/banker/login
// @access  Public
const loginBanker = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 Login attempt for:", email);
    console.log("📝 Password received:", password);

    const banker = await Banker.findOne({ email }).select("+password");

    if (!banker) {
      console.log("❌ Banker not found");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    console.log("✅ Banker found:", banker.email);
    console.log("🔑 Stored hash:", banker.password);

    // ✅ TRY DIRECT bcrypt.compare
    const isMatch = await bcrypt.compare(password, banker.password);
    console.log("🔐 bcrypt.compare result:", isMatch);

    // ✅ ALSO TRY the model method
    const isMatchModel = await banker.comparePassword(password);
    console.log("🔐 comparePassword result:", isMatchModel);

    if (!isMatch && !isMatchModel) {
      console.log("❌ Both password checks FAILED");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    console.log("✅ Password matches!");

    const token = generateToken(banker._id);
    banker.lastLogin = new Date();
    await banker.save();

    res.json({
      success: true,
      token,
      banker: {
        id: banker._id,
        bankerId: banker.bankerId,
        name: banker.name,
        email: banker.email,
        role: banker.role,
        department: banker.department,
        permissions: banker.permissions,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get pending transactions
// @route   GET /api/banker/pending-transactions
// @access  Private/Banker
const getPendingTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ status: "pending" })
      .populate("user", "businessName email phone")
      .populate("creditCard")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments({ status: "pending" });

    res.json({
      success: true,
      count: transactions.length,
      transactions,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error("Get pending transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Approve transaction
// @route   POST /api/banker/approve-transaction
// @access  Private/Banker
const approveTransaction = async (req, res) => {
  try {
    const { transactionId, comments } = req.body;

    const transaction = await Transaction.findById(transactionId).populate(
      "user"
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (transaction.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Transaction already processed",
      });
    }

    const creditCard = await CreditCard.findById(transaction.creditCard);
    if (!creditCard) {
      return res.status(404).json({
        success: false,
        message: "Credit card not found",
      });
    }

    // Check available balance again
    if (creditCard.availableBalance < transaction.amount) {
      transaction.status = "declined";
      transaction.bankerApproval = {
        approvedBy: req.banker.id,
        approvedAt: new Date(),
        comments: "Insufficient balance at time of approval",
      };
      await transaction.save();

      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    // Update credit card
    creditCard.availableBalance -= transaction.amount;
    creditCard.currentOutstanding += transaction.amount;
    await creditCard.save();

    // Update transaction
    transaction.status = "approved";
    transaction.bankerApproval = {
      approvedBy: req.banker.id,
      approvedAt: new Date(),
      comments: comments || "Approved by banker",
    };
    transaction.remainingBalance = creditCard.availableBalance;
    await transaction.save();

    // Send notification to customer
    await sendNotification({
      user: transaction.user._id,
      type: "transaction_approval",
      title: "Transaction Approved",
      message: `Your purchase of ₹${transaction.amount} has been approved. Remaining balance: ₹${creditCard.availableBalance}`,
      priority: "medium",
      channel: { email: true, sms: true, inApp: true },
      relatedTo: { transaction: transaction._id },
    });

    console.log(
      `Transaction ${transaction.transactionId} approved by banker ${req.banker.name}`
    );

    res.json({
      success: true,
      message: "Transaction approved",
      transaction: {
        id: transaction._id,
        transactionId: transaction.transactionId,
        status: transaction.status,
        remainingBalance: creditCard.availableBalance,
      },
    });
  } catch (error) {
    console.error("Approve transaction error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Decline transaction
// @route   POST /api/banker/decline-transaction
// @access  Private/Banker
const declineTransaction = async (req, res) => {
  try {
    const { transactionId, reason } = req.body;

    const transaction = await Transaction.findById(transactionId).populate(
      "user"
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (transaction.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Transaction already processed",
      });
    }

    transaction.status = "declined";
    transaction.bankerApproval = {
      approvedBy: req.banker.id,
      approvedAt: new Date(),
      comments: reason || "Declined by banker",
    };
    await transaction.save();

    // Send notification to customer
    await sendNotification({
      user: transaction.user._id,
      type: "transaction_declined",
      title: "Transaction Declined",
      message: `Your transaction of ₹${
        transaction.amount
      } was declined. Reason: ${reason || "Not specified"}`,
      priority: "high",
      channel: { email: true, sms: true, inApp: true },
      relatedTo: { transaction: transaction._id },
    });

    res.json({
      success: true,
      message: "Transaction declined",
    });
  } catch (error) {
    console.error("Decline transaction error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get all customers
// @route   GET /api/banker/customers
// @access  Private/Banker
const getCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const customers = await User.find({ role: "user" })
      .select("-password")
      .populate("creditCard")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ role: "user" });

    res.json({
      success: true,
      count: customers.length,
      customers,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error("Get customers error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get customer details - FIXED VERSION
// @route   GET /api/banker/customer/:id
// @access  Private/Banker
const getCustomerDetails = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id)
      .select("-password")
      .populate("creditCard");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Get customer transactions
    const transactions = await Transaction.find({ user: customer._id })
      .sort({ createdAt: -1 })
      .limit(50);

    // Get customer billing cycles
    const bills = await BillingCycle.find({ user: customer._id })
      .sort({ cycleYear: -1, cycleMonth: -1 })
      .limit(12);

    res.json({
      success: true,
      customer,
      transactions,
      bills,
    });
  } catch (error) {
    console.error("Get customer details error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Approve credit card
// @route   PUT /api/banker/approve-card/:userId
// @access  Private/Banker
const approveCreditCard = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.creditCard) {
      return res.status(400).json({
        success: false,
        message: "User has not applied for credit card",
      });
    }

    user.isCreditApproved = true;
    user.accountStatus = "active";
    user.approvedBy = req.banker.id;
    user.approvedAt = new Date();
    await user.save();

    const creditCard = await CreditCard.findById(user.creditCard);
    if (creditCard) {
      creditCard.status = "active";
      await creditCard.save();
    }

    await sendNotification({
      user: userId,
      type: "credit_limit_alert",
      title: "Credit Card Approved",
      message: `Your credit card application has been approved. Your credit limit is ₹70,000`,
      priority: "high",
      channel: { email: true, sms: true, inApp: true },
    });

    res.json({
      success: true,
      message: "Credit card approved successfully",
    });
  } catch (error) {
    console.error("Approve credit card error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Block customer card
// @route   PUT /api/banker/block-card/:userId
// @access  Private/Banker
const blockCustomerCard = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const creditCard = await CreditCard.findById(user.creditCard);
    if (!creditCard) {
      return res.status(404).json({
        success: false,
        message: "Credit card not found",
      });
    }

    creditCard.status = "blocked";
    await creditCard.save();

    user.accountStatus = "blocked";
    await user.save();

    await sendNotification({
      user: userId,
      type: "card_blocked",
      title: "Card Blocked",
      message: `Your credit card has been blocked. Reason: ${
        reason || "Banker action"
      }`,
      priority: "urgent",
      channel: { email: true, sms: true, inApp: true },
    });

    res.json({
      success: true,
      message: "Card blocked successfully",
    });
  } catch (error) {
    console.error("Block card error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get banker dashboard stats
// @route   GET /api/banker/stats
// @access  Private/Banker
const getBankerStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: "user" });
    const activeCards = await CreditCard.countDocuments({ status: "active" });
    const pendingTransactions = await Transaction.countDocuments({
      status: "pending",
    });
    const pendingApprovals = await User.countDocuments({
      creditCard: { $exists: true },
      isCreditApproved: false,
    });

    // Today's transactions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTransactions = await Transaction.countDocuments({
      createdAt: { $gte: today },
    });

    // Total transaction volume
    const transactionVolume = await Transaction.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalCustomers,
        activeCards,
        pendingTransactions,
        pendingApprovals,
        todayTransactions,
        totalTransactionVolume: transactionVolume[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Get banker stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  registerBanker,
  loginBanker,
  getPendingTransactions,
  approveTransaction,
  declineTransaction,
  getCustomers,
  getCustomerDetails,
  approveCreditCard,
  blockCustomerCard,
  getBankerStats,
};
