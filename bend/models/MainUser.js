const mongoose = require("mongoose");

const mainUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: String,
  tenantId: { type: String, required: true },
});

module.exports = mongoose.model("MainUser", mainUserSchema);
