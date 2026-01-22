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
const User = require('../models/User');
class UserService {
    searchUsers(query, excludeUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const keyword = query
                ? {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { email: { $regex: query, $options: 'i' } }
                    ],
                    // Exclude current user from results
                    _id: { $ne: excludeUserId }
                }
                : {};
            const users = yield User.find(keyword).select('name email profile_pic status');
            return users;
        });
    }
    getUserProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        });
    }
    updateUserProfile(userId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User.findByIdAndUpdate(userId, updateData, {
                new: true,
                runValidators: true
            });
            return user;
        });
    }
}
module.exports = new UserService();
