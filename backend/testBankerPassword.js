const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ Connection failed:', err);
    process.exit(1);
  });

const bankerSchema = new mongoose.Schema({}, { strict: false });
const Banker = mongoose.model('Banker', bankerSchema);

async function testPassword() {
  try {
    // Find the banker
    const banker = await Banker.findOne({ email: 'banker@electrokart.com' });
    
    if (!banker) {
      console.log('❌ Banker not found');
      return;
    }
    
    console.log('✅ Banker found:', banker.email);
    console.log('Stored hash:', banker.password);
    console.log('\n🔐 Testing passwords...\n');
    
    // Test various passwords
    const passwordsToTest = [
      'banker123',
      'Banker123',
      'admin123',
      'password123',
      'banker@123'
    ];
    
    for (const pwd of passwordsToTest) {
      const isValid = await bcrypt.compare(pwd, banker.password);
      console.log(`Password "${pwd}": ${isValid ? '✅ MATCH!' : '❌ No match'}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
}

testPassword();
