const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true, maxlength: 255 },
    author: { type: String, required: true, maxlength: 150 },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    price: { type: Number, required: true },
    original_price: { type: Number },
    stock: { type: Number, default: 0 },
    description: { type: String },
    image_url: { type: String, maxlength: 500 },
    avg_rating: { type: Number, default: 0 },
    review_count: { type: Number, default: 0 },
    isbn: { type: String, maxlength: 20 },
    publisher: { type: String, maxlength: 150 },
    published_year: { type: Number },
    pages: { type: Number },
    language: { type: String, default: 'Khmer', maxlength: 50 },
    is_featured: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

bookSchema.virtual('category', {
    ref: 'Category',
    localField: 'category_id',
    foreignField: '_id',
    justOne: true
});

bookSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'book_id'
});

bookSchema.set('toObject', { virtuals: true });
bookSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        if (!ret.id) ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Book', bookSchema);
