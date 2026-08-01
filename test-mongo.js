const mongoose = require("mongoose");

const uri = "mongodb+srv://jadav-dhruvil-20:CyberShield2026@cybershield-admin.qlx6dmr.mongodb.net/?appName=cybershield-admin";

mongoose
  .connect(uri)
  .then(() => {
    console.log("✅ MongoDB Connected");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Connection Failed");
    console.error(err);
    process.exit(1);
  });
  console.log(process.env.MONGODB_URI);