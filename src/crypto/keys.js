import crypto from 'crypto';

/**
 * Key pair generation and management
 */

export class KeyPair {
    /**
     * Create a new KeyPair instance
     * @param {Object} options - Generation options
     */
    constructor(options = {}) {
        const { bits = 2048, type = 'rsa' } = options;
        this.bits = bits;
        this.type = type;
        this.publicKey = null;
        this.privateKey = null;
    }

    /**
     * Generate a new key pair
     * @returns {Promise<void>}
     */
    async generate() {
        return new Promise((resolve, reject) => {
            crypto.generateKeyPair(this.type, {
                modulusLength: this.bits,
                publicKeyEncoding: { type: 'spki', format: 'pem' },
                privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
            }, (err, publicKey, privateKey) => {
                if (err) reject(err);
                else {
                    this.publicKey = publicKey;
                    this.privateKey = privateKey;
                    resolve();
                }
            });
        });
    }

    /**
     * Load keys from PEM strings
     * @param {string} publicKey - Public key in PEM format
     * @param {string} privateKey - Private key in PEM format
     */
    loadFromPEM(publicKey, privateKey) {
        this.publicKey = publicKey;
        this.privateKey = privateKey;
    }

    /**
     * Get public key as PEM string
     * @returns {string|null} Public key
     */
    getPublicKey() {
        return this.publicKey;
    }

    /**
     * Get private key as PEM string
     * @returns {string|null} Private key
     */
    getPrivateKey() {
        return this.privateKey;
    }

    /**
     * Export key pair to JSON
     * @returns {Object} Key pair data
     */
    toJSON() {
        return {
            type: this.type,
            bits: this.bits,
            publicKey: this.publicKey,
            privateKey: this.privateKey
        };
    }

    /**
     * Import key pair from JSON
     * @param {Object} data - Key pair data
     */
    static fromJSON(data) {
        const keyPair = new KeyPair({ bits: data.bits, type: data.type });
        keyPair.loadFromPEM(data.publicKey, data.privateKey);
        return keyPair;
    }
}

/**
 * Generate a new key pair
 * @param {Object} options - Generation options
 * @returns {Promise<KeyPair>} Generated key pair
 */
export async function generate_keys(options = {}) {
    const keyPair = new KeyPair(options);
    await keyPair.generate();
    return keyPair;
}

/**
 * Generate an Ethereum-style address from public key
 * @param {string} publicKey - Public key in PEM format
 * @returns {string} Ethereum address
 */
export function public_to_address(publicKey) {
    // This is a simplified version for demonstration
    // In real Ethereum, it involves keccak256 of public key (without prefix) and taking last 20 bytes
    const hash = crypto.createHash('sha256').update(publicKey).digest('hex');
    return '0x' + hash.slice(-40);
}

/**
 * Validate a public key format
 * @param {string} publicKey - Public key to validate
 * @param {string} type - Key type
 * @returns {boolean} True if valid
 */
export function validate_public_key(publicKey, type = 'rsa') {
    try {
        crypto.createPublicKey(publicKey);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Validate a private key format
 * @param {string} privateKey - Private key to validate
 * @param {string} type - Key type
 * @returns {boolean} True if valid
 */
export function validate_private_key(privateKey, type = 'rsa') {
    try {
        crypto.createPrivateKey(privateKey);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Generate a symmetric key for encryption
 * @param {number} length - Key length in bits (128, 192, or 256)
 * @returns {string} Random key
 */
export function generate_symmetric_key(length = 256) {
    const bytes = length / 8;
    return crypto.randomBytes(bytes).toString('hex');
}
