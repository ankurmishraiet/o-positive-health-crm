import { Employee } from "../models/employee.model";
import { Salary } from "../models/salary.model";

export const PayrollService = {
  async processPayroll({ month, year, department }: { 
    month: number; 
    year: number; 
    department?: string; 
  }) {
    try {
      // Build query filter
      const query: any = { status: 'Active' };
      if (department) {
        query.department = department;
      }

      // Get all employees matching criteria
      const employees = await Employee.find(query).lean();

      if (employees.length === 0) {
        throw new Error("No active employees found matching criteria");
      }

      // Process payroll for each employee
      const processedPayrolls = [];
      for (const employee of employees) {
        // Check if payroll already exists for this month/year
        const existingSalary = await Salary.findOne({
          employeeId: employee._id,
          month,
          year
        });

        if (existingSalary) {
          processedPayrolls.push(existingSalary);
          continue;
        }

        // Calculate salary components
        const basicSalary = employee.salary || 0;
        const basicSalaryNum = Number(basicSalary);
        const workingDays = 30; // Default working days
        const presentDays = 30; // Assume full attendance - should be calculated from attendance system
        
        const salaryData = {
          employeeId: employee._id,
          employeeName: employee.name,
          employeeCode: employee.employeeId,
          department: employee.department,
          designation: employee.designation,
          month,
          year,
          basicSalary: basicSalaryNum,
          allowances: {
            hra: Math.round(basicSalaryNum * 0.4), // 40% HRA
            da: Math.round(basicSalaryNum * 0.15), // 15% DA
            conveyance: 1600,
            medical: 1250,
            other: 0
          },
          incentives: {
            performance: 0,
            target: 0,
            bonus: 0,
            commission: 0,
            other: 0
          },
          deductions: {
            pf: Math.round(basicSalaryNum * 0.12), // 12% PF
            esi: basicSalaryNum <= 21000 ? Math.round(basicSalaryNum * 0.0075) : 0, // 0.75% ESI if salary <= 21k
            tds: 0,
            insurance: 0,
            loan: 0,
            advance: 0,
            other: 0
          },
          workingDays,
          presentDays,
          overtimeHours: 0,
          overtimeRate: 0,
          leavesTaken: 0,
          leaveDeduction: 0,
          paymentStatus: "Processed",
          paymentMethod: "Bank Transfer",
          createdBy: "System" // In real app, use authenticated user ID
        };

        const salary = await Salary.create(salaryData);
        processedPayrolls.push(salary);
      }

      return {
        totalEmployeesProcessed: employees.length,
        month,
        year,
        department: department || "All",
        totalAmount: processedPayrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0),
        payrolls: processedPayrolls
      };
    } catch (error) {
      console.error("Error processing payroll:", error);
      throw new Error("Failed to process payroll");
    }
  },

  async getPayrollStats() {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      // Get all active employees
      const totalEmployees = await Employee.countDocuments({ status: 'Active' });

      // Get payrolls for current month
      const processedPayrolls = await Salary.countDocuments({
        month: currentMonth,
        year: currentYear
      });

      // Get pending payrolls (employees without salary record for current month)
      const pendingPayrolls = totalEmployees - processedPayrolls;

      // Calculate total payroll amount for current month
      const salaries = await Salary.find({
        month: currentMonth,
        year: currentYear
      });
      
      const totalPayrollAmount = salaries.reduce((sum, s) => sum + (s.netSalary || 0), 0);

      const stats = {
        totalEmployees,
        processedThisMonth: processedPayrolls,
        pendingPayrolls: Math.max(0, pendingPayrolls),
        totalPayrollAmount,
        currentMonth,
        currentYear
      };

      return stats;
    } catch (error) {
      console.error("Error fetching payroll stats:", error);
      throw new Error("Failed to fetch payroll statistics");
    }
  },

  async list(filters: any) {
    try {
      const { month, year, department, status } = filters;

      // Build query
      const query: any = {};
      
      if (month) query.month = parseInt(month);
      if (year) query.year = parseInt(year);
      if (department) query.department = department;
      if (status) query.paymentStatus = status;

      // If no month/year specified, use current month
      if (!month && !year) {
        const currentDate = new Date();
        query.month = currentDate.getMonth() + 1;
        query.year = currentDate.getFullYear();
      }

      const payrolls = await Salary.find(query)
        .populate('employeeId', 'name email department designation')
        .sort({ createdAt: -1 })
        .lean();

      return {
        payrolls,
        total: payrolls.length
      };
    } catch (error) {
      console.error("Error listing payrolls:", error);
      throw new Error("Failed to list payrolls");
    }
  }
};