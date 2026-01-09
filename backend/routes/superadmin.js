const express = require('express');
const User = require('../models/User');
const College = require('../models/College');
const LostItem = require('../models/LostItem');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/superadmin/dashboard
// @desc    Get super admin dashboard data with college analytics
// @access  Private (Super Admin only)
router.get('/dashboard', auth, requireRole(['superadmin']), async (req, res) => {
    try {
        // Get all colleges
        const colleges = await College.find().populate('adminId', 'name email assignedDate');

        // Get statistics
        const totalColleges = await College.countDocuments();
        const collegesWithAdmins = await College.countDocuments({ adminId: { $ne: null } });
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const totalLostItems = await LostItem.countDocuments({ isActive: true });
        const foundItems = await LostItem.countDocuments({ status: 'Found', isActive: true });

        // Get college-wise analytics for graphs
        const collegeAnalytics = await Promise.all(
            colleges.map(async (college) => {
                const studentCount = await User.countDocuments({
                    role: 'student',
                    college: college.name
                });

                const lostItemsCount = await LostItem.countDocuments({
                    college: college.name,
                    isActive: true
                });

                const foundItemsCount = await LostItem.countDocuments({
                    college: college.name,
                    status: 'Found',
                    isActive: true
                });

                const claimedItemsCount = await LostItem.countDocuments({
                    college: college.name,
                    status: 'Claimed',
                    isActive: true
                });

                return {
                    collegeId: college._id,
                    collegeName: college.name,
                    collegeLogo: college.logo,
                    shortName: college.shortName,
                    hasAdmin: !!college.adminId,
                    adminName: college.adminId?.name || null,
                    studentCount,
                    lostItemsCount,
                    foundItemsCount,
                    claimedItemsCount,
                    recoveryRate: lostItemsCount > 0 ?
                        ((foundItemsCount + claimedItemsCount) / lostItemsCount * 100).toFixed(1) : 0
                };
            })
        );

        // Get monthly trends across all colleges
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyTrends = await LostItem.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo },
                    isActive: true
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    totalItems: { $sum: 1 },
                    foundItems: {
                        $sum: { $cond: [{ $eq: ['$status', 'Found'] }, 1, 0] }
                    },
                    claimedItems: {
                        $sum: { $cond: [{ $eq: ['$status', 'Claimed'] }, 1, 0] }
                    }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Get category-wise distribution
        const categoryDistribution = await LostItem.aggregate([
            {
                $match: { isActive: true }
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    foundCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'Found'] }, 1, 0] }
                    }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                stats: {
                    totalColleges,
                    collegesWithAdmins,
                    collegesWithoutAdmins: totalColleges - collegesWithAdmins,
                    totalStudents,
                    totalAdmins,
                    totalLostItems,
                    foundItems,
                    overallRecoveryRate: totalLostItems > 0 ?
                        ((foundItems) / totalLostItems * 100).toFixed(1) : 0
                },
                colleges,
                collegeAnalytics,
                monthlyTrends,
                categoryDistribution
            }
        });
    } catch (error) {
        console.error('Super admin dashboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/superadmin/colleges
// @desc    Get all colleges
// @access  Private (Super Admin only)
router.get('/colleges', auth, requireRole(['superadmin']), async (req, res) => {
    try {
        const colleges = await College.find().populate('adminId', 'name email assignedDate');

        res.json({
            success: true,
            data: colleges
        });
    } catch (error) {
        console.error('Get colleges error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/superadmin/colleges
// @desc    Add new college
// @access  Private (Super Admin only)
router.post('/colleges', auth, requireRole(['superadmin']), async (req, res) => {
    try {
        const { name, domain, logo, shortName } = req.body;

        // Check if college already exists
        const existingCollege = await College.findOne({
            $or: [{ name }, { domain }]
        });

        if (existingCollege) {
            return res.status(400).json({
                message: 'College with this name or domain already exists'
            });
        }

        const college = new College({
            name,
            domain,
            logo: logo || '🎓',
            shortName
        });

        await college.save();

        // @route   PUT /api/superadmin/colleges/:id
        // @desc    Update college
        // @access  Private (Super Admin only)
        router.put('/colleges/:id', auth, requireRole(['superadmin']), async (req, res) => {
            try {
                const { name, domain, logo, shortName } = req.body;
                const collegeId = req.params.id;

                // Check if another college has the same name or domain
                const existingCollege = await College.findOne({
                    $and: [
                        { _id: { $ne: collegeId } },
                        { $or: [{ name }, { domain }] }
                    ]
                });

                if (existingCollege) {
                    return res.status(400).json({
                        message: 'Another college with this name or domain already exists'
                    });
                }

                const college = await College.findByIdAndUpdate(
                    collegeId,
                    { name, domain, logo: logo || '🎓', shortName },
                    { new: true }
                ).populate('adminId', 'name email');

                if (!college) {
                    return res.status(404).json({ message: 'College not found' });
                }

                res.json({
                    success: true,
                    data: college
                });
            } catch (error) {
                console.error('Update college error:', error);
                res.status(500).json({ message: 'Server error' });
            }
        });

        // @route   DELETE /api/superadmin/colleges/:id
        // @desc    Delete college
        // @access  Private (Super Admin only)
        router.delete('/colleges/:id', auth, requireRole(['superadmin']), async (req, res) => {
            try {
                const collegeId = req.params.id;

                const college = await College.findById(collegeId);
                if (!college) {
                    return res.status(404).json({ message: 'College not found' });
                }

                // Check if college has students or admin
                const studentCount = await User.countDocuments({
                    role: 'student',
                    college: college.name
                });

                if (studentCount > 0) {
                    return res.status(400).json({
                        message: `Cannot delete college. It has ${studentCount} students enrolled.`
                    });
                }

                // Remove admin if exists
                if (college.adminId) {
                    await User.findByIdAndDelete(college.adminId);
                }

                await College.findByIdAndDelete(collegeId);

                res.json({
                    success: true,
                    message: 'College deleted successfully'
                });
            } catch (error) {
                console.error('Delete college error:', error);
                res.status(500).json({ message: 'Server error' });
            }
        });

        // @route   GET /api/superadmin/colleges/:id/analytics
        // @desc    Get college analytics
        // @access  Private (Super Admin only)
        router.get('/colleges/:id/analytics', auth, requireRole(['superadmin']), async (req, res) => {
            try {
                const collegeId = req.params.id;

                const college = await College.findById(collegeId).populate('adminId', 'name email');
                if (!college) {
                    return res.status(404).json({ message: 'College not found' });
                }

                // Get analytics data
                const totalStudents = await User.countDocuments({
                    role: 'student',
                    college: college.name
                });

                const totalLostItems = await LostItem.countDocuments({
                    college: college.name,
                    isActive: true
                });

                const foundItems = await LostItem.countDocuments({
                    college: college.name,
                    status: 'Found',
                    isActive: true
                });

                const claimedItems = await LostItem.countDocuments({
                    college: college.name,
                    status: 'Claimed',
                    isActive: true
                });

                // Get recent activity
                const recentItems = await LostItem.find({
                    college: college.name,
                    isActive: true
                })
                    .populate('reportedBy', 'name email')
                    .sort({ createdAt: -1 })
                    .limit(5);

                // Get monthly statistics (last 6 months)
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

                const monthlyStats = await LostItem.aggregate([
                    {
                        $match: {
                            college: college.name,
                            createdAt: { $gte: sixMonthsAgo },
                            isActive: true
                        }
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: '$createdAt' },
                                month: { $month: '$createdAt' }
                            },
                            totalItems: { $sum: 1 },
                            foundItems: {
                                $sum: { $cond: [{ $eq: ['$status', 'Found'] }, 1, 0] }
                            },
                            claimedItems: {
                                $sum: { $cond: [{ $eq: ['$status', 'Claimed'] }, 1, 0] }
                            }
                        }
                    },
                    { $sort: { '_id.year': 1, '_id.month': 1 } }
                ]);

                res.json({
                    success: true,
                    data: {
                        college,
                        stats: {
                            totalStudents,
                            totalLostItems,
                            foundItems,
                            claimedItems,
                            pendingItems: totalLostItems - foundItems - claimedItems,
                            recoveryRate: totalLostItems > 0 ? ((foundItems + claimedItems) / totalLostItems * 100).toFixed(1) : 0
                        },
                        recentItems,
                        monthlyStats
                    }
                });
            } catch (error) {
                console.error('Get college analytics error:', error);
                res.status(500).json({ message: 'Server error' });
            }
        });

        // @route   POST /api/superadmin/admins
        // @desc    Add new admin to college
        // @access  Private (Super Admin only)
        router.post('/admins', auth, requireRole(['superadmin']), async (req, res) => {
            try {
                const { name, email, password, college, collegeLogo } = req.body;

                // Check if user already exists
                const existingUser = await User.findOne({ email: email.toLowerCase() });
                if (existingUser) {
                    return res.status(400).json({ message: 'User already exists with this email' });
                }

                // Check if college already has an admin
                const existingAdmin = await User.findOne({ role: 'admin', college });
                if (existingAdmin) {
                    return res.status(400).json({ message: 'This college already has an admin' });
                }

                // Create new admin
                const admin = new User({
                    name,
                    email: email.toLowerCase(),
                    password,
                    role: 'admin',
                    college,
                    collegeLogo: collegeLogo || '🎓'
                });

                await admin.save();

                // Update college record
                await College.findOneAndUpdate(
                    { name: college },
                    { adminId: admin._id },
                    { upsert: true }
                );

                res.status(201).json({
                    success: true,
                    data: {
                        id: admin._id,
                        name: admin.name,
                        email: admin.email,
                        college: admin.college,
                        assignedDate: admin.assignedDate
                    }
                });
            } catch (error) {
                console.error('Add admin error:', error);
                res.status(500).json({ message: 'Server error' });
            }
        });

        // @route   DELETE /api/superadmin/admins/:id
        // @desc    Remove admin
        // @access  Private (Super Admin only)
        router.delete('/admins/:id', auth, requireRole(['superadmin']), async (req, res) => {
            try {
                const adminId = req.params.id;

                const admin = await User.findById(adminId);
                if (!admin || admin.role !== 'admin') {
                    return res.status(404).json({ message: 'Admin not found' });
                }

                // Remove admin from college
                await College.findOneAndUpdate(
                    { name: admin.college },
                    { adminId: null }
                );

                // Delete admin user
                await User.findByIdAndDelete(adminId);

                res.json({
                    success: true,
                    message: 'Admin removed successfully'
                });
            } catch (error) {
                console.error('Remove admin error:', error);
                res.status(500).json({ message: 'Server error' });
            }
        });

        res.json({
            success: true,
            message: 'Admin removed successfully'
        });
    } catch (error) {
        console.error('Remove admin error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/superadmin/students
// @desc    Get all students across all colleges
// @access  Private (Super Admin only)
router.get('/students', auth, requireRole(['superadmin']), async (req, res) => {
    try {
        const { college, page = 1, limit = 20 } = req.query;

        const filter = { role: 'student' };
        if (college) filter.college = college;

        const students = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(filter);

        res.json({
            success: true,
            data: {
                students,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total
            }
        });
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/superadmin/lost-items
// @desc    Get all lost items across all colleges
// @access  Private (Super Admin only)
router.get('/lost-items', auth, requireRole(['superadmin']), async (req, res) => {
    try {
        const { college, status, page = 1, limit = 20 } = req.query;

        const filter = { isActive: true };
        if (college) filter.college = college;
        if (status) filter.status = status;

        const items = await LostItem.find(filter)
            .populate('reportedBy', 'name email college')
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

module.exports = router;