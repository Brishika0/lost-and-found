const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const College = require('./models/College');
require('dotenv').config();

const colleges = [
    {
        name: "Herald College Kathmandu",
        domain: "heraldcollege.edu.np",
        logo: "🎓",
        shortName: "Herald",
    },
    {
        name: "Islington College",
        domain: "islington.edu.np",
        logo: "🏛️",
        shortName: "Islington",
    },
    {
        name: "Itahari International College",
        domain: "iic.edu.np",
        logo: "🌐",
        shortName: "IIC",
    },
    {
        name: "Apex College",
        domain: "apex.edu.np",
        logo: "⛰️",
        shortName: "Apex",
    },
    {
        name: "Kavya School",
        domain: "kavya.edu.np",
        logo: "📚",
        shortName: "Kavya",
    },
    {
        name: "Biratnagar International College",
        domain: "bic.edu.np",
        logo: "🎯",
        shortName: "BIC",
    },
];

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await College.deleteMany({});
        console.log('Cleared existing data');

        // Create colleges
        await College.insertMany(colleges);
        console.log('Colleges created');

        // Create super admin
        const hashedSuperAdminPassword = await hashPassword('superadmin123');
        const superAdmin = await User.create({
            name: 'Super Administrator',
            email: 'superadmin@ing.edu.np',
            password: hashedSuperAdminPassword,
            role: 'superadmin'
        });
        console.log('Super admin created');

        // Create sample admins
        const adminAccounts = [
            {
                name: 'Herald Admin',
                email: 'admin@heraldcollege.edu.np',
                password: 'admin123',
                college: 'Herald College Kathmandu',
                collegeLogo: '🎓'
            },
            {
                name: 'Islington Admin',
                email: 'admin@islington.edu.np',
                password: 'admin123',
                college: 'Islington College',
                collegeLogo: '🏛️'
            },
            {
                name: 'IIC Admin',
                email: 'admin@iic.edu.np',
                password: 'admin123',
                college: 'Itahari International College',
                collegeLogo: '🌐'
            }
        ];

        for (const adminData of adminAccounts) {
            const hashedPassword = await hashPassword(adminData.password);
            const admin = await User.create({
                ...adminData,
                password: hashedPassword,
                role: 'admin'
            });

            // Update college with admin ID
            await College.findOneAndUpdate(
                { name: adminData.college },
                { adminId: admin._id }
            );
        }
        console.log('Sample admins created');

        // Create sample students
        const sampleStudents = [
            {
                name: 'John Doe',
                email: 'john.doe@heraldcollege.edu.np',
                password: 'student123',
                college: 'Herald College Kathmandu',
                collegeLogo: '🎓'
            },
            {
                name: 'Jane Smith',
                email: 'jane.smith@islington.edu.np',
                password: 'student123',
                college: 'Islington College',
                collegeLogo: '🏛️'
            },
            {
                name: 'Mike Johnson',
                email: 'mike.johnson@iic.edu.np',
                password: 'student123',
                college: 'Itahari International College',
                collegeLogo: '🌐'
            }
        ];

        for (const studentData of sampleStudents) {
            const hashedPassword = await hashPassword(studentData.password);
            await User.create({
                ...studentData,
                password: hashedPassword,
                role: 'student'
            });
        }
        console.log('Sample students created');

        console.log('\n=== SEEDING COMPLETED ===');
        console.log('Super Admin: superadmin@ing.edu.np / superadmin123');
        console.log('Sample Admin: admin@heraldcollege.edu.np / admin123');
        console.log('Sample Student: john.doe@heraldcollege.edu.np / student123');

        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedDatabase();