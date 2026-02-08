const mongoose = require('mongoose');
require('dotenv').config();

async function fixDuplicateKeyError() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('students');

    // Drop the problematic index
    try {
      await collection.dropIndex('certificates.certificateId_1');
      console.log('✅ Dropped certificates.certificateId_1 index');
    } catch (err) {
      console.log('Index may not exist:', err.message);
    }

    // Create sparse index (allows null values)
    await collection.createIndex(
      { 'certificates.certificateId': 1 },
      { sparse: true, unique: true }
    );
    console.log('✅ Created sparse index for certificates.certificateId');

    console.log('\n✅ Database fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixDuplicateKeyError();
