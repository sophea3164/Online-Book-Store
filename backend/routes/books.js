const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getBooks, getBook, createBook, updateBook, deleteBook, getCategories, createCategory } = require('../controllers/bookController');
const { addReview, getReviews } = require('../controllers/reviewController');
const { authenticate, isAdmin } = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', getBooks);
router.get('/:id', getBook);
router.post('/', authenticate, isAdmin, upload.single('image'), createBook);
router.put('/:id', authenticate, isAdmin, upload.single('image'), updateBook);
router.delete('/:id', authenticate, isAdmin, deleteBook);

router.get('/:id/reviews', getReviews);
router.post('/:id/reviews', authenticate, addReview);

module.exports = router;
