// MongoDB Comprehensive Seed Data Script
// Run this script to populate the database with sample data for ALL modules
// Usage: node scripts/seed-data.js [--clear] [--module=module_name]

const { MongoClient } = require("mongodb");

// Configuration
const config = {
  clearDatabase: process.argv.includes("--clear"),
  specificModule: process.argv
    .find((arg) => arg.startsWith("--module="))
    ?.split("=")[1],
  verbose: process.argv.includes("--verbose"),
};

function log(message, type = "info") {
  const timestamp = new Date().toISOString();
  const prefix = type === "error" ? "❌" : type === "success" ? "✅" : "ℹ️";
  console.log(`${prefix} [${timestamp}] ${message}`);
}

async function main() {
  const uri =
    "mongodb+srv://avinash:MPLS52MY3XvCKkqP@opositivehealthcrm.727tycn.mongodb.net/o_positive_health_crm?retryWrites=true&w=majority&appName=OPositiveHealthCRM";
  const client = new MongoClient(uri);

  try {
    log("Connecting to MongoDB...");
    await client.connect();
    const database = client.db("o_positive_health_crm");

    // Get all collections
    const usersCollection = database.collection("users");
    const leadsCollection = database.collection("leads");
    const employeesCollection = database.collection("employees");
    const doctorsCollection = database.collection("doctors");
    const hospitalsCollection = database.collection("hospitals");
    const cabsCollection = database.collection("cabs");
    const partnersCollection = database.collection("partners");
    const loansCollection = database.collection("loans");
    const insuranceCollection = database.collection("insurances");
    const reimbursementCollection = database.collection("reimbursements");
    const appointmentCollection = database.collection("appointments");
    const invoiceCollection = database.collection("invoices");

    // Clear database if requested
    if (config.clearDatabase) {
      log("Clearing existing data...");
      await Promise.all([
        usersCollection.deleteMany({}),
        leadsCollection.deleteMany({}),
        employeesCollection.deleteMany({}),
        doctorsCollection.deleteMany({}),
        hospitalsCollection.deleteMany({}),
        cabsCollection.deleteMany({}),
        partnersCollection.deleteMany({}),
        loansCollection.deleteMany({}),
        insuranceCollection.deleteMany({}),
        reimbursementCollection.deleteMany({}),
        appointmentCollection.deleteMany({}),
        invoiceCollection.deleteMany({}),
      ]);
      log("Database cleared successfully", "success");
    }

    // Module: Users
    if (!config.specificModule || config.specificModule === "users") {
      log("Populating Users...");
      await usersCollection.insertMany([
        {
          userId: "admin001",
          employeeId: "EMP001",
          name: "Admin User",
          email: "admin@opositivehealth.com",
          phone: "9876543210",
          password:
            "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm", // password: admin123
          role: "admin",
          isVerified: true,
        },
        {
          userId: "bd001",
          employeeId: "EMP002",
          name: "John Smith",
          email: "john@opositivehealth.com",
          phone: "9876543211",
          password:
            "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm", // password: admin123
          role: "bd",
          isVerified: true,
        },
        {
          userId: "hr001",
          employeeId: "EMP003",
          name: "Sarah Johnson",
          email: "sarah@opositivehealth.com",
          phone: "9876543212",
          password:
            "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm", // password: admin123
          role: "hr",
          isVerified: true,
        },
        {
          userId: "doc001",
          employeeId: "DOC001",
          name: "Dr. Amit Patel",
          email: "amit.patel@opositivehealth.com",
          phone: "9876543215",
          password:
            "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm", // password: admin123
          role: "doctor",
          isVerified: true,
        },
        {
          userId: "finance001",
          employeeId: "EMP004",
          name: "Finance Manager",
          email: "finance@opositivehealth.com",
          phone: "9876543230",
          password:
            "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm", // password: admin123
          role: "finance",
          isVerified: true,
        },
      ]);
      log("✅ Users inserted successfully", "success");
    }

    // Module: Leads
    if (!config.specificModule || config.specificModule === "leads") {
      log("Populating Leads...");
      await leadsCollection.insertMany([
        {
          patientId: "PAT001",
          patientName: "Rajesh Kumar",
          age: 45,
          gender: "Male",
          dob: new Date("1978-05-15"),
          contact: {
            mobile: "9876543213",
            email: "rajesh@email.com",
            whatsappNumber: "9876543213",
          },
          treatment: "Cardiology Consultation",
          city: "Mumbai",
          modeOfPayment: "Insurance",
          leadStatus: "New",
          description: "Patient needs cardiac evaluation",
          opdStatus: "Pending",
          ipdStatus: "Not Required",
          insuranceDetails: {
            hasInsurance: true,
            policyType: "Corporate",
            policyNumber: "POL123456",
            insuranceCompanyName: "Star Health Insurance",
          },
          documents: [],
          aadharNumber: "123456789012",
          pancardNumber: "ABCDE1234F",
          workingProfession: "Software Engineer",
          leadSource: "Website",
          address: "123 Main Street, Mumbai",
          pincode: "400001",
          engagement: {
            firstEngagement: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            lastEngagement: new Date(),
            followUpAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            daysToClose: 7,
          },
        },
        {
          patientId: "PAT002",
          patientName: "Priya Sharma",
          age: 32,
          gender: "Female",
          dob: new Date("1991-08-22"),
          contact: {
            mobile: "9876543214",
            email: "priya@email.com",
            whatsappNumber: "9876543214",
          },
          treatment: "Gynecology Consultation",
          city: "Delhi",
          modeOfPayment: "Cash",
          leadStatus: "Follow-up",
          description: "Routine checkup required",
          opdStatus: "Scheduled",
          ipdStatus: "Not Required",
          insuranceDetails: {
            hasInsurance: false,
          },
          documents: [],
          aadharNumber: "111122223333",
          pancardNumber: "BCDEF2345G",
          workingProfession: "Teacher",
          leadSource: "Referral",
          address: "456 Park Avenue, Delhi",
          pincode: "110001",
          engagement: {
            firstEngagement: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            lastEngagement: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            followUpAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            daysToClose: 3,
          },
        },
        {
          patientId: "PAT003",
          patientName: "Arjun Mehta",
          age: 28,
          gender: "Male",
          dob: new Date("1995-12-10"),
          contact: {
            mobile: "9876543240",
            email: "arjun@email.com",
            whatsappNumber: "9876543240",
          },
          treatment: "Orthopedic Consultation",
          city: "Mumbai",
          modeOfPayment: "Cash",
          leadStatus: "Converted",
          description: "Sports injury - knee pain",
          opdStatus: "Completed",
          ipdStatus: "Not Required",
          insuranceDetails: {
            hasInsurance: true,
            policyType: "Individual",
            policyNumber: "POL789012",
            insuranceCompanyName: "HDFC ERGO",
          },
          documents: [],
          aadharNumber: "333344445555",
          pancardNumber: "CDEFG3456H",
          workingProfession: "Athlete",
          leadSource: "Direct",
          address: "789 Sports Complex Road, Mumbai",
          pincode: "400003",
          engagement: {
            firstEngagement: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            lastEngagement: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            followUpAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            daysToClose: 14,
          },
        },
      ]);
      log("✅ Leads inserted successfully", "success");
    }

    // Module: Employees
    if (!config.specificModule || config.specificModule === "employees") {
      log("Populating Employees...");
      await employeesCollection.insertMany([
        {
          name: "Admin User",
          age: 35,
          gender: "Male",
          email: "admin.work@opositivehealth.com",
          phone: "9876543210",
          address: "123 Admin Street, Mumbai",
          designation: "System Administrator",
          department: "IT",
          qualification: "B.Tech Computer Science",
          aadharNumber: "111122223333",
          pancardNumber: "ABCDE1234F",
          salary: 80000,
        },
        {
          name: "John Smith",
          age: 28,
          gender: "Male",
          email: "john.work@opositivehealth.com",
          phone: "9876543211",
          address: "456 BD Street, Mumbai",
          designation: "Business Development Executive",
          department: "Sales",
          qualification: "MBA Marketing",
          aadharNumber: "222233334444",
          pancardNumber: "BCDEF2345G",
          salary: 45000,
        },
        {
          name: "Sarah Johnson",
          age: 30,
          gender: "Female",
          email: "sarah.work@opositivehealth.com",
          phone: "9876543212",
          address: "789 HR Street, Mumbai",
          designation: "HR Manager",
          department: "Human Resources",
          qualification: "MBA HR",
          aadharNumber: "333344445555",
          pancardNumber: "CDEFG3456H",
          salary: 60000,
        },
        {
          name: "Finance Manager",
          age: 40,
          gender: "Male",
          email: "finance.work@opositivehealth.com",
          phone: "9876543230",
          address: "321 Finance Street, Mumbai",
          designation: "Finance Manager",
          department: "Finance",
          qualification: "CA",
          aadharNumber: "444455556666",
          pancardNumber: "DEFGH4567I",
          salary: 90000,
        },
      ]);
      log("✅ Employees inserted successfully", "success");
    }

    // Module: Doctors
    if (!config.specificModule || config.specificModule === "doctors") {
      log("Populating Doctors...");
      await doctorsCollection.insertMany([
        {
          name: "Dr. Amit Patel",
          specialization: "Cardiology",
          phone: "9876543215",
          email: "amit.patel@hospital.com",
          location: "Mumbai",
          consultationFee: 1500,
          availability: "Monday, Wednesday, Friday",
          qualifications: "MD Cardiology, MBBS",
          experienceYears: 15,
          languages: ["English", "Hindi", "Gujarati"],
          rating: 4.8,
          tags: ["Heart Specialist", "Interventional Cardiology"],
          address: "City Hospital, Mumbai",
          isActive: true,
        },
        {
          name: "Dr. Sunita Reddy",
          specialization: "Gynecology",
          phone: "9876543216",
          email: "sunita.reddy@hospital.com",
          location: "Delhi",
          consultationFee: 1200,
          availability: "Tuesday, Thursday, Saturday",
          qualifications: "MD Gynecology, MBBS",
          experienceYears: 12,
          languages: ["English", "Hindi", "Telugu"],
          rating: 4.7,
          tags: ["Women's Health", "Maternity Care"],
          address: "Metro Hospital, Delhi",
          isActive: true,
        },
        {
          name: "Dr. Rakesh Sharma",
          specialization: "Orthopedics",
          phone: "9876543241",
          email: "rakesh.sharma@hospital.com",
          location: "Mumbai",
          consultationFee: 1800,
          availability: "Monday, Tuesday, Thursday, Friday",
          qualifications: "MS Orthopedics, MBBS",
          experienceYears: 18,
          languages: ["English", "Hindi"],
          rating: 4.9,
          tags: ["Sports Medicine", "Joint Replacement"],
          address: "City Hospital, Mumbai",
          isActive: true,
        },
        {
          name: "Dr. Neha Agarwal",
          specialization: "Dermatology",
          phone: "9876543242",
          email: "neha.agarwal@hospital.com",
          location: "Delhi",
          consultationFee: 1000,
          availability: "Monday, Wednesday, Friday, Saturday",
          qualifications: "MD Dermatology, MBBS",
          experienceYears: 8,
          languages: ["English", "Hindi"],
          rating: 4.6,
          tags: ["Skin Care", "Cosmetic Dermatology"],
          address: "Metro Hospital, Delhi",
          isActive: true,
        },
      ]);
      log("✅ Doctors inserted successfully", "success");
    }

    // Module: Hospitals
    if (!config.specificModule || config.specificModule === "hospitals") {
      log("Populating Hospitals...");
      await hospitalsCollection.insertMany([
        {
          name: "City Hospital",
          address: "123 Hospital Road, Mumbai",
          phone: "022-12345678",
          email: "info@cityhospital.com",
          location: {
            city: "Mumbai",
            state: "Maharashtra",
            pin: "400002",
            lat: 19.076,
            lng: 72.8777,
          },
          type: "Multi-specialty",
          beds: 300,
          rating: 4.5,
          emergencyServices: "Yes",
          ambulanceService: true,
          laboratoryService: true,
          pharmacyService: true,
          status: "Active",
          facilities: ["ICU", "Emergency", "Pharmacy", "Laboratory"],
          specializations: [
            "Cardiology",
            "Neurology",
            "Orthopedics",
            "General Medicine",
          ],
          contactPerson: {
            name: "Dr. Admin",
            phone: "022-12345678",
            email: "admin@cityhospital.com",
            designation: "Administrator",
          },
          website: "https://cityhospital.com",
          description: "Leading multi-specialty hospital in Mumbai",
          isActive: true,
        },
        {
          name: "Metro Hospital",
          address: "456 Metro Street, Delhi",
          phone: "011-87654321",
          email: "info@metrohospital.com",
          location: {
            city: "Delhi",
            state: "Delhi",
            pin: "110002",
            lat: 28.7041,
            lng: 77.1025,
          },
          type: "Specialty",
          beds: 200,
          rating: 4.3,
          emergencyServices: "Yes",
          ambulanceService: true,
          laboratoryService: true,
          pharmacyService: true,
          status: "Active",
          facilities: ["NICU", "Emergency", "Pharmacy", "Radiology"],
          specializations: ["Gynecology", "Pediatrics", "Dermatology", "ENT"],
          contactPerson: {
            name: "Dr. Metro Admin",
            phone: "011-87654321",
            email: "admin@metrohospital.com",
            designation: "Chief Administrator",
          },
          website: "https://metrohospital.com",
          description: "Specialized care hospital in Delhi",
          isActive: true,
        },
        {
          name: "Apollo Health Center",
          address: "789 Apollo Road, Mumbai",
          phone: "022-98765432",
          email: "info@apollohealth.com",
          location: {
            city: "Mumbai",
            state: "Maharashtra",
            pin: "400003",
            lat: 19.0176,
            lng: 72.8562,
          },
          type: "Super Specialty",
          beds: 400,
          rating: 4.8,
          emergencyServices: "Yes",
          ambulanceService: true,
          laboratoryService: true,
          pharmacyService: true,
          status: "Active",
          facilities: [
            "ICU",
            "NICU",
            "Emergency",
            "Pharmacy",
            "Laboratory",
            "Radiology",
          ],
          specializations: [
            "Cardiology",
            "Orthopedics",
            "Dermatology",
            "Neurology",
          ],
          contactPerson: {
            name: "Dr. Apollo Admin",
            phone: "022-98765432",
            email: "admin@apollohealth.com",
            designation: "Medical Director",
          },
          website: "https://apollohealth.com",
          description: "Premium super specialty hospital",
          isActive: true,
        },
      ]);
      log("✅ Hospitals inserted successfully", "success");
    }

    // Module: Cabs
    if (!config.specificModule || config.specificModule === "cabs") {
      log("Populating Cabs...");

      // Get employee IDs for booking references
      const employees = await employeesCollection.find({}).limit(4).toArray();
      const empIds = employees.map((emp) => emp._id);

      await cabsCollection.insertMany([
        {
          bookingId: "OPD240001",
          patientName: "Rajesh Kumar",
          phone: "9876543213",
          requestedBy: empIds[0] || null,
          requestedByModel: "Employee",
          pickupLocation: {
            address: "123 Main Street, Mumbai",
            lat: 19.076,
            lng: 72.8777,
          },
          destination: {
            address: "City Hospital, Mumbai",
            lat: 19.0176,
            lng: 72.8562,
          },
          serviceType: "OPD",
          department: "Cardiology",
          appointmentTime: "10:00 AM",
          urgency: "Normal",
          pickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          driverName: "Ramesh Singh",
          vehicleNumber: "MH-01-AB-1234",
          status: "Confirmed",
          fare: "₹300",
          estimatedFare: "₹300",
          distance: "12 km",
          returnTrip: "Yes",
          notes: "Patient needs assistance walking",
        },
        {
          bookingId: "IPD240002",
          patientName: "Priya Sharma",
          phone: "9876543214",
          requestedBy: empIds[1] || null,
          requestedByModel: "Employee",
          pickupLocation: {
            address: "456 Park Avenue, Delhi",
            lat: 28.7041,
            lng: 77.1025,
          },
          destination: {
            address: "Metro Hospital, Delhi",
            lat: 28.6139,
            lng: 77.209,
          },
          serviceType: "IPD",
          admissionType: "Emergency",
          roomNumber: "A-201",
          urgency: "High",
          pickupTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
          driverName: "Suresh Kumar",
          vehicleNumber: "DL-02-CD-5678",
          status: "In Progress",
          fare: "₹500",
          estimatedFare: "₹500",
          distance: "18 km",
          returnTrip: "No",
          notes: "Emergency admission required",
        },
        {
          bookingId: "SCH240003",
          patientName: "Arjun Mehta",
          phone: "9876543240",
          requestedBy: empIds[2] || null,
          requestedByModel: "Employee",
          pickupLocation: {
            address: "789 Sports Complex Road, Mumbai",
            lat: 19.0176,
            lng: 72.8562,
          },
          destination: {
            address: "Apollo Health Center, Mumbai",
            lat: 19.076,
            lng: 72.8777,
          },
          serviceType: "Employee",
          urgency: "Low",
          pickupTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
          isScheduled: true,
          scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          scheduledTime: "2:00 PM",
          driverName: "Manoj Yadav",
          vehicleNumber: "MH-02-EF-9012",
          status: "Scheduled",
          fare: "₹250",
          estimatedFare: "₹250",
          distance: "8 km",
          returnTrip: "Yes",
          notes: "Follow-up appointment",
        },
        {
          bookingId: "CAB240004",
          patientName: "Dr. Amit Patel",
          phone: "9876543215",
          requestedBy: empIds[3] || null,
          requestedByModel: "Employee",
          pickupLocation: {
            address: "City Hospital, Mumbai",
            lat: 19.0176,
            lng: 72.8562,
          },
          destination: {
            address: "Medical Conference Center, Mumbai",
            lat: 19.076,
            lng: 72.8777,
          },
          serviceType: "Doctor",
          urgency: "Normal",
          pickupTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
          driverName: "Vikram Joshi",
          vehicleNumber: "DL-03-GH-3456",
          status: "Pending Assignment",
          fare: "₹400",
          estimatedFare: "₹400",
          distance: "15 km",
          returnTrip: "Yes",
          notes: "Doctor transport for conference",
        },
      ]);
      log("✅ Cabs inserted successfully", "success");
    }

    // Module: Partners
    if (!config.specificModule || config.specificModule === "partners") {
      log("Populating Partners...");
      await partnersCollection.insertMany([
        {
          name: "TechCorp Solutions",
          type: "Insurance",
          contactPerson: "John Manager",
          phone: "022-98765432",
          email: "contact@techcorp.com",
          address: "789 Business Park, Mumbai",
          location: {
            city: "Mumbai",
            state: "Maharashtra",
            pin: "400001",
          },
          services: ["Employee Health Insurance", "Wellness Programs"],
          contractStartDate: new Date("2023-01-01"),
          contractEndDate: new Date("2024-12-31"),
          isActive: true,
          notes: "Corporate insurance partner",
        },
        {
          name: "Individual Partner - Ravi Gupta",
          type: "Other",
          contactPerson: "Ravi Gupta",
          phone: "9876543219",
          email: "ravi.gupta@email.com",
          address: "321 Residential Area, Delhi",
          location: {
            city: "Delhi",
            state: "Delhi",
            pin: "110001",
          },
          services: ["Referral Services"],
          contractStartDate: new Date("2023-06-01"),
          contractEndDate: new Date("2024-05-31"),
          isActive: true,
          notes: "Individual referral partner",
        },
        {
          name: "HealthCare Associates",
          type: "Lab",
          contactPerson: "Dr. Associate",
          phone: "011-12345678",
          email: "partners@healthcare.com",
          address: "456 Healthcare Complex, Delhi",
          location: {
            city: "Delhi",
            state: "Delhi",
            pin: "110002",
          },
          services: ["Medical Equipment", "Laboratory Services"],
          contractStartDate: new Date("2023-03-01"),
          contractEndDate: new Date("2025-02-28"),
          isActive: true,
          notes: "Laboratory services partner",
        },
      ]);
      log("✅ Partners inserted successfully", "success");
    }

    // Module: Loans
    if (!config.specificModule || config.specificModule === "loans") {
      log("Populating Loans...");

      // Get lead IDs for linking loans to patients
      const leads = await leadsCollection.find({}).toArray();
      const leadIds = leads.map((lead) => lead._id);

      await loansCollection.insertMany([
        {
          leadId: leadIds[0] || null, // Rajesh Kumar
          amount: 500000,
          approvedAmount: 450000,
          creditedAmount: 425000, // after GST and deductions
          loanPurpose: "Cardiac Surgery",
          treatmentType: "Surgery",
          urgency: "High",
          hospital: "City Hospital",
          doctorName: "Dr. Amit Patel",
          estimatedTreatmentCost: 500000,
          applicantDetails: {
            fullName: "Vikash Sharma",
            contactNumber: "9876543220",
            alternateNumber: "9876543221",
            email: "vikash.sharma@email.com",
            address: "123 Treatment Street, Mumbai",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400001",
            dateOfBirth: new Date("1985-05-15"),
          },
          financialDetails: {
            occupation: "Software Engineer",
            monthlyIncome: 80000,
            employerName: "TechCorp Ltd",
            workExperience: "10 years",
          },
          interestRate: 12.5,
          tenureMonths: 24,
          emiAmount: 23456,
          status: "Active",
          applicationDate: new Date("2023-10-01"),
          approvalDate: new Date("2023-10-15"),
          disbursalDate: new Date("2023-10-20"),
          disbursementStatus: "Disbursed",
          assignTo: "Loan Officer 1",
          leadSource: "Hospital",
          priority: "High",
          notes: "Fast-tracked due to emergency",
          applicantType: "Patient",
          documents: ["aadhar.pdf", "income_proof.pdf"],
        },
        {
          leadId: leadIds[1] || null, // Priya Sharma
          amount: 200000,
          loanPurpose: "Emergency Medical Treatment",
          treatmentType: "Emergency",
          urgency: "Emergency",
          hospital: "Metro Hospital",
          doctorName: "Dr. Sunita Reddy",
          estimatedTreatmentCost: 200000,
          applicantDetails: {
            fullName: "Anjali Patel",
            contactNumber: "9876543221",
            email: "anjali.patel@email.com",
            address: "456 Emergency Lane, Delhi",
            city: "Delhi",
            state: "Delhi",
            pincode: "110001",
            dateOfBirth: new Date("1990-08-22"),
          },
          financialDetails: {
            occupation: "Teacher",
            monthlyIncome: 45000,
            employerName: "Delhi Public School",
            workExperience: "5 years",
          },
          interestRate: 10.0,
          tenureMonths: 12,
          status: "Under Review",
          applicationDate: new Date("2023-11-01"),
          disbursementStatus: "Pending",
          assignTo: "Loan Officer 2",
          leadSource: "Website",
          priority: "High",
          notes: "Under documentation review",
          applicantType: "Patient",
          documents: ["aadhar.pdf"],
        },
        {
          leadId: leadIds[2] || null, // Arjun Mehta
          amount: 750000,
          approvedAmount: 700000,
          creditedAmount: 665000,
          loanPurpose: "Orthopedic Surgery",
          treatmentType: "Surgery",
          urgency: "Normal",
          hospital: "Apollo Health Center",
          doctorName: "Dr. Rakesh Sharma",
          estimatedTreatmentCost: 750000,
          applicantDetails: {
            fullName: "Rohit Kumar",
            contactNumber: "9876543245",
            email: "rohit.kumar@email.com",
            address: "789 Sports Lane, Mumbai",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400003",
            dateOfBirth: new Date("1988-12-10"),
          },
          financialDetails: {
            occupation: "Business Owner",
            monthlyIncome: 120000,
            employerName: "Self Employed",
            workExperience: "8 years",
          },
          interestRate: 11.5,
          tenureMonths: 36,
          emiAmount: 25123,
          status: "Active",
          applicationDate: new Date("2023-09-15"),
          approvalDate: new Date("2023-09-30"),
          disbursalDate: new Date("2023-10-05"),
          disbursementStatus: "Disbursed",
          assignTo: "Loan Officer 1",
          leadSource: "Referral",
          priority: "Normal",
          notes: "Sports injury treatment",
          applicantType: "Patient",
          documents: ["aadhar.pdf", "income_proof.pdf", "business_proof.pdf"],
        },
        {
          amount: 300000,
          loanPurpose: "General Treatment",
          treatmentType: "Treatment",
          urgency: "Low",
          hospital: "General Hospital",
          doctorName: "Dr. General",
          estimatedTreatmentCost: 300000,
          applicantDetails: {
            fullName: "Kavita Singh",
            contactNumber: "9876543246",
            email: "kavita.singh@email.com",
            address: "321 General Street, Delhi",
            city: "Delhi",
            state: "Delhi",
            pincode: "110002",
            dateOfBirth: new Date("1995-03-20"),
          },
          financialDetails: {
            occupation: "Clerk",
            monthlyIncome: 25000,
            employerName: "Government Office",
            workExperience: "3 years",
          },
          interestRate: 13.0,
          tenureMonths: 18,
          status: "Rejected",
          applicationDate: new Date("2023-11-10"),
          disbursementStatus: "N/A",
          assignTo: "Loan Officer 3",
          leadSource: "Walk-in",
          priority: "Low",
          notes: "Rejected due to insufficient documentation",
          applicantType: "Patient",
          documents: [],
        },
      ]);
      log("✅ Loans inserted successfully", "success");
    }

    // Module: Insurance - NEW ADDITION
    if (!config.specificModule || config.specificModule === "insurance") {
      log("Populating Insurance...");

      // First, get lead IDs to link insurance policies
      const leads = await leadsCollection.find({}).toArray();
      const leadIds = leads.map((lead) => lead._id);

      await insuranceCollection.insertMany([
        {
          leadId: leadIds[0], // Rajesh Kumar
          type: "Corporate",
          companyName: "Star Health Insurance",
          policyNumber: "POL123456",
          tpaName: "Medi Assist",
          validity: {
            to: new Date("2024-12-31"),
          },
          sumInsured: 500000,
          dependents: ["Spouse", "2 Children"],
          holderDetails: {
            dob: new Date("1978-05-15"),
            officialEmail: "rajesh.kumar@techcorp.com",
            contactNumber: "9876543213",
          },
          uploadedDocs: ["policy_document.pdf", "employee_card.jpg"],
        },
        {
          leadId: leadIds[2] || leadIds[0], // Arjun Mehta or fallback
          type: "Individual",
          companyName: "HDFC ERGO",
          policyNumber: "POL789012",
          tpaName: "Vidal Health",
          validity: {
            to: new Date("2024-05-31"),
          },
          sumInsured: 300000,
          dependents: [],
          holderDetails: {
            dob: new Date("1995-12-10"),
            officialEmail: "arjun.mehta@gmail.com",
            contactNumber: "9876543240",
          },
          uploadedDocs: ["individual_policy.pdf"],
        },
        {
          leadId: leadIds[1] || leadIds[0], // Priya Sharma or fallback
          type: "Individual",
          companyName: "ICICI Lombard",
          policyNumber: "POL345678",
          tpaName: "Good Health TPA",
          validity: {
            to: new Date("2024-02-29"),
          },
          sumInsured: 200000,
          dependents: ["Parent"],
          holderDetails: {
            dob: new Date("1991-08-22"),
            officialEmail: "priya.sharma@school.edu",
            contactNumber: "9876543214",
          },
          uploadedDocs: ["family_policy.pdf", "dependent_details.jpg"],
        },
      ]);
      log("✅ Insurance inserted successfully", "success");
    }

    // Module: Reimbursement - NEW ADDITION
    if (!config.specificModule || config.specificModule === "reimbursement") {
      log("Populating Reimbursement...");

      // Get employee IDs to link reimbursements
      const employees = await employeesCollection.find({}).toArray();
      const empIds = employees.map((emp) => emp._id);

      await reimbursementCollection.insertMany([
        {
          employeeId: empIds[1] || empIds[0], // John Smith or fallback
          title: "Medical Consultation",
          amount: 1500,
          purpose: "Cardiology consultation for chest pain",
          date: new Date("2023-11-15"),
          receiptFile: "medical_receipt_001.pdf",
        },
        {
          employeeId: empIds[2] || empIds[0], // Sarah Johnson or fallback
          title: "Prescription Medicines",
          amount: 850,
          purpose: "Monthly diabetes medication",
          date: new Date("2023-11-20"),
          receiptFile: "pharmacy_receipt_002.pdf",
        },
        {
          employeeId: empIds[3] || empIds[0], // Finance Manager or fallback
          title: "Dental Treatment",
          amount: 2200,
          purpose: "Root canal treatment",
          date: new Date("2023-11-10"),
          receiptFile: "dental_receipt_003.pdf",
        },
        {
          employeeId: empIds[1] || empIds[0], // John Smith
          title: "Eye Checkup",
          amount: 800,
          purpose: "Annual eye examination and glasses",
          date: new Date("2023-11-25"),
          receiptFile: "eye_care_receipt_004.pdf",
        },
        {
          employeeId: empIds[2] || empIds[0], // Sarah Johnson
          title: "Physiotherapy Sessions",
          amount: 3000,
          purpose: "Physiotherapy for back pain (6 sessions)",
          date: new Date("2023-11-05"),
          receiptFile: "physio_receipt_005.pdf",
        },
      ]);
      log("✅ Reimbursement inserted successfully", "success");
    }

    // Module: Appointments - NEW ADDITION
    if (!config.specificModule || config.specificModule === "appointments") {
      log("Populating Appointments...");

      // Get doctor and hospital IDs to link appointments
      const doctors = await doctorsCollection.find({}).toArray();
      const hospitals = await hospitalsCollection.find({}).toArray();
      const employees = await employeesCollection.find({}).toArray();
      const docIds = doctors.map((doc) => doc._id);
      const hospIds = hospitals.map((hosp) => hosp._id);
      const empIds = employees.map((emp) => emp._id);

      await appointmentCollection.insertMany([
        {
          appointmentId: "APT240001",
          patientName: "Rajesh Kumar",
          patientPhone: "9876543213",
          patientEmail: "rajesh@email.com",
          doctor: docIds[0], // Dr. Amit Patel
          doctorName: "Dr. Amit Patel",
          hospital: hospIds[0], // City Hospital
          hospitalName: "City Hospital",
          department: "Cardiology",
          appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          appointmentTime: "10:00 AM",
          duration: 30,
          type: "OPD",
          status: "Scheduled",
          priority: "High",
          symptoms: "Chest pain and shortness of breath",
          medicalHistory: "Hypertension, family history of heart disease",
          allergies: "None known",
          currentMedications: "Amlodipine 5mg",
          bookedBy: empIds[1] || empIds[0], // John Smith
          bookedByModel: "Employee",
          consultationFee: 1500,
          isPaid: false,
          paymentMethod: "Insurance",
          followUpRequired: true,
          followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          notes: "Patient referred for cardiac evaluation",
          reminderSent: false,
          reminderDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        },
        {
          appointmentId: "APT240002",
          patientName: "Priya Sharma",
          patientPhone: "9876543214",
          patientEmail: "priya@email.com",
          doctor: docIds[1] || docIds[0], // Dr. Sunita Reddy
          doctorName: "Dr. Sunita Reddy",
          hospital: hospIds[1] || hospIds[0], // Metro Hospital
          hospitalName: "Metro Hospital",
          department: "Gynecology",
          appointmentDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
          appointmentTime: "2:00 PM",
          duration: 30,
          type: "OPD",
          status: "Confirmed",
          priority: "Normal",
          symptoms: "Routine checkup",
          medicalHistory: "No significant medical history",
          allergies: "Penicillin",
          currentMedications: "None",
          bookedBy: empIds[1] || empIds[0], // John Smith
          bookedByModel: "Employee",
          consultationFee: 1200,
          isPaid: true,
          paymentMethod: "Cash",
          followUpRequired: false,
          notes: "Annual routine gynecological checkup",
          reminderSent: true,
          reminderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          appointmentId: "APT240003",
          patientName: "Arjun Mehta",
          patientPhone: "9876543240",
          patientEmail: "arjun@email.com",
          doctor: docIds[2] || docIds[0], // Dr. Rakesh Sharma
          doctorName: "Dr. Rakesh Sharma",
          hospital: hospIds[0] || hospIds[0], // City Hospital
          hospitalName: "City Hospital",
          department: "Orthopedics",
          appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          appointmentTime: "11:30 AM",
          duration: 45,
          type: "OPD",
          status: "Scheduled",
          priority: "Normal",
          symptoms: "Knee pain after sports injury",
          medicalHistory: "Previous sports injuries",
          allergies: "None",
          currentMedications: "Ibuprofen as needed",
          bookedBy: empIds[1] || empIds[0], // John Smith
          bookedByModel: "Employee",
          consultationFee: 1800,
          isPaid: false,
          paymentMethod: "Insurance",
          followUpRequired: true,
          followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          notes: "MRI may be required based on examination",
          reminderSent: false,
          reminderDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        },
        {
          appointmentId: "EMR240001",
          patientName: "Emergency Patient",
          patientPhone: "9876543250",
          patientEmail: "",
          doctor: docIds[0] || docIds[0], // Dr. Amit Patel
          doctorName: "Dr. Amit Patel",
          hospital: hospIds[0] || hospIds[0], // City Hospital
          hospitalName: "City Hospital",
          department: "Emergency",
          appointmentDate: new Date(), // Today
          appointmentTime: "Emergency",
          duration: 60,
          type: "Emergency",
          status: "In Progress",
          priority: "Emergency",
          symptoms: "Chest pain, severe",
          medicalHistory: "Unknown",
          allergies: "Unknown",
          currentMedications: "Unknown",
          bookedBy: empIds[0] || empIds[0], // Admin
          bookedByModel: "Employee",
          consultationFee: 2000,
          isPaid: false,
          paymentMethod: "Emergency",
          followUpRequired: true,
          notes: "Emergency admission, immediate attention required",
          reminderSent: false,
        },
      ]);
      log("✅ Appointments inserted successfully", "success");
    }

    // Module: Invoices - NEW ADDITION
    if (!config.specificModule || config.specificModule === "invoices") {
      log("Populating Invoices...");

      // Get all entity IDs for linking invoices
      const doctors = await doctorsCollection.find({}).toArray();
      const employees = await employeesCollection.find({}).toArray();
      const hospitals = await hospitalsCollection.find({}).toArray();
      const users = await usersCollection.find({}).toArray();

      const docIds = doctors.map((doc) => doc._id);
      const empIds = employees.map((emp) => emp._id);
      const hospIds = hospitals.map((hosp) => hosp._id);
      const userIds = users.map((user) => user._id);

      await invoiceCollection.insertMany([
        {
          invoiceNumber: "INV-202411-0001",
          subtotal: 1500,
          taxableAmount: 1500,
          discountAmount: 0,
          gstRate: 18,
          gstAmount: 270,
          totalAmount: 1770,
          paidAmount: 1770,
          pendingAmount: 0,
          issueDate: new Date("2023-11-01"),
          dueDate: new Date("2023-11-15"),
          entityType: "Doctor",
          entityId: docIds[0], // Dr. Amit Patel
          entityName: "Dr. Amit Patel",
          invoiceType: "Service",
          invoiceCategory: "Medical",
          category: "Income",
          items: [
            {
              description: "Cardiology Consultation",
              quantity: 1,
              unitPrice: 1500,
              totalPrice: 1500,
              category: "Consultation",
              hsnCode: "9963",
              gstRate: 18,
            },
          ],
          status: "Paid",
          paymentStatus: "Paid",
          paymentMethod: "UPI",
          paymentDate: new Date("2023-11-01"),
          generatedBy: userIds[0], // Admin
          createdBy: userIds[0], // Admin
        },
        {
          invoiceNumber: "INV-202411-0002",
          subtotal: 45000,
          taxableAmount: 45000,
          discountAmount: 0,
          gstRate: 0,
          gstAmount: 0,
          totalAmount: 45000,
          paidAmount: 45000,
          pendingAmount: 0,
          issueDate: new Date("2023-11-01"),
          dueDate: new Date("2023-11-01"),
          entityType: "Employee",
          entityId: empIds[1], // John Smith
          entityName: "John Smith",
          invoiceType: "Salary",
          invoiceCategory: "HR",
          category: "Expense",
          items: [
            {
              description: "Monthly Salary - November 2023",
              quantity: 1,
              unitPrice: 45000,
              totalPrice: 45000,
              category: "Salary",
            },
          ],
          status: "Paid",
          paymentStatus: "Paid",
          paymentMethod: "Bank Transfer",
          paymentDate: new Date("2023-11-01"),
          generatedBy: userIds[2], // HR
          createdBy: userIds[2], // HR
        },
        {
          invoiceNumber: "INV-202411-0003",
          subtotal: 1500,
          taxableAmount: 1500,
          discountAmount: 150,
          gstRate: 18,
          gstAmount: 243,
          totalAmount: 1593,
          paidAmount: 0,
          pendingAmount: 1593,
          issueDate: new Date("2023-11-15"),
          dueDate: new Date("2023-11-30"),
          entityType: "Hospital",
          entityId: hospIds[0], // City Hospital
          entityName: "City Hospital",
          invoiceType: "Commission",
          invoiceCategory: "Financial",
          category: "Expense",
          items: [
            {
              description: "Referral Commission - Patient: Rajesh Kumar",
              quantity: 1,
              unitPrice: 1500,
              totalPrice: 1500,
              category: "Commission",
              hsnCode: "9963",
              gstRate: 18,
            },
          ],
          status: "Sent",
          paymentStatus: "Unpaid",
          paymentMethod: "Bank Transfer",
          generatedBy: userIds[4], // Finance
          createdBy: userIds[4], // Finance
        },
        {
          invoiceNumber: "INV-202411-0004",
          subtotal: 2200,
          taxableAmount: 2200,
          discountAmount: 0,
          gstRate: 18,
          gstAmount: 396,
          totalAmount: 2596,
          paidAmount: 2596,
          pendingAmount: 0,
          issueDate: new Date("2023-11-10"),
          dueDate: new Date("2023-11-10"),
          entityType: "Employee",
          entityId: empIds[3], // Finance Manager
          entityName: "Finance Manager",
          invoiceType: "Reimbursement",
          invoiceCategory: "HR",
          category: "Expense",
          items: [
            {
              description: "Medical Reimbursement - Dental Treatment",
              quantity: 1,
              unitPrice: 2200,
              totalPrice: 2200,
              category: "Medical",
              hsnCode: "9963",
              gstRate: 18,
            },
          ],
          status: "Paid",
          paymentStatus: "Paid",
          paymentMethod: "Bank Transfer",
          paymentDate: new Date("2023-11-12"),
          generatedBy: userIds[2], // HR
          approvedBy: userIds[4], // Finance
          createdBy: userIds[2], // HR
          updatedBy: userIds[4], // Finance
        },
        {
          invoiceNumber: "INV-202411-0005",
          subtotal: 5000,
          taxableAmount: 5000,
          discountAmount: 500,
          gstRate: 18,
          gstAmount: 810,
          totalAmount: 5310,
          paidAmount: 2655,
          pendingAmount: 2655,
          issueDate: new Date("2023-11-20"),
          dueDate: new Date("2024-01-20"),
          entityType: "Hospital",
          entityId: hospIds[1], // Metro Hospital
          entityName: "Metro Hospital",
          invoiceType: "Service",
          invoiceCategory: "Medical",
          category: "Income",
          items: [
            {
              description: "Partnership Service Fee - Q4 2023",
              quantity: 1,
              unitPrice: 3000,
              totalPrice: 3000,
              category: "Partnership",
              hsnCode: "9963",
              gstRate: 18,
            },
            {
              description: "Additional Medical Services",
              quantity: 1,
              unitPrice: 2000,
              totalPrice: 2000,
              category: "Medical",
              hsnCode: "9963",
              gstRate: 18,
            },
          ],
          status: "Viewed",
          paymentStatus: "Partially Paid",
          paymentMethod: "Cheque",
          paymentDate: new Date("2023-11-25"),
          generatedBy: userIds[4], // Finance
          createdBy: userIds[4], // Finance
        },
      ]);
      log("✅ Invoices inserted successfully", "success");
    }

    // Summary
    const totalStats = {
      users: await usersCollection.countDocuments(),
      leads: await leadsCollection.countDocuments(),
      employees: await employeesCollection.countDocuments(),
      doctors: await doctorsCollection.countDocuments(),
      hospitals: await hospitalsCollection.countDocuments(),
      cabs: await cabsCollection.countDocuments(),
      partners: await partnersCollection.countDocuments(),
      loans: await loansCollection.countDocuments(),
      insurance: await insuranceCollection.countDocuments(),
      reimbursement: await reimbursementCollection.countDocuments(),
      appointments: await appointmentCollection.countDocuments(),
      invoices: await invoiceCollection.countDocuments(),
    };

    log("\n🎉 Database populated successfully!", "success");
    log("📊 Summary:");
    Object.entries(totalStats).forEach(([module, count]) => {
      log(
        `   • ${module.charAt(0).toUpperCase() + module.slice(1)}: ${count} records`,
      );
    });
    log(
      `\n📈 Total Records: ${Object.values(totalStats).reduce((a, b) => a + b, 0)}`,
    );
    log(
      "\n✅ All 12 modules now have sample data for integration testing!",
      "success",
    );
  } finally {
    await client.close();
  }
}

main().catch(console.error);
