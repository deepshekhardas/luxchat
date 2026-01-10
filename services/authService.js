const User = require('../models/User');

class AuthService {
    async register(userData) {
        const { name, email, password, profile_pic } = userData;

        // Check availability
        const userExists = await User.findOne({ email });
        if (userExists) {
            throw new Error('User already exists');
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            profile_pic
        });

        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            profile_pic: user.profile_pic,
            token: user.getSignedJwtToken()
        };
    }

    async login(email, password) {
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        // Update status to online
        user.status = 'online';
        user.last_seen = Date.now();
        await user.save();

        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            profile_pic: user.profile_pic,
            token: user.getSignedJwtToken()
        };
    }

    async logout(userId) {
        const user = await User.findById(userId);
        if (user) {
            user.status = 'offline';
            user.last_seen = Date.now();
            await user.save();
        }
        return true;
    }
}

module.exports = new AuthService();
