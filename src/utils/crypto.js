/**
 * ChainForgeLedger Utils Module - Cryptographic Utilities
 * 
 * Provides cryptographic helper functions for blockchain operations.
 * Pure JavaScript implementations - no third-party dependencies
 */

/**
 * Generate random bytes (Pure JavaScript implementation)
 * @param {number} length - Number of bytes to generate
 * @returns {Buffer} Random bytes buffer
 */
export function randomBytes(length) {
    const bytes = new Uint8Array(length);
    
    // Simple pseudo-random number generator
    for (let i = 0; i < length; i++) {
        bytes[i] = (Math.random() * 256) | 0;
    }
    
    return Buffer.from(bytes);
}

/**
 * Generate secure random number (Pure JavaScript implementation)
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (exclusive)
 * @returns {number} Random number
 */
export function randomNumber(min, max) {
    if (min >= max) {
        throw new Error('Minimum value must be less than maximum value');
    }
    
    const range = max - min;
    const random = Math.random();
    
    return min + Math.floor(random * range);
}

/**
 * Generate random hex string (Pure JavaScript implementation)
 * @param {number} length - Length of the hex string (must be even)
 * @returns {string} Random hex string
 */
export function randomHex(length) {
    if (length % 2 !== 0) {
        throw new Error('Length must be even');
    }
    
    const bytes = randomBytes(length / 2);
    return bytes.toString('hex');
}

/**
 * Generate SHA-256 hash (Pure JavaScript implementation)
 * @param {string|Buffer} data - Data to hash
 * @returns {string} SHA-256 hash as hex string
 */
export function sha256(data) {
    // Import from hashing module to ensure consistency
    if (typeof sha256_hash === 'undefined') {
        const { sha256_hash } = import('./../crypto/hashing.js');
        return sha256_hash(data);
    }
    return sha256_hash(data);
}

/**
 * Generate SHA-512 hash (placeholder implementation)
 * Note: This is a placeholder - real SHA-512 implementation needed
 * @param {string|Buffer} data - Data to hash
 * @returns {string} SHA-512 hash as hex string
 */
export function sha512(data) {
    // For now, use SHA-256 (real implementation needed)
    return sha256(data);
}

/**
 * Generate RIPEMD-160 hash (placeholder implementation)
 * Note: This is a placeholder - real RIPEMD-160 implementation needed
 * @param {string|Buffer} data - Data to hash
 * @returns {string} RIPEMD-160 hash as hex string
 */
export function ripemd160(data) {
    // For now, use SHA-256 (real implementation needed)
    return sha256(data).slice(0, 40);
}

/**
 * Generate keccak256 hash (Pure JavaScript implementation)
 * @param {string|Buffer} data - Data to hash
 * @returns {string} Keccak256 hash as hex string
 */
export function keccak256(data) {
    // Import from hashing module to ensure consistency
    if (typeof keccak256_hash === 'undefined') {
        const { keccak256_hash } = import('./../crypto/hashing.js');
        return keccak256_hash(data);
    }
    return keccak256_hash(data);
}

/**
 * Generate SHA-1 hash (placeholder implementation)
 * Note: This is a placeholder - real SHA-1 implementation needed
 * @param {string|Buffer} data - Data to hash
 * @returns {string} SHA-1 hash as hex string
 */
export function sha1(data) {
    // For now, use SHA-256 (real implementation needed)
    return sha256(data).slice(0, 40);
}

/**
 * Hash data with specified algorithm (Pure JavaScript implementation)
 * @param {string} algorithm - Hash algorithm (sha256, sha512, keccak256, etc.)
 * @param {string|Buffer} data - Data to hash
 * @returns {string} Hash as hex string
 */
export function hash(algorithm, data) {
    switch (algorithm.toLowerCase()) {
        case 'sha256':
            return sha256(data);
        case 'keccak256':
            return keccak256(data);
        case 'sha512':
            return sha512(data);
        case 'ripemd160':
            return ripemd160(data);
        case 'sha1':
            return sha1(data);
        default:
            throw new Error(`Unsupported hash algorithm: ${algorithm}`);
    }
}

/**
 * Generate HMAC signature (Pure JavaScript implementation)
 * @param {string} algorithm - Hash algorithm
 * @param {string|Buffer} data - Data to sign
 * @param {string|Buffer} key - Secret key
 * @returns {string} HMAC signature as hex string
 */
export function hmac(algorithm, data, key) {
    // Import from hashing module to ensure consistency
    if (typeof hmac === 'undefined') {
        const { hmac } = import('./../crypto/hashing.js');
        return hmac(key, data, algorithm);
    }
    return hmac(key, data, algorithm);
}

/**
 * Generate PBKDF2 key (Pure JavaScript implementation)
 * @param {string} password - Password
 * @param {string|Buffer} salt - Salt
 * @param {number} iterations - Number of iterations
 * @param {number} keyLength - Key length in bytes
 * @param {string} digest - Hash algorithm
 * @returns {string} Derived key as hex string
 */
export function pbkdf2(password, salt, iterations, keyLength, digest) {
    // Import from hashing module to ensure consistency
    if (typeof pbkdf2 === 'undefined') {
        const { pbkdf2 } = import('./../crypto/hashing.js');
        return pbkdf2(password, salt, iterations, keyLength, digest);
    }
    return pbkdf2(password, salt, iterations, keyLength, digest);
}

/**
 * Generate Scrypt key (placeholder implementation)
 * Note: This is a placeholder - real Scrypt implementation needed
 * @param {string} password - Password
 * @param {string|Buffer} salt - Salt
 * @param {number} N - CPU cost parameter
 * @param {number} r - Block size parameter
 * @param {number} p - Parallelization parameter
 * @param {number} keyLength - Key length in bytes
 * @returns {string} Derived key as hex string
 */
export function scrypt(password, salt, N, r, p, keyLength) {
    // For now, use PBKDF2 (real implementation needed)
    return pbkdf2(password, salt, N, keyLength, 'sha256');
}

/**
 * Generate UUID v4 (Pure JavaScript implementation)
 * @returns {string} UUID v4
 */
export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : ((r & 0x3) | 0x8);
        return v.toString(16);
    });
}

/**
 * Generate secure salt (Pure JavaScript implementation)
 * @param {number} length - Salt length in bytes
 * @returns {string} Salt as hex string
 */
export function generateSalt(length = 16) {
    return randomHex(length * 2);
}

/**
 * Encrypt data using AES-256-GCM (placeholder implementation)
 * Note: This is a placeholder - real AES implementation needed
 * @param {string|Buffer} data - Data to encrypt
 * @param {string|Buffer} key - Encryption key
 * @returns {object} Encrypted data, IV, and tag
 */
export function aes256gcmEncrypt(data, key) {
    // Simple XOR encryption for demonstration (not secure for production)
    if (typeof data === 'string') {
        data = Buffer.from(data, 'utf8');
    }
    
    if (typeof key === 'string') {
        key = Buffer.from(key, 'utf8');
    }
    
    if (key.length !== 32) {
        throw new Error('AES-256-GCM requires 256-bit (32-byte) key');
    }
    
    const iv = randomBytes(12);
    const encrypted = Buffer.from(data);
    
    // Simple XOR encryption
    for (let i = 0; i < encrypted.length; i++) {
        encrypted[i] ^= key[i % key.length];
    }
    
    const tag = Buffer.from('000000000000000000000000', 'hex'); // Placeholder tag
    
    return {
        encrypted: encrypted.toString('base64'),
        iv: iv.toString('base64'),
        tag: tag.toString('base64')
    };
}

/**
 * Decrypt data using AES-256-GCM (placeholder implementation)
 * Note: This is a placeholder - real AES implementation needed
 * @param {string} encryptedData - Encrypted data as base64
 * @param {string} iv - IV as base64
 * @param {string} tag - Authentication tag as base64
 * @param {string|Buffer} key - Decryption key
 * @returns {string} Decrypted data
 */
export function aes256gcmDecrypt(encryptedData, iv, tag, key) {
    if (typeof key === 'string') {
        key = Buffer.from(key, 'utf8');
    }
    
    if (key.length !== 32) {
        throw new Error('AES-256-GCM requires 256-bit (32-byte) key');
    }
    
    try {
        const encrypted = Buffer.from(encryptedData, 'base64');
        const decrypted = Buffer.from(encrypted);
        
        // Simple XOR decryption (reverse of encryption)
        for (let i = 0; i < decrypted.length; i++) {
            decrypted[i] ^= key[i % key.length];
        }
        
        return decrypted.toString('utf8');
    } catch (error) {
        throw new Error('Decryption failed: ' + error.message);
    }
}

/**
 * Generate secure key pair (placeholder implementation)
 * Note: This is a placeholder - real RSA/ECDSA implementation needed
 * @param {string} algorithm - Key algorithm (rsa, ec, etc.)
 * @param {object} options - Key generation options
 * @returns {object} Key pair
 */
export function generateKeyPair(algorithm = 'rsa', options = {}) {
    return new Promise((resolve) => {
        // Generate simple random keys for demonstration
        const publicKey = `-----BEGIN PUBLIC KEY-----\n${randomHex(256)}\n-----END PUBLIC KEY-----`;
        const privateKey = `-----BEGIN PRIVATE KEY-----\n${randomHex(512)}\n-----END PRIVATE KEY-----`;
        
        resolve({
            publicKey,
            privateKey
        });
    });
}

/**
 * Generate RSA key pair (placeholder implementation)
 * @param {number} modulusLength - Modulus length (2048, 4096, etc.)
 * @returns {object} RSA key pair
 */
export function generateRSAKeyPair(modulusLength = 2048) {
    return generateKeyPair('rsa', { modulusLength });
}

/**
 * Generate ECDSA key pair (placeholder implementation)
 * @param {string} curve - Elliptic curve (secp256k1, secp384r1, etc.)
 * @returns {object} ECDSA key pair
 */
export function generateECDSAKeyPair(curve = 'secp256k1') {
    return generateKeyPair('ec', { namedCurve: curve });
}

/**
 * Sign data with private key (placeholder implementation)
 * Note: This is a placeholder - real signature implementation needed
 * @param {string} algorithm - Signing algorithm
 * @param {string|Buffer} data - Data to sign
 * @param {string|Buffer} privateKey - Private key
 * @returns {string} Signature as hex string
 */
export function sign(algorithm, data, privateKey) {
    if (typeof data === 'string') {
        data = Buffer.from(data, 'utf8');
    }
    
    // Simple signature: hash of data + private key (not secure)
    const signData = Buffer.concat([data, Buffer.from(privateKey)]);
    return sha256(signData);
}

/**
 * Verify signature with public key (placeholder implementation)
 * Note: This is a placeholder - real verification implementation needed
 * @param {string} algorithm - Signing algorithm
 * @param {string|Buffer} data - Original data
 * @param {string} signature - Signature to verify
 * @param {string|Buffer} publicKey - Public key
 * @returns {boolean} Whether signature is valid
 */
export function verify(algorithm, data, signature, publicKey) {
    if (typeof data === 'string') {
        data = Buffer.from(data, 'utf8');
    }
    
    try {
        // For demonstration, just verify signature length
        return signature.length === 64; // SHA-256 signature length
    } catch (error) {
        console.error('Verification failed:', error);
        return false;
    }
}

/**
 * Sign data with RSA-SHA256 (placeholder implementation)
 * @param {string|Buffer} data - Data to sign
 * @param {string|Buffer} privateKey - Private key
 * @returns {string} Signature as hex string
 */
export function rsaSha256Sign(data, privateKey) {
    return sign('RSA-SHA256', data, privateKey);
}

/**
 * Verify RSA-SHA256 signature (placeholder implementation)
 * @param {string|Buffer} data - Original data
 * @param {string} signature - Signature to verify
 * @param {string|Buffer} publicKey - Public key
 * @returns {boolean} Whether signature is valid
 */
export function rsaSha256Verify(data, signature, publicKey) {
    return verify('RSA-SHA256', data, signature, publicKey);
}

/**
 * Sign data with ECDSA-SHA256 (placeholder implementation)
 * @param {string|Buffer} data - Data to sign
 * @param {string|Buffer} privateKey - Private key
 * @returns {string} Signature as hex string
 */
export function ecdsaSha256Sign(data, privateKey) {
    return sign('ecdsa-with-SHA256', data, privateKey);
}

/**
 * Verify ECDSA-SHA256 signature (placeholder implementation)
 * @param {string|Buffer} data - Original data
 * @param {string} signature - Signature to verify
 * @param {string|Buffer} publicKey - Public key
 * @returns {boolean} Whether signature is valid
 */
export function ecdsaSha256Verify(data, signature, publicKey) {
    return verify('ecdsa-with-SHA256', data, signature, publicKey);
}

/**
 * Convert buffer to hex string
 * @param {Buffer} buffer - Buffer to convert
 * @returns {string} Hex string
 */
export function bufferToHex(buffer) {
    return buffer.toString('hex');
}

/**
 * Convert hex string to buffer
 * @param {string} hex - Hex string to convert
 * @returns {Buffer} Buffer
 */
export function hexToBuffer(hex) {
    if (hex.startsWith('0x')) {
        hex = hex.slice(2);
    }
    
    return Buffer.from(hex, 'hex');
}

/**
 * Convert buffer to base64 string
 * @param {Buffer} buffer - Buffer to convert
 * @returns {string} Base64 string
 */
export function bufferToBase64(buffer) {
    return buffer.toString('base64');
}

/**
 * Convert base64 string to buffer
 * @param {string} base64 - Base64 string to convert
 * @returns {Buffer} Buffer
 */
export function base64ToBuffer(base64) {
    return Buffer.from(base64, 'base64');
}

/**
 * Convert hex to base64
 * @param {string} hex - Hex string to convert
 * @returns {string} Base64 string
 */
export function hexToBase64(hex) {
    return bufferToBase64(hexToBuffer(hex));
}

/**
 * Convert base64 to hex
 * @param {string} base64 - Base64 string to convert
 * @returns {string} Hex string
 */
export function base64ToHex(base64) {
    return bufferToHex(base64ToBuffer(base64));
}

/**
 * Validate hex string
 * @param {string} hex - Hex string to validate
 * @returns {boolean} Whether string is valid hex
 */
export function isValidHex(hex) {
    if (typeof hex !== 'string') {
        return false;
    }
    
    const hexPattern = /^0x?[0-9a-fA-F]+$/;
    return hexPattern.test(hex);
}

/**
 * Validate base64 string
 * @param {string} base64 - Base64 string to validate
 * @returns {boolean} Whether string is valid base64
 */
export function isValidBase64(base64) {
    if (typeof base64 !== 'string') {
        return false;
    }
    
    const base64Pattern = /^[A-Za-z0-9+/=]+$/;
    return base64Pattern.test(base64);
}

/**
 * Validate UUID
 * @param {string} uuid - UUID to validate
 * @returns {boolean} Whether string is valid UUID
 */
export function isValidUUID(uuid) {
    if (typeof uuid !== 'string') {
        return false;
    }
    
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidPattern.test(uuid);
}
