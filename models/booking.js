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
});

module.exports = mongoose.model('Booking', bookingSchema);