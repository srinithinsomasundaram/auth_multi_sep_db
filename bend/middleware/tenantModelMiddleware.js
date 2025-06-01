const getTenantConnection = require("../config/getTenantConnection");
const userSchema = require("../models/User");

const tenantModelMiddleware = async (req, res, next) => {
  try {
    const tenantId = req.user?.tenantId || req.body?.tenantId;

    if (!tenantId) {
      return res.status(400).json({ message: "Tenant ID is required" });
    }

    if (!req.tenantConn) {
      req.tenantConn = await getTenantConnection(tenantId);
    }

    // Create or reuse User model for tenant DB
    req.User = req.tenantConn.model("User", userSchema);

    next();
  } catch (error) {
    console.error("Tenant Model Middleware error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = tenantModelMiddleware;
