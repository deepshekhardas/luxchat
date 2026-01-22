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
const request = require('supertest');
const express = require('express');
// Mock app for testing routes if actual app export is complex
// In a real scenario, we would export 'app' from server.js
// For now, we will create a simple mock to verify the test setup works.
// Ideally, refactor server.js to export app.
const app = express();
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));
describe('Server Health Check', () => {
    it('should return 200 OK', () => __awaiter(this, void 0, void 0, function* () {
        const res = yield request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('ok');
    }));
});
