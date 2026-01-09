const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Electronics', 'Clothing', 'Books', 'Accessories', 'Documents', 'Other']
    },
    status: {
        type: String,
        enum: ['Lost', 'Found', 'Claimed'],
        default: 'Lost'
    },
    college: {
        type: String,
        required: true
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    foundBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    claimedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    dateReported: {
        type: Date,
        default: Date.now
    },
    dateFound: {
        type: Date,
        default: null
    },
    dateClaimed: {
        type: Date,
        default: null
    },
    contactInfo: {
        phone: String,
        email: String
    },
    images: [{
        type: String // URLs to uploaded images
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LostItem', lostItemSchema);