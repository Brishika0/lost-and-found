const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['superadmin', 'admin', 'student'],
        required: true
    },
    college: {
        type: String,
        required: function () {
            return this.role === 'admin' || this.role === 'student';
        }
    },
    collegeLogo: {
        type: String,
        default: '🎓'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    assignedDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Static method to hash password
userSchema.statics.hashPassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

module.exports = mongoose.model('User', userSchema);