const User = require('../models/User');

class UserService {
  async searchUsers(query, excludeUserId) {
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

    const users = await User.find(keyword).select('name email profile_pic status');
    return users;
  }

  async getUserProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateUserProfile(userId, updateData) {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true
    });
    return user;
  }
}

module.exports = new UserService();
