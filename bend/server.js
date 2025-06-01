const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const cookieParser = require('cookie-parser');

dotenv.config();


const app = express();
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000',  // Your React app URL
    credentials: true                 // Allow credentials (cookies)
  }));
  app.use(cookieParser()); 
mongoose
  .connect(process.env.MONGO_BASE_URI, { useNewUrlParser: true })
  .then(() => console.log("✅ Global DB connected"))
  .catch((err) => console.error("❌ DB connection error", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);


app.get("/", (req, res) => {
  res.send("Multi-Tenant API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
