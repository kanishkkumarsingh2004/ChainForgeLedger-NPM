import { sha256_hash } from '../crypto/hashing.js';
import { Transaction } from './transaction.js';
import { MerkleTree } from './merkle.js';

/**
 * Block and block management
 */

export class Block {
    /**
     * Create a new Block instance
     * @param {Object} options - Block options
     */
    constructor(options = {}) {
        this.index = options.index || 0;
        this.timestamp = options.timestamp || Date.now();
        this.transactions = options.transactions || [];
        this.previousHash = options.previousHash || '0'.repeat(64);
        this.nonce = options.nonce || 0;
        this.validator = options.validator || null;
        this.difficulty = options.difficulty || 1;
        this.size = options.size || 0;
        this.txRoot = options.txRoot || this.calculateTxRoot();
        this.stateRoot = options.stateRoot || '0'.repeat(64);
        this.receiptRoot = options.receiptRoot || '0'.repeat(64);
        this.hash = options.hash || this.calculateHash();
    }

    /**
     * Calculate transactions Merkle root (txRoot)
     * @returns {string} Transactions Merkle root
     */
    calculateTxRoot() {
        if (this.transactions.length === 0) {
            return '0'.repeat(64);
        }
        
        const merkleTree = new MerkleTree(this.transactions.map(tx => tx.toJSON()));
        return merkleTree.getRoot();
    }

    /**
     * Calculate state root (stateRoot)
     * @returns {string} State Merkle root
     */
    calculateStateRoot() {
        return '0'.repeat(64);
    }

    /**
     * Calculate receipts Merkle root (receiptRoot)
     * @returns {string} Receipts Merkle root
     */
    calculateReceiptRoot() {
        return '0'.repeat(64);
    }

    /**
     * Calculate block hash
     * @returns {string} Block hash
     */
    calculateHash() {
        const blockData = JSON.stringify({
            index: this.index,
            timestamp: this.timestamp,
            txRoot: this.txRoot,
            stateRoot: this.stateRoot,
            receiptRoot: this.receiptRoot,
            previousHash: this.previousHash,
            nonce: this.nonce,
            validator: this.validator,
            difficulty: this.difficulty
        });
        return sha256_hash(blockData);
    }

    /**
     * Set block index
     * @param {number} index - Block index
     */
    setIndex(index) {
        if (typeof index !== 'number' || index < 0) {
            throw new Error('Index must be a non-negative integer');
        }
        this.index = index;
    }

    /**
     * Set previous block hash
     * @param {string} hash - Previous block hash
     */
    setPreviousHash(hash) {
        if (typeof hash !== 'string' || hash.length !== 64) {
            throw new Error('Previous hash must be a 64-character string');
        }
        this.previousHash = hash;
    }

    /**
     * Set block difficulty
     * @param {number} difficulty - Mining difficulty
     */
    setDifficulty(difficulty) {
        if (typeof difficulty !== 'number' || difficulty < 1) {
            throw new Error('Difficulty must be a positive integer');
        }
        this.difficulty = difficulty;
    }

    /**
     * Set block validator
     * @param {string} validator - Validator address
     */
    setValidator(validator) {
        this.validator = validator;
    }

    /**
     * Add a transaction to the block
     * @param {Transaction} transaction - Transaction to add
     */
    addTransaction(transaction) {
        if (!(transaction instanceof Transaction)) {
            throw new Error('Must provide a Transaction instance');
        }

        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction');
        }

        this.transactions.push(transaction);
        this.txRoot = this.calculateTxRoot();
        this.size = this.calculateSize();
    }

    /**
     * Add multiple transactions to the block
     * @param {Transaction[]} transactions - Transactions to add
     */
    addTransactions(transactions) {
        transactions.forEach(transaction => this.addTransaction(transaction));
    }

    /**
     * Remove a transaction from the block
     * @param {string} transactionId - ID of transaction to remove
     */
    removeTransaction(transactionId) {
        const index = this.transactions.findIndex(tx => tx.id === transactionId);
        if (index !== -1) {
            this.transactions.splice(index, 1);
            this.size = this.calculateSize();
        }
    }

    /**
     * Get all transactions in the block
     * @returns {Transaction[]} Array of transactions
     */
    getTransactions() {
        return [...this.transactions];
    }

    /**
     * Get transaction count
     * @returns {number} Number of transactions
     */
    getTransactionCount() {
        return this.transactions.length;
    }

    /**
     * Calculate block size in bytes
     * @returns {number} Block size
     */
    calculateSize() {
        return Buffer.byteLength(JSON.stringify(this.toJSON()), 'utf8');
    }

    /**
     * Check if block contains a specific transaction
     * @param {string} transactionId - Transaction ID to check
     * @returns {boolean} True if block contains the transaction
     */
    hasTransaction(transactionId) {
        return this.transactions.some(tx => tx.id === transactionId);
    }

    /**
     * Find a transaction in the block
     * @param {string} transactionId - Transaction ID to find
     * @returns {Transaction|null} Found transaction or null
     */
    findTransaction(transactionId) {
        return this.transactions.find(tx => tx.id === transactionId) || null;
    }

    /**
     * Validate block
     * @param {Block|null} previousBlock - Previous block for validation
     * @returns {Object} Validation result
     */
    validate(previousBlock = null) {
        const errors = [];

        // Validate hash
        const calculatedHash = this.calculateHash();
        if (this.hash !== calculatedHash) {
            errors.push(`Invalid hash: expected ${calculatedHash}, got ${this.hash}`);
        }

        // Validate index
        if (previousBlock && this.index !== previousBlock.index + 1) {
            errors.push(`Invalid index: expected ${previousBlock.index + 1}, got ${this.index}`);
        }

        // Validate previous hash
        if (previousBlock && this.previousHash !== previousBlock.hash) {
            errors.push(`Invalid previous hash: expected ${previousBlock.hash}, got ${this.previousHash}`);
        }

        // Validate transactions
        const invalidTransactions = this.transactions.filter(tx => !tx.isValid());
        invalidTransactions.forEach(tx => {
            errors.push(`Invalid transaction ${tx.id}: ${tx.validate().message}`);
        });

        // Validate txRoot
        const calculatedTxRoot = this.calculateTxRoot();
        if (this.txRoot !== calculatedTxRoot) {
            errors.push(`Invalid txRoot: expected ${calculatedTxRoot}, got ${this.txRoot}`);
        }

        // Validate timestamp
        if (previousBlock && this.timestamp <= previousBlock.timestamp) {
            errors.push('Timestamp must be after previous block');
        }

        // Validate difficulty
        if (typeof this.difficulty !== 'number' || this.difficulty < 1) {
            errors.push(`Invalid difficulty: ${this.difficulty}`);
        }

        const isValid = errors.length === 0;

        return {
            isValid,
            errors,
            message: isValid ? 'Block is valid' : `Block validation failed: ${errors.join(', ')}`
        };
    }

    /**
     * Check if block is valid
     * @param {Block|null} previousBlock - Previous block for validation
     * @returns {boolean} True if valid
     */
    isValid(previousBlock = null) {
        return this.validate(previousBlock).isValid;
    }

    /**
     * Convert block to JSON object
     * @returns {Object} Block as JSON
     */
    toJSON() {
        return {
            index: this.index,
            timestamp: this.timestamp,
            transactions: this.transactions.map(tx => tx.toJSON()),
            previousHash: this.previousHash,
            hash: this.hash,
            nonce: this.nonce,
            validator: this.validator,
            difficulty: this.difficulty,
            size: this.size,
            txRoot: this.txRoot,
            stateRoot: this.stateRoot,
            receiptRoot: this.receiptRoot
        };
    }

    /**
     * Create block from JSON object
     * @param {Object} data - Block data
     * @returns {Block} Block instance
     */
    static fromJSON(data) {
        const block = new Block({
            index: data.index,
            timestamp: data.timestamp,
            previousHash: data.previousHash,
            hash: data.hash,
            nonce: data.nonce,
            validator: data.validator,
            difficulty: data.difficulty,
            size: data.size,
            txRoot: data.txRoot,
            stateRoot: data.stateRoot,
            receiptRoot: data.receiptRoot
        });

        // Convert transactions to Transaction instances
        if (data.transactions) {
            block.addTransactions(data.transactions.map(tx => Transaction.fromJSON(tx)));
        }

        return block;
    }

    /**
     * Calculate block reward based on block index
     * @param {number} index - Block index
     * @returns {number} Block reward
     */
    static calculateBlockReward(index) {
        // Halving every 4 years or 210,000 blocks (like Bitcoin)
        const halvingInterval = 210000;
        const initialReward = 50;
        const halvings = Math.floor(index / halvingInterval);
        const reward = initialReward / Math.pow(2, halvings);
        return Math.max(reward, 0);
    }

    /**
     * Get block statistics
     * @returns {Object} Block statistics
     */
    getStatistics() {
        const totalValue = this.transactions.reduce((sum, tx) => sum + tx.amount, 0);
        const totalFees = this.transactions.reduce((sum, tx) => sum + tx.fee, 0);

        return {
            index: this.index,
            transactionCount: this.getTransactionCount(),
            size: this.size,
            timestamp: this.timestamp,
            totalValue,
            totalFees,
            reward: Block.calculateBlockReward(this.index),
            difficulty: this.difficulty
        };
    }
}

/**
 * Create a new block
 * @param {Object} options - Block options
 * @returns {Block} New block instance
 */
export function create_block(options = {}) {
    return new Block(options);
}

/**
 * Create a genesis block
 * @returns {Block} Genesis block
 */
export function create_genesis_block() {
    return new Block({
        index: 0,
        timestamp: Date.now(),
        transactions: [],
        previousHash: '0'.repeat(64),
        nonce: 0
    });
}
