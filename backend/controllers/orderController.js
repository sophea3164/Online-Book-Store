const { Order, OrderItem, Book, CartItem, User } = require('../models');

// POST /api/orders
const createOrder = async (req, res) => {
    try {
        const { shipping_address, shipping_city, shipping_phone, payment_method = 'cod', notes } = req.body;
        const cartItems = await CartItem.find({ user_id: req.user.id }).populate('book');

        if (!cartItems.length)
            return res.status(400).json({ success: false, message: 'Cart is empty' });

        let total = 0;
        for (const item of cartItems) {
            if (!item.book || !item.book.is_active || item.book.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for "${item.book ? item.book.title : 'Deleted Book'}"` });
            }
            total += item.quantity * item.book.price;
        }

        const order = await Order.create({
            user_id: req.user.id,
            total_amount: total.toFixed(2),
            status: 'processing',
            shipping_address, shipping_city, shipping_phone, payment_method, notes
        });

        for (const item of cartItems) {
            await OrderItem.create({
                order_id: order._id,
                book_id: item.book_id,
                quantity: item.quantity,
                unit_price: item.book.price
            });
            await Book.findByIdAndUpdate(item.book_id, { $inc: { stock: -item.quantity } });
        }

        await CartItem.deleteMany({ user_id: req.user.id });
        res.status(201).json({ success: true, data: order, message: 'Order placed successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/orders (user's own orders)
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user_id: req.user.id })
            .populate({
                path: 'items',
                populate: { path: 'book', select: 'title author image_url' }
            })
            .sort({ created_at: -1 });
            
        res.json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/orders/:id
const getOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user_id: req.user.id })
            .populate('user', 'name email phone')
            .populate({
                path: 'items',
                populate: { path: 'book', select: 'title author image_url price' }
            });
            
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        res.json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/admin/orders (admin)
const getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = {};
        if (status) query.status = status;
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const count = await Order.countDocuments(query);
        const rows = await Order.find(query)
            .populate('user', 'name email phone')
            .populate({ path: 'items', populate: { path: 'book', select: 'title' } })
            .sort({ created_at: -1 })
            .limit(parseInt(limit))
            .skip(skip);
            
        res.json({ success: true, data: rows, pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /api/admin/orders/:id/status (admin)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        
        order.status = status;
        await order.save();
        res.json({ success: true, data: order, message: 'Order status updated' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus };
