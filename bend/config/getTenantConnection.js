const mongoose = require("mongoose");

const getTenantConnection = async (tenantId) => {
  const base = process.env.MONGO_BASE_URI.replace(/\/$/, "");
  const dbName = `tenant_${tenantId}`;
  const dbURI = `${base}/${dbName}`;
  return mongoose.createConnection(dbURI);
};

module.exports = getTenantConnection;
