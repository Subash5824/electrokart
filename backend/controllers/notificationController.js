const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications/my-notifications
// @access  Private
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      user: req.user.id,
      'channel.inApp.read': false
    }).sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      count: notifications.length,
      notifications 
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/read/:id
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }

    // Check if notification belongs to user
    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    notification.channel.inApp.read = true;
    notification.channel.inApp.readAt = new Date();
    await notification.save();

    res.json({ 
      success: true, 
      message: 'Notification marked as read',
      notification 
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, 'channel.inApp.read': false },
      { 
        'channel.inApp.read': true, 
        'channel.inApp.readAt': new Date() 
      }
    );

    res.json({ 
      success: true, 
      message: 'All notifications marked as read' 
    });

  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Get all notifications (for banker)
// @route   GET /api/notifications/all
// @access  Private/Banker
const getAllNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find()
      .populate('user', 'businessName email')
      .populate('banker', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments();

    res.json({
      success: true,
      notifications,
      page,
      pages: Math.ceil(total / limit),
      total
    });

  } catch (error) {
    console.error('Get all notifications error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }

    // Check if notification belongs to user or banker
    if (notification.user?.toString() !== req.user?.id && 
        notification.banker?.toString() !== req.banker?.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    await notification.deleteOne();

    res.json({ 
      success: true, 
      message: 'Notification deleted' 
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

module.exports = { 
  getMyNotifications, 
  markAsRead, 
  markAllAsRead,
  getAllNotifications,
  deleteNotification 
};