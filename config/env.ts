import dotenv from 'dotenv';

// Load env vars
dotenv.config();

export const port = process.env.PORT || 5002;
export const mongoURI = process.env.MONGO_URI;
export const jwtSecret = process.env.JWT_SECRET;
export const jwtExpire = process.env.JWT_EXPIRE;
export const nodeEnv = process.env.NODE_ENV || 'development';

