const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const College = require('../models/College');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/login
// @desc    Login user (admin, superadmin, student)
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password, role, college } = req.body;

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check role
        if (user.role !== role) {
            return res.status(400).json({ message: 'Invalid role for this account' });
        }

        // For admin, check college match
        if (role === 'admin' && user.college !== college) {
            return res.status(400).json({ message: 'Invalid college selection' });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(400).json({ message: 'Account is deactivated' });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                college: user.college,
                collegeLogo: user.collegeLogo
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public (for students) / Protected (for admins by superadmin)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, college, collegeLogo } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // For admin registration, check if college already has an admin
        if (role === 'admin') {
            const existingAdmin = await User.findOne({ role: 'admin', college });
            if (existingAdmin) {
                return res.status(400).json({ message: 'This college already has an admin' });
            }
        }

        // Create new user
        const user = new User({
            name,
            email: email.toLowerCase(),
            password,
            role,
            college,
            collegeLogo: collegeLogo || '🎓'
        });

        await user.save();

        // If it's an admin, update the college record
        if (role === 'admin') {
            await College.findOneAndUpdate(
                { name: college },
                { adminId: user._id },
                { upsert: true }
            );
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                college: user.college,
                collegeLogo: user.collegeLogo
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        res.json({
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                college: req.user.college,
                collegeLogo: req.user.collegeLogo
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;