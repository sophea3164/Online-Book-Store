const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    quantity: { type: Number, required: true },
    unit_price: { type: Number, required: true }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

orderItemSchema.virtual('book', {
    ref: 'Book',
    localField: 'book_id',
    foreignField: '_id',
    justOne: true
});

orderItemSchema.virtual('order', {
    ref: 'Order',
    localField: 'order_id',
    foreignField: '_id',
    justOne: true
});

orderItemSchema.set('toObject', { virtuals: true });
orderItemSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('OrderItem', orderItemSchema);
