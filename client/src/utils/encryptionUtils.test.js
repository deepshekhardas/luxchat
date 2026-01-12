import { describe, it, expect } from 'vitest';
import { encryptMessage, decryptMessage } from './encryptionUtils';

describe('Encryption Utils', () => {
    it('should encrypt a message', () => {
        const message = 'Hello World';
        const encrypted = encryptMessage(message);
        expect(encrypted).not.toBe(message);
        expect(encrypted).not.toBe('');
    });

    it('should decrypt a message back to original', () => {
        const message = 'Secret Data';
        const encrypted = encryptMessage(message);
        const decrypted = decryptMessage(encrypted);
        expect(decrypted).toBe(message);
    });

    it('should return empty string for empty input', () => {
        expect(encryptMessage('')).toBe('');
        expect(decryptMessage('')).toBe('');
    });

    it('should handle malformed ciphertext gracefully (return as is)', () => {
        const malformed = 'not-encrypted-text';
        // Our utility falls back to returning the text if decryption fails or returns empty
        const result = decryptMessage(malformed);
        expect(result).toBe(malformed);
    });
});
