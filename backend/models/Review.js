const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

reviewSchema.virtual('user', {
    ref: 'User',
    localField: 'user_id',
    foreignField: '_id',
    justOne: true
});

reviewSchema.virtual('book', {
    ref: 'Book',
    localField: 'book_id',
    foreignField: '_id',
    justOne: true
});

reviewSchema.set('toObject', { virtuals: true });
reviewSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Review', reviewSchema);
