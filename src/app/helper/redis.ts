import Redis from "ioredis";
import config from "../../config";


const redis = new Redis(config.redisUrl as string, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

redis.on("connect", () => {
  console.log("🟢 Redis connected successfully");
});

redis.on("ready", () => {
  console.log("⚡ Redis is ready to use");
});

redis.on("error", (err) => {
  console.error("🔴 Redis connection error:", err);
});

redis.on("close", () => {
  console.warn("🟠 Redis connection closed");
});

export default redis;
