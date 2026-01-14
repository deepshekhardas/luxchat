const { createClient } = require('redis');

let redisClient;

if (process.env.REDIS_URL || process.env.NODE_ENV === 'production') {
    redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    redisClient.on('connect', () => console.log('Redis Connected ⚡'));

    redisClient.connect().catch(console.error);
}

const cacheService = {
    // Get data from cache
    get: async (key) => {
        if (!redisClient?.isOpen) return null;
        try {
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Redis Get Error:', error);
            return null;
        }
    },

    // Set data in cache with expiry (default 3600 seconds = 1 hour)
    set: async (key, value, expiry = 3600) => {
        if (!redisClient?.isOpen) return;
        try {
            await redisClient.set(key, JSON.stringify(value), {
                EX: expiry
            });
        } catch (error) {
            console.error('Redis Set Error:', error);
        }
    },

    // Delete from cache
    del: async (key) => {
        if (!redisClient?.isOpen) return;
        try {
            await redisClient.del(key);
        } catch (error) {
            console.error('Redis Del Error:', error);
        }
    }
};

module.exports = cacheService;
