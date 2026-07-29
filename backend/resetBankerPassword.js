const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ Connection error:", err);
    process.exit(1);
  });

const bankerSchema = new mongoose.Schema({
  bankerId: String,
  name: String,
  email: String,
  password: String,
  role: String,
  department: String,
  permissions: [String],
  isActive: Boolean,
});

const Banker = mongoose.model("Banker", bankerSchema);

async function resetBanker() {
  try {
    // Delete the existing banker
    await Banker.deleteOne({ email: "banker@electrokart.com" });
    console.log("✅ Deleted existing banker");

    // Generate a NEW hash for "banker123"
    const hashedPassword = await bcrypt.hash("banker123", 10);
    console.log("🔑 New hash generated:", hashedPassword);

    // Create new banker
    const banker = new Banker({
      bankerId: "BNK" + Date.now().toString().slice(-8),
      name: "Bank Admin",
      email: "banker@electrokart.com",
      password: hashedPassword,
      role: "admin",
      department: "approval",
      permissions: ["view_customers", "approve_transactions", "block_cards"],
      isActive: true,
    });

    await banker.save();
    console.log("✅ Banker created successfully!");
    console.log("📧 Email: banker@electrokart.com");
    console.log("🔑 Password: banker123");
    console.log("🔐 Hash in DB:", hashedPassword);

    // Verify the password works
    const savedBanker = await Banker.findOne({
      email: "banker@electrokart.com",
    });
    const isValid = await bcrypt.compare("banker123", savedBanker.password);
    console.log(
      "🔐 Password verification:",
      isValid ? "✅ SUCCESS!" : "❌ FAILED"
    );
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
}

resetBanker();
