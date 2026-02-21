import crypto from 'crypto';

/**
 * Digital signature utilities
 */

export class Signature {
    /**
     * Create a new Signature instance
     * @param {Object} options - Signature options
     */
    constructor(options = {}) {
        this.algorithm = options.algorithm || 'sha256';
        this.privateKey = options.privateKey || null;
        this.publicKey = options.publicKey || null;
    }

    /**
     * Sign data using the private key
     * @param {string|Buffer} data - Data to sign
     * @param {Object} options - Signing options
     * @returns {string} Signature as hexadecimal string
     */
    sign(data, options = {}) {
        if (!this.privateKey) {
            throw new Error('Private key not set');
        }

        const sign = crypto.createSign(this.algorithm);
        sign.update(data.toString());
        sign.end();

        return sign.sign(this.privateKey, 'hex');
    }

    /**
     * Verify a signature using the public key
     * @param {string|Buffer} data - Original data
     * @param {string} signature - Signature to verify (hexadecimal)
     * @param {Object} options - Verification options
     * @returns {boolean} True if signature is valid
     */
    verify(data, signature, options = {}) {
        if (!this.publicKey) {
            throw new Error('Public key not set');
        }

        try {
            const verify = crypto.createVerify(this.algorithm);
            verify.update(data.toString());
            verify.end();

            return verify.verify(this.publicKey, signature, 'hex');
        } catch (error) {
            console.error('Verification error:', error);
            return false;
        }
    }

    /**
     * Set the private key
     * @param {string} privateKey - Private key in PEM format
     */
    setPrivateKey(privateKey) {
        this.privateKey = privateKey;
    }

    /**
     * Set the public key
     * @param {string} publicKey - Public key in PEM format
     */
    setPublicKey(publicKey) {
        this.publicKey = publicKey;
    }

    /**
     * Get signature algorithm
     * @returns {string} Algorithm name
     */
    getAlgorithm() {
        return this.algorithm;
    }

    /**
     * Set signature algorithm
     * @param {string} algorithm - Algorithm name (e.g., 'sha256', 'sha384')
     */
    setAlgorithm(algorithm) {
        this.algorithm = algorithm;
    }
}

/**
 * Create a digital signature
 * @param {string|Buffer} data - Data to sign
 * @param {string} privateKey - Private key in PEM format
 * @param {string} algorithm - Hash algorithm
 * @returns {string} Signature as hexadecimal string
 */
export function create_signature(data, privateKey, algorithm = 'sha256') {
    const signature = new Signature({
        algorithm,
        privateKey
    });
    return signature.sign(data);
}

/**
 * Verify a digital signature
 * @param {string|Buffer} data - Original data
 * @param {string} signature - Signature to verify (hexadecimal)
 * @param {string} publicKey - Public key in PEM format
 * @param {string} algorithm - Hash algorithm
 * @returns {boolean} True if signature is valid
 */
export function verify_signature(data, signature, publicKey, algorithm = 'sha256') {
    const verifier = new Signature({
        algorithm,
        publicKey
    });
    return verifier.verify(data, signature);
}

/**
 * Generate a signature object with keys
 * @param {Object} options - Configuration options
 * @returns {Signature} Signature instance
 */
export function create_signature_instance(options = {}) {
    return new Signature(options);
}

/**
 * List supported signature algorithms
 * @returns {string[]} Array of supported algorithms
 */
export function get_supported_algorithms() {
    // Common algorithms supported by Node.js crypto module
    return [
        'sha256', 'sha384', 'sha512',
        'md5', 'ripemd160',
        'sha1', 'sha224'
    ];
}
