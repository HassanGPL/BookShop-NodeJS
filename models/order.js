const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    items: [{
        product: { type: Object, required: true },
        quantity: { type: Number, required: true }
    }],
    user: {
        userId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        name: {
            type: String,
            required: true
        }
    }
});

exports.module = mongoose.model('Order', orderSchema);