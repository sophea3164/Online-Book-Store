const Order = require('../models/Order');
const { generateKHQR, checkKHQRStatus } = require('../services/khqrService');

// POST /api/payments/khqr/generate
exports.generateQR = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, user_id: userId });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.payment_status === 'paid') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    const qrData = await generateKHQR({
      amount: order.total_amount,
      currency: 'USD',
      orderId: order._id.toString(),
    });

    // Store md5 for polling
    order.khqr_md5 = qrData.md5;
    order.payment_method = 'khqr';
    await order.save();

    res.json({
      success: true,
      qrString: qrData.qrString,
      md5: qrData.md5,
      deeplink: qrData.deeplink,
      amount: order.totalAmount,
      currency: 'USD',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/payments/khqr/status
exports.checkStatus = async (req, res) => {
  try {
    const { md5, orderId } = req.body;

    const statusData = await checkKHQRStatus(md5);
    const isPaid = statusData?.responseCode === 0;

    if (isPaid) {
      await Order.findByIdAndUpdate(orderId, {
        payment_status: 'paid',
        status: 'shipping',
        paid_at: new Date(),
      });
    }

    res.json({ paid: isPaid, data: statusData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};