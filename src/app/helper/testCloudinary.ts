// src/helpers/cloudinaryTest.ts
import { v2 as cloudinary } from "cloudinary";
import config from "../../config";

export const testCloudinaryConnection = async () => {
  try {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: config.cloudinary.cloud_name,
      api_key: config.cloudinary.api_key,
      api_secret: config.cloudinary.api_secret,
    });

    // Test connection by pinging Cloudinary API
    const result = await cloudinary.api.ping();
    console.log("🟢 Cloudinary connected successfully:", result);
  } catch (error) {
    console.error("🔴 Cloudinary connection failed:", error);
  }
};

// Call this at startup to test
testCloudinaryConnection();
