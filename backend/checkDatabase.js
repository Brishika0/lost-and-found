const mongoose = require('mongoose');
const User = require('./models/User');
const College = require('./models/College');
require('dotenv').config();

async function checkDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check users
        const users = await User.find().select('name email role college');
        console.log('\n📊 Users in database:');
        users.forEach(user => {
            console.log(`- ${user.name} (${user.email}) - Role: ${user.role}${user.college ? `, College: ${user.college}` : ''}`);
        });

        // Check colleges
        const colleges = await College.find().populate('adminId', 'name email');
        console.log('\n🏫 Colleges in database:');
        colleges.forEach(college => {
            console.log(`- ${college.name} (${college.domain}) - Admin: ${college.adminId ? college.adminId.name : 'No admin assigned'}`);
        });

        console.log('\n🎉 Database verification complete!');

    } catch (error) {
        console.error('❌ Database check error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

checkDatabase();