const API_URL = 'http://localhost:5001/api';

async function runTest() {
    try {
        console.log('1. Registering/Logging in User 1...');
        let token;

        let res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test1@example.com', password: 'password123' })
        });

        let data = await res.json();

        if (!res.ok) {
            console.log('Login failed, trying register...');
            res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Test User 1', email: 'test1@example.com', password: 'password123' })
            });
            data = await res.json();
        }

        token = data.token;
        if (!token) throw new Error('No token received');
        console.log('Auth successful');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        console.log('2. Fetching Conversations...');
        res = await fetch(`${API_URL}/conversations`, { headers });
        data = await res.json();

        let convId;
        if (data.data.length > 0) {
            convId = data.data[0]._id;
            console.log('Found conversation:', convId);
        } else {
            console.log('No conversations found. Please ensure User 1 has a chat.');
            return;
        }

        console.log('3. Sending Message...');
        res = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                recipient_id: convId,
                text: 'Hello from verification script',
                attachments: []
            })
        });

        const msgData = await res.json();

        if (res.ok) {
            console.log('Message Sent SUCCESSFULLY:', msgData);
        } else {
            console.error('Message Send FAILED:', msgData);
        }

    } catch (error) {
        console.error('Test Failed:', error.message);
    }
}

runTest();
