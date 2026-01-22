import { createClient } from 'redis';

// Simple in-memory cache fallback
const memoryCache = new Map<string, string>();
let useMemory = false;
let redisClient: any;

if (process.env.REDIS_URL) {
    redisClient = createClient({
        url: process.env.REDIS_URL
    });

    redisClient.on('error', (err: any) => {
        console.warn('Redis Client Error (switching to memory mode):', err.message);
        // Note: We can't easily hot-swap the internal client state for existing connections,
        // but the proxy methods will check isOpen and fall back.
    });

    redisClient.on('connect', () => {
        console.log('Connected to Redis ⚡');
        useMemory = false;
    });
} else {
    console.log('No REDIS_URL provided. Using in-memory cache.');
    useMemory = true;
}

// Proxy object to handle fallback logic transparently
const clientProxy = {
    get isOpen() {
        if (useMemory) return true;
        return redisClient?.isOpen || false;
    },

    connect: async () => {
        if (useMemory) return;
        try {
            if (!redisClient.isOpen) {
                await redisClient.connect();
            }
        } catch (err) {
            console.error('Redis Connection Failed, falling back to memory:', err);
            useMemory = true;
        }
    },

    get: async (key: string) => {
        if (useMemory || !redisClient?.isOpen) {
            return memoryCache.get(key) || null;
        }
        try {
            return await redisClient.get(key);
        } catch (err) {
            console.error('Redis Get Error, using memory:', err);
            return memoryCache.get(key) || null;
        }
    },

    set: async (key: string, value: string, options?: any) => {
        if (useMemory || !redisClient?.isOpen) {
            memoryCache.set(key, value);
            return;
        }
        try {
            await redisClient.set(key, value, options);
        } catch (err) {
            console.error('Redis Set Error, using memory:', err);
            memoryCache.set(key, value);
        }
    },

    setEx: async (key: string, seconds: number, value: string) => {
        if (useMemory || !redisClient?.isOpen) {
            memoryCache.set(key, value);
            // Optional: simulate expiry with setTimeout if strictly needed, 
            // but for simple chats, indefinite is often acceptable or cleared on restart.
            return;
        }
        try {
            await redisClient.setEx(key, seconds, value);
        } catch (err) {
            console.error('Redis SetEx Error, using memory:', err);
            memoryCache.set(key, value);
        }
    },

    del: async (key: string) => {
        if (useMemory || !redisClient?.isOpen) {
            memoryCache.delete(key);
            return;
        }
        try {
            await redisClient.del(key);
        } catch (err) {
            console.error('Redis Del Error, using memory:', err);
            memoryCache.delete(key);
        }
    },

    on: (event: string, callback: any) => {
        if (redisClient) {
            redisClient.on(event, callback);
        }
    }
    // Add other methods as needed (hGet, etc.) if they appear in usage.
};

const connectRedis = async () => {
    await clientProxy.connect();
};

export { clientProxy as redisClient, connectRedis };
