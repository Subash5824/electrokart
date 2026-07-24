const Notification = require('../models/Notification');

const sendNotification = async (data) => {
  try {
    const notification = new Notification({
      user: data.user,
      banker: data.banker,
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority,
      relatedTo: data.relatedTo
    });

    await notification.save();

    if (data.channel?.email) {
      console.log(`📧 Email sent: ${data.title}`);
      notification.channel.email.sent = true;
      notification.channel.email.sentAt = new Date();
    }

    if (data.channel?.sms) {
      console.log(`📱 SMS sent: ${data.title}`);
      notification.channel.sms.sent = true;
      notification.channel.sms.sentAt = new Date();
    }

    if (data.channel?.inApp) {
      notification.channel.inApp = { sent: true, sentAt: new Date() };
    }

    await notification.save();
    return notification;

  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

const getUnreadNotifications = async (userId) => {
  return await Notification.find({
    user: userId,
    'channel.inApp.read': false
  }).sort({ createdAt: -1 });
};

const markAsRead = async (notificationId) => {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { 'channel.inApp.read': true, 'channel.inApp.readAt': new Date() },
    { new: true }
  );
};

module.exports = { sendNotification, getUnreadNotifications, markAsRead };