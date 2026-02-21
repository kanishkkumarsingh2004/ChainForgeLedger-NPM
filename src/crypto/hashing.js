import crypto from 'crypto';

/**
 * Cryptographic hashing functions
 */

/**
 * SHA-256 hash function
 * @param {string|Buffer} data - Data to hash
 * @returns {string} Hexadecimal hash value
 */
export function sha256_hash(data) {
    const hash = crypto.createHash('sha256');
    hash.update(data.toString());
    return hash.digest('hex');
}

/**
 * Keccak-256 hash function
 * @param {string|Buffer} data - Data to hash
 * @returns {string} Hexadecimal hash value
 */
export function keccak256_hash(data) {
    // In Node.js, we can use sha3-256 which is similar to keccak256
    const hash = crypto.createHash('sha3-256');
    hash.update(data.toString());
    return hash.digest('hex');
}

/**
 * Double SHA-256 hash (SHA256(SHA256(data)))
 * @param {string|Buffer} data - Data to hash
 * @returns {string} Hexadecimal hash value
 */
export function double_sha256(data) {
    return sha256_hash(sha256_hash(data));
}

/**
 * Hash for merkle tree construction
 * @param {string} left - Left node hash
 * @param {string} right - Right node hash
 * @returns {string} Combined hash
 */
export function merkle_hash(left, right) {
    return sha256_hash(left + right);
}

/**
 * Generate a random salt
 * @param {number} length - Length of salt in bytes
 * @returns {string} Hexadecimal salt
 */
export function generate_salt(length = 16) {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * PBKDF2 key derivation function
 * @param {string} password - Input password
 * @param {string} salt - Salt value
 * @param {number} iterations - Number of iterations
 * @param {number} keyLength - Length of derived key in bytes
 * @param {string} digest - Hashing algorithm
 * @returns {Promise<string>} Derived key as hexadecimal string
 */
export function pbkdf2(password, salt, iterations = 100000, keyLength = 32, digest = 'sha256') {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, iterations, keyLength, digest, (err, derivedKey) => {
            if (err) reject(err);
            else resolve(derivedKey.toString('hex'));
        });
    });
}

/**
 * HMAC (Hash-based Message Authentication Code)
 * @param {string} key - Secret key
 * @param {string|Buffer} data - Data to authenticate
 * @param {string} algorithm - HMAC algorithm
 * @returns {string} HMAC as hexadecimal string
 */
export function hmac(key, data, algorithm = 'sha256') {
    const hmac = crypto.createHmac(algorithm, key);
    hmac.update(data.toString());
    return hmac.digest('hex');
}
