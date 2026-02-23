/**
 * ChainForgeLedger VM Context
 * 
 * Strictly controlled execution environment for smart contracts
 * ensuring deterministic behavior.
 */

export class VMContext {
    /**
     * Create a new VM context with controlled environment
     * @param {Object} options - Context options
     */
    constructor(options = {}) {
        // Block context (deterministic values)
        this.block = {
            index: options.blockIndex || 0,
            timestamp: options.blockTimestamp || 0,
            difficulty: options.blockDifficulty || 1,
            gasLimit: options.blockGasLimit || 1000000,
            coinbase: options.blockCoinbase || '0x00000000000000000000000000000000'
        };

        // Transaction context (deterministic values)
        this.transaction = {
            id: options.transactionId || 'tx_0',
            sender: options.transactionSender || '0x00000000000000000000000000000000',
            receiver: options.transactionReceiver || '0x00000000000000000000000000000000',
            amount: options.transactionAmount || 0,
            gasPrice: options.transactionGasPrice || 1,
            gasLimit: options.transactionGasLimit || 1000000,
            data: options.transactionData || '0x'
        };

        // Controlled randomness source (seed-based for determinism)
        this.random = new DeterministicRandom(options.seed || 0);
    }

    /**
     * Get current block context
     * @returns {Object} Block context
     */
    getBlockContext() {
        return { ...this.block };
    }

    /**
     * Get current transaction context
     * @returns {Object} Transaction context
     */
    getTransactionContext() {
        return { ...this.transaction };
    }

    /**
     * Get deterministic random number generator
     * @returns {DeterministicRandom} Random generator
     */
    getRandom() {
        return this.random;
    }

    /**
     * Create a snapshot of the current context
     * @returns {VMContext} Context snapshot
     */
    snapshot() {
        return new VMContext({
            blockIndex: this.block.index,
            blockTimestamp: this.block.timestamp,
            blockDifficulty: this.block.difficulty,
            blockGasLimit: this.block.gasLimit,
            blockCoinbase: this.block.coinbase,
            transactionId: this.transaction.id,
            transactionSender: this.transaction.sender,
            transactionReceiver: this.transaction.receiver,
            transactionAmount: this.transaction.amount,
            transactionGasPrice: this.transaction.gasPrice,
            transactionGasLimit: this.transaction.gasLimit,
            transactionData: this.transaction.data,
            seed: this.random.getSeed()
        });
    }

    /**
     * Validate context for determinism
     * @returns {Object} Validation result
     */
    validate() {
        const errors = [];

        // Check block context for valid values
        if (!Number.isInteger(this.block.index) || this.block.index < 0) {
            errors.push('Invalid block index');
        }

        if (!Number.isInteger(this.block.timestamp) || this.block.timestamp < 0) {
            errors.push('Invalid block timestamp');
        }

        if (typeof this.block.coinbase !== 'string' || !this.block.coinbase.startsWith('0x')) {
            errors.push('Invalid coinbase address');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

/**
 * Deterministic random number generator based on seed
 */
export class DeterministicRandom {
    /**
     * Create a new deterministic random generator
     * @param {number|string} seed - Seed value
     */
    constructor(seed) {
        this.seed = this._hashSeed(seed);
        this.state = this.seed;
    }

    /**
     * Hash seed to 32-bit integer
     * @param {number|string} seed - Seed value
     * @returns {number} 32-bit hash
     */
    _hashSeed(seed) {
        let strSeed = String(seed);
        let hash = 0;
        
        for (let i = 0; i < strSeed.length; i++) {
            const char = strSeed.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash);
    }

    /**
     * Get current seed
     * @returns {number} Seed value
     */
    getSeed() {
        return this.seed;
    }

    /**
     * Reset random generator to initial state
     */
    reset() {
        this.state = this.seed;
    }

    /**
     * Generate random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random integer
     */
    nextInt(min = 0, max = 100) {
        if (min > max) {
            [min, max] = [max, min];
        }

        this.state = (this.state * 1664525 + 1013904223) % 4294967296;
        const normalized = this.state / 4294967296;
        
        return Math.floor(normalized * (max - min + 1)) + min;
    }

    /**
     * Generate random floating-point number between 0 and 1
     * @returns {number} Random float
     */
    nextFloat() {
        this.state = (this.state * 1664525 + 1013904223) % 4294967296;
        return this.state / 4294967296;
    }

    /**
     * Generate random boolean
     * @returns {boolean} Random boolean
     */
    nextBoolean() {
        return this.nextInt(0, 1) === 1;
    }

    /**
     * Generate random hex string
     * @param {number} length - Length in bytes
     * @returns {string} Hex string
     */
    nextHex(length = 32) {
        let hex = '';
        for (let i = 0; i < length; i++) {
            hex += this.nextInt(0, 15).toString(16);
        }
        return hex;
    }
}

// Singleton instance for runtime
let globalVMContext = null;

/**
 * Initialize and get global VM context
 * @param {Object} options - Context options
 * @returns {VMContext} VM context instance
 */
export function getVMContext(options = {}) {
    if (!globalVMContext) {
        globalVMContext = new VMContext(options);
    }
    return globalVMContext;
}

/**
 * Reset global VM context
 * @param {Object} options - New context options
 */
export function resetVMContext(options = {}) {
    globalVMContext = new VMContext(options);
}
