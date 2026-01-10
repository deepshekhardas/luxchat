const asyncHandler = require('express-async-handler');
const groupService = require('../services/groupService');

const createGroup = asyncHandler(async (req, res) => {
    const { name, description, members } = req.body;

    const group = await groupService.createGroup(name, description, members, req.user.id);
    res.status(201).json({
        success: true,
        data: group
    });
});

const getMyGroups = asyncHandler(async (req, res) => {
    const groups = await groupService.getUserGroups(req.user.id);
    res.json({
        success: true,
        count: groups.length,
        data: groups
    });
});

const addMember = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await groupService.addMember(groupId, userId, req.user.id);
    res.json({
        success: true,
        data: group
    });
});

module.exports = { createGroup, getMyGroups, addMember };
