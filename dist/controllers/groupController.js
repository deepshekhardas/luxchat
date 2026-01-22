var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const asyncHandler = require('express-async-handler');
const groupService = require('../services/groupService');
const createGroup = asyncHandler((req, res) => __awaiter(this, void 0, void 0, function* () {
    const { name, description, members } = req.body;
    const group = yield groupService.createGroup(name, description, members, req.user.id);
    res.status(201).json({
        success: true,
        data: group
    });
}));
const getMyGroups = asyncHandler((req, res) => __awaiter(this, void 0, void 0, function* () {
    const groups = yield groupService.getUserGroups(req.user.id);
    res.json({
        success: true,
        count: groups.length,
        data: groups
    });
}));
const addMember = asyncHandler((req, res) => __awaiter(this, void 0, void 0, function* () {
    const { groupId } = req.params;
    const { userId } = req.body;
    const group = yield groupService.addMember(groupId, userId, req.user.id);
    res.json({
        success: true,
        data: group
    });
}));
module.exports = { createGroup, getMyGroups, addMember };
