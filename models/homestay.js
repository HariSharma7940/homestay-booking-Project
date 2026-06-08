const mongoose = require('mongoose');

const homestaySchema = mongoose.Schema({
    houseName: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    photo: String,
    description: String,
    guests: {
        type: Number,
        default: 1
    },
    bedrooms: {
        type: Number,
        default: 1
    },
    bathrooms: {
        type: Number,
        default: 1
    },
    amenities: {
        type: [String],
        default: []
    },
    hostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
});

module.exports = mongoose.model('Homestay', homestaySchema);
