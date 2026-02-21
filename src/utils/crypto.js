/**
 * ChainForgeLedger Utils Module - Cryptographic Utilities
 * 
 * Provides cryptographic helper functions for blockchain operations.
 */

import crypto from 'crypto';
import { createHash } from 'crypto';

/**
 * Generate random bytes.
 * @param {number} length - Number of bytes to generate
 * @returns {Buffer} Random bytes buffer
 */
export function randomBytes(length) {
    return crypto.randomBytes(length);
}

/**
 * Generate secure random number.
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (exclusive)
 * @returns {number} Random number
 */
export function randomNumber(min, max) {
    if (min >= max) {
        throw new Error('Minimum value must be less than maximum value');
    }
    
    const range = max - min;
    const buffer = crypto.randomBytes(4);
    const random = buffer.readUInt32LE(0) / (0xFFFFFFFF + 1);
    
    return min + Math.floor(random * range);
}

/**
 * Generate random hex string.
 * @param {number} length - Length of the hex string (must be even)
 * @returns {string} Random hex string
 */
export function randomHex(length) {
    if (length % 2 !== 0) {
        throw new Error('Length must be even');
    }
    
    return crypto.randomBytes(length / 2).toString('hex');
}

/**
 * Generate SHA-256 hash.
 * @param {string|Buffer} data - Data to hash
 * @returns {string} SHA-256 hash as hex string
 */
export function sha256(data) {
    if (typeof data === 'string') {
        data = Buffer.from(data, 'utf8');
    }
    
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate SHA-512 hash.
 * @param {string|Buffer} data - Data to hash
 * @returns {string} SHA-512 hash as hex string
 */
export function sha512(data) {
    if (typeof data === 'string') {
        data = Buffer.from(data, 'utf8');
    }
    
    return crypto.createHash('sha512').update(data).digest('hex');
}

/**
 * Generate RIPEMD-160 hash.
 * @param {string|Buffer} data - Data to hash
 * @returns {string} RIPEMD-160 hash as hex string
 */
export function ripemd160(data) {
    if (typeof data === 'string') {
        data = Buffer.from(data, 'utf8');
    }
    
    return crypto.createHash('ripemd160').update(data).digest('hex');
}

/**
 * Generate keccak256 hash.
 * @param {string|Buffer} data - Data to hash
 * @returns {string} Keccak256 hash as hex string
 */
export function keccak256(data) {
    if (typeof data === 'string') {
        data = Buffer.from(data, 'utf8');
    }
    
    return crypto.createHash('keccak256').update(data).digest('hex');
}

/**
 * Generate SHA-1 hash (for legacy compatibility only).
 * @param {string|Buffer} data - Data to hash
 * @returns {string} SHA-1 hash as hex string
 */
export function sha1(data) {
    if (typeof data === 'string') {
        data = Buffer.from(data, 'utf8');
    }
    
    return crypto.createHash('sha1').update(data).digest('hex');
}

/**
 * Hash data with specified algorithm.
 * @param {string} algorithm - Hash algorithm (sha256, sha512, keccak256, etc.)
 * @param {string|Buffer} data - Data to hash
 * @returns {string} Hash as hex string
 */
export function hash(algorithm, data) {
    if (typeof data === 'string') {
        data = Buffer.from(data, 'utf8');
    }
    
    return crypto.createHash(algorithm).update(data).digest('hex');
}

/**
 * Generate HMAC signature.
 * @param {string} algorithm - Hash algorithm
 * @param {string|Buffer} data - Data to sign
 * @param {string|Buffer} key - Secret key
 * @returns {string} HMAC signature as hex string
 */
export function hmac(algorithm, data, key) {
    if (typeof data === 'string') {
        data = Buffer.from(data, 'utf8');
    }
    
    if (typeof key === 'string') {
        key = Buffer.from(key, 'utf8');
    }
    
    return crypto.createHmac(algorithm, key).update(data).digest('hex');
}

/**
 * Generate PBKDF2 key.
 * @param {string} password - Password
 * @param {string|Buffer} salt - Salt
 * @param {number} iterations - Number of iterations
 * @param {number} keyLength - Key length in bytes
 * @param {string} digest - Hash algorithm
 * @returns {string} Derived key as hex string
 */
export function pbkdf2(password, salt, iterations, keyLength, digest) {
    if (typeof salt === 'string') {
        salt = Buffer.from(salt, 'utf8');
    }
    
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, iterations, keyLength, digest, (error, derivedKey) => {
            if (error) {
                reject(error);
            } else {
                resolve(derivedKey.toString('hex'));
            }
        });
    });
}

/**
 * Generate Scrypt key.
 * @param {string} password - Password
 * @param {string|Buffer} salt - Salt
 * @param {number} N - CPU cost parameter
 * @param {number} r - Block size parameter
 * @param {number} p - Parallelization parameter
 * @param {number} keyLength - Key length in bytes
 * @returns {string} Derived key as hex string
 */
export function scrypt(password, salt, N, r, p, keyLength) {
    if (typeof salt === 'string') {
        salt = Buffer.from(salt, 'utf8');
    }
    
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, keyLength, { N, r, p }, (error, derivedKey) => {
            if (error) {
                reject(error);
            } else {
                resolve(derivedKey.toString('hex'));
            }
        });
    });
}

/**
 * Generate UUID v4.
 * @returns {string} UUID v4
 */
export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = crypto.randomBytes(1)[0] % 16 | 0;
        const v = c === 'x' ? r : ((r & 0x3) | 0x8);
        return v.toString(16);
    });
}

/**
 * Generate secure salt.
 * @param {number} length - Salt length in bytes
 * @returns {string} Salt as hex string
 */
export function generateSalt(length = 16) {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Encrypt data using AES-256-GCM.
 * @param {string|Buffer} data - Data to encrypt
 * @param {string|Buffer} key - Encryption key
 * @returns {object} Encrypted data, IV, and tag
 */
export function aes256gcmEncrypt(data, key) {
    if (typeof data === 'string') {
        data = Buffer.from(data, 'utf8');
    }
    
    if (typeof key === 'string') {
        key = Buffer.from(key, 'utf8');
    }
    
    if (key.length !== 32) {
        throw new Error('AES-256-GCM requires 256-bit (32-byte) key');
    }
    
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipher('aes-256-gcm', key);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    const tag = cipher.getAuthTag();
    
    return {
        encrypted: encrypted.toString('base64'),
        iv: iv.toString('base64'),
        tag: tag.toString('base64')
    };
}

/**
 * Decrypt data using AES-256-GCM.
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
        const decipher = crypto.createDecipher('aes-256-gcm', key);
        decipher.setAuthTag(Buffer.from(tag, 'base64'));
        decipher.setIV(Buffer.from(iv, 'base64'));
        
        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(encryptedData, 'base64')),
            decipher.final()
        ]);
        
        return decrypted.toString('utf8');
    } catch (error) {
        throw new Error('Decryption failed: ' + error.message);
    }
}

/**
 * Generate secure key pair.
 * @param {string} algorithm - Key algorithm (rsa, ec, etc.)
 * @param {object} options - Key generation options
 * @returns {object} Key pair
 */
export function generateKeyPair(algorithm = 'rsa', options = {}) {
    return new Promise((resolve, reject) => {
        crypto.generateKeyPair(algorithm, options, (error, publicKey, privateKey) => {
            if (error) {
                reject(error);
            } else {
                resolve({
                    publicKey: publicKey.export({ format: 'pem', type: 'spki' }),
                    privateKey: privateKey.export({ format: 'pem', type: 'pkcs8' })
                });
            }
        });
    });
}

/**
 * Generate RSA key pair.
 * @param {number} modulusLength - Modulus length (2048, 4096, etc.)
 * @returns {object} RSA key pair
 */
export function generateRSAKeyPair(modulusLength = 2048) {
    return generateKeyPair('rsa', {
        modulusLength,
        publicExponent: 0x10001,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
}

/**
 * Generate ECDSA key pair.
 * @param {string} curve - Elliptic curve (secp256k1, secp384r1, etc.)
 * @returns {object} ECDSA key pair
 */
export function generateECDSAKeyPair(curve = 'secp256k1') {
    return generateKeyPair('ec', {
        namedCurve: curve,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
}

/**
 * Sign data with private key.
 * @param {string} algorithm - Signing algorithm
 * @param {string|Buffer} data - Data to sign
 * @param {string|Buffer} privateKey - Private key
 * @returns {string} Signature as hex string
 */
export function sign(algorithm, data, privateKey) {
    if (typeof data === 'string') {
        data = Buffer.from(data, 'utf8');
    }
    
    if (typeof privateKey === 'string') {
        privateKey = Buffer.from(privateKey, 'utf8');
    }
    
    const signer = crypto.createSign(algorithm);
    signer.update(data);
    return signer.sign(privateKey, 'hex');
}

/**
 * Verify signature with public key.
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
    
    if (typeof publicKey === 'string') {
        publicKey = Buffer.from(publicKey, 'utf8');
    }
    
    try {
        const verifier = crypto.createVerify(algorithm);
        verifier.update(data);
        return verifier.verify(publicKey, signature, 'hex');
    } catch (error) {
        console.error('Verification failed:', error);
        return false;
    }
}

/**
 * Sign data with RSA-SHA256.
 * @param {string|Buffer} data - Data to sign
 * @param {string|Buffer} privateKey - Private key
 * @returns {string} Signature as hex string
 */
export function rsaSha256Sign(data, privateKey) {
    return sign('RSA-SHA256', data, privateKey);
}

/**
 * Verify RSA-SHA256 signature.
 * @param {string|Buffer} data - Original data
 * @param {string} signature - Signature to verify
 * @param {string|Buffer} publicKey - Public key
 * @returns {boolean} Whether signature is valid
 */
export function rsaSha256Verify(data, signature, publicKey) {
    return verify('RSA-SHA256', data, signature, publicKey);
}

/**
 * Sign data with ECDSA-SHA256.
 * @param {string|Buffer} data - Data to sign
 * @param {string|Buffer} privateKey - Private key
 * @returns {string} Signature as hex string
 */
export function ecdsaSha256Sign(data, privateKey) {
    return sign('ecdsa-with-SHA256', data, privateKey);
}

/**
 * Verify ECDSA-SHA256 signature.
 * @param {string|Buffer} data - Original data
 * @param {string} signature - Signature to verify
 * @param {string|Buffer} publicKey - Public key
 * @returns {boolean} Whether signature is valid
 */
export function ecdsaSha256Verify(data, signature, publicKey) {
    return verify('ecdsa-with-SHA256', data, signature, publicKey);
}

/**
 * Convert buffer to hex string.
 * @param {Buffer} buffer - Buffer to convert
 * @returns {string} Hex string
 */
export function bufferToHex(buffer) {
    return buffer.toString('hex');
}

/**
 * Convert hex string to buffer.
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
 * Convert buffer to base64 string.
 * @param {Buffer} buffer - Buffer to convert
 * @returns {string} Base64 string
 */
export function bufferToBase64(buffer) {
    return buffer.toString('base64');
}

/**
 * Convert base64 string to buffer.
 * @param {string} base64 - Base64 string to convert
 * @returns {Buffer} Buffer
 */
export function base64ToBuffer(base64) {
    return Buffer.from(base64, 'base64');
}

/**
 * Convert hex to base64.
 * @param {string} hex - Hex string to convert
 * @returns {string} Base64 string
 */
export function hexToBase64(hex) {
    return bufferToBase64(hexToBuffer(hex));
}

/**
 * Convert base64 to hex.
 * @param {string} base64 - Base64 string to convert
 * @returns {string} Hex string
 */
export function base64ToHex(base64) {
    return bufferToHex(base64ToBuffer(base64));
}

/**
 * Validate hex string.
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
 * Validate base64 string.
 * @param {string} base64 - Base64 string to validate
 * @returns {boolean} Whether string is valid base64
 */
export function isValidBase64(base64) {
    if (typeof base64 !== 'string') {
        return false;
    }
    
    try {
        Buffer.from(base64, 'base64');
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Validate UUID.
 * @param {string} uuid - UUID to validate
 * @returns {boolean} Whether string is valid UUID
 */
export function isValidUUID(uuid) {
    if (typeof uuid !== 'string') {
        return false;
    }
    
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidPattern.test(uuid);
}
