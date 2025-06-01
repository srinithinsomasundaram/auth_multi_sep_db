const express = require("express");
const router = express.Router();
const MainUser = require("../models/MainUser");
const getTenantConnection = require("../utils/tenantConnection");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

// Middleware to authenticate access token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const tokenFromHeader = authHeader && authHeader.split(" ")[1];
  const tokenFromCookie = req.cookies?.accessToken;

  const token = tokenFromHeader || tokenFromCookie;

  if (!token) return res.status(401).json({ message: "Access token missing" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

// Register route
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await MainUser.findOne({ email });

    if (user) return res.status(400).json({ message: "User already exists" });

    const tenantId = uuidv4().slice(0, 8); // short UUID
    const newUser = await MainUser.create({ email, password, tenantId });

    // Connect to tenant DB (optional: seed data)
    const tenantConn = getTenantConnection(tenantId);
    await tenantConn.asPromise(); // Wait for connection

    return res.status(201).json({ message: "User registered", tenantId });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Get tenant by email
router.post("/get-tenant", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await MainUser.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ tenantId: user.tenantId });
  } catch (err) {
    console.error("Fetch Tenant Error:", err);
    res.status(500).json({ error: "Error fetching tenant" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await MainUser.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Access & Refresh Tokens
    const accessToken = jwt.sign(
      { email: user.email, tenantId: user.tenantId },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { email: user.email, tenantId: user.tenantId },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      token: accessToken,
      tenantId: user.tenantId,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// Verify route
router.get("/verify", authenticateToken, (req, res) => {
  res.json({
    message: "Token is valid",
    email: req.user.email,
    tenantId: req.user.tenantId,
  });
});

// Refresh token route
router.post("/refresh", (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token found" });

  jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });

    const newAccessToken = jwt.sign(
      { email: user.email, tenantId: user.tenantId },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Access token refreshed" });
  });
});

module.exports = router;
// Logout route
router.post("/logout", (req, res) => {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });
  
    res.status(200).json({ message: "Logged out successfully" });
  });
  