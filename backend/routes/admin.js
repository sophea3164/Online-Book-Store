const express = require('express');
const router = express.Router();
const { getUsers, toggleUserStatus, getSalesReport, getRevenueReport, getLowStockReport, getDashboard, createCategory, updateCategory, deleteCategory } = require('../controllers/adminController');
const { getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { getCategories } = require('../controllers/bookController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.use(authenticate, isAdmin);

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/users/:id/status', toggleUserStatus);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/reports/sales', getSalesReport);
router.get('/reports/revenue', getRevenueReport);
router.get('/reports/low-stock', getLowStockReport);
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;
