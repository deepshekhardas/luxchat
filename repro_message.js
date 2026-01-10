const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function runTest() {
    try {
        console.log('1. Registering/Logging in User 1...');
        let token;
        try {
            const res = await axios.post(`${API_URL}/auth/login`, {
                email: 'test1@example.com',
                password: 'password123'
            });
            token = res.data.token;
            console.log('Login successful');
        } catch (e) {
            console.log('Login failed, trying register...');
            const res = await axios.post(`${API_URL}/auth/register`, {
                name: 'Test User 1',
                email: 'test1@example.com',
                password: 'password123'
            });
            token = res.data.token;
            console.log('Register successful');
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };

        console.log('2. Creating/Fetching Conversation...');
        // Need a second user to chat with. 
        // For this test, let's just get existing conversations.
        const convRes = await axios.get(`${API_URL}/conversations`, config);
        let convId;

        if (convRes.data.data.length > 0) {
            convId = convRes.data.data[0]._id;
            console.log('Found existing conversation:', convId);
        } else {
            console.log('No conversations found. Please ensure User 1 has a chat. (Skipping creation for simplicity unless needed)');
            // To properly test we might need to create one, but let's see if this fails first.
            return;
        }

        console.log('3. Sending Message...');
        // Logic from ChatWindow.jsx:
        // payload = { recipient_id: activeChat._id, text: ... }
        try {
            const msgRes = await axios.post(`${API_URL}/messages`, {
                recipient_id: convId, // Passing CONVERSATION ID as recipient_id
                text: 'Hello from verification script',
                attachments: []
            }, config);
            console.log('Message Sent SUCCESSFULLY:', msgRes.data);
        } catch (err) {
            console.error('Message Send FAILED:', err.response ? err.response.data : err.message);
        }

    } catch (error) {
        console.error('Test Failed:', error.message);
    }
}

runTest();
