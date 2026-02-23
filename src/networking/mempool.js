/**
 * ChainForgeLedger Mempool Module
 * 
 * Implements transaction mempool functionality.
 */

export class TransactionPool {
    /**
     * Create a new transaction pool instance.
     * @param {object} options - Mempool configuration
     */
    constructor(options = {}) {
        this.transactions = new Map();
        this.transaction_map = new Map();
        this.transaction_counter = 0;
        this.max_transaction_size = options.max_transaction_size || 10240;
        this.max_transaction_fee = options.max_transaction_fee || 10000;
        this.transaction_size_limit = options.transaction_size_limit || 5120;
        this.max_valid_transactions = options.max_valid_transactions || 5000;
        this.transaction_fees = new Map();
        this.transaction_fee_threshold = options.transaction_fee_threshold || 1000;
        this.transaction_lifetime = options.transaction_lifetime || 24 * 60 * 60; // 24 hours
        this.transaction_count = 0;
        this.valid_transactions = new Map();
        this.transaction_fee_claims = new Map();
        this.transaction_pool_stats = {
            transaction_count: 0,
            valid_transactions: 0,
            invalid_transactions: 0,
            average_fee_per_gas: 0,
            total_transaction_fee: 0,
            last_clearing_time: null,
            transaction_lifetime: options.transaction_lifetime || 24 * 60 * 60
        };
        this.transaction_cache = new Map();
        this.pending_fee_claims = new Map();
    }

    /**
     * Initialize transaction pool with initial transactions.
     * @param {Array} initial_transactions - Initial transactions to add
     */
    initialize(initial_transactions = []) {
        initial_transactions.forEach(tx => this.add_transaction(tx));
    }

    /**
     * Add a transaction to the pool.
     * @param {object} transaction - Transaction object
     * @param {number} block_number - Block number
     * @param {number} timestamp - Timestamp
     */
    add_transaction(transaction, block_number = 0, timestamp = Date.now() / 1000) {
        const transaction_id = this._get_transaction_id(transaction);
        
        if (this.transactions.has(transaction_id)) {
            return false;
        }

        transaction.block_number = block_number;
        transaction.timestamp = timestamp;
        
        this.transactions.set(transaction_id, transaction);
        this.transaction_map.set(transaction.id, transaction);
        this.transaction_counter++;
        this.transaction_count++;

        this._update_stats('add');
        return true;
    }

    /**
     * Get transaction ID.
     * @private
     */
    _get_transaction_id(transaction) {
        return transaction.id || `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get transaction by ID.
     * @param {string} transaction_id - Transaction ID
     * @returns {object} Transaction
     */
    get_transaction(transaction_id) {
        return this.transactions.get(transaction_id) || 
               this.transaction_map.get(transaction_id) ||
               null;
    }

    /**
     * Get all transactions.
     * @returns {Array} List of transactions
     */
    get_all_transactions() {
        return Array.from(this.transactions.values());
    }

    /**
     * Remove a transaction from the pool.
     * @param {string} transaction_id - Transaction ID
     */
    remove_transaction(transaction_id) {
        const transaction = this.get_transaction(transaction_id);
        
        if (transaction) {
            this.transactions.delete(transaction_id);
            this.transaction_map.delete(transaction.id);
            this.transaction_fees.delete(transaction_id);
            this.transaction_count--;

            this._update_stats('remove');
        }
    }

    /**
     * Update pool statistics.
     * @private
     */
    _update_stats(action) {
        this.transaction_pool_stats.transaction_count = this.transaction_count;
        
        if (action === 'add') {
            this.transaction_pool_stats.average_fee_per_gas = 
                this.transaction_fees.size > 0 
                    ? Array.from(this.transaction_fees.values()).reduce((sum, fee) => sum + fee, 0) / this.transaction_fees.size 
                    : 0;
            this.transaction_pool_stats.total_transaction_fee = 
                Array.from(this.transaction_fees.values()).reduce((sum, fee) => sum + fee, 0);
        }
    }

    /**
     * Remove expired transactions from the pool.
     * @param {number} current_block_number - Current block number
     * @param {number} current_timestamp - Current timestamp
     */
    remove_expired_transactions(current_block_number, current_timestamp) {
        const transactions_to_remove = [];
        
        Array.from(this.transactions.entries()).forEach(([tx_id, tx]) => {
            if (current_timestamp - tx.timestamp > this.transaction_lifetime) {
                transactions_to_remove.push(tx_id);
            }
        });

        transactions_to_remove.forEach(tx_id => {
            const transaction = this.transactions.get(tx_id);
            
            if (transaction) {
                this.transaction_fee_claims.set(tx_id, {
                    transaction_id: tx_id,
                    amount: transaction.fee,
                    timestamp: current_timestamp
                });
                
                this.remove_transaction(tx_id);
            }
        });
    }

    /**
     * Clear transaction cache.
     */
    clear_transaction_cache() {
        this.transaction_cache.clear();
    }

    /**
     * Handle transaction fee claims.
     * @param {string} transaction_id - Transaction ID
     * @param {string} sender - Sender address
     * @param {string} receiver - Receiver address
     * @param {number} amount - Fee amount
     */
    handle_fee_claim(transaction_id, sender, receiver, amount) {
        this.transaction_fee_claims.set(transaction_id, {
            transaction_id,
            sender,
            receiver,
            amount,
            timestamp: Date.now() / 1000
        });
    }

    /**
     * Get transaction count.
     * @returns {number} Transaction count
     */
    get_transaction_count() {
        return this.transaction_count;
    }

    /**
     * Calculate total transaction fee.
     * @returns {number} Total transaction fee
     */
    get_total_transaction_fee() {
        return Array.from(this.transaction_fees.values()).reduce((sum, fee) => sum + fee, 0);
    }

    /**
     * Get statistics.
     * @returns {object} Statistics
     */
    get_statistics() {
        return {
            transaction_count: this.transaction_count,
            valid_transactions: this.transaction_pool_stats.valid_transactions,
            invalid_transactions: this.transaction_pool_stats.invalid_transactions,
            total_transaction_fee: this.get_total_transaction_fee(),
            average_fee_per_gas: this.transaction_pool_stats.average_fee_per_gas,
            last_clearing_time: this.transaction_pool_stats.last_clearing_time,
            transaction_lifetime: this.transaction_pool_stats.transaction_lifetime
        };
    }

    /**
     * Get valid transactions.
     * @returns {Array} List of valid transactions
     */
    get_valid_transactions() {
        return this.valid_transactions.size > 0 
            ? Array.from(this.valid_transactions.values()) 
            : this.get_all_transactions();
    }

    /**
     * Check if transaction exists.
     * @param {string} transaction_id - Transaction ID
     * @returns {boolean} Whether transaction exists
     */
    has_transaction(transaction_id) {
        return this.transactions.has(transaction_id) || 
               this.transaction_map.has(transaction_id);
    }

    /**
     * Clear all transactions.
     */
    clear() {
        this.transactions.clear();
        this.transaction_map.clear();
        this.transaction_fees.clear();
        this.transaction_cache.clear();
        this.transaction_fee_claims.clear();
        this.transaction_count = 0;
        this.transaction_pool_stats.transaction_count = 0;
        this.transaction_pool_stats.total_transaction_fee = 0;
        this.transaction_pool_stats.average_fee_per_gas = 0;
        this.transaction_pool_stats.last_clearing_time = Date.now() / 1000;
    }

    /**
     * Get transactions between two blocks.
     * @param {number} start_block - Start block number
     * @param {number} end_block - End block number
     * @returns {Array} List of transactions
     */
    get_transactions_between_blocks(start_block, end_block) {
        return Array.from(this.transactions.values())
            .filter(tx => tx.block_number >= start_block && tx.block_number <= end_block);
    }

    /**
     * Get transaction history for an address.
     * @param {string} address - Address
     * @returns {Array} List of transactions
     */
    get_transaction_history(address) {
        return Array.from(this.transactions.values())
            .filter(tx => tx.sender === address || tx.receiver === address);
    }

    /**
     * Get transaction with max gas.
     * @returns {object} Transaction with max gas
     */
    get_transaction_with_max_gas() {
        if (this.transaction_count === 0) {
            return null;
        }

        let max_gas = -1;
        let selected_transaction = null;

        Array.from(this.transactions.values()).forEach(tx => {
            if (tx.gas > max_gas) {
                max_gas = tx.gas;
                selected_transaction = tx;
            }
        });

        return selected_transaction;
    }

    /**
     * Clear expired pending fee claims.
     * @param {number} current_timestamp - Current timestamp
     * @param {number} expiration_time - Expiration time in seconds
     */
    clear_expired_claims(current_timestamp, expiration_time = 24 * 60 * 60) {
        for (let [tx_id, claim] of this.pending_fee_claims.entries()) {
            if (current_timestamp - claim.timestamp > expiration_time) {
                this.pending_fee_claims.delete(tx_id);
            }
        }
    }
}

export class TransactionPoolManager {
    /**
     * Create a new transaction pool manager instance.
     */
    constructor() {
        this.transaction_pool = new TransactionPool();
    }

    /**
     * Add a transaction to the pool.
     * @param {object} transaction - Transaction to add
     * @param {number} block_number - Block number
     */
    addTransaction(transaction, block_number = 0) {
        return this.transaction_pool.add_transaction(transaction, block_number);
    }

    add_transaction(transaction, block_number = 0) {
        return this.addTransaction(transaction, block_number);
    }

    /**
     * Remove a transaction from the pool.
     * @param {string} transaction_id - Transaction ID
     */
    remove_transaction(transaction_id) {
        this.transaction_pool.remove_transaction(transaction_id);
    }

    /**
     * Get transaction by ID.
     * @param {string} transaction_id - Transaction ID
     * @returns {object} Transaction
     */
    get_transaction(transaction_id) {
        return this.transaction_pool.get_transaction(transaction_id);
    }

    /**
     * Get all transactions.
     * @returns {Array} List of transactions
     */
    get_all_transactions() {
        return this.transaction_pool.get_all_transactions();
    }

    /**
     * Handle transaction fee claim.
     * @param {string} transaction_id - Transaction ID
     * @param {string} sender - Sender address
     * @param {string} receiver - Receiver address
     * @param {number} amount - Fee amount
     */
    handle_transaction_fee_claim(transaction_id, sender, receiver, amount) {
        this.transaction_pool.handle_fee_claim(transaction_id, sender, receiver, amount);
    }

    /**
     * Get transaction history for an address.
     * @param {string} address - Address
     * @returns {Array} List of transactions
     */
    get_transaction_history(address) {
        return this.transaction_pool.get_transaction_history(address);
    }

    /**
     * Get transaction pool statistics.
     * @returns {object} Statistics
     */
    get_transaction_pool_statistics() {
        return this.transaction_pool.get_statistics();
    }

    /**
     * Clear all transactions.
     */
    clear_transaction_pool() {
        this.transaction_pool.clear();
    }

    /**
     * Clear transaction cache.
     */
    clear_transaction_cache() {
        this.transaction_pool.clear_transaction_cache();
    }

    /**
     * Get valid transactions.
     * @returns {Array} List of valid transactions
     */
    getPendingTransactions() {
        return this.transaction_pool.get_valid_transactions();
    }

    get_valid_transactions() {
        return this.getPendingTransactions();
    }
}
