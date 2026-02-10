import Redis from "ioredis";

const redis = new Redis({
  host: "redis-16404.c84.us-east-1-2.ec2.cloud.redislabs.com",
  port: 16404,
  username: "default",
  password: "r6sl0PMMqeJ9yxbD4BLqGaK8uH9j81k2",
  maxRetriesPerRequest: null
});

redis.on("connect", () => {
  console.log("Redis Connected Successfully");
});

redis.on("error", (err) => {
  console.log("Redis Error:", err);
});

export default redis;
