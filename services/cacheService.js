const { createClient } = require('redis');

let redisClient;
let useMemory = false;
const memoryCache = new Map();

// Initialize Client only if URL is present or we want to try default (but carefully)
if (process.env.REDIS_URL) {
    redisClient = createClient({
        url: process.env.REDIS_URL
    });

    redisClient.on('error', (err) => {
        console.warn('CacheService Redis Error (switching to memory):', err.message);
        // Note: For existing calls, we can't switch seamlessly without a proxy,
        // but the methods below check isOpen.
    });

    redisClient.on('connect', () => {
        console.log('CacheService: Redis Connected ⚡');
        useMemory = false;
    });

    redisClient.connect().catch(err => {
        console.error('CacheService: Connection Failed, using memory:', err.message);
        useMemory = true;
    });
} else {
    console.log('CacheService: No REDIS_URL, using In-Memory Cache.');
    useMemory = true;
}

const cacheService = {
    // Get data from cache
    get: async (key) => {
        if (useMemory || !redisClient?.isOpen) {
            return memoryCache.get(key) || null;
        }
        try {
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Redis Get Error:', error);
            return memoryCache.get(key) || null; // Fallback on read error
        }
    },

    // Set data in cache with expiry (default 3600 seconds = 1 hour)
    set: async (key, value, expiry = 3600) => {
        // Always update memory cache for consistency if we fall back later
        if (useMemory) {
            memoryCache.set(key, value);
            // handle simplistic expiry if needed, or ignore for now
            return;
        }

        if (!redisClient?.isOpen) {
            memoryCache.set(key, value);
            return;
        }

        try {
            await redisClient.set(key, JSON.stringify(value), {
                EX: expiry
            });
        } catch (error) {
            console.error('Redis Set Error:', error);
            // Fallback
            memoryCache.set(key, value);
        }
    },

    // Delete from cache
    del: async (key) => {
        if (useMemory) {
            memoryCache.delete(key);
            return;
        }
        if (!redisClient?.isOpen) {
            memoryCache.delete(key);
            return;
        }
        try {
            await redisClient.del(key);
        } catch (error) {
            console.error('Redis Del Error:', error);
            memoryCache.delete(key);
        }
    }
};

module.exports = cacheService;
