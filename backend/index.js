require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

const app = express();

// Connect to MongoDB
connectDB();

app.use('/api/payments', require('./routes/payments'));


// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/categories', (() => {
    const r = require('express').Router();
    r.get('/', require('./controllers/bookController').getCategories);
    return r;
})());

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: 'Online Book Store API is running', time: new Date() }));

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
