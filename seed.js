import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const testConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected");

    // Test: list all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📂 Collections in DB:", collections.map(c => c.name));

    // Test: check first employee
    const employee = await mongoose.connection.db
      .collection("employees")
      .findOne();

    console.log("👤 First employee record:", employee);

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
};

testConnection();
