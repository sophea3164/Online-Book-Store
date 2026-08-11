const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrder } = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrder);

module.exports = router;
