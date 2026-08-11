const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');

const generateToken = (user) =>
    jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

// POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ success: false, message: 'Name, email and password are required' });

        const existing = await User.findOne({ email });
        if (existing)
            return res.status(409).json({ success: false, message: 'Email already registered' });

        const hashed = await bcrypt.hash(password, 12);
        const user = await User.create({ name, email, phone, password: hashed });
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address, city: user.city }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ success: false, message: 'Email and password required' });

        const user = await User.findOne({ email });
        if (!user || !user.is_active)
            return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid)
            return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const token = generateToken(user);
        res.json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address, city: user.city }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ success: false, message: 'Email not found' });

        const token = crypto.randomBytes(32).toString('hex');
        user.reset_token = token;
        user.reset_token_expires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        res.json({
            success: true,
            message: 'Password reset token generated',
            reset_token: token
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
    try {
        const { token, new_password } = req.body;
        const user = await User.findOne({ reset_token: token });

        if (!user || !user.reset_token_expires || user.reset_token_expires < new Date())
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });

        user.password = await bcrypt.hash(new_password, 12);
        user.reset_token = undefined;
        user.reset_token_expires = undefined;
        await user.save();

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/auth/me
const getMe = async (req, res) => {
    res.json({
        success: true,
        user: { id: req.user.id, name: req.user.name, email: req.user.email, phone: req.user.phone, role: req.user.role, address: req.user.address, city: req.user.city }
    });
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
    try {
        const { name, phone, address, city } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.name = name || user.name;
        user.phone = phone !== undefined ? phone : user.phone;
        user.address = address !== undefined ? address : user.address;
        user.city = city !== undefined ? city : user.city;
        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address, city: user.city }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { register, login, forgotPassword, resetPassword, getMe, updateProfile };
