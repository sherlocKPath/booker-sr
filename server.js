const express = require("express");
const cors = require("cors");
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

const crypto = require("crypto");

// สร้าง token
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

const mongoose = require("mongoose");
mongoose
  .connect("mongodb+srv://petchza10222:1652038ZXCV@peth.3o5dx.mongodb.net/Booker")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  key: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);

// Login Endpoint
app.post("/api/extension/login", async (req, res) => {
  const { email, key } = req.body;

  try {
    const user = await User.findOne({ email, key });
    if (user) {
      // สร้าง token สำหรับ `k`
      const k = generateToken(); // ใช้ฟังก์ชัน generateToken() เพื่อสร้าง token

      return res.json({
        success: true,
        message: "Login successful",
        subscription: {
          email: user.email, // เก็บ email ของ user
          key: user.key,     // เก็บ key ของ user
          k: k,              // ส่ง token ที่สร้างไว้
        },
      });
    } else {
      return res.status(401).json({ error: "Invalid email or key" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
});

// Signup Endpoint
app.post("/api/extension/signup", async (req, res) => {
  const { email, key } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Generate a unique token for `k`
    const k = generateToken();

    // Create a new user
    const newUser = new User({ email, key });
    await newUser.save();

    return res.json({
      success: true,
      message: "Signup successful",
      subscription: {
        email: newUser.email,
        key: newUser.key,
        k: k, // เพิ่ม token ที่สร้างไว้
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});


// เริ่มต้นเซิร์ฟเวอร์
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
