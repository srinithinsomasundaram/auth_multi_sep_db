const mongoose = require("mongoose");

const getTenantConnection = (tenantId) => {
  const dbURI = `${process.env.MONGO_BASE_URI}/tenant_${tenantId}`;
  return mongoose.createConnection(dbURI, {
    useNewUrlParser: true,
  });
};

module.exports = getTenantConnection;
