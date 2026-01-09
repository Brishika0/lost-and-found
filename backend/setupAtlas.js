// Quick setup script for MongoDB Atlas
const mongoose = require('mongoose');
require('dotenv').config();

// Test Atlas connection
const atlasUri = "mongodb+srv://demo:demo123@cluster0.mongodb.net/fyp_lost_found?retryWrites=true&w=majority";

async function testAtlasConnection() {
    try {
        console.log('🔄 Testing MongoDB Atlas connection...');

        await mongoose.connect(atlasUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ MongoDB Atlas Connected Successfully!');

        // Test basic operations
        const testCollection = mongoose.connection.db.collection('test');
        await testCollection.insertOne({ test: 'atlas_connection', timestamp: new Date() });
        console.log('✅ Atlas write test successful!');

        const testDoc = await testCollection.findOne({ test: 'atlas_connection' });
        console.log('✅ Atlas read test successful!');

        // Clean up
        await testCollection.deleteOne({ test: 'atlas_connection' });
        console.log('✅ Atlas delete test successful!');

        console.log('\n🎉 MongoDB Atlas is working! You can use cloud database.');
        console.log('📝 Update your .env file with:');
        console.log(`MONGO_URI=${atlasUri}`);

    } catch (error) {
        console.error('❌ Atlas Connection Error:', error.message);
        console.log('\n📋 Atlas Setup Instructions:');
        console.log('1. Go to https://www.mongodb.com/atlas');
        console.log('2. Sign up for free account');
        console.log('3. Create a new cluster (free tier)');
        console.log('4. Get your connection string');
        console.log('5. Update MONGO_URI in .env file');
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

testAtlasConnection();