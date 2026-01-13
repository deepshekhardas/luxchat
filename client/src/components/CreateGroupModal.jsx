import { useState } from 'react';
import api from '../services/api';
import { X, Search, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateGroupModal = ({ onClose, onGroupCreated }) => {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const { data } = await api.get(`/users?search=${query}`);
        setSearchResults(data.data);
      } catch (error) {
        console.error(error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const toggleUser = (user) => {
    if (selectedUsers.find((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName || selectedUsers.length === 0) {
      return toast.error('Please provide a name and select members');
    }

    try {
      const { data } = await api.post('/groups', {
        name: groupName,
        members: selectedUsers.map((u) => u._id)
      });
      onGroupCreated(data.data);
      toast.success('Group Created!');
      onClose();
    } catch {
      toast.error('Failed to create group');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Create Group</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Group Name</label>
            <input
              type="text"
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. Project Team"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          {/* Member Selection */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Add Members</label>
            <div className="relative">
              <input
                type="text"
                className="w-full p-2 pl-8 bg-gray-700 rounded border border-gray-600 text-white focus:outline-none focus:border-blue-500"
                placeholder="Search users..."
                value={searchQuery}
                onChange={handleSearch}
              />
              <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 text-sm text-gray-400 max-h-32 overflow-y-auto border border-gray-700 rounded p-1">
                {searchResults.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => toggleUser(u)}
                    className="flex items-center justify-between p-2 hover:bg-gray-700 cursor-pointer rounded"
                  >
                    <span>{u.name}</span>
                    {selectedUsers.find((sel) => sel._id === u._id) && (
                      <Check size={16} className="text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Tags */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((u) => (
                <span
                  key={u._id}
                  className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded-full flex items-center"
                >
                  {u.name}
                  <button
                    type="button"
                    onClick={() => toggleUser(u)}
                    className="ml-1 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold transition"
          >
            Create Group
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
