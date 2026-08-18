/**
 * Script to create indexes on the Lead collection for better query performance
 * Run this script after deploying the pagination changes to production
 * 
 * Usage: node scripts/create-lead-indexes.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/o_positive_health_crm';

async function createLeadIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    const Lead = mongoose.connection.collection('leads');

    console.log('\nCreating indexes on Lead collection...');

    // Create indexes for better pagination performance
    const indexes = [
      { key: { createdAt: -1 }, name: 'createdAt_-1' },
      { key: { leadStatus: 1, createdAt: -1 }, name: 'leadStatus_1_createdAt_-1' },
      { key: { createdBy: 1, createdAt: -1 }, name: 'createdBy_1_createdAt_-1' },
      { key: { assignedTo: 1, createdAt: -1 }, name: 'assignedTo_1_createdAt_-1' },
      { key: { city: 1 }, name: 'city_1' },
      { key: { 'contact.mobile': 1 }, name: 'contact.mobile_1' },
      { key: { patientName: 'text', treatment: 'text' }, name: 'patientName_text_treatment_text' }
    ];

    for (const index of indexes) {
      try {
        console.log(`Creating index: ${index.name}`);
        await Lead.createIndex(index.key, { name: index.name, background: true });
        console.log(`✓ Created index: ${index.name}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`⚠ Index ${index.name} already exists with different options, skipping...`);
        } else if (error.message.includes('already exists')) {
          console.log(`✓ Index ${index.name} already exists`);
        } else {
          console.error(`✗ Error creating index ${index.name}:`, error.message);
        }
      }
    }

    // List all indexes
    console.log('\nCurrent indexes on Lead collection:');
    const existingIndexes = await Lead.indexes();
    existingIndexes.forEach(index => {
      console.log(`  - ${index.name || JSON.stringify(index.key)}`);
    });

    // Get collection stats
    const stats = await Lead.stats();
    console.log('\nCollection Statistics:');
    console.log(`  Total Documents: ${stats.count}`);
    console.log(`  Total Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Average Document Size: ${(stats.avgObjSize / 1024).toFixed(2)} KB`);
    console.log(`  Total Index Size: ${(stats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`);

    console.log('\n✅ Index creation completed successfully!');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
createLeadIndexes().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
