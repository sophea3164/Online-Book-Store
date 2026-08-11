const { Book, Category, Review } = require('../models');

// GET /api/books
const getBooks = async (req, res) => {
    try {
        const { search, category_id, author, page = 1, limit = 12, featured } = req.query;
        const query = { is_active: true };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } }
            ];
        }
        if (category_id) query.category_id = category_id;
        if (author) query.author = { $regex: author, $options: 'i' };
        if (featured === 'true') query.is_featured = true;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const count = await Book.countDocuments(query);
        const rows = await Book.find(query)
            .populate('category', 'name')
            .limit(parseInt(limit))
            .skip(skip)
            .sort({ created_at: -1 });

        res.json({
            success: true,
            data: rows,
            pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/books/:id
const getBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate('category', 'name')
            .populate({
                path: 'reviews',
                populate: { path: 'user', select: 'name' },
                options: { sort: { 'created_at': -1 }, limit: 20 }
            });
            
        if (!book || !book.is_active)
            return res.status(404).json({ success: false, message: 'Book not found' });
        res.json({ success: true, data: book });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/books (admin)
const createBook = async (req, res) => {
    try {
        const { title, author, category_id, price, original_price, stock, description, isbn, publisher, published_year, pages, language, is_featured } = req.body;
        const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;

        const book = await Book.create({
            title, author, category_id, price, original_price, stock, description,
            image_url, isbn, publisher, published_year, pages, language, is_featured
        });
        res.status(201).json({ success: true, data: book, message: 'Book created successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /api/books/:id (admin)
const updateBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

        const { title, author, category_id, price, original_price, stock, description, isbn, publisher, published_year, pages, language, is_featured, is_active } = req.body;
        const image_url = req.file ? `/uploads/${req.file.filename}` : (req.body.image_url || book.image_url);

        Object.assign(book, { title, author, category_id, price, original_price, stock, description, image_url, isbn, publisher, published_year, pages, language, is_featured, is_active });
        await book.save();
        
        res.json({ success: true, data: book, message: 'Book updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /api/books/:id (admin)
const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
        book.is_active = false;
        await book.save();
        res.json({ success: true, message: 'Book deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/categories
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort('name');
        res.json({ success: true, data: categories });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/categories (admin)
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const cat = await Category.create({ name });
        res.status(201).json({ success: true, data: cat });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getBooks, getBook, createBook, updateBook, deleteBook, getCategories, createCategory };
