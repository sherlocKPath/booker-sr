const express = require("express");
const cors = require("cors");
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

const mongoose = require("mongoose");
mongoose
  .connect("mongodb+srv://petchza10222:1652038zc@peth.3o5dx.mongodb.net/Booker")
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
      return res.json({
        success: true,
        message: "Login successful",
        subscription: "Premium",
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

    // Create a new user
    const newUser = new User({ email, key });
    await newUser.save();

    return res.json({ success: true, message: "Signup successful" });
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
