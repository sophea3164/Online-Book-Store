const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, maxlength: 150 },
    phone: { type: String, maxlength: 20 },
    address: { type: String },
    city: { type: String, maxlength: 100 },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    reset_token: { type: String },
    reset_token_expires: { type: Date },
    is_active: { type: Boolean, default: true }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

userSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('User', userSchema);
