var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const Group = require('../models/Group');
class GroupService {
    createGroup(name, description, memberIds, adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Ensure admin is in members
            if (!memberIds.includes(adminId)) {
                memberIds.push(adminId);
            }
            const group = yield Group.create({
                name,
                description,
                members: memberIds,
                admin: adminId,
                last_message: {
                    text: `Group "${name}" created`,
                    sender: adminId,
                    createdAt: new Date()
                }
            });
            return yield Group.findById(group._id)
                .populate('members', 'name profile_pic status')
                .populate('admin', 'name');
        });
    }
    getUserGroups(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const groups = yield Group.find({ members: { $in: [userId] } })
                .populate('members', 'name profile_pic')
                .sort({ updatedAt: -1 });
            return groups;
        });
    }
    addMember(groupId, userId, adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            const group = yield Group.findById(groupId);
            if (!group)
                throw new Error('Group not found');
            if (group.admin.toString() !== adminId) {
                throw new Error('Only admin can add members');
            }
            if (group.members.includes(userId)) {
                throw new Error('User already in group');
            }
            group.members.push(userId);
            yield group.save();
            return group;
        });
    }
}
module.exports = new GroupService();
