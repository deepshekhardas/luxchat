const asyncHandler = require('express-async-handler');
const userService = require('../services/userService');

const searchUsers = asyncHandler(async (req, res) => {
  const users = await userService.searchUsers(req.query.search, req.user.id);
  res.json({
    success: true,
    count: users.length,
    data: users
  });
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateUserProfile(req.user.id, req.body);
  res.json({
    success: true,
    data: user
  });
});

module.exports = { searchUsers, updateUserProfile };
