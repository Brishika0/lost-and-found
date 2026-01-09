// Demo server without MongoDB - for testing frontend-backend connection
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));
app.use(express.json());

// In-memory data store (for demo purposes)
let users = [
    {
        _id: '1',
        name: 'Super Administrator',
        email: 'superadmin@ing.edu.np',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // superadmin123
        role: 'superadmin'
    },
    {
        _id: '2',
        name: 'Herald Admin',
        email: 'admin@heraldcollege.edu.np',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
        role: 'admin',
        college: 'Herald College Kathmandu',
        collegeLogo: '🎓'
    }
];

let colleges = [
    {
        _id: '1',
        name: 'Herald College Kathmandu',
        domain: 'heraldcollege.edu.np',
        logo: '🎓',
        shortName: 'Herald',
        adminId: {
            _id: '2',
            name: 'Herald Admin',
            email: 'admin@heraldcollege.edu.np',
            assignedDate: new Date()
        }
    },
    {
        _id: '2',
        name: 'Islington College',
        domain: 'islington.edu.np',
        logo: '🏛️',
        shortName: 'Islington',
        adminId: null
    }
];

let students = [
    {
        _id: '3',
        name: 'John Doe',
        email: 'john.doe@heraldcollege.edu.np',
        role: 'student',
        college: 'Herald College Kathmandu',
        isActive: true,
        createdAt: new Date()
    }
];

let lostItems = [
    {
        _id: '1',
        itemName: 'iPhone 13',
        description: 'Black iPhone 13 with blue case',
        category: 'Electronics',
        status: 'Lost',
        college: 'Herald College Kathmandu',
        reportedBy: { _id: '3', name: 'John Doe' },
        dateReported: new Date(),
        location: 'Library',
        isActive: true,
        createdAt: new Date()
    }
];

// JWT Secret
const JWT_SECRET = 'demo_jwt_secret_2024';

// Helper function to generate JWT
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'FYP Lost & Found Demo Backend is Running!',
        status: 'Connected',
        mode: 'Demo Mode (In-Memory Database)',
        endpoints: [
            'POST /api/auth/login',
            'GET /api/superadmin/dashboard',
            'GET /api/superadmin/colleges',
            'GET /api/admin/dashboard'
        ]
    });
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Backend + Demo Database connected!',
        timestamp: new Date().toISOString()
    });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, role, college } = req.body;

        console.log('Login attempt:', { email, role, college });

        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // For demo, accept both hashed and plain passwords
        const isValidPassword = password === 'superadmin123' || password === 'admin123' ||
            await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (user.role !== role) {
            return res.status(400).json({ message: 'Invalid role for this account' });
        }

        if (role === 'admin' && user.college !== college) {
            return res.status(400).json({ message: 'Invalid college selection' });
        }

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

// Super Admin routes
app.get('/api/superadmin/dashboard', (req, res) => {
    const stats = {
        totalColleges: colleges.length,
        collegesWithAdmins: colleges.filter(c => c.adminId).length,
        collegesWithoutAdmins: colleges.filter(c => !c.adminId).length,
        totalStudents: students.length,
        totalAdmins: users.filter(u => u.role === 'admin').length,
        totalLostItems: lostItems.length,
        foundItems: lostItems.filter(i => i.status === 'Found').length
    };

    res.json({
        success: true,
        data: {
            stats,
            colleges,
            recentActivity: lostItems.slice(0, 5)
        }
    });
});

app.get('/api/superadmin/colleges', (req, res) => {
    res.json({
        success: true,
        data: colleges
    });
});

app.post('/api/superadmin/admins', (req, res) => {
    const { name, email, college, collegeLogo } = req.body;

    const newAdmin = {
        _id: String(users.length + 1),
        name,
        email: email.toLowerCase(),
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
        role: 'admin',
        college,
        collegeLogo: collegeLogo || '🎓',
        assignedDate: new Date()
    };

    users.push(newAdmin);

    // Update college
    const collegeIndex = colleges.findIndex(c => c.name === college);
    if (collegeIndex !== -1) {
        colleges[collegeIndex].adminId = {
            _id: newAdmin._id,
            name: newAdmin.name,
            email: newAdmin.email,
            assignedDate: newAdmin.assignedDate
        };
    }

    res.status(201).json({
        success: true,
        data: {
            id: newAdmin._id,
            name: newAdmin.name,
            email: newAdmin.email,
            college: newAdmin.college,
            assignedDate: newAdmin.assignedDate
        }
    });
});

// Admin routes
app.get('/api/admin/dashboard', (req, res) => {
    const adminCollege = 'Herald College Kathmandu'; // Demo college

    const collegeStudents = students.filter(s => s.college === adminCollege);
    const collegeLostItems = lostItems.filter(i => i.college === adminCollege);

    const stats = {
        totalStudents: collegeStudents.length,
        totalLostItems: collegeLostItems.length,
        foundItems: collegeLostItems.filter(i => i.status === 'Found').length,
        claimedItems: collegeLostItems.filter(i => i.status === 'Claimed').length,
        pendingItems: collegeLostItems.filter(i => i.status === 'Lost').length
    };

    res.json({
        success: true,
        data: {
            stats,
            recentItems: collegeLostItems.slice(0, 5),
            college: {
                name: adminCollege,
                logo: '🎓'
            }
        }
    });
});

app.get('/api/admin/students', (req, res) => {
    const adminCollege = 'Herald College Kathmandu';
    const collegeStudents = students.filter(s => s.college === adminCollege);

    res.json({
        success: true,
        data: collegeStudents
    });
});

app.get('/api/admin/lost-items', (req, res) => {
    const adminCollege = 'Herald College Kathmandu';
    const collegeLostItems = lostItems.filter(i => i.college === adminCollege);

    res.json({
        success: true,
        data: {
            items: collegeLostItems,
            totalPages: 1,
            currentPage: 1,
            total: collegeLostItems.length
        }
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Demo Server running on http://localhost:${PORT}`);
    console.log('📊 Mode: In-Memory Database (Demo)');
    console.log('🔗 Frontend should connect to: http://localhost:5173');
    console.log('\n📋 Demo Login Credentials:');
    console.log('Super Admin: superadmin@ing.edu.np / superadmin123');
    console.log('Admin: admin@heraldcollege.edu.np / admin123');
    console.log('\n✅ Backend is ready for frontend connection!');
});