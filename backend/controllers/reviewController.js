const { Review, Book, OrderItem, Order } = require('../models');

// POST /api/books/:id/reviews
const addReview = async (req, res) => {
    try {
        const book_id = req.params.id;
        const { rating, comment } = req.body;

        // Check if user has purchased this book
        // In Mongoose with separate models, this takes a slightly more complex aggregate/lookup or two queries.
        // We will fetch orders for the user that are completed
        const completedOrders = await Order.find({ user_id: req.user.id, status: 'completed' }).select('_id');
        const orderIds = completedOrders.map(o => o._id);
        
        const purchased = await OrderItem.findOne({ 
            book_id, 
            order_id: { $in: orderIds } 
        });
        
        if (!purchased)
            return res.status(403).json({ success: false, message: 'You can only review books you have purchased and received' });

        // Check for duplicate review
        const existing = await Review.findOne({ user_id: req.user.id, book_id });
        if (existing)
            return res.status(409).json({ success: false, message: 'You have already reviewed this book' });

        const review = await Review.create({ user_id: req.user.id, book_id, rating, comment });

        // Update book avg_rating
        const allReviews = await Review.find({ book_id });
        const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
        await Book.findByIdAndUpdate(book_id, { avg_rating: avg.toFixed(2), review_count: allReviews.length });

        res.status(201).json({ success: true, data: review, message: 'Review submitted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/books/:id/reviews
const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ book_id: req.params.id })
            .populate('user', 'name')
            .sort({ created_at: -1 });
        res.json({ success: true, data: reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { addReview, getReviews };
