# Employee Data Migration Guide

## Prerequisites
- Node.js installed
- MongoDB running and accessible
- DATABASE_URL environment variable set in `server/.env`

## Migration Steps

### 1. Backup Your Database
Before running any migration, always backup your database:

```bash
# Using mongodump
mongodump --uri="your-connection-string" --out=backup-$(date +%Y%m%d)
```

### 2. Run the Migration Script

```bash
# Navigate to server directory
cd server

# Install dependencies if not already installed
npm install

# Run the migration
node scripts/migrate-employee-fields.js
```

### 3. Expected Output

The script will display:
```
✅ Connected to MongoDB
📊 Found X employees in the database
✅ Updated X employees with new fields
✅ Set startingSalary for X employees based on current salary
✅ Migrated address to addressPresent for X employees
✅ Initialized increments array for X employees

📋 Migration Summary:
   Total employees: X
   Fields added/updated: X
   Starting salaries set: X
   Addresses migrated: X
   Increments initialized: X

✅ Migration completed successfully
```

### 4. Verify Migration

After migration, verify the changes:

```bash
# Connect to MongoDB shell
mongosh "your-connection-string"

# Check a sample employee record
use opositive
db.employees.findOne()

# Verify new fields exist
db.employees.findOne({}, {
  dateOfBirth: 1,
  dateOfEnding: 1,
  startingSalary: 1,
  increments: 1,
  alternateNumber: 1,
  fatherName: 1,
  experience: 1,
  addressPresent: 1,
  addressPermanent: 1
})
```

## What the Migration Does

1. **Adds New Fields**: Creates new fields with null/default values
   - dateOfBirth
   - dateOfEnding
   - alternateNumber
   - fatherName
   - experience
   - addressPresent
   - addressPermanent

2. **Initializes Arrays**: Creates empty arrays for
   - increments

3. **Sets Starting Salary**: For employees with existing salary but no startingSalary
   - Copies current salary to startingSalary

4. **Migrates Legacy Data**: 
   - Copies `address` field to `addressPresent` where applicable

5. **Maintains Compatibility**:
   - Does not remove any existing fields
   - Preserves all existing data
   - Non-destructive operation

## Rollback (If Needed)

If you need to rollback the migration:

```bash
# Restore from backup
mongorestore --uri="your-connection-string" backup-YYYYMMDD

# Or manually remove fields
db.employees.updateMany({}, {
  $unset: {
    dateOfBirth: "",
    dateOfEnding: "",
    alternateNumber: "",
    fatherName: "",
    experience: "",
    addressPresent: "",
    addressPermanent: "",
    increments: "",
    startingSalary: ""
  }
})
```

## Troubleshooting

### Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running and DATABASE_URL is correct in `.env`

### Permission Error
```
Error: not authorized on opositive to execute command
```
**Solution**: Check database user has write permissions

### Duplicate Key Error
```
Error: E11000 duplicate key error
```
**Solution**: This shouldn't happen with this migration, but if it does, check for duplicate employeeId, email, or phone fields

## Post-Migration Checklist

- [ ] Migration script completed without errors
- [ ] Sample employee records verified in database
- [ ] Web application loads without errors
- [ ] Employee list page displays correctly
- [ ] Can create new employee with all fields
- [ ] Can view employee details with new fields
- [ ] Can edit existing employees
- [ ] Search and filter work correctly

## Notes

- Migration is **idempotent** - safe to run multiple times
- Only affects employees missing the new fields
- Existing data is preserved
- New employees automatically have all fields
- The migration takes approximately 1-2 seconds per 1000 employees

## Support

If you encounter issues:
1. Check the script output for specific errors
2. Verify MongoDB connection
3. Ensure you have backup before trying fixes
4. Check server logs for detailed error messages
