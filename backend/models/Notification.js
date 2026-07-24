const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    banker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Banker",
    },

    type: {
      type: String,
      enum: [
        "bill_generated",
        "payment_due",
        "minimum_payment_due",
        "payment_received",
        "interest_charged",
        "transaction_approval",
        "transaction_declined",
        "unusual_activity",
        "credit_limit_alert",
        "card_blocked",
        "login",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    channel: {
      email: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
      },
      sms: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
      },
      inApp: {
        read: { type: Boolean, default: false },
        readAt: Date,
      },
    },

    relatedTo: {
      transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
      billingCycle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BillingCycle",
      },
      payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    },

    expiresAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
