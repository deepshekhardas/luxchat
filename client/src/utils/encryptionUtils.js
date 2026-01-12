import CryptoJS from 'crypto-js';

// Setup a secret key (In a real app, this should be exchanged via Diffie-Hellman)
// For this portfolio demo, we use a fixed App Secret from env or a default.
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'luxchat-super-secret-key-2024';

export const encryptMessage = (text) => {
    if (!text) return '';
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

export const decryptMessage = (cipherText) => {
    if (!cipherText) return '';
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);

        // If decryption results in empty string (often happens with wrong key or plain text),
        // OR if it looks like garbage, we might return original logic.
        // BUT for this simple implementation:
        if (originalText) {
            return originalText;
        }
        return cipherText; // Fallback: display as is (if it was plain text)
    } catch {
        return cipherText; // Fallback for plain text messages
    }
};
