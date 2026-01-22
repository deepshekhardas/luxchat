import { UserDocument } from '../models/User';

declare global {
    namespace Express {
        interface Request {
            user?: UserDocument;
        }
    }

    namespace NodeJS {
        interface ProcessEnv {
            MONGO_URI: string;
            JWT_SECRET: string;
            PORT: string;
            NODE_ENV: 'development' | 'production' | 'test';
            GEMINI_API_KEY: string;
            HUGGINGFACE_TOKEN: string;
            GROQ_API_KEY: string;
            REDIS_URL: string;
        }
    }
}
