const express = require('express');
const router = express.Router();
const { generateQR, checkStatus } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.post('/khqr/generate', authenticate, generateQR);
router.post('/khqr/status', authenticate, checkStatus);

module.exports = router;