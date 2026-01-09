const mongoose = require('mongoose');
const User = require('./models/User');
const LostItem = require('./models/LostItem');
require('dotenv').config();

const sampleLostItems = [
    {
        itemName: 'iPhone 13 Pro',
        description: 'Black iPhone 13 Pro with blue case, small crack on screen',
        category: 'Electronics',
        status: 'Lost',
        location: 'Library - 2nd Floor',
        college: 'Herald College Kathmandu'
    },
    {
        itemName: 'MacBook Air',
        description: 'Silver MacBook Air 13-inch with stickers',
        category: 'Electronics',
        status: 'Found',
        location: 'Computer Lab',
        college: 'Herald College Kathmandu'
    },
    {
        itemName: 'Student ID Card',
        description: 'Herald College student ID card',
        category: 'Documents',
        status: 'Claimed',
        location: 'Cafeteria',
        college: 'Herald College Kathmandu'
    },
    {
        itemName: 'Wireless Headphones',
        description: 'Sony WH-1000XM4 black headphones',
        category: 'Electronics',
        status: 'Lost',
        location: 'Study Hall',
        college: 'Islington College'
    },
    {
        itemName: 'Textbook - Data Structures',
        description: 'Data Structures and Algorithms textbook',
        category: 'Books',
        status: 'Found',
        location: 'Classroom 201',
        college: 'Islington College'
    },
    {
        itemName: 'Wallet',
        description: 'Brown leather wallet with cards',
        category: 'Accessories',
        status: 'Lost',
        location: 'Parking Area',
        college: 'Itahari International College'
    },
    {
        itemName: 'Water Bottle',
        description: 'Blue metal water bottle with college logo',
        category: 'Other',
        status: 'Found',
        location: 'Gym',
        college: 'Itahari International College'
    },
    {
        itemName: 'Laptop Charger',
        description: 'Dell laptop charger 65W',
        category: 'Electronics',
        status: 'Lost',
        location: 'Library',
        college: 'Apex College'
    }
];

const seedLostItems = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing lost items
        await LostItem.deleteMany({});
        console.log('Cleared existing lost items');

        // Get users to assign as reporters
        const students = await User.find({ role: 'student' });

        for (const itemData of sampleLostItems) {
            // Find a student from the same college
            const reporter = students.find(s => s.college === itemData.college);

            if (reporter) {
                const lostItem = new LostItem({
                    ...itemData,
                    reportedBy: reporter._id,
                    dateReported: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
                    contactInfo: {
                        email: reporter.email,
                        phone: '+977-98' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0')
                    }
                });

                // Set found/claimed dates for appropriate items
                if (itemData.status === 'Found') {
                    lostItem.dateFound = new Date(lostItem.dateReported.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
                } else if (itemData.status === 'Claimed') {
                    lostItem.dateFound = new Date(lostItem.dateReported.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000);
                    lostItem.dateClaimed = new Date(lostItem.dateFound.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000);
                    lostItem.claimedBy = reporter._id;
                }

                await lostItem.save();
            }
        }

        console.log('Sample lost items created successfully!');
        console.log(`Created ${sampleLostItems.length} lost items across different colleges`);

        // Show summary
        const itemsByCollege = await LostItem.aggregate([
            {
                $group: {
                    _id: '$college',
                    total: { $sum: 1 },
                    lost: { $sum: { $cond: [{ $eq: ['$status', 'Lost'] }, 1, 0] } },
                    found: { $sum: { $cond: [{ $eq: ['$status', 'Found'] }, 1, 0] } },
                    claimed: { $sum: { $cond: [{ $eq: ['$status', 'Claimed'] }, 1, 0] } }
                }
            }
        ]);

        console.log('\nItems by College:');
        itemsByCollege.forEach(college => {
            console.log(`${college._id}: ${college.total} items (${college.lost} lost, ${college.found} found, ${college.claimed} claimed)`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedLostItems();