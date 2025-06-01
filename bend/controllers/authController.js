const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const getTenantConnection = require("../config/getTenantConnection");
const UserSchema = require("../models/User");
const MainUser = require("../models/MainUser");

// 1️⃣ REGISTER — Auto-generate tenantId
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Step 1: Check if email already exists globally
    const existing = await MainUser.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    // Step 2: Generate tenantId (e.g., based on timestamp or name)
    const tenantId = "tenant_" + Date.now();

    // Step 3: Create tenant-specific DB & user
    const tenantConn = await getTenantConnection(tenantId);
    const TenantUser = tenantConn.model("User", UserSchema);

    const hashedPassword = await bcrypt.hash(password, 10);
    await TenantUser.create({ name, email, password: hashedPassword });

    // Step 4: Save to global users for login/email-to-tenant resolution
    await MainUser.create({ email, tenantId });

    res.status(201).json({ message: "User registered", tenantId });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

// 2️⃣ LOGIN — Find tenantId by email, then connect
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userMeta = await MainUser.findOne({ email });
    if (!userMeta) return res.status(400).json({ message: "User not found" });

    const tenantConn = await getTenantConnection(userMeta.tenantId);
    const TenantUser = tenantConn.model("User", UserSchema);

    const user = await TenantUser.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, tenantId: userMeta.tenantId },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};
