const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
    try {
        console.log('Testing MongoDB connection...');
        console.log('MongoDB URI:', process.env.MONGO_URI);

        // Try to connect
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected Successfully!');

        // Test basic operations
        const testCollection = mongoose.connection.db.collection('test');
        await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
        console.log('✅ Database write test successful!');

        const testDoc = await testCollection.findOne({ test: 'connection' });
        console.log('✅ Database read test successful!', testDoc);

        // Clean up
        await testCollection.deleteOne({ test: 'connection' });
        console.log('✅ Database delete test successful!');

        console.log('\n🎉 All database tests passed! Backend is ready to connect.');

    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        console.log('\n📋 Setup Instructions:');
        console.log('1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
        console.log('2. Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas');
        console.log('3. Update MONGO_URI in .env file with your connection string');
        console.log('\nFor local MongoDB, make sure the service is running:');
        console.log('- Windows: Start "MongoDB" service in Services');
        console.log('- Mac: brew services start mongodb/brew/mongodb-community');
        console.log('- Linux: sudo systemctl start mongod');
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

testConnection();