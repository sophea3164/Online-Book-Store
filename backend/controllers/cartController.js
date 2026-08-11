const { CartItem, Book } = require('../models');

// GET /api/cart
const getCart = async (req, res) => {
    try {
        const items = await CartItem.find({ user_id: req.user.id })
            .populate('book', 'title author price image_url stock is_active');
            
        // Filter out items where book might have been deleted or deactivated
        const validItems = items.filter(i => i.book && i.book.is_active);
        
        let total = validItems.reduce((sum, i) => sum + i.quantity * i.book.price, 0);
        res.json({ success: true, data: { items: validItems, total: parseFloat(total.toFixed(2)) } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/cart
const addToCart = async (req, res) => {
    try {
        const { book_id, quantity = 1 } = req.body;
        const book = await Book.findById(book_id);
        if (!book || !book.is_active)
            return res.status(404).json({ success: false, message: 'Book not found' });
        if (book.stock < quantity)
            return res.status(400).json({ success: false, message: 'Insufficient stock' });

        let item = await CartItem.findOne({ user_id: req.user.id, book_id });
        if (item) {
            item.quantity += parseInt(quantity);
            await item.save();
        } else {
            item = await CartItem.create({ user_id: req.user.id, book_id, quantity });
        }
        res.json({ success: true, data: item, message: 'Added to cart' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /api/cart/:id
const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const item = await CartItem.findOne({ _id: req.params.id, user_id: req.user.id });
        if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });

        if (parseInt(quantity) <= 0) {
            await CartItem.findByIdAndDelete(req.params.id);
            return res.json({ success: true, message: 'Item removed from cart' });
        }
        item.quantity = parseInt(quantity);
        await item.save();
        res.json({ success: true, data: item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /api/cart/:id
const removeFromCart = async (req, res) => {
    try {
        const item = await CartItem.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
        if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });
        res.json({ success: true, message: 'Item removed from cart' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /api/cart (clear all)
const clearCart = async (req, res) => {
    try {
        await CartItem.deleteMany({ user_id: req.user.id });
        res.json({ success: true, message: 'Cart cleared' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
