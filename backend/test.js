const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load env vars
dotenv.config();

console.log('\n🔍 ELECTROKART BACKEND TEST\n'.brightBlue.bold);

// Test 1: Environment variables
console.log('📁 Testing Environment Variables...'.yellow);
const requiredEnv = ['PORT', 'MONGODB_URI', 'JWT_SECRET'];
let envPassed = true;

requiredEnv.forEach(env => {
  if (process.env[env]) {
    console.log(`  ✅ ${env} = ${process.env[env]}`.green);
  } else {
    console.log(`  ❌ ${env} is missing`.red);
    envPassed = false;
  }
});

if (envPassed) {
  console.log('  ✅ Environment variables OK\n'.green);
} else {
  console.log('  ❌ Environment variables failed\n'.red);
}

// Test 2: MongoDB Connection
console.log('📁 Testing MongoDB Connection...'.yellow);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('  ✅ MongoDB Connected Successfully'.green);
    
    // Test 3: Database operations
    console.log('\n📁 Testing Database Operations...'.yellow);
    
    // List databases
    mongoose.connection.db.admin().listDatabases((err, result) => {
      if (err) {
        console.log('  ❌ Failed to list databases'.red);
      } else {
        console.log('  ✅ Can list databases'.green);
        console.log(`     Available: ${result.databases.map(db => db.name).join(', ')}`.gray);
      }
      
      // Test 4: Check models
      console.log('\n📁 Checking Models...'.yellow);
      const models = mongoose.connection.modelNames();
      if (models.length > 0) {
        console.log(`  ✅ Models loaded: ${models.join(', ')}`.green);
      } else {
        console.log('  ⚠️  No models loaded yet'.yellow);
      }
      
      // Close connection
      mongoose.connection.close();
      console.log('\n✅ All tests completed!\n'.brightGreen.bold);
    });
  })
  .catch(err => {
    console.log(`  ❌ MongoDB Connection Failed: ${err.message}`.red);
    console.log('\n❌ Tests failed!\n'.red.bold);
  });

// Test 5: Check required files
console.log('📁 Checking Required Files...'.yellow);
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'server.js',
  'config/db.js',
  'config/config.js',
  'models/User.js',
  'models/Product.js',
  'models/Order.js',
  'controllers/authController.js',
  'routes/authRoutes.js',
  'middleware/authMiddleware.js'
];

requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${file}`.green);
  } else {
    console.log(`  ❌ ${file} missing`.red);
  }
});