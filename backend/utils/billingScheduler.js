const cron = require('node-cron');
const BillingCycle = require('../models/BillingCycle');
const User = require('../models/User');
const CreditCard = require('../models/CreditCard');
const Transaction = require('../models/Transaction');
const { sendNotification } = require('./notificationSender');
const { calculateInterest, calculateLateFee } = require('./interestCalculator');

// Run at midnight on the 1st of every month
const scheduleBilling = () => {
  console.log('📅 Billing scheduler initialized');
  
  cron.schedule('0 0 1 * *', async () => {
    console.log('📊 Starting monthly billing cycle...');
    
    try {
      const users = await User.find({ 
        isCreditApproved: true,
        accountStatus: 'active'
      });
      
      console.log(`Found ${users.length} active users for billing`);
      
      let successCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          await generateMonthlyBill(user._id);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Error generating bill for user ${user._id}:`, error.message);
          
          // Log error for monitoring
          await logBillingError(user._id, error.message);
        }
      }
      
      console.log(`✅ Billing completed - Success: ${successCount}, Errors: ${errorCount}`);
      
      // Send summary to admin bankers
      await sendBillingSummary(successCount, errorCount);
      
    } catch (error) {
      console.error('❌ Billing cycle error:', error);
      
      // Send alert to admins
      await sendAdminAlert('Billing cycle failed', error.message);
    }
  });

  // Also run daily to check for overdue payments
  cron.schedule('0 9 * * *', async () => {
    console.log('🔔 Checking for overdue payments...');
    await checkOverduePayments();
  });
};

// Generate monthly bill for a user
const generateMonthlyBill = async (userId) => {
  console.log(`Generating bill for user: ${userId}`);
  
  const creditCard = await CreditCard.findOne({ user: userId });
  if (!creditCard) {
    throw new Error('Credit card not found');
  }

  const now = new Date();
  const lastMonth = new Date(now);
  lastMonth.setMonth(now.getMonth() - 1);
  
  const startOfMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
  const endOfMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0, 23, 59, 59);

  // Get all transactions for the month
  const transactions = await Transaction.find({
    user: userId,
    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    status: { $in: ['approved', 'completed'] }
  });

  console.log(`Found ${transactions.length} transactions for billing`);

  const totalPurchases = transactions
    .filter(t => t.type === 'purchase')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPayments = transactions
    .filter(t => t.type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const previousBalance = creditCard.lastStatementBalance || 0;
  let statementBalance = previousBalance + totalPurchases - totalPayments;
  
  // Calculate interest on unpaid balance from previous month
  let interestCharged = 0;
  if (previousBalance > 0) {
    // Check if previous bill was paid
    const previousBill = await BillingCycle.findOne({
      user: userId,
      cycleMonth: lastMonth.getMonth(),
      cycleYear: lastMonth.getFullYear()
    });
    
    if (previousBill && previousBill.paymentStatus !== 'paid') {
      const daysOverdue = Math.ceil((now - previousBill.dueDate) / (1000 * 60 * 60 * 24));
      if (daysOverdue > 0) {
        interestCharged = calculateInterest(previousBalance, daysOverdue);
        statementBalance += interestCharged;
        
        // Record interest transaction
        await Transaction.create({
          user: userId,
          creditCard: creditCard._id,
          type: 'interest',
          amount: interestCharged,
          description: `Interest charged on unpaid balance`,
          status: 'completed',
          remainingBalance: creditCard.availableBalance
        });
      }
    }
  }

  const minimumPayment = Math.max(500, Math.round(statementBalance * 0.05));
  const dueDate = new Date(now.getFullYear(), now.getMonth(), 15);

  // Check if bill already exists for this period
  let billingCycle = await BillingCycle.findOne({
    user: userId,
    cycleMonth: lastMonth.getMonth(),
    cycleYear: lastMonth.getFullYear()
  });

  if (billingCycle) {
    // Update existing bill
    billingCycle.totalPurchases = totalPurchases;
    billingCycle.totalPayments = totalPayments;
    billingCycle.interestCharged = interestCharged;
    billingCycle.statementBalance = statementBalance;
    billingCycle.minimumPayment = minimumPayment;
    billingCycle.dueDate = dueDate;
    billingCycle.transactions = transactions.map(t => t._id);
    await billingCycle.save();
  } else {
    // Create new billing cycle
    billingCycle = new BillingCycle({
      user: userId,
      creditCard: creditCard._id,
      cycleMonth: lastMonth.getMonth(),
      cycleYear: lastMonth.getFullYear(),
      statementDate: now,
      dueDate,
      previousBalance,
      totalPurchases,
      totalPayments,
      interestCharged,
      statementBalance,
      minimumPayment,
      transactions: transactions.map(t => t._id)
    });

    await billingCycle.save();
  }

  // Update credit card
  creditCard.lastStatementBalance = statementBalance;
  creditCard.minimumPayment = minimumPayment;
  creditCard.dueDate = dueDate;
  await creditCard.save();

  // Send notification to customer
  await sendNotification({
    user: userId,
    type: 'bill_generated',
    title: 'Monthly Credit Card Bill Generated',
    message: `Your bill for ${lastMonth.toLocaleString('default', { month: 'long' })} is ₹${statementBalance}. Minimum payment ₹${minimumPayment} due by ${dueDate.toDateString()}`,
    priority: 'high',
    channel: { email: true, sms: true, inApp: true },
    relatedTo: { billingCycle: billingCycle._id }
  });

  return billingCycle;
};

// Check for overdue payments
const checkOverduePayments = async () => {
  try {
    const today = new Date();
    
    const overdueBills = await BillingCycle.find({
      dueDate: { $lt: today },
      paymentStatus: { $in: ['unpaid', 'partial'] },
      isClosed: false
    }).populate('user');

    console.log(`Found ${overdueBills.length} overdue bills`);

    for (const bill of overdueBills) {
      const daysOverdue = Math.ceil((today - bill.dueDate) / (1000 * 60 * 60 * 24));
      
      // Send reminder
      await sendNotification({
        user: bill.user._id,
        type: 'payment_due',
        title: 'Payment Overdue',
        message: `Your payment of ₹${bill.minimumPayment} is ${daysOverdue} days overdue. Please pay immediately to avoid additional charges.`,
        priority: 'urgent',
        channel: { email: true, sms: true, inApp: true },
        relatedTo: { billingCycle: bill._id }
      });

      // Apply late fee if more than 30 days overdue
      if (daysOverdue > 30 && !bill.lateFeeApplied) {
        const lateFee = calculateLateFee(bill.statementBalance);
        
        await Transaction.create({
          user: bill.user._id,
          creditCard: bill.creditCard,
          type: 'fee',
          amount: lateFee,
          description: 'Late payment fee',
          status: 'completed',
          remainingBalance: bill.statementBalance + lateFee
        });

        bill.lateFeeApplied = true;
        await bill.save();
      }
    }
  } catch (error) {
    console.error('Error checking overdue payments:', error);
  }
};

// Log billing errors
const logBillingError = async (userId, error) => {
  // Implement error logging (could save to database)
  console.error(`Billing error for user ${userId}:`, error);
};

// Send billing summary to admins
const sendBillingSummary = async (successCount, errorCount) => {
  // Implement admin notification
  console.log(`Billing summary - Success: ${successCount}, Errors: ${errorCount}`);
};

// Send admin alert
const sendAdminAlert = async (title, message) => {
  // Implement admin alert system
  console.error(`ADMIN ALERT - ${title}: ${message}`);
};

module.exports = { 
  scheduleBilling, 
  generateMonthlyBill,
  checkOverduePayments 
};