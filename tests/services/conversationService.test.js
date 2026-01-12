const conversationService = require('../../services/conversationService');
const Conversation = require('../../models/Conversation');

// Mock Mongoose Model
jest.mock('../../models/Conversation');

describe('ConversationService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getConversations', () => {
        it('should return all conversations for a user', async () => {
            const mockConversations = [
                { _id: 'conv1', participants: ['user1', 'user2'] },
                { _id: 'conv2', participants: ['user1', 'user3'] }
            ];

            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(mockConversations)
            };

            Conversation.find.mockReturnValue(mockQuery);

            const result = await conversationService.getConversations('user1');

            expect(Conversation.find).toHaveBeenCalledWith({
                participants: { $in: ['user1'] }
            });
            expect(mockQuery.populate).toHaveBeenCalledWith('participants', 'name profile_pic status last_seen');
            expect(mockQuery.sort).toHaveBeenCalledWith({ updatedAt: -1 });
            expect(result).toEqual(mockConversations);
        });

        it('should return empty array if no conversations exist', async () => {
            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue([])
            };

            Conversation.find.mockReturnValue(mockQuery);

            const result = await conversationService.getConversations('newUser');

            expect(result).toEqual([]);
        });
    });

    describe('getOrCreateConversation', () => {
        it('should return existing conversation if found', async () => {
            const mockConversation = {
                _id: 'conv123',
                participants: ['user1', 'user2']
            };

            const mockQuery = {
                populate: jest.fn().mockResolvedValue(mockConversation)
            };

            Conversation.findOne.mockReturnValue(mockQuery);

            const result = await conversationService.getOrCreateConversation('user1', 'user2');

            expect(Conversation.findOne).toHaveBeenCalledWith({
                participants: { $all: ['user1', 'user2'] }
            });
            expect(result).toEqual(mockConversation);
        });

        it('should create new conversation if not found', async () => {
            const mockNewConversation = {
                _id: 'newConv123',
                participants: ['user1', 'user2']
            };

            // First findOne returns null (no existing conversation)
            const mockFindOneQuery = {
                populate: jest.fn().mockResolvedValue(null)
            };
            Conversation.findOne.mockReturnValueOnce(mockFindOneQuery);

            // Create returns new conversation
            Conversation.create.mockResolvedValue(mockNewConversation);

            // FindById for populate
            const mockFindByIdQuery = {
                populate: jest.fn().mockResolvedValue(mockNewConversation)
            };
            Conversation.findById.mockReturnValue(mockFindByIdQuery);

            const result = await conversationService.getOrCreateConversation('user1', 'user2');

            expect(Conversation.create).toHaveBeenCalledWith({
                participants: ['user1', 'user2'],
                unread_counts: {
                    'user1': 0,
                    'user2': 0
                }
            });
            expect(result).toEqual(mockNewConversation);
        });
    });
});
