import { sha256_hash } from '../crypto/hashing.js';

/**
 * Transaction receipt management
 */

export class TransactionReceipt {
    /**
     * Create a new TransactionReceipt instance
     * @param {Object} options - Receipt options
     */
    constructor(options = {}) {
        this.id = options.id || this.generateId();
        this.transactionId = options.transactionId || null;
        this.blockHash = options.blockHash || null;
        this.blockNumber = options.blockNumber || null;
        this.timestamp = options.timestamp || Date.now();
        this.status = options.status || 'pending'; // pending, successful, failed
        this.gasUsed = options.gasUsed || 0;
        this.gasPrice = options.gasPrice || 0;
        this.fee = options.fee || 0;
        this.logs = options.logs || [];
        this.contractAddress = options.contractAddress || null;
        this.root = options.root || null;
        this.cumulativeGasUsed = options.cumulativeGasUsed || 0;
        this.effectiveGasPrice = options.effectiveGasPrice || 0;
    }

    /**
     * Generate a unique receipt ID
     * @returns {string} Receipt ID
     */
    generateId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return sha256_hash(timestamp + random).slice(0, 32);
    }

    /**
     * Set transaction ID
     * @param {string} transactionId - Transaction ID
     */
    setTransactionId(transactionId) {
        this.transactionId = transactionId;
    }

    /**
     * Set block hash
     * @param {string} blockHash - Block hash
     */
    setBlockHash(blockHash) {
        this.blockHash = blockHash;
    }

    /**
     * Set block number
     * @param {number} blockNumber - Block number
     */
    setBlockNumber(blockNumber) {
        if (typeof blockNumber !== 'number' || blockNumber < 0) {
            throw new Error('Block number must be a non-negative integer');
        }
        this.blockNumber = blockNumber;
    }

    /**
     * Set receipt status
     * @param {string} status - Receipt status
     */
    setStatus(status) {
        const validStatuses = ['pending', 'successful', 'failed'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status: ${status}`);
        }
        this.status = status;
    }

    /**
     * Set gas used
     * @param {number} gasUsed - Gas used
     */
    setGasUsed(gasUsed) {
        if (typeof gasUsed !== 'number' || gasUsed < 0) {
            throw new Error('Gas used must be a non-negative number');
        }
        this.gasUsed = gasUsed;
    }

    /**
     * Set gas price
     * @param {number} gasPrice - Gas price
     */
    setGasPrice(gasPrice) {
        if (typeof gasPrice !== 'number' || gasPrice < 0) {
            throw new Error('Gas price must be a non-negative number');
        }
        this.gasPrice = gasPrice;
    }

    /**
     * Set transaction fee
     * @param {number} fee - Transaction fee
     */
    setFee(fee) {
        if (typeof fee !== 'number' || fee < 0) {
            throw new Error('Fee must be a non-negative number');
        }
        this.fee = fee;
    }

    /**
     * Add a log entry
     * @param {Object} log - Log entry
     */
    addLog(log) {
        this.logs.push(log);
    }

    /**
     * Add multiple log entries
     * @param {Array} logs - Log entries
     */
    addLogs(logs) {
        logs.forEach(log => this.addLog(log));
    }

    /**
     * Set contract address
     * @param {string} contractAddress - Contract address
     */
    setContractAddress(contractAddress) {
        this.contractAddress = contractAddress;
    }

    /**
     * Set root hash
     * @param {string} root - Root hash
     */
    setRoot(root) {
        this.root = root;
    }

    /**
     * Set cumulative gas used
     * @param {number} cumulativeGasUsed - Cumulative gas used
     */
    setCumulativeGasUsed(cumulativeGasUsed) {
        if (typeof cumulativeGasUsed !== 'number' || cumulativeGasUsed < 0) {
            throw new Error('Cumulative gas used must be a non-negative number');
        }
        this.cumulativeGasUsed = cumulativeGasUsed;
    }

    /**
     * Set effective gas price
     * @param {number} effectiveGasPrice - Effective gas price
     */
    setEffectiveGasPrice(effectiveGasPrice) {
        if (typeof effectiveGasPrice !== 'number' || effectiveGasPrice < 0) {
            throw new Error('Effective gas price must be a non-negative number');
        }
        this.effectiveGasPrice = effectiveGasPrice;
    }

    /**
     * Check if transaction was successful
     * @returns {boolean} True if successful
     */
    isSuccessful() {
        return this.status === 'successful';
    }

    /**
     * Check if transaction failed
     * @returns {boolean} True if failed
     */
    isFailed() {
        return this.status === 'failed';
    }

    /**
     * Check if transaction is pending
     * @returns {boolean} True if pending
     */
    isPending() {
        return this.status === 'pending';
    }

    /**
     * Convert receipt to JSON object
     * @returns {Object} Receipt as JSON
     */
    toJSON() {
        return {
            id: this.id,
            transactionId: this.transactionId,
            blockHash: this.blockHash,
            blockNumber: this.blockNumber,
            timestamp: this.timestamp,
            status: this.status,
            gasUsed: this.gasUsed,
            gasPrice: this.gasPrice,
            fee: this.fee,
            logs: this.logs,
            contractAddress: this.contractAddress,
            root: this.root,
            cumulativeGasUsed: this.cumulativeGasUsed,
            effectiveGasPrice: this.effectiveGasPrice
        };
    }

    /**
     * Create receipt from JSON object
     * @param {Object} data - Receipt data
     * @returns {TransactionReceipt} Receipt instance
     */
    static fromJSON(data) {
        return new TransactionReceipt({
            id: data.id,
            transactionId: data.transactionId,
            blockHash: data.blockHash,
            blockNumber: data.blockNumber,
            timestamp: data.timestamp,
            status: data.status,
            gasUsed: data.gasUsed,
            gasPrice: data.gasPrice,
            fee: data.fee,
            logs: data.logs || [],
            contractAddress: data.contractAddress,
            root: data.root,
            cumulativeGasUsed: data.cumulativeGasUsed,
            effectiveGasPrice: data.effectiveGasPrice
        });
    }

    /**
     * Validate receipt
     * @returns {Object} Validation result
     */
    validate() {
        const errors = [];

        if (!this.transactionId || typeof this.transactionId !== 'string') {
            errors.push('Invalid transaction ID');
        }

        if (this.blockNumber !== null && (typeof this.blockNumber !== 'number' || this.blockNumber < 0)) {
            errors.push('Invalid block number');
        }

        if (typeof this.gasUsed !== 'number' || this.gasUsed < 0) {
            errors.push('Invalid gas used');
        }

        if (typeof this.gasPrice !== 'number' || this.gasPrice < 0) {
            errors.push('Invalid gas price');
        }

        if (typeof this.fee !== 'number' || this.fee < 0) {
            errors.push('Invalid fee');
        }

        if (!this.timestamp || isNaN(this.timestamp)) {
            errors.push('Invalid timestamp');
        }

        const isValid = errors.length === 0;

        return {
            isValid,
            errors,
            message: isValid ? 'Receipt is valid' : `Receipt validation failed: ${errors.join(', ')}`
        };
    }

    /**
     * Check if receipt is valid
     * @returns {boolean} True if valid
     */
    isValid() {
        return this.validate().isValid;
    }
}

/**
 * Create a new transaction receipt
 * @param {Object} options - Receipt options
 * @returns {TransactionReceipt} New receipt instance
 */
export function create_transaction_receipt(options = {}) {
    return new TransactionReceipt(options);
}

/**
 * Create multiple transaction receipts
 * @param {Array} receiptData - Array of receipt data
 * @returns {TransactionReceipt[]} Array of receipt instances
 */
export function create_transaction_receipts(receiptData) {
    return receiptData.map(data => new TransactionReceipt(data));
}

/**
 * Validate multiple transaction receipts
 * @param {TransactionReceipt[]} receipts - Receipts to validate
 * @returns {Object} Validation results
 */
export function validate_transaction_receipts(receipts) {
    const results = [];
    const invalidReceipts = [];

    receipts.forEach(receipt => {
        const validation = receipt.validate();
        results.push(validation);
        if (!validation.isValid) {
            invalidReceipts.push(receipt);
        }
    });

    return {
        valid: receipts.length - invalidReceipts.length,
        invalid: invalidReceipts.length,
        invalidReceipts,
        allValid: invalidReceipts.length === 0
    };
}
