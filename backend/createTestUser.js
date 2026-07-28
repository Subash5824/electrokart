const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

mongoose
  .connect("mongodb://localhost:27017/electrokart")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ Connection error:", err);
    process.exit(1);
  });

const userSchema = new mongoose.Schema({
  businessName: String,
  email: String,
  phone: String,
  gstNumber: String,
  password: String,
  creditLimit: Number,
  isCreditApproved: Boolean,
  accountStatus: String,
  role: String,
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
});

const User = mongoose.model("User", userSchema);

async function createTestUser() {
  try {
    // Delete existing user
    await User.deleteMany({ email: "test@store.com" });
    console.log("✅ Deleted existing user");

    // Generate hash for "Password@123"
    const plainPassword = "Password@123";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    console.log('🔑 Generated hash for "Password@123":', hashedPassword);

    // Create new user
    const user = new User({
      businessName: "Test Store",
      email: "test@store.com",
      phone: "9876543210",
      gstNumber: "29ABCDE1234F2Z5",
      password: hashedPassword,
      creditLimit: 100000,
      isCreditApproved: true,
      accountStatus: "active",
      role: "user",
      address: {
        street: "123, Test Road",
        city: "Test City",
        state: "Test State",
        pincode: "560034",
      },
    });

    await user.save();
    console.log("✅ User created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email: test@store.com");
    console.log("🔑 Password: Password@123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Verify the password works
    const savedUser = await User.findOne({ email: "test@store.com" });
    const isMatch = await bcrypt.compare("Password@123", savedUser.password);
    console.log(
      "🔐 Password verification:",
      isMatch ? "✅ SUCCESS!" : "❌ FAILED"
    );
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
}

createTestUser();
