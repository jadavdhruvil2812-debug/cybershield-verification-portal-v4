const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI || "mongodb+srv://jadav-dhruvil-20:CyberShield2026@cybershield-admin.qlx6dmr.mongodb.net/?appName=cybershield-admin";

console.log("Attempting database connection to cluster...");

mongoose
  .connect(uri)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Connection Failed");
    console.error(err);
    process.exit(1);
  });