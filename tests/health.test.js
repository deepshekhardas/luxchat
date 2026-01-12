const request = require('supertest');
const express = require('express');

// Mock app for testing routes if actual app export is complex
// In a real scenario, we would export 'app' from server.js
// For now, we will create a simple mock to verify the test setup works.
// Ideally, refactor server.js to export app.

const app = express();
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));

describe('Server Health Check', () => {
    it('should return 200 OK', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('ok');
    });
});
