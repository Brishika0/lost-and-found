const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testLiveConnection() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔗 Testing live database connection...');

        // Add a test document
        const testUser = await User.create({
            name: 'Test User - ' + new Date().toLocaleTimeString(),
            email: 'test' + Date.now() + '@test.com',
            password: 'test123',
            role: 'student',
            college: 'Test College'
        });

        console.log('✅ Created test user:', testUser.name);
        console.log('🆔 User ID:', testUser._id);
        console.log('');
        console.log('👀 Check MongoDB Compass now - you should see this new user!');
        console.log('📍 Navigate to: fyp_lost_found > users collection');

        // Wait 5 seconds then delete the test user
        setTimeout(async () => {
            await User.findByIdAndDelete(testUser._id);
            console.log('🗑️ Deleted test user (cleanup)');
            console.log('✅ Live connection test completed!');
            process.exit(0);
        }, 5000);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testLiveConnection();