import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "";
  try {
    if (uri == "") {
      console.warn("[database]: MongoDB URI not provided, running in mock mode");
      return;
    }
    await mongoose.connect(uri).then((res) => {
      console.log(
        `[database]: MongoDB connected successfully: ${res?.connection?.db?.databaseName}`
      );
    });
  } catch (err) {
    console.warn(`[database]: MongoDB connection failed: ${err}. Running in mock mode.`);
    // Don't exit the process, let the app run with mock data
  }
};
