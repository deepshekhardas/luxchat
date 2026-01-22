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
const userService = require('../../services/userService');
const User = require('../../models/User');
// Mock Mongoose Model
jest.mock('../../models/User');
describe('UserService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('searchUsers', () => {
        it('should return users matching the keyword excluding current user', () => __awaiter(this, void 0, void 0, function* () {
            const mockUsers = [{ name: 'Test User', email: 'test@example.com' }];
            // Mock chainable query: find().select()
            const mockSelect = jest.fn().mockResolvedValue(mockUsers);
            User.find.mockReturnValue({ select: mockSelect });
            const result = yield userService.searchUsers('test', '123');
            expect(User.find).toHaveBeenCalledWith(expect.objectContaining({
                $or: expect.any(Array),
                _id: { $ne: '123' }
            }));
            expect(mockSelect).toHaveBeenCalledWith('name email profile_pic status');
            expect(result).toEqual(mockUsers);
        }));
        it('should return empty list if query is empty', () => __awaiter(this, void 0, void 0, function* () {
            const mockSelect = jest.fn().mockResolvedValue([]);
            User.find.mockReturnValue({ select: mockSelect });
            yield userService.searchUsers('', '123');
            // Should call find with empty object {}
            expect(User.find).toHaveBeenCalledWith({});
        }));
    });
    describe('getUserProfile', () => {
        it('should return user if found', () => __awaiter(this, void 0, void 0, function* () {
            const mockUser = { name: 'Found User' };
            User.findById.mockResolvedValue(mockUser);
            const result = yield userService.getUserProfile('validId');
            expect(result).toEqual(mockUser);
        }));
        it('should throw error if user not found', () => __awaiter(this, void 0, void 0, function* () {
            User.findById.mockResolvedValue(null);
            yield expect(userService.getUserProfile('invalidId')).rejects.toThrow('User not found');
        }));
    });
});
