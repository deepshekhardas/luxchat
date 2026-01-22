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
const messageService = require('../../services/messageService');
const Message = require('../../models/Message');
const Conversation = require('../../models/Conversation');
const Group = require('../../models/Group');
// Mock Mongoose Models
jest.mock('../../models/Message');
jest.mock('../../models/Conversation');
jest.mock('../../models/Group');
describe('MessageService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('sendMessage', () => {
        it('should send a direct message successfully', () => __awaiter(this, void 0, void 0, function* () {
            const mockConversation = {
                _id: 'conv123',
                participants: ['user1', 'user2'],
                last_message: null,
                unread_counts: new Map(),
                save: jest.fn().mockResolvedValue(true)
            };
            const mockMessage = {
                _id: 'msg123',
                sender: 'user1',
                conversation_id: 'conv123',
                text: 'Hello!',
                populate: jest.fn().mockResolvedValue({
                    _id: 'msg123',
                    sender: { name: 'User 1', profile_pic: null },
                    text: 'Hello!'
                })
            };
            Conversation.findById.mockResolvedValue(mockConversation);
            Message.create.mockResolvedValue(mockMessage);
            yield messageService.sendMessage('user1', 'conv123', 'Hello!');
            expect(Message.create).toHaveBeenCalledWith(expect.objectContaining({
                sender: 'user1',
                conversation_id: 'conv123',
                text: 'Hello!'
            }));
            expect(mockConversation.save).toHaveBeenCalled();
        }));
        it('should send a group message successfully', () => __awaiter(this, void 0, void 0, function* () {
            const mockGroup = {
                _id: 'group123',
                members: ['user1', 'user2', 'user3'],
                last_message: null,
                save: jest.fn().mockResolvedValue(true)
            };
            const mockMessage = {
                _id: 'msg123',
                sender: 'user1',
                group_id: 'group123',
                text: 'Hello Group!',
                populate: jest.fn().mockResolvedValue({
                    _id: 'msg123',
                    sender: { name: 'User 1' },
                    text: 'Hello Group!'
                })
            };
            Group.findById.mockResolvedValue(mockGroup);
            Message.create.mockResolvedValue(mockMessage);
            yield messageService.sendMessage('user1', 'group123', 'Hello Group!', [], true);
            expect(Message.create).toHaveBeenCalledWith(expect.objectContaining({
                sender: 'user1',
                group_id: 'group123',
                text: 'Hello Group!'
            }));
        }));
        it('should throw error if group not found', () => __awaiter(this, void 0, void 0, function* () {
            Group.findById.mockResolvedValue(null);
            yield expect(messageService.sendMessage('user1', 'invalidGroup', 'Hi', [], true)).rejects.toThrow('Group not found');
        }));
        it('should throw error if user is not a group member', () => __awaiter(this, void 0, void 0, function* () {
            const mockGroup = {
                _id: 'group123',
                members: ['user2', 'user3'] // user1 is not a member
            };
            Group.findById.mockResolvedValue(mockGroup);
            yield expect(messageService.sendMessage('user1', 'group123', 'Hi', [], true)).rejects.toThrow('Not a member of this group');
        }));
        it('should throw error if conversation not found', () => __awaiter(this, void 0, void 0, function* () {
            Conversation.findById.mockResolvedValue(null);
            yield expect(messageService.sendMessage('user1', 'invalidConv', 'Hi')).rejects.toThrow('Conversation not found');
        }));
    });
    describe('getMessages', () => {
        it('should return messages for a conversation', () => __awaiter(this, void 0, void 0, function* () {
            const mockMessages = [
                { _id: 'msg1', text: 'Hello' },
                { _id: 'msg2', text: 'Hi there' }
            ];
            const mockQuery = {
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockMessages)
            };
            Message.find.mockReturnValue(mockQuery);
            const result = yield messageService.getMessages('conv123', false, 50, 0);
            expect(Message.find).toHaveBeenCalledWith({ conversation_id: 'conv123' });
            expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(result).toEqual(mockMessages.reverse());
        }));
        it('should return messages for a group', () => __awaiter(this, void 0, void 0, function* () {
            const mockMessages = [{ _id: 'msg1', text: 'Group message' }];
            const mockQuery = {
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockMessages)
            };
            Message.find.mockReturnValue(mockQuery);
            yield messageService.getMessages('group123', true);
            expect(Message.find).toHaveBeenCalledWith({ group_id: 'group123' });
        }));
    });
    describe('markAsRead', () => {
        it('should mark messages as read and reset unread count', () => __awaiter(this, void 0, void 0, function* () {
            const mockConversation = {
                unread_counts: new Map([['user1', 5]]),
                save: jest.fn().mockResolvedValue(true)
            };
            Message.updateMany.mockResolvedValue({ modifiedCount: 5 });
            Conversation.findById.mockResolvedValue(mockConversation);
            yield messageService.markAsRead('conv123', 'user1', false);
            expect(Message.updateMany).toHaveBeenCalledWith({ conversation_id: 'conv123', sender: { $ne: 'user1' }, status: { $ne: 'read' } }, { $set: { status: 'read' } });
            expect(mockConversation.unread_counts.get('user1')).toBe(0);
            expect(mockConversation.save).toHaveBeenCalled();
        }));
    });
});
