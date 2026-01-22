"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const db_1 = __importDefault(require("./config/db"));
const redis_1 = require("./config/redis");
const env_1 = require("./config/env");
// Connect to Database & Redis
const startServices = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1.default)();
    yield (0, redis_1.connectRedis)(); // Connect Redis
    // Seed LuxBot
    try {
        const User = require('./models/User'); // Keep dynamic require for Mongoose model to avoid circular deps if any
        const botEmail = 'luxbot@luxchat.com';
        const botExists = yield User.findOne({ email: botEmail });
        if (!botExists) {
            console.log('Creating LuxBot User...');
            yield User.create({
                name: 'LuxBot',
                email: botEmail,
                password: 'luxbotpassword123',
                profile_pic: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png',
                status: 'online',
                last_seen: new Date()
            });
            console.log('LuxBot User Created! 🤖');
        }
        else {
            if (botExists.status !== 'online') {
                botExists.status = 'online';
                yield botExists.save();
            }
        }
    }
    catch (err) {
        console.error('Error seeding LuxBot:', err);
    }
});
startServices();
// Start Server
const PORT = env_1.port || 5001;
app_1.server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    app_1.server.close(() => process.exit(1));
});
