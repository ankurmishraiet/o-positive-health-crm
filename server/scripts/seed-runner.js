#!/usr/bin/env node

// Seed Runner Utility
// This utility provides an easy way to run the comprehensive seed script with various options

const { spawn } = require('child_process');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorLog(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function showHelp() {
  colorLog('\n🌱 O Positive Health CRM - Database Seed Runner', 'cyan');
  colorLog('═'.repeat(50), 'cyan');
  
  colorLog('\nUsage:', 'bright');
  colorLog('  npm run seed [options]', 'green');
  colorLog('  node scripts/seed-runner.js [options]', 'green');
  
  colorLog('\nOptions:', 'bright');
  colorLog('  --help, -h           Show this help message', 'yellow');
  colorLog('  --clear              Clear existing data before seeding', 'yellow');
  colorLog('  --module=<name>      Seed only specific module', 'yellow');
  colorLog('  --verbose            Show detailed logging', 'yellow');
  colorLog('  --list-modules       List all available modules', 'yellow');
  
  colorLog('\nModules Available:', 'bright');
  const modules = [
    'users', 'leads', 'employees', 'doctors', 'hospitals',
    'cabs', 'partners', 'loans', 'insurance', 'reimbursement',
    'appointments', 'invoices'
  ];
  modules.forEach(module => {
    colorLog(`  • ${module}`, 'green');
  });
  
  colorLog('\nExamples:', 'bright');
  colorLog('  npm run seed                           # Seed all modules', 'cyan');
  colorLog('  npm run seed -- --clear                # Clear and seed all', 'cyan');
  colorLog('  npm run seed -- --module=leads         # Seed only leads', 'cyan');
  colorLog('  npm run seed -- --clear --verbose      # Clear, seed all with verbose logs', 'cyan');
  
  colorLog('\nNote:', 'bright');
  colorLog('  This script populates sample data for ALL 12 CRM modules', 'magenta');
  colorLog('  to enable comprehensive integration testing.', 'magenta');
  colorLog('');
}

function listModules() {
  colorLog('\n📋 Available Modules for O Positive Health CRM:', 'cyan');
  colorLog('═'.repeat(50), 'cyan');
  
  const modules = [
    { name: 'users', description: 'System users and authentication data' },
    { name: 'leads', description: 'Patient leads and prospects' },
    { name: 'employees', description: 'Staff and employee records' },
    { name: 'doctors', description: 'Doctor profiles and specializations' },
    { name: 'hospitals', description: 'Hospital and medical facility data' },
    { name: 'cabs', description: 'Transportation and cab booking data' },
    { name: 'partners', description: 'Business partners and associations' },
    { name: 'loans', description: 'Medical loan applications and approvals' },
    { name: 'insurance', description: 'Insurance policies and claims' },
    { name: 'reimbursement', description: 'Employee medical reimbursements' },
    { name: 'appointments', description: 'Medical appointment scheduling' },
    { name: 'invoices', description: 'Financial invoices and billing' },
  ];
  
  modules.forEach((module, index) => {
    colorLog(`${(index + 1).toString().padStart(2)}. ${module.name.padEnd(15)} - ${module.description}`, 'green');
  });
  
  colorLog('\nUsage: npm run seed -- --module=<module_name>', 'yellow');
  colorLog('');
}

function runSeedScript(args = []) {
  const scriptPath = path.join(__dirname, 'seed-data.js');
  
  colorLog('\n🌱 Starting Database Seeding Process...', 'cyan');
  colorLog(`📁 Script: ${scriptPath}`, 'blue');
  
  if (args.length > 0) {
    colorLog(`⚙️  Arguments: ${args.join(' ')}`, 'blue');
  }
  
  const child = spawn('node', [scriptPath, ...args], {
    stdio: 'inherit',
    cwd: path.dirname(scriptPath)
  });
  
  child.on('close', (code) => {
    if (code === 0) {
      colorLog('\n✅ Seeding completed successfully!', 'green');
    } else {
      colorLog(`\n❌ Seeding failed with exit code ${code}`, 'red');
      process.exit(code);
    }
  });
  
  child.on('error', (error) => {
    colorLog(`\n❌ Error running seed script: ${error.message}`, 'red');
    process.exit(1);
  });
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

if (args.includes('--list-modules')) {
  listModules();
  process.exit(0);
}

// Run the seed script with provided arguments
runSeedScript(args);