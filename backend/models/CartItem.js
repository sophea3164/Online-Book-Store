const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    quantity: { type: Number, default: 1, required: true }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

cartItemSchema.virtual('book', {
    ref: 'Book',
    localField: 'book_id',
    foreignField: '_id',
    justOne: true
});

cartItemSchema.virtual('user', {
    ref: 'User',
    localField: 'user_id',
    foreignField: '_id',
    justOne: true
});

cartItemSchema.set('toObject', { virtuals: true });
cartItemSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('CartItem', cartItemSchema);
