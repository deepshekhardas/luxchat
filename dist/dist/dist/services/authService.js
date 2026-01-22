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
const User = require('../models/User');
class AuthService {
    register(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password, profile_pic } = userData;
            // Check availability
            const userExists = yield User.findOne({ email });
            if (userExists) {
                throw new Error('User already exists');
            }
            // Create user
            const user = yield User.create({
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
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User.findOne({ email }).select('+password');
            if (!user) {
                throw new Error('Invalid credentials');
            }
            const isMatch = yield user.matchPassword(password);
            if (!isMatch) {
                throw new Error('Invalid credentials');
            }
            // Update status to online
            user.status = 'online';
            user.last_seen = Date.now();
            yield user.save();
            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                profile_pic: user.profile_pic,
                token: user.getSignedJwtToken()
            };
        });
    }
    logout(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User.findById(userId);
            if (user) {
                user.status = 'offline';
                user.last_seen = Date.now();
                yield user.save();
            }
            return true;
        });
    }
}
module.exports = new AuthService();
