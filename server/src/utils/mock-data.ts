// Mock data generator for testing when database is unavailable

export const generateMockSalaries = () => {
  return {
    salaries: [
      {
        id: "SAL-001",
        employeeName: "Rajesh Kumar",
        employeeId: "EMP001",
        designation: "Sales Manager",
        department: "Sales",
        baseSalary: 45000,
        incentives: 8500,
        deductions: 2500,
        netSalary: 51000,
        grossSalary: 53500,
        allowances: 3000,
        month: "January 2024",
        status: "Paid",
        paymentDate: "2024-01-31",
        workingDays: 26,
        presentDays: 25,
        attendancePercentage: 96,
        relatedIncentives: [
          {
            id: "INC-001",
            type: "Performance",
            amount: 5000,
            status: "Paid"
          },
          {
            id: "INC-002", 
            type: "Target Achievement",
            amount: 3500,
            status: "Paid"
          }
        ]
      },
      {
        id: "SAL-002",
        employeeName: "Priya Sharma",
        employeeId: "EMP002",
        designation: "Marketing Executive",
        department: "Marketing",
        baseSalary: 35000,
        incentives: 5500,
        deductions: 1500,
        netSalary: 39000,
        grossSalary: 40500,
        allowances: 2000,
        month: "January 2024",
        status: "Pending",
        paymentDate: null,
        workingDays: 26,
        presentDays: 26,
        attendancePercentage: 100,
        relatedIncentives: [
          {
            id: "INC-003",
            type: "Performance",
            amount: 5500,
            status: "Processing"
          }
        ]
      },
      {
        id: "SAL-003",
        employeeName: "Amit Patel",
        employeeId: "EMP003",
        designation: "Customer Service Representative",
        department: "Customer Service",
        baseSalary: 28000,
        incentives: 3200,
        deductions: 1200,
        netSalary: 30000,
        grossSalary: 31200,
        allowances: 1800,
        month: "January 2024",
        status: "Paid",
        paymentDate: "2024-01-31",
        workingDays: 26,
        presentDays: 24,
        attendancePercentage: 92,
        relatedIncentives: []
      }
    ],
    total: 3,
    page: 1,
    totalPages: 1
  };
};

export const generateMockIncentives = () => {
  return {
    incentives: [
      {
        id: "INC-001",
        incentiveId: "INC-2024-001",
        employeeName: "Rajesh Kumar",
        employeeCode: "EMP001",
        department: "Sales",
        designation: "Sales Manager",
        incentiveType: "Performance",
        title: "Q4 Sales Performance Bonus",
        description: "Exceeded quarterly sales target by 15%",
        amount: 5000,
        paymentStatus: "Paid",
        approvalStatus: "Approved",
        paymentDate: "2024-01-31",
        month: 1,
        year: 2024
      },
      {
        id: "INC-002",
        incentiveId: "INC-2024-002",
        employeeName: "Rajesh Kumar",
        employeeCode: "EMP001",
        department: "Sales",
        designation: "Sales Manager",
        incentiveType: "Target Achievement",
        title: "Monthly Target Achievement",
        description: "Achieved 120% of monthly target",
        amount: 3500,
        paymentStatus: "Paid",
        approvalStatus: "Approved",
        paymentDate: "2024-01-31",
        month: 1,
        year: 2024
      },
      {
        id: "INC-003",
        incentiveId: "INC-2024-003",
        employeeName: "Priya Sharma",
        employeeCode: "EMP002",
        department: "Marketing",
        designation: "Marketing Executive",
        incentiveType: "Performance",
        title: "Campaign Success Bonus",
        description: "Led successful marketing campaign with 25% ROI",
        amount: 5500,
        paymentStatus: "Processing",
        approvalStatus: "Approved",
        paymentDate: null,
        month: 1,
        year: 2024
      }
    ],
    total: 3,
    page: 1,
    totalPages: 1
  };
};

export const generateMockEmployees = () => {
  return {
    employees: [
      {
        id: "675a1234567890abcdef1234",
        name: "Rajesh Kumar",
        age: 32,
        gender: "Male",
        email: "rajesh.kumar@opositivehealth.com",
        phone: "9876543210",
        designation: "Sales Manager",
        department: "Sales",
        salary: 45000,
        qualification: "MBA Marketing",
        address: "123 Main Street, Mumbai",
        aadharNumber: "1234-5678-9012",
        pancardNumber: "ABCDE1234F"
      },
      {
        id: "675a1234567890abcdef1235",
        name: "Priya Sharma",
        age: 28,
        gender: "Female",
        email: "priya.sharma@opositivehealth.com", 
        phone: "9876543211",
        designation: "Marketing Executive",
        department: "Marketing",
        salary: 35000,
        qualification: "B.Com Marketing",
        address: "456 Business District, Delhi",
        aadharNumber: "2345-6789-0123",
        pancardNumber: "BCDEF2345G"
      }
    ],
    total: 2,
    page: 1,
    totalPages: 1
  };
};

export const generateMockPartners = () => {
  return {
    partners: [
      {
        id: "675a1234567890abcdef1236",
        partnerId: "PART-2024-001",
        name: "Sunrise Diagnostics",
        type: "Corporate",
        businessType: "Diagnostic",
        contactNumber: "9876543212",
        email: "contact@sunrisediag.com",
        city: "Mumbai",
        state: "Maharashtra",
        status: "Active",
        contractStatus: "Active",
        companyName: "Sunrise Diagnostics Pvt Ltd",
        gstNumber: "27ABCDE1234F1Z5",
        contractValue: 500000,
        commissionRate: 15
      },
      {
        id: "675a1234567890abcdef1237",
        partnerId: "PART-2024-002", 
        name: "Dr. Vikram Singh",
        type: "Individual",
        businessType: "Consultant",
        contactNumber: "9876543213",
        email: "dr.vikram@email.com",
        city: "Delhi",
        state: "Delhi",
        status: "Active",
        contractStatus: "Active",
        firstName: "Vikram",
        lastName: "Singh",
        aadharNumber: "3456-7890-1234",
        contractValue: 200000,
        commissionRate: 20
      }
    ],
    total: 2,
    page: 1,
    totalPages: 1
  };
};

export const generateMockDoctors = () => {
  return {
    doctors: [
      {
        id: "675a1234567890abcdef1238",
        name: "Dr. Ananya Desai",
        specialization: "Cardiology",
        email: "dr.ananya@opositivehealth.com",
        phone: "9876543214",
        qualifications: "MBBS, MD Cardiology",
        experienceYears: 12,
        consultationFee: 1500,
        type: "With Us",
        location: "Mumbai",
        availability: "Available",
        isActive: true,
        status: "Active",
        rating: 4.8,
        languages: ["English", "Hindi", "Marathi"]
      },
      {
        id: "675a1234567890abcdef1239",
        name: "Dr. Rohit Mehta",
        specialization: "Orthopedics",
        email: "dr.rohit@external.com",
        phone: "9876543215",
        qualifications: "MBBS, MS Orthopedics",
        experienceYears: 8,
        consultationFee: 1200,
        type: "Self Clinic",
        location: "Delhi",
        availability: "Busy",
        isActive: true,
        status: "Active",
        rating: 4.6,
        languages: ["English", "Hindi"]
      }
    ],
    total: 2,
    page: 1,
    totalPages: 1
  };
};