import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create Redis client
const redis = new Redis({
     url: process.env.UPSTASH_REDIS_REST_URL!,
     token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Create limiter
export const rateLimiter = new Ratelimit({
     redis,
     limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 requests per hour
});