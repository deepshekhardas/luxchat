const API_URL = 'http://127.0.0.1:5001/api';

async function runAdvancedTest() {
    try {
        console.log('1. Auth: Logging in User 1...');

        let res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test1@example.com', password: 'password123' })
        });

        let data = await res.json();

        if (!data.token) {
            console.log('Login failed, trying register...');
            res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Test User 1', email: 'test1@example.com', password: 'password123' })
            });
            data = await res.json();
        }

        const token = data.token;
        if (!token) throw new Error('Auth failed: ' + (data.message || 'Unknown error'));
        console.log('Auth successful');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // --- TEST 1: SEARCH ---
        console.log('\n--- TEST 1: SEARCH USERS ---');
        const searchQuery = 'test';
        res = await fetch(`${API_URL}/users?search=${searchQuery}`, { headers });
        data = await res.json();

        if (data.success && Array.isArray(data.data)) {
            console.log(`✅ Search Success. Found ${data.data.length} users for query "${searchQuery}"`);
            data.data.forEach(u => console.log(`   - ${u.name} (${u.email})`));
        } else {
            console.error('❌ Search Failed', data);
        }

        // --- TEST 2: CREATE GROUP ---
        console.log('\n--- TEST 2: CREATE GROUP ---');
        // Need a second user to add to group. Let's pick the first one from search that isn't me
        // (Assuming search returns others)
        const others = data.data.filter(u => u.email !== 'test1@example.com');

        if (others.length === 0) {
            console.log('⚠️ Need another user to test group creation. Please register test2@example.com first.');
        } else {
            const memberId = others[0]._id;
            const groupName = 'Verification Group ' + Math.floor(Math.random() * 1000);

            res = await fetch(`${API_URL}/groups`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name: groupName,
                    members: [memberId],
                    description: 'Test group via script'
                })
            });

            data = await res.json();
            if (data.success) {
                console.log(`✅ Group Creation Success: "${data.data.name}" (ID: ${data.data._id})`);
                console.log(`   - Members: ${data.data.members.length}`);
            } else {
                console.error('❌ Group Creation Failed', data);
            }
        }

    } catch (error) {
        console.error('Test Failed:', error.message);
    }
}

runAdvancedTest();
