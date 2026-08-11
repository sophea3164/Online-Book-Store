const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, maxlength: 100 }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

categorySchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Category', categorySchema);
