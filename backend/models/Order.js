const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    total_amount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['processing', 'shipping', 'completed', 'cancelled'],
        default: 'processing'
    },
    shipping_address: { type: String, required: true },
    shipping_city: { type: String },
    shipping_phone: { type: String, required: true, maxlength: 20 },
    payment_method: {
        type: String,
        enum: ['cod', 'online'],
        default: 'cod'
    },
    payment_status: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    notes: { type: String },
    khqr_md5: { type: String },
    paid_at: { type: Date }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

orderSchema.virtual('user', {
    ref: 'User',
    localField: 'user_id',
    foreignField: '_id',
    justOne: true
});

orderSchema.virtual('items', {
    ref: 'OrderItem',
    localField: '_id',
    foreignField: 'order_id'
});

orderSchema.set('toObject', { virtuals: true });
orderSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        if (!ret.id) ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Order', orderSchema);
