var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    get: (key) => __awaiter(this, void 0, void 0, function* () {
        if (!(redisClient === null || redisClient === void 0 ? void 0 : redisClient.isOpen))
            return null;
        try {
            const data = yield redisClient.get(key);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            console.error('Redis Get Error:', error);
            return null;
        }
    }),
    // Set data in cache with expiry (default 3600 seconds = 1 hour)
    set: (key_1, value_1, ...args_1) => __awaiter(this, [key_1, value_1, ...args_1], void 0, function* (key, value, expiry = 3600) {
        if (!(redisClient === null || redisClient === void 0 ? void 0 : redisClient.isOpen))
            return;
        try {
            yield redisClient.set(key, JSON.stringify(value), {
                EX: expiry
            });
        }
        catch (error) {
            console.error('Redis Set Error:', error);
        }
    }),
    // Delete from cache
    del: (key) => __awaiter(this, void 0, void 0, function* () {
        if (!(redisClient === null || redisClient === void 0 ? void 0 : redisClient.isOpen))
            return;
        try {
            yield redisClient.del(key);
        }
        catch (error) {
            console.error('Redis Del Error:', error);
        }
    })
};
module.exports = cacheService;
