import * as crypto from 'crypto';
export default class SEncrypt {

    /**
     * Encrypts a string using a given key.
     *
     * @param data - The plaintext string to be encrypted.
     * @param key - The encryption key used for the encryption process.
     * @returns The encrypted string in hexadecimal format.
     */
    public static encrypt(data: string, key: string): string {
        const algorithm = 'aes-256-cbc'; // Encryption algorithm
        const iv = crypto.randomBytes(16); // Initialization vector

        // Create a cipher using the specified algorithm, key, and IV
        const cipher = crypto.createCipheriv(algorithm, crypto.scryptSync(key, 'salt', 32), iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Return the encrypted data as a combination of the IV and encrypted content
        return iv.toString('hex') + ':' + encrypted;
    }

    /**
     * Decrypts an encrypted string using a given key.
     *
     * @param encryptedData - The encrypted string in hexadecimal format (IV:EncryptedData).
     * @param key - The encryption key used for decryption.
     * @returns The decrypted plaintext string.
     */
    public static decrypt(encryptedData: string, key: string): string {
        const algorithm = 'aes-256-cbc'; // Encryption algorithm
        const [ivHex, encrypted] = encryptedData.split(':'); // Split the IV and encrypted data
        const iv = Buffer.from(ivHex, 'hex'); // Convert IV from hex to buffer

        // Create a decipher using the specified algorithm, key, and IV
        const decipher = crypto.createDecipheriv(algorithm, crypto.scryptSync(key, 'salt', 32), iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        // Return the decrypted plaintext
        return decrypted;
    }
}

// // Example usage
// const key = 'my_secret_key';
// const originalData = 'Hello, TypeScript!';

// // Encrypt the original data
// const encryptedData = SEncrypt.encrypt(originalData, key);
// console.log('Encrypted:', encryptedData);

// // Decrypt the encrypted data
// const decryptedData = SEncrypt.decrypt(encryptedData, key);
// console.log('Decrypted:', decryptedData);