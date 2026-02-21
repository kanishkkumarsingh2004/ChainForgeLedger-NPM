import crypto from 'crypto';
import { sha256_hash, keccak256_hash } from './hashing.js';
import { generate_keys, KeyPair, public_to_address } from './keys.js';

/**
 * Wallet management system
 */

export class Wallet {
    /**
     * Create a new Wallet instance
     * @param {Object} options - Wallet options
     */
    constructor(options = {}) {
        this.address = options.address || null;
        this.keyPair = options.keyPair || new KeyPair();
        this.balance = options.balance || 0;
        this.transactions = options.transactions || [];
        this.createdAt = options.createdAt || new Date();
        this.updatedAt = options.updatedAt || new Date();
    }

    /**
     * Generate a new wallet with random keys
     * @returns {Promise<Wallet>} New wallet instance
     */
    static async create() {
        const keyPair = await generate_keys();
        const address = public_to_address(keyPair.getPublicKey());
        return new Wallet({
            address,
            keyPair,
            balance: 0
        });
    }

    /**
     * Import a wallet from private key
     * @param {string} privateKey - Private key in PEM format
     * @returns {Promise<Wallet>} Imported wallet
     */
    static async importFromPrivateKey(privateKey) {
        const keyPair = new KeyPair();
        // For demonstration, we'll create a dummy public key (in real scenario, extract from private key)
        const dummyPublicKey = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----';
        keyPair.loadFromPEM(dummyPublicKey, privateKey);
        const address = public_to_address(dummyPublicKey);
        return new Wallet({
            address,
            keyPair
        });
    }

    /**
     * Get wallet address
     * @returns {string} Wallet address
     */
    getAddress() {
        return this.address;
    }

    /**
     * Get current balance
     * @returns {number} Balance
     */
    getBalance() {
        return this.balance;
    }

    /**
     * Update wallet balance
     * @param {number} amount - New balance
     */
    setBalance(amount) {
        if (typeof amount !== 'number' || amount < 0) {
            throw new Error('Balance must be a non-negative number');
        }
        this.balance = amount;
        this.updatedAt = new Date();
    }

    /**
     * Add a transaction to wallet history
     * @param {Object} transaction - Transaction object
     */
    addTransaction(transaction) {
        this.transactions.push(transaction);
        this.updatedAt = new Date();
    }

    /**
     * Get transaction history
     * @param {Object} options - Filter options
     * @returns {Array} Transaction history
     */
    getTransactions(options = {}) {
        const { limit = 100, offset = 0 } = options;
        return this.transactions.slice(offset, offset + limit);
    }

    /**
     * Sign a transaction
     * @param {Object} transaction - Transaction to sign
     * @returns {string} Signature
     */
    signTransaction(transaction) {
        const transactionData = JSON.stringify(transaction);
        const hash = sha256_hash(transactionData);
        // In real implementation, this would use actual private key signing
        return crypto.createHash('sha256').update(hash + this.address).digest('hex');
    }

    /**
     * Verify transaction signature
     * @param {Object} transaction - Transaction to verify
     * @param {string} signature - Signature to verify
     * @returns {boolean} True if signature is valid
     */
    verifyTransactionSignature(transaction, signature) {
        const transactionData = JSON.stringify(transaction);
        const hash = sha256_hash(transactionData);
        const expectedSignature = crypto.createHash('sha256').update(hash + this.address).digest('hex');
        return signature === expectedSignature;
    }

    /**
     * Export wallet as JSON for backup
     * @param {string} password - Password to encrypt wallet
     * @returns {string} Encrypted wallet JSON
     */
    export(password) {
        const walletData = {
            address: this.address,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            balance: this.balance,
            transactions: this.transactions,
            keyPair: this.keyPair.toJSON()
        };
        // In real implementation, this would be encrypted with the password
        return JSON.stringify(walletData);
    }

    /**
     * Import a wallet from JSON backup
     * @param {string} encryptedData - Encrypted wallet data
     * @param {string} password - Password to decrypt
     * @returns {Wallet} Decrypted wallet instance
     */
    static import(encryptedData, password) {
        const walletData = JSON.parse(encryptedData);
        const keyPair = KeyPair.fromJSON(walletData.keyPair);
        return new Wallet({
            address: walletData.address,
            keyPair,
            balance: walletData.balance,
            transactions: walletData.transactions,
            createdAt: new Date(walletData.createdAt),
            updatedAt: new Date(walletData.updatedAt)
        });
    }

    /**
     * Generate a QR code data URI for wallet address
     * @param {Object} options - QR code options
     * @returns {string} QR code data URI
     */
    getAddressQRCode(options = {}) {
        // Simplified version - in real app, use qrcode library
        const size = options.size || 256;
        return `data:image/svg+xml;base64,${Buffer.from(`<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><text x="${size/2}" y="${size/2}" text-anchor="middle" dy=".3em">${this.address.slice(0, 8)}...</text></svg>`).toString('base64')}`;
    }

    /**
     * Get wallet statistics
     * @returns {Object} Wallet statistics
     */
    getStatistics() {
        const totalSent = this.transactions
            .filter(tx => tx.sender === this.address)
            .reduce((sum, tx) => sum + (tx.amount || 0), 0);

        const totalReceived = this.transactions
            .filter(tx => tx.receiver === this.address)
            .reduce((sum, tx) => sum + (tx.amount || 0), 0);

        return {
            transactionCount: this.transactions.length,
            totalSent,
            totalReceived,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

/**
 * Create a new wallet
 * @returns {Promise<Wallet>} New wallet instance
 */
export async function create_wallet() {
    return Wallet.create();
}

/**
 * Create multiple wallets
 * @param {number} count - Number of wallets to create
 * @returns {Promise<Wallet[]>} Array of new wallets
 */
export async function create_wallets(count = 1) {
    const wallets = [];
    for (let i = 0; i < count; i++) {
        wallets.push(await Wallet.create());
    }
    return wallets;
}

/**
 * Validate a wallet address format
 * @param {string} address - Address to validate
 * @returns {boolean} True if valid
 */
export function validate_address(address) {
    return typeof address === 'string' && address.startsWith('0x') && address.length === 42;
}
