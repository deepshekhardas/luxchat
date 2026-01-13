const userService = require('../../services/userService');
const User = require('../../models/User');

// Mock Mongoose Model
jest.mock('../../models/User');

describe('UserService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchUsers', () => {
    it('should return users matching the keyword excluding current user', async () => {
      const mockUsers = [{ name: 'Test User', email: 'test@example.com' }];
      // Mock chainable query: find().select()
      const mockSelect = jest.fn().mockResolvedValue(mockUsers);
      User.find.mockReturnValue({ select: mockSelect });

      const result = await userService.searchUsers('test', '123');

      expect(User.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.any(Array),
          _id: { $ne: '123' }
        })
      );
      expect(mockSelect).toHaveBeenCalledWith('name email profile_pic status');
      expect(result).toEqual(mockUsers);
    });

    it('should return empty list if query is empty', async () => {
      const mockSelect = jest.fn().mockResolvedValue([]);
      User.find.mockReturnValue({ select: mockSelect });

      await userService.searchUsers('', '123');

      // Should call find with empty object {}
      expect(User.find).toHaveBeenCalledWith({});
    });
  });

  describe('getUserProfile', () => {
    it('should return user if found', async () => {
      const mockUser = { name: 'Found User' };
      User.findById.mockResolvedValue(mockUser);

      const result = await userService.getUserProfile('validId');
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user not found', async () => {
      User.findById.mockResolvedValue(null);

      await expect(userService.getUserProfile('invalidId')).rejects.toThrow('User not found');
    });
  });
});
