import { createClient } from "redis";
import { logger } from "./logger";

let redisClient: ReturnType<typeof createClient> | null = null;

export async function initRedis() {
  if (!process.env.REDIS_URL) {
    logger.warn("Redis URL not configured, caching disabled");
    return null;
  }

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL,
    });

    redisClient.on("error", (err) => {
      logger.error({ error: err }, "Redis client error");
    });

    await redisClient.connect();
    logger.info("Redis connected");

    return redisClient;
  } catch (error) {
    logger.error({ error }, "Failed to initialize Redis");
    return null;
  }
}

export function getRedisClient() {
  return redisClient;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redisClient) return null;

  try {
    const cached = await redisClient.get(key);
    return cached ? (JSON.parse(cached) as T) : null;
  } catch (error) {
    logger.error({ error, key }, "Redis get error");
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttl: number = 3600) {
  if (!redisClient) return false;

  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error({ error, key }, "Redis set error");
    return false;
  }
}

export async function cacheDel(key: string) {
  if (!redisClient) return false;

  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error({ error, key }, "Redis delete error");
    return false;
  }
}
