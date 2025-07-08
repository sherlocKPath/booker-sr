const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const crypto = require("crypto");
const app = express();

// -------------------------
// ✅ CONFIG
// -------------------------
const PORT = process.env.PORT || 3000;

const ALLOWED_ORIGINS = [
  "chrome-extension://onnbpbefmfdcjadmoppgjdimhbaliohc",
  "chrome-extension://kkloimbciajfffkblhnhcpcmnjbchlpc"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

// -------------------------
// ✅ Middleware
// -------------------------
app.use(express.json());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Preflight

// (Optional) ใส่ fallback headers กันกรณีเซิร์ฟเวอร์ไม่ส่งกลับ
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  next();
});

// -------------------------
// ✅ MongoDB
// -------------------------
mongoose
  .connect("mongodb+srv://petchza10222:1652038ZXCV@peth.3o5dx.mongodb.net/Booker")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  key: { type: String, required: true },
});
const User = mongoose.model("User", UserSchema);

// -------------------------
// ✅ Utility
// -------------------------
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

// -------------------------
// ✅ Routes
// -------------------------

// Login
app.post("/api/extension/login", async (req, res) => {
  const { email, key } = req.body;
  if (!email || !key) {
    return res.status(400).json({ error: "Missing email or key" });
  }

  try {
    const user = await User.findOne({ email, key });
    if (user) {
      const k = generateToken();
      return res.json({
        success: true,
        message: "Login successful",
        subscription: { email: user.email, key: user.key, k }
      });
    } else {
      return res.status(401).json({ error: "Invalid email or key" });
    }
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
});

// Signup
app.post("/api/extension/signup", async (req, res) => {
  const { email, key } = req.body;
  if (!email || !key) {
    return res.status(400).json({ error: "Missing email or key" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const newUser = new User({ email, key });
    await newUser.save();

    const k = generateToken();
    return res.json({
      success: true,
      message: "Signup successful",
      subscription: { email: newUser.email, key: newUser.key, k }
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
});

// -------------------------
// ✅ Start Server
// -------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
