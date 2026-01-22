var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            }
        }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const asyncHandler = require('express-async-handler');
const authService = require('../services/authService');
const cacheService = require('../services/cacheService');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User'); // Direct access or via service - let's do direct for speed or add to service
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const googleLogin = asyncHandler((req, res) => __awaiter(this, void 0, void 0, function* () {
    const { token } = req.body;
    const ticket = yield client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
    });
    const { name, email, sub: googleId } = ticket.getPayload();
    // Check if user exists
    let user = yield User.findOne({
        $or: [{ googleId }, { email }]
    });
    if (!user) {
        // Create new user
        user = yield User.create({
            name,
            email,
            googleId,
            password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8) // Random password
        });
    }
    else {
        // Link Google ID if not linked
        if (!user.googleId) {
            user.googleId = googleId;
            yield user.save();
        }
    }
    // Generate Token (Same as AuthService)
    const jwtToken = user.getSignedJwtToken();
    res.json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            token: jwtToken
        }
    });
}));
const register = asyncHandler((req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const user = yield authService.register(req.body);
        res.status(201).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}));
const login = asyncHandler((req, res) => __awaiter(this, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield authService.login(email, password);
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: error.message // Service throws "Invalid credentials" or "User not found"
        });
    }
}));
const logout = asyncHandler((req, res) => __awaiter(this, void 0, void 0, function* () {
    // In a stateless JWT setup, client just deletes token.
    // Server side, we can update status to offline.
    yield authService.logout(req.user.id);
    res.json({ success: true, message: 'Logged out successfully' });
}));
const getMe = asyncHandler((req, res) => __awaiter(this, void 0, void 0, function* () {
    const cacheKey = `user:${req.user.id}`;
    // Try to get from cache
    const cachedUser = yield cacheService.get(cacheKey);
    if (cachedUser) {
        return res.json({
            success: true,
            data: cachedUser,
            source: 'cache'
        });
    }
    // If not in cache, send DB response (req.user is already fetched by ensureAuthenticated middleware)
    // And set cache for next time
    yield cacheService.set(cacheKey, req.user);
    res.json({
        success: true,
        data: req.user,
        source: 'db'
    });
}));
module.exports = { register, login, logout, getMe, googleLogin };
