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

    const leadsCollection = database.collection("leads");

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
  } finally {
    await client.close();
  }
}

main().catch(console.error);
