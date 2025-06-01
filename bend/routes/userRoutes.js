const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const tenantModelMiddleware = require("../middleware/tenantModelMiddleware");

const router = express.Router();

router.get(
  "/profile",
  authMiddleware,
  tenantModelMiddleware,
  async (req, res) => {
    try {
      const user = await req.User.findById(req.user.id).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Example: Admin-only route
router.get(
  "/all-users",
  authMiddleware,
  roleMiddleware("admin"),
  tenantModelMiddleware,
  async (req, res) => {
    try {
      const users = await req.User.find().select("-password");
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
