const User = require("../models/User");
const CreditCard = require("../models/CreditCard");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/config");
const { sendNotification } = require("../utils/notificationSender");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expire,
  });
};

// ============= REGISTER USER =============
const registerUser = async (req, res) => {
  try {
    const { businessName, email, phone, gstNumber, password } = req.body;

    if (!businessName || !email || !phone || !gstNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const userExists = await User.findOne({
      $or: [{ email }, { phone }, { gstNumber }],
    });

    if (userExists) {
      let message = "User already exists with this ";
      if (userExists.email === email) message += "email";
      else if (userExists.phone === phone) message += "phone number";
      else if (userExists.gstNumber === gstNumber) message += "GST number";

      return res.status(400).json({
        success: false,
        message,
      });
    }

    const user = await User.create({
      businessName,
      email,
      phone,
      gstNumber,
      password,
      role: "user",
      accountStatus: "pending",
      creditLimit: config.creditCard.defaultLimit,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        businessName: user.businessName,
        email: user.email,
        phone: user.phone,
        gstNumber: user.gstNumber,
        role: user.role,
        accountStatus: user.accountStatus,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// ============= LOGIN USER =============
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 Login attempt:", email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // ✅ FIXED: Use '+password' to include the password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log("✅ User found:", user.businessName);

    // Check if account is active
    if (user.accountStatus === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Please contact support.",
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    console.log("🔐 Password match:", isPasswordMatch);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Get credit card info if exists
    let creditCard = null;
    if (user.creditCard) {
      creditCard = await CreditCard.findById(user.creditCard).select("-cvv");
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Send login notification
    try {
      await sendNotification({
        user: user._id,
        type: "login",
        title: "New Login Detected",
        message: `New login to your account at ${new Date().toLocaleString()}`,
        priority: "low",
        channel: { email: false, sms: false, inApp: true },
      });
    } catch (notifError) {
      console.log("Login notification not sent");
    }

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        businessName: user.businessName,
        email: user.email,
        phone: user.phone,
        gstNumber: user.gstNumber,
        role: user.role,
        accountStatus: user.accountStatus,
        isCreditApproved: user.isCreditApproved,
        creditLimit: user.creditLimit,
        creditCard: creditCard
          ? {
              id: creditCard._id,
              cardNumber: creditCard.cardNumber,
              cardType: creditCard.cardType,
              status: creditCard.status,
              availableBalance: creditCard.availableBalance,
              currentOutstanding: creditCard.currentOutstanding,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: config.nodeEnv === "development" ? error.message : undefined,
    });
  }
};

// ============= GET PROFILE =============
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").populate({
      path: "creditCard",
      select: "-cvv",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        businessName: user.businessName,
        email: user.email,
        phone: user.phone,
        gstNumber: user.gstNumber,
        role: user.role,
        accountStatus: user.accountStatus,
        isCreditApproved: user.isCreditApproved,
        creditLimit: user.creditLimit,
        address: user.address,
        createdAt: user.createdAt,
        creditCard: user.creditCard
          ? {
              id: user.creditCard._id,
              cardNumber: user.creditCard.cardNumber,
              cardType: user.creditCard.cardType,
              status: user.creditCard.status,
              availableBalance: user.creditCard.availableBalance,
              currentOutstanding: user.creditCard.currentOutstanding,
              creditLimit: user.creditCard.creditLimit,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ============= UPDATE PROFILE =============
const updateProfile = async (req, res) => {
  try {
    const { businessName, phone, address } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (businessName) user.businessName = businessName;
    if (phone) user.phone = phone;
    if (address) {
      user.address = {
        ...user.address,
        ...address,
      };
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        businessName: updatedUser.businessName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ============= CHANGE PASSWORD =============
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ============= FORGOT PASSWORD =============
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET + user.password,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Password reset email sent",
      resetToken,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ============= RESET PASSWORD =============
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide token and new password",
      });
    }

    const decoded = jwt.decode(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ============= LOGOUT =============
const logoutUser = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ============= DELETE ACCOUNT =============
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const creditCard = await CreditCard.findById(user.creditCard);
    if (creditCard && creditCard.currentOutstanding > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete account with outstanding balance",
      });
    }

    user.accountStatus = "deleted";
    await user.save();

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ============= VERIFY EMAIL =============
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isEmailVerified = true;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logoutUser,
  deleteAccount,
  verifyEmail,
};
