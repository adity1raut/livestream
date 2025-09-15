import mongoose from "mongoose";

const ConnectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/admin", {});
    console.log("Database connection established !!!!");
  } catch (err) {
    console.log("Failed to connect to the database..." + err.message);
  }
};

export default ConnectDB;
