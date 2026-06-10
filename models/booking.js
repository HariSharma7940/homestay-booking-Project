const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
    homeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Homestay',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    guests: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['eSewa', 'Khalti', 'Mobile Banking']
    },
    advanceAmount: {
        type: Number,
        required: true
    },
    remainingAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending Owner Approval', 'Approved', 'Rejected', 'Cancelled'],
        default: 'Pending Owner Approval'
    },
    approvedAt: {
        type: Date
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    rejectedAt: {
        type: Date
    },
    rejectionReason: {
        type: String
    }
});

module.exports = mongoose.model('Booking', bookingSchema);