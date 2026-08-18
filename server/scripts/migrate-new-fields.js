const mongoose = require('mongoose');
require('dotenv').config();

async function migrate() {
  try {
    await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/opositive');
    console.log('Connected to MongoDB');

    // Update Lead model to add assignedBy field (if not present)
    const Lead = mongoose.connection.collection('leads');
    
    // Add assignedBy field to existing leads (set to null initially)
    const leadsUpdated = await Lead.updateMany(
      { assignedBy: { $exists: false } },
      { $set: { assignedBy: null } }
    );
    console.log(`✅ Updated ${leadsUpdated.modifiedCount} leads with assignedBy field`);

    // Update Employee model to add hasAccount and userId fields
    const Employee = mongoose.connection.collection('employees');
    
    const employeesUpdated = await Employee.updateMany(
      { hasAccount: { $exists: false } },
      { $set: { hasAccount: false, userId: null } }
    );
    console.log(`✅ Updated ${employeesUpdated.modifiedCount} employees with hasAccount and userId fields`);

    // Create unique sparse index on contact.mobile in leads collection
    try {
      await Lead.createIndex({ 'contact.mobile': 1 }, { unique: true, sparse: true });
      console.log('✅ Created unique sparse index on contact.mobile');
    } catch (error) {
      if (error.code === 85) {
        console.log('⚠️  Index already exists on contact.mobile');
      } else {
        console.error('❌ Error creating index:', error.message);
      }
    }

    // Find and report duplicate phone numbers in leads
    const duplicates = await Lead.aggregate([
      {
        $match: {
          'contact.mobile': { $exists: true, $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$contact.mobile',
          count: { $sum: 1 },
          ids: { $push: '$_id' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    if (duplicates.length > 0) {
      console.log('\n⚠️  Warning: Found duplicate phone numbers in leads:');
      duplicates.forEach(dup => {
        console.log(`   Phone: ${dup._id}, Count: ${dup.count}, Lead IDs: ${dup.ids.join(', ')}`);
      });
      console.log('\n   Please review and merge/delete duplicate leads manually.');
      console.log('   You can keep the most recent lead and delete others, or merge the data.');
    } else {
      console.log('✅ No duplicate phone numbers found in leads');
    }

    console.log('\n✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
