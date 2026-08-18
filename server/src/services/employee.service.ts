import { Employee } from "../models/employee.model";
import { User } from "../models/user.model";
import { AuthService } from "./auth.service";
import { RoleService } from "./role.service";

export const EmployeeService = {
  async list(filters: any = {}) {
    try {
      const {
        department,
        designation,
        status,
        page = 1,
        limit = 10,
        sort = "-createdAt",
      } = filters;

      const query: any = {};

      if (department) query.department = new RegExp(department, "i");
      if (designation) query.designation = new RegExp(designation, "i");

      const skip = (page - 1) * limit;

      const [employeesData, total] = await Promise.all([
        Employee.find(query)
          .populate("reportsTo", "name designation")
          .populate("userId", "userId role email") // Populate userId to get user details
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Employee.countDocuments(query),
      ]);

      // Transform data to match frontend expectations
      const employees = employeesData.map((employee: any) => {
        // Calculate system age in months
        let systemAgeMonths = 0;
        if (employee.joiningDate) {
          const now = new Date();
          const joining = new Date(employee.joiningDate);
          systemAgeMonths =
            (now.getFullYear() - joining.getFullYear()) * 12 +
            (now.getMonth() - joining.getMonth());
          systemAgeMonths = Math.max(0, systemAgeMonths);
        }

        return {
          _id: employee._id, // Frontend expects _id, not id
          employeeId: employee.employeeId,
          name: employee.name,
          age: employee.age,
          gender: employee.gender,
          email: employee.email,
          phone: employee.phone,
          designation: employee.designation,
          department: employee.department,
          salary: employee.salary,
          status: employee.status,
          joiningDate: employee.joiningDate,
          qualification: employee.qualification,
          address: employee.address,
          aadharNumber: employee.aadharNumber,
          pancardNumber: employee.pancardNumber,
          previousEmployer: employee.previousEmployer,
          reportingTo: employee.reportsTo
            ? (employee.reportsTo as any).name
            : null,
          reportsTo: employee.reportsTo,
          photo: employee.photo,
          resume: employee.resume,
          loans: employee.loans,
          incentives: employee.incentives,
          // New fields
          dateOfBirth: employee.dateOfBirth,
          dateOfEnding: employee.dateOfEnding,
          startingSalary: employee.startingSalary,
          increments: employee.increments || [],
          alternateNumber: employee.alternateNumber,
          fatherName: employee.fatherName,
          experience: employee.experience,
          addressPresent: employee.addressPresent,
          addressPermanent: employee.addressPermanent,
          systemAgeMonths: systemAgeMonths,
          hasAccount: employee.hasAccount,
          userId: employee.userId,
          // Bank details
          bankDetails: employee.bankDetails || null,
          // Documents
          documents: employee.documents || [],
          createdAt: employee.createdAt,
          updatedAt: employee.updatedAt,
        };
      });

      return {
        employees,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("Error fetching employees:", error);
      throw error;
    }
  },

  async getById(id: string) {
    try {
      const employee: any = await Employee.findById(id)
        .populate("reportsTo", "name designation")
        .populate("userId", "userId role email") // Populate userId to get user details
        .lean();

      if (!employee) {
        return null;
      }

      // Check if user exists by phone number even if userId is not set
      // This handles cases where account was created but employee record wasn't updated
      let userAccount = employee.userId;
      if (!userAccount && employee.phone) {
        const existingUser = await User.findOne({ phone: employee.phone })
          .select("userId role email")
          .lean();
        
        if (existingUser) {
          // Sync the employee record with the user
          await Employee.findByIdAndUpdate(id, {
            hasAccount: true,
            userId: existingUser._id,
          });
          userAccount = existingUser;
        }
      }

      // Calculate system age in months
      let systemAgeMonths = 0;
      if (employee.joiningDate) {
        const now = new Date();
        const joining = new Date(employee.joiningDate);
        systemAgeMonths =
          (now.getFullYear() - joining.getFullYear()) * 12 +
          (now.getMonth() - joining.getMonth());
        systemAgeMonths = Math.max(0, systemAgeMonths);
      }

      return {
        _id: employee._id, // Frontend expects _id, not id
        employeeId: employee.employeeId,
        name: employee.name,
        age: employee.age,
        gender: employee.gender,
        email: employee.email,
        phone: employee.phone,
        designation: employee.designation,
        department: employee.department,
        salary: employee.salary,
        status: employee.status,
        joiningDate: employee.joiningDate,
        qualification: employee.qualification,
        address: employee.address,
        aadharNumber: employee.aadharNumber,
        pancardNumber: employee.pancardNumber,
        previousEmployer: employee.previousEmployer,
        reportingTo: employee.reportsTo
          ? (employee.reportsTo as any).name
          : null,
        reportsTo: employee.reportsTo,
        photo: employee.photo,
        resume: employee.resume,
        loans: employee.loans,
        incentives: employee.incentives,
        // New fields
        dateOfBirth: employee.dateOfBirth,
        dateOfEnding: employee.dateOfEnding,
        startingSalary: employee.startingSalary,
        increments: employee.increments || [],
        alternateNumber: employee.alternateNumber,
        fatherName: employee.fatherName,
        experience: employee.experience,
        addressPresent: employee.addressPresent,
        addressPermanent: employee.addressPermanent,
        systemAgeMonths: systemAgeMonths,
        hasAccount: userAccount ? true : employee.hasAccount,
        userId: userAccount || employee.userId,
        // Bank details
        bankDetails: employee.bankDetails || null,
        // Documents
        documents: employee.documents || [],
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt,
      };
    } catch (error) {
      console.error("Error fetching employee:", error);
      throw error;
    }
  },

  async create(data: any) {
    try {
      // Validate required fields
      if (!data.name) {
        throw new Error("Employee name is required");
      }
      if (!data.email) {
        throw new Error("Employee email is required");
      }
      if (!data.phone) {
        throw new Error("Employee phone is required");
      }

      // Generate employeeId if not provided
      if (!data.employeeId) {
        const count = await Employee.countDocuments();
        data.employeeId = `EMP${String(count + 1).padStart(4, "0")}`;
      }

      // Set default status if not provided
      if (!data.status) {
        data.status = "Active";
      }

      // Set joining date if not provided
      if (!data.joiningDate) {
        data.joiningDate = new Date();
      }

      // Create employee
      const employee = await Employee.create(data);

      // Create user credentials if requested
      let user = null;
      if (data.createCredentials && data.userData) {
        try {
          const userData = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            employeeId: employee.employeeId,
            ...data.userData,
          };

          // Handle custom role
          if (data.userData.customRole) {
            const customRole = await RoleService.getRoleById(
              data.userData.customRole
            );
            if (customRole) {
              userData.customRole = customRole._id;
              userData.role = customRole.name; // Set role name for backwards compatibility
            }
          }

          user = await AuthService.createUser(userData);
        } catch (userError) {
          // If user creation fails, delete the created employee and throw error
          await Employee.findByIdAndDelete(employee._id);
          throw new Error(
            `Failed to create user credentials: ${userError.message}`
          );
        }
      }

      return {
        employee,
        user,
        message: user
          ? "Employee and user credentials created successfully"
          : "Employee created successfully",
      };
    } catch (error) {
      console.error("Error creating employee:", error);
      throw error;
    }
  },

  async update(id: string, data: any) {
    try {
      return await Employee.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      console.error("Error updating employee:", error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      return await Employee.findByIdAndDelete(id);
    } catch (error) {
      console.error("Error deleting employee:", error);
      throw error;
    }
  },

  async updateHierarchy(id: string, reportsTo: string) {
    try {
      return await Employee.findByIdAndUpdate(id, { reportsTo }, { new: true });
    } catch (error) {
      console.error("Error updating employee hierarchy:", error);
      throw error;
    }
  },

  async getStats() {
    try {
      const [totalEmployees, activeEmployees, departmentStats] =
        await Promise.all([
          Employee.countDocuments(),
          Employee.countDocuments({ status: { $ne: "Inactive" } }),
          Employee.aggregate([
            {
              $group: {
                _id: "$department",
                count: { $sum: 1 },
                avgSalary: { $avg: "$salary" },
              },
            },
            { $sort: { count: -1 } },
          ]),
        ]);

      return {
        totalEmployees,
        activeEmployees,
        departmentBreakdown: departmentStats,
      };
    } catch (error) {
      console.error("Error fetching employee stats:", error);
      throw error;
    }
  },

  async createUserAccount(
    employeeId: string,
    userData?: { username?: string; password?: string; role?: string }
  ) {
    try {
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        throw new Error("Employee not found");
      }

      // Check if a user already exists with this phone number
      const existingUser = await User.findOne({ phone: employee.phone });
      if (existingUser) {
        // User exists but employee record might not be linked
        // Sync the employee record with the existing user
        await Employee.findByIdAndUpdate(employeeId, {
          hasAccount: true,
          userId: existingUser._id,
        });

        return {
          user: existingUser,
          username: existingUser.userId,
          message: "Account already exists and has been linked to this employee",
          alreadyExisted: true,
        };
      }

      if (employee.hasAccount && employee.userId) {
        throw new Error("Employee already has a user account");
      }

      // Generate username if not provided
      const employeeName = employee.name ? String(employee.name) : "user";
      const username =
        userData?.username ||
        `${employeeName.toLowerCase().replace(/\s+/g, ".")}`;

      // Generate password if not provided (auto-generate)
      const password =
        userData?.password ||
        Math.random().toString(36).slice(-8) +
          Math.random().toString(36).slice(-8).toUpperCase();

      // Create user with the provided or default role
      const user = await AuthService.createUser({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        employeeId: employee.employeeId,
        username: username,
        password: password,
        role: userData?.role || "bd",
      });

      // Update employee record
      await Employee.findByIdAndUpdate(employeeId, {
        hasAccount: true,
        userId: user._id,
      });

      return {
        user,
        username,
        passwordPlain: password, // Return only once for the admin
        message: "User account created successfully",
        alreadyExisted: false,
      };
    } catch (error: any) {
      console.error("Error creating user account:", error);
      throw error;
    }
  },

  async removeUserAccount(employeeId: string) {
    try {
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        throw new Error("Employee not found");
      }

      if (!employee.hasAccount || !employee.userId) {
        throw new Error("Employee does not have a user account");
      }

      // Delete the user account
      await AuthService.deleteUser(employee.userId.toString());

      // Update employee record
      await Employee.findByIdAndUpdate(employeeId, {
        hasAccount: false,
        userId: null,
      });

      return {
        message: "User account removed successfully",
      };
    } catch (error: any) {
      console.error("Error removing user account:", error);
      throw error;
    }
  },
};
