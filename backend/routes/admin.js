const express = require('express');
const User = require('../models/User');
const College = require('../models/College');
const LostItem = require('../models/LostItem');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin only)
router.get('/dashboard', auth, requireRole(['admin']), async (req, res) => {
    try {
        const adminCollege = req.user.college;

        // Get statistics for the admin's college
        const totalStudents = await User.countDocuments({
            role: 'student',
            college: adminCollege
        });

        const totalLostItems = await LostItem.countDocuments({
            college: adminCollege,
            isActive: true
        });

        const foundItems = await LostItem.countDocuments({
            college: adminCollege,
            status: 'Found',
            isActive: true
        });

        const claimedItems = await LostItem.countDocuments({
            college: adminCollege,
            status: 'Claimed',
            isActive: true
        });

        // Get recent lost items
        const recentItems = await LostItem.find({
            college: adminCollege,
            isActive: true
        })
            .populate('reportedBy', 'name email')
            .populate('foundBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            data: {
                stats: {
                    totalStudents,
                    totalLostItems,
                    foundItems,
                    claimedItems,
                    pendingItems: totalLostItems - foundItems - claimedItems
                },
                recentItems,
                college: {
                    name: adminCollege,
                    logo: req.user.collegeLogo
                }
            }
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/students
// @desc    Get all students for admin's college
// @access  Private (Admin only)
router.get('/students', auth, requireRole(['admin']), async (req, res) => {
    try {
        const students = await User.find({
            role: 'student',
            college: req.user.college
        }).select('-password').sort({ createdAt: -1 });

        res.json({
            success: true,
            data: students
        });
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/lost-items
// @desc    Get all lost items for admin's college
// @access  Private (Admin only)
router.get('/lost-items', auth, requireRole(['admin']), async (req, res) => {
    try {
        const { status, category, page = 1, limit = 10 } = req.query;

        const filter = {
            college: req.user.college,
            isActive: true
        };

        if (status) filter.status = status;
        if (category) filter.category = category;

        const items = await LostItem.find(filter)
            .populate('reportedBy', 'name email')
            .populate('foundBy', 'name email')
            .populate('claimedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await LostItem.countDocuments(filter);

        res.json({
            success: true,
            data: {
                items,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total
            }
        });
    } catch (error) {
        console.error('Get lost items error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/admin/lost-items/:id/status
// @desc    Update lost item status
// @access  Private (Admin only)
router.put('/lost-items/:id/status', auth, requireRole(['admin']), async (req, res) => {
    try {
        const { status, foundBy, claimedBy } = req.body;
        const itemId = req.params.id;

        const updateData = { status };

        if (status === 'Found' && foundBy) {
            updateData.foundBy = foundBy;
            updateData.dateFound = new Date();
        }

        if (status === 'Claimed' && claimedBy) {
            updateData.claimedBy = claimedBy;
            updateData.dateClaimed = new Date();
        }

        const item = await LostItem.findOneAndUpdate(
            {
                _id: itemId,
                college: req.user.college
            },
            updateData,
            { new: true }
        ).populate('reportedBy foundBy claimedBy', 'name email');

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Update item status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;