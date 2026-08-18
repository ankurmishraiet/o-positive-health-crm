import mongoose from "mongoose";
import { User } from "../src/models/user.model";
import { Employee } from "../src/models/employee.model";
import { Lead } from "../src/models/lead.model";
import dotenv from "dotenv";

dotenv.config();

async function debug() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Find user with userId OPH0017
    const user = await User.findOne({ userId: 'OPH0017' });
    console.log('\n=== User with userId OPH0017 ===');
    console.log('User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('User _id:', user._id.toString());
      console.log('User role:', user.role);
      console.log('User name:', user.name);
    }

    if (user) {
      // Find employee with this user's _id
      const employee = await Employee.findOne({ userId: user._id });
      console.log('\n=== Employee record ===');
      console.log('Employee found:', employee ? 'YES' : 'NO');
      if (employee) {
        console.log('Employee _id:', employee._id.toString());
        console.log('Employee name:', employee.name);
        console.log('Employee userId:', employee.userId?.toString());
      }

      if (employee) {
        // Find leads assigned to this employee
        const leads = await Lead.find({ assignedTo: employee._id }).lean();
        console.log('\n=== Leads assigned to employee ===');
        console.log('Total leads found:', leads.length);
        leads.forEach((lead, idx) => {
          console.log(`\nLead ${idx + 1}:`);
          console.log('  Patient Name:', lead.patientName);
          console.log('  Lead Status:', lead.leadStatus);
          console.log('  AssignedTo:', lead.assignedTo?.toString());
        });

        // Also check if assignedTo might be stored as something else
        const allLeads = await Lead.find({}).select('patientName assignedTo').lean();
        console.log('\n=== All leads in system ===');
        console.log('Total leads:', allLeads.length);
        const leadsWithAssignment = allLeads.filter(l => l.assignedTo);
        console.log('Leads with assignedTo:', leadsWithAssignment.length);
      } else {
        console.log('\n=== Checking all employees ===');
        const allEmployees = await Employee.find({}).select('name userId employeeId').lean();
        console.log('Total employees:', allEmployees.length);
        allEmployees.forEach((emp, idx) => {
          console.log(`Employee ${idx + 1}: name=${emp.name}, userId=${emp.userId?.toString()}, employeeId=${emp.employeeId}`);
        });
      }
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debug();
