const authService = require('../../services/authService');
const User = require('../../models/User');

// Mock Mongoose Model
jest.mock('../../models/User');

describe('AuthService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const mockUserData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };

            const mockCreatedUser = {
                _id: 'user123',
                name: 'Test User',
                email: 'test@example.com',
                profile_pic: null,
                getSignedJwtToken: jest.fn().mockReturnValue('mockToken123')
            };

            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue(mockCreatedUser);

            const result = await authService.register(mockUserData);

            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(User.create).toHaveBeenCalled();
            expect(result).toHaveProperty('token', 'mockToken123');
            expect(result).toHaveProperty('_id', 'user123');
        });

        it('should throw error if user already exists', async () => {
            User.findOne.mockResolvedValue({ email: 'existing@example.com' });

            await expect(authService.register({
                name: 'Test',
                email: 'existing@example.com',
                password: 'pass123'
            })).rejects.toThrow('User already exists');
        });
    });

    describe('login', () => {
        it('should login successfully with valid credentials', async () => {
            const mockUser = {
                _id: 'user123',
                name: 'Test User',
                email: 'test@example.com',
                profile_pic: null,
                status: 'offline',
                matchPassword: jest.fn().mockResolvedValue(true),
                getSignedJwtToken: jest.fn().mockReturnValue('mockToken123'),
                save: jest.fn().mockResolvedValue(true)
            };

            const mockSelect = jest.fn().mockResolvedValue(mockUser);
            User.findOne.mockReturnValue({ select: mockSelect });

            const result = await authService.login('test@example.com', 'password123');

            expect(result).toHaveProperty('token', 'mockToken123');
            expect(mockUser.status).toBe('online');
            expect(mockUser.save).toHaveBeenCalled();
        });

        it('should throw error if user not found', async () => {
            const mockSelect = jest.fn().mockResolvedValue(null);
            User.findOne.mockReturnValue({ select: mockSelect });

            await expect(authService.login('notfound@example.com', 'pass'))
                .rejects.toThrow('Invalid credentials');
        });

        it('should throw error if password does not match', async () => {
            const mockUser = {
                matchPassword: jest.fn().mockResolvedValue(false)
            };

            const mockSelect = jest.fn().mockResolvedValue(mockUser);
            User.findOne.mockReturnValue({ select: mockSelect });

            await expect(authService.login('test@example.com', 'wrongpass'))
                .rejects.toThrow('Invalid credentials');
        });
    });

    describe('logout', () => {
        it('should update user status to offline', async () => {
            const mockUser = {
                status: 'online',
                save: jest.fn().mockResolvedValue(true)
            };

            User.findById.mockResolvedValue(mockUser);

            const result = await authService.logout('user123');

            expect(mockUser.status).toBe('offline');
            expect(mockUser.save).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('should return true even if user not found', async () => {
            User.findById.mockResolvedValue(null);

            const result = await authService.logout('invalidId');

            expect(result).toBe(true);
        });
    });
});
