const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    domain: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    logo: {
        type: String,
        default: '🎓'
    },
    shortName: {
        type: String,
        required: true,
        trim: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('College', collegeSchema);