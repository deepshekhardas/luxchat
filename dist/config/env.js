"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeEnv = exports.jwtExpire = exports.jwtSecret = exports.mongoURI = exports.port = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Load env vars
dotenv_1.default.config();
exports.port = process.env.PORT || 5002;
exports.mongoURI = process.env.MONGO_URI;
exports.jwtSecret = process.env.JWT_SECRET;
exports.jwtExpire = process.env.JWT_EXPIRE;
exports.nodeEnv = process.env.NODE_ENV || 'development';
