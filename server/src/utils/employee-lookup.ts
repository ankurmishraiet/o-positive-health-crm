import { Employee } from "../models/employee.model";
import { User } from "../models/user.model";

/**
 * Find employee for a given user ID
 * Tries multiple strategies to handle both new and legacy data:
 * 1. Direct userId reference (new model)
 * 2. Email match (legacy)
 * 3. Phone match (legacy)
 * 4. EmployeeId match (legacy)
 */
export async function findEmployeeForUser(userId: string) {
  // First try: Look up by userId ObjectId (new data model)
  let employee = await Employee.findOne({ userId }).lean();
  if (employee) {
    console.log('[Employee Lookup] Found employee by userId reference');
    return employee;
  }

  // Second try: Get user details and match by email/phone (legacy data)
  const user = await User.findById(userId).lean();
  if (user) {
    console.log('[Employee Lookup] Looking up employee by user email/phone:', { email: user.email, phone: user.phone });
    
    // Try email match
    if (user.email) {
      employee = await Employee.findOne({ email: user.email }).lean();
      if (employee) {
        console.log('[Employee Lookup] Found employee by email match');
        return employee;
      }
    }
    
    // Try phone match
    if (user.phone) {
      employee = await Employee.findOne({ phone: user.phone }).lean();
      if (employee) {
        console.log('[Employee Lookup] Found employee by phone match');
        return employee;
      }
    }

    // Try employeeId match (if user has employeeId and employee has matching employeeId)
    if (user.employeeId) {
      employee = await Employee.findOne({ employeeId: user.employeeId }).lean();
      if (employee) {
        console.log('[Employee Lookup] Found employee by employeeId match');
        return employee;
      }
    }
  }

  console.log('[Employee Lookup] No employee found for user');
  return null;
}
