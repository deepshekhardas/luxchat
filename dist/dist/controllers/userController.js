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
const asyncHandler = require('express-async-handler');
const userService = require('../services/userService');
const searchUsers = asyncHandler((req, res) => __awaiter(this, void 0, void 0, function* () {
    const users = yield userService.searchUsers(req.query.search, req.user.id);
    res.json({
        success: true,
        count: users.length,
        data: users
    });
}));
const updateUserProfile = asyncHandler((req, res) => __awaiter(this, void 0, void 0, function* () {
    const user = yield userService.updateUserProfile(req.user.id, req.body);
    res.json({
        success: true,
        data: user
    });
}));
module.exports = { searchUsers, updateUserProfile };
