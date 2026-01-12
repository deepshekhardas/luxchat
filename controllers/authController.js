const asyncHandler = require('express-async-handler');
const authService = require('../services/authService');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User'); // Direct access or via service - let's do direct for speed or add to service
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = asyncHandler(async (req, res) => {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, sub: googleId, picture } = ticket.getPayload();

    // Check if user exists
    let user = await User.findOne({
        $or: [{ googleId }, { email }]
    });

    if (!user) {
        // Create new user
        user = await User.create({
            name,
            email,
            googleId,
            password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8) // Random password
        });
    } else {
        // Link Google ID if not linked
        if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
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
});


const register = asyncHandler(async (req, res) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await authService.login(email, password);
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message // Service throws "Invalid credentials" or "User not found"
        });
    }
});

const logout = asyncHandler(async (req, res) => {
    // In a stateless JWT setup, client just deletes token.
    // Server side, we can update status to offline.
    await authService.logout(req.user.id);
    res.json({ success: true, message: 'Logged out successfully' });
});

const getMe = asyncHandler(async (req, res) => {
    res.json({
        success: true,
        data: req.user
    });
});

module.exports = { register, login, logout, getMe, googleLogin };
