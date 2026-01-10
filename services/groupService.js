const Group = require('../models/Group');

class GroupService {
    async createGroup(name, description, memberIds, adminId) {
        // Ensure admin is in members
        if (!memberIds.includes(adminId)) {
            memberIds.push(adminId);
        }

        const group = await Group.create({
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

        return await Group.findById(group._id)
            .populate('members', 'name profile_pic status')
            .populate('admin', 'name');
    }

    async getUserGroups(userId) {
        const groups = await Group.find({ members: { $in: [userId] } })
            .populate('members', 'name profile_pic')
            .sort({ updatedAt: -1 });
        return groups;
    }

    async addMember(groupId, userId, adminId) {
        const group = await Group.findById(groupId);
        if (!group) throw new Error('Group not found');

        if (group.admin.toString() !== adminId) {
            throw new Error('Only admin can add members');
        }

        if (group.members.includes(userId)) {
            throw new Error('User already in group');
        }

        group.members.push(userId);
        await group.save();
        return group;
    }
}

module.exports = new GroupService();
