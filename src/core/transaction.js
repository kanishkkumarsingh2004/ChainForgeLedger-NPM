import { sha256_hash } from '../crypto/hashing.js';

/**
 * Transaction management
 */

export class Transaction {
    /**
     * Create a new Transaction instance
     * @param {Object} options - Transaction options
     */
    constructor(options = {}) {
        this.id = options.id || this.generateId();
        this.sender = options.sender || null;
        this.receiver = options.receiver || null;
        this.amount = options.amount || 0;
        this.timestamp = options.timestamp || Date.now();
        this.fee = options.fee || 0.001;
        this.signature = options.signature || null;
        this.data = options.data || null;
        this.status = options.status || 'pending'; // pending, confirmed, failed
    }

    /**
     * Generate a unique transaction ID
     * @returns {string} Transaction ID
     */
    generateId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return sha256_hash(timestamp + random).slice(0, 32);
    }

    /**
     * Set transaction sender
     * @param {string} sender - Sender address
     */
    setSender(sender) {
        this.sender = sender;
    }

    /**
     * Set transaction receiver
     * @param {string} receiver - Receiver address
     */
    setReceiver(receiver) {
        this.receiver = receiver;
    }

    /**
     * Set transaction amount
     * @param {number} amount - Transaction amount
     */
    setAmount(amount) {
        if (typeof amount !== 'number' || amount <= 0) {
            throw new Error('Amount must be a positive number');
        }
        this.amount = amount;
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
     * Set transaction data
     * @param {*} data - Additional transaction data
     */
    setData(data) {
        this.data = data;
    }

    /**
     * Set transaction signature
     * @param {string} signature - Digital signature
     */
    setSignature(signature) {
        this.signature = signature;
    }

    /**
     * Set transaction status
     * @param {string} status - Transaction status
     */
    setStatus(status) {
        const validStatuses = ['pending', 'confirmed', 'failed'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status: ${status}`);
        }
        this.status = status;
    }

    /**
     * Convert transaction to JSON object
     * @returns {Object} Transaction as JSON
     */
    toJSON() {
        return {
            id: this.id,
            sender: this.sender,
            receiver: this.receiver,
            amount: this.amount,
            timestamp: this.timestamp,
            fee: this.fee,
            signature: this.signature,
            data: this.data,
            status: this.status
        };
    }

    /**
     * Create transaction from JSON object
     * @param {Object} data - Transaction data
     * @returns {Transaction} Transaction instance
     */
    static fromJSON(data) {
        return new Transaction({
            id: data.id,
            sender: data.sender,
            receiver: data.receiver,
            amount: data.amount,
            timestamp: data.timestamp,
            fee: data.fee,
            signature: data.signature,
            data: data.data,
            status: data.status
        });
    }

    /**
     * Validate transaction
     * @returns {Object} Validation result
     */
    validate() {
        const errors = [];

        if (!this.sender || typeof this.sender !== 'string') {
            errors.push('Invalid sender address');
        }

        if (!this.receiver || typeof this.receiver !== 'string') {
            errors.push('Invalid receiver address');
        }

        if (typeof this.amount !== 'number' || this.amount <= 0) {
            errors.push('Invalid amount');
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
            message: isValid ? 'Transaction is valid' : `Transaction validation failed: ${errors.join(', ')}`
        };
    }

    /**
     * Check if transaction is valid
     * @returns {boolean} True if valid
     */
    isValid() {
        return this.validate().isValid;
    }

    /**
     * Calculate transaction hash
     * @returns {string} Transaction hash
     */
    calculateHash() {
        const transactionData = JSON.stringify({
            id: this.id,
            sender: this.sender,
            receiver: this.receiver,
            amount: this.amount,
            timestamp: this.timestamp,
            fee: this.fee
        });
        return sha256_hash(transactionData);
    }

    /**
     * Check if transaction is confirmed
     * @returns {boolean} True if confirmed
     */
    isConfirmed() {
        return this.status === 'confirmed';
    }

    /**
     * Check if transaction is pending
     * @returns {boolean} True if pending
     */
    isPending() {
        return this.status === 'pending';
    }

    /**
     * Check if transaction has failed
     * @returns {boolean} True if failed
     */
    isFailed() {
        return this.status === 'failed';
    }

    /**
     * Get transaction size in bytes
     * @returns {number} Transaction size
     */
    getSize() {
        return JSON.stringify(this.toJSON()).length;
    }
}

/**
 * Create a new transaction
 * @param {Object} options - Transaction options
 * @returns {Transaction} New transaction instance
 */
export function create_transaction(options = {}) {
    return new Transaction(options);
}

/**
 * Create multiple transactions
 * @param {Array} transactionData - Array of transaction data
 * @returns {Transaction[]} Array of transaction instances
 */
export function create_transactions(transactionData) {
    return transactionData.map(data => new Transaction(data));
}

/**
 * Validate multiple transactions
 * @param {Transaction[]} transactions - Transactions to validate
 * @returns {Object} Validation results
 */
export function validate_transactions(transactions) {
    const results = [];
    const invalidTransactions = [];

    transactions.forEach(transaction => {
        const validation = transaction.validate();
        results.push(validation);
        if (!validation.isValid) {
            invalidTransactions.push(transaction);
        }
    });

    return {
        valid: transactions.length - invalidTransactions.length,
        invalid: invalidTransactions.length,
        invalidTransactions,
        allValid: invalidTransactions.length === 0
    };
}

/**
 * Calculate total value of transactions
 * @param {Transaction[]} transactions - Transactions to sum
 * @param {Object} options - Calculation options
 * @returns {number} Total value
 */
export function calculate_transaction_total(transactions, options = {}) {
    const { includeFees = false } = options;

    return transactions.reduce((total, tx) => {
        let value = tx.amount;
        if (includeFees) {
            value += tx.fee;
        }
        return total + value;
    }, 0);
}
