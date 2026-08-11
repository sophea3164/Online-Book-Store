const { User, Book, Order, OrderItem, Review, Category } = require('../models');

// GET /api/admin/users
const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const count = await User.countDocuments(query);
        const rows = await User.find(query)
            .select('-password -reset_token -reset_token_expires')
            .limit(parseInt(limit))
            .skip(skip)
            .sort({ created_at: -1 });

        res.json({ success: true, data: rows, pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /api/admin/users/:id/status
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        user.is_active = !user.is_active;
        await user.save();
        res.json({ success: true, message: `User ${user.is_active ? 'activated' : 'deactivated'}` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/admin/reports/sales
const getSalesReport = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const query = { status: { $ne: 'cancelled' } };
        
        if (start_date && end_date) {
            query.created_at = { 
                $gte: new Date(start_date), 
                $lte: new Date(end_date + 'T23:59:59') 
            };
        }

        const orders = await Order.find(query)
            .populate({ path: 'items', populate: { path: 'book', select: 'title' } })
            .sort({ created_at: -1 });

        const totalRevenue = orders.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);
        const totalOrders = orders.length;

        // Sales by book
        const bookSales = {};
        orders.forEach(o => {
            if (!o.items) return;
            o.items.forEach(item => {
                if (!item.book) return; 
                const key = item.book._id;
                if (!bookSales[key]) bookSales[key] = { title: item.book.title, qty: 0, revenue: 0 };
                bookSales[key].qty += item.quantity;
                bookSales[key].revenue += item.quantity * parseFloat(item.unit_price);
            });
        });

        res.json({
            success: true,
            data: {
                total_revenue: parseFloat(totalRevenue.toFixed(2)),
                total_orders: totalOrders,
                book_sales: Object.entries(bookSales).map(([id, d]) => ({ book_id: id, ...d })).sort((a, b) => b.revenue - a.revenue)
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/admin/reports/revenue
const getRevenueReport = async (req, res) => {
    try {
        const monthly = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
                order_count: { $sum: 1 },
                revenue: { $sum: "$total_amount" }
            }},
            { $project: { month: "$_id", order_count: 1, revenue: 1, _id: 0 } },
            { $sort: { month: -1 } },
            { $limit: 12 }
        ]);

        res.json({ success: true, data: monthly });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/admin/reports/low-stock
const getLowStockReport = async (req, res) => {
    try {
        const { threshold = 10 } = req.query;
        const books = await Book.find({ stock: { $lte: parseInt(threshold) }, is_active: true })
            .populate('category', 'name')
            .sort({ stock: 1 });
        res.json({ success: true, data: books });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/admin/dashboard
const getDashboard = async (req, res) => {
    try {
        const totalBooks = await Book.countDocuments({ is_active: true });
        const totalCategories = await Category.countDocuments();
        const totalUsers = await User.countDocuments({ role: 'customer' });
        const totalOrders = await Order.countDocuments({ status: { $ne: 'cancelled' } });
        
        const revAgg = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: "$total_amount" } } }
        ]);
        const totalRevenue = revAgg.length ? revAgg[0].total : 0;

        const recentOrders = await Order.find()
            .populate('user', 'name email')
            .populate({ path: 'items', populate: { path: 'book', select: 'title' } })
            .sort({ created_at: -1 })
            .limit(5);

        const lowStockCount = await Book.countDocuments({ stock: { $lte: 10 }, is_active: true });

        res.json({
            success: true,
            data: {
                total_books: totalBooks,
                total_categories: totalCategories,
                total_users: totalUsers,
                total_orders: totalOrders,
                total_revenue: parseFloat(totalRevenue.toFixed(2)),
                low_stock_count: lowStockCount,
                recent_orders: recentOrders
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/admin/categories
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });

        const existing = await Category.findOne({ name });
        if (existing) return res.status(400).json({ success: false, message: 'Category already exists' });

        const category = await Category.create({ name });
        res.status(201).json({ success: true, data: category, message: 'Category created successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /api/admin/categories/:id
const updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });

        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

        const existing = await Category.findOne({ name, _id: { $ne: req.params.id } });
        if (existing) return res.status(400).json({ success: false, message: 'Category name already exists' });

        category.name = name;
        await category.save();
        res.json({ success: true, data: category, message: 'Category updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /api/admin/categories/:id
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

        const booksCount = await Book.countDocuments({ category_id: category._id });
        if (booksCount > 0) {
            return res.status(400).json({ success: false, message: `Cannot delete category. ${booksCount} book(s) are associated with it.` });
        }

        await Category.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Category deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getUsers, toggleUserStatus, getSalesReport, getRevenueReport, getLowStockReport, getDashboard,
    createCategory, updateCategory, deleteCategory
};
