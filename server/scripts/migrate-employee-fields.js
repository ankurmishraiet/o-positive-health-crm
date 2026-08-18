const mongoose = require("mongoose");
require("dotenv").config();

async function migrateEmployeeFields() {
  try {
    await mongoose.connect(
      process.env.DATABASE_URL || "mongodb://localhost:27017/opositive"
    );
    console.log("✅ Connected to MongoDB");

    const Employee = mongoose.connection.collection("employees");

    // Get all employees to check current state
    const totalEmployees = await Employee.countDocuments();
    console.log(`📊 Found ${totalEmployees} employees in the database`);

    // Add new fields to existing employees
    const result = await Employee.updateMany(
      {
        $or: [
          { dateOfBirth: { $exists: false } },
          { dateOfEnding: { $exists: false } },
          { startingSalary: { $exists: false } },
          { increments: { $exists: false } },
          { alternateNumber: { $exists: false } },
          { fatherName: { $exists: false } },
          { experience: { $exists: false } },
          { addressPresent: { $exists: false } },
          { addressPermanent: { $exists: false } },
        ],
      },
      {
        $set: {
          dateOfBirth: null,
          dateOfEnding: null,
          alternateNumber: null,
          fatherName: null,
          experience: null,
          addressPresent: null,
          addressPermanent: null,
        },
        $setOnInsert: {
          increments: [],
          startingSalary: null,
        },
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} employees with new fields`);

    // For employees with existing salary but no startingSalary, set startingSalary = salary
    const salaryUpdate = await Employee.updateMany(
      {
        salary: { $exists: true, $ne: null },
        startingSalary: { $exists: false },
      },
      [
        {
          $set: {
            startingSalary: "$salary",
          },
        },
      ]
    );

    console.log(
      `✅ Set startingSalary for ${salaryUpdate.modifiedCount} employees based on current salary`
    );

    // Migrate address to addressPresent if addressPresent doesn't exist
    const addressMigration = await Employee.updateMany(
      {
        address: { $exists: true, $ne: null, $ne: "" },
        addressPresent: { $in: [null, ""] },
      },
      [
        {
          $set: {
            addressPresent: "$address",
          },
        },
      ]
    );

    console.log(
      `✅ Migrated address to addressPresent for ${addressMigration.modifiedCount} employees`
    );

    // Initialize empty increments array for all employees without it
    const incrementsInit = await Employee.updateMany(
      { increments: { $exists: false } },
      { $set: { increments: [] } }
    );

    console.log(
      `✅ Initialized increments array for ${incrementsInit.modifiedCount} employees`
    );

    // Summary
    console.log("\n📋 Migration Summary:");
    console.log(`   Total employees: ${totalEmployees}`);
    console.log(`   Fields added/updated: ${result.modifiedCount}`);
    console.log(`   Starting salaries set: ${salaryUpdate.modifiedCount}`);
    console.log(`   Addresses migrated: ${addressMigration.modifiedCount}`);
    console.log(`   Increments initialized: ${incrementsInit.modifiedCount}`);

    console.log("\n✅ Migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateEmployeeFields();
