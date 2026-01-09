const mongoose = require('mongoose');
const User = require('./models/User');
const College = require('./models/College');
require('dotenv').config();

async function showDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔗 Connected to MongoDB: fyp_lost_found');
        console.log('📍 Connection String: mongodb://localhost:27017/fyp_lost_found');
        console.log('='.repeat(60));

        // Show database info
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        console.log('\n📊 DATABASE OVERVIEW:');
        console.log(`Database Name: ${db.databaseName}`);
        console.log(`Collections: ${collections.map(c => c.name).join(', ')}`);

        // Show users collection
        const userCount = await User.countDocuments();
        console.log(`\n👥 USERS COLLECTION (${userCount} documents):`);

        const users = await User.find().select('name email role college').lean();
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name}`);
            console.log(`   📧 Email: ${user.email}`);
            console.log(`   🎭 Role: ${user.role}`);
            if (user.college) console.log(`   🏫 College: ${user.college}`);
            console.log(`   🆔 ID: ${user._id}`);
            console.log('');
        });

        // Show colleges collection
        const collegeCount = await College.countDocuments();
        console.log(`🏫 COLLEGES COLLECTION (${collegeCount} documents):`);

        const colleges = await College.find().populate('adminId', 'name email').lean();
        colleges.forEach((college, index) => {
            console.log(`${index + 1}. ${college.name}`);
            console.log(`   🌐 Domain: ${college.domain}`);
            console.log(`   ${college.logo} Logo: ${college.logo}`);
            console.log(`   👤 Admin: ${college.adminId ? college.adminId.name : 'No admin assigned'}`);
            console.log(`   🆔 ID: ${college._id}`);
            console.log('');
        });

        console.log('='.repeat(60));
        console.log('🎯 TO VIEW IN MONGODB COMPASS:');
        console.log('1. Open MongoDB Compass');
        console.log('2. Connect to: mongodb://localhost:27017');
        console.log('3. Select database: fyp_lost_found');
        console.log('4. Browse collections: users, colleges');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

showDatabase();