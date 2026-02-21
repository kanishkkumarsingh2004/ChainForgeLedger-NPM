/**
 * Blockchain state management
 */

export class State {
    /**
     * Create a new State instance
     * @param {Object} initialState - Initial state
     */
    constructor(initialState = {}) {
        this.state = { ...initialState };
        this.history = [];
        this.blockHeight = 0;
        this.lastUpdated = Date.now();
    }

    /**
     * Get a value from state
     * @param {string} key - State key
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} Value from state
     */
    get(key, defaultValue = null) {
        return this.state[key] !== undefined ? this.state[key] : defaultValue;
    }

    /**
     * Set a value in state
     * @param {string} key - State key
     * @param {*} value - Value to set
     */
    set(key, value) {
        this.state[key] = value;
        this.lastUpdated = Date.now();
    }

    /**
     * Delete a value from state
     * @param {string} key - State key
     */
    delete(key) {
        delete this.state[key];
        this.lastUpdated = Date.now();
    }

    /**
     * Check if key exists in state
     * @param {string} key - State key
     * @returns {boolean} True if key exists
     */
    has(key) {
        return key in this.state;
    }

    /**
     * Get all keys in state
     * @returns {Array} Array of keys
     */
    keys() {
        return Object.keys(this.state);
    }

    /**
     * Get all values in state
     * @returns {Array} Array of values
     */
    values() {
        return Object.values(this.state);
    }

    /**
     * Get all entries in state
     * @returns {Array} Array of [key, value] pairs
     */
    entries() {
        return Object.entries(this.state);
    }

    /**
     * Get the entire state
     * @returns {Object} Current state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Set the entire state
     * @param {Object} newState - New state
     */
    setState(newState) {
        this.state = { ...newState };
        this.lastUpdated = Date.now();
    }

    /**
     * Clear the state
     */
    clear() {
        this.state = {};
        this.lastUpdated = Date.now();
    }

    /**
     * Update state from transactions
     * @param {Array} transactions - Transactions to apply
     */
    applyTransactions(transactions) {
        transactions.forEach(transaction => {
            // Update balances based on transaction
            if (transaction.sender && transaction.receiver && transaction.amount > 0) {
                // Deduct from sender
                const senderBalance = this.get(`balance:${transaction.sender}`, 0);
                if (senderBalance >= transaction.amount) {
                    this.set(`balance:${transaction.sender}`, senderBalance - transaction.amount);
                    
                    // Add to receiver
                    const receiverBalance = this.get(`balance:${transaction.receiver}`, 0);
                    this.set(`balance:${transaction.receiver}`, receiverBalance + transaction.amount);

                    // Record transaction
                    this.recordTransaction(transaction);
                }
            }
        });
    }

    /**
     * Record a transaction in state history
     * @param {Object} transaction - Transaction to record
     */
    recordTransaction(transaction) {
        const existingTransactions = this.get('transactions', []);
        this.set('transactions', [...existingTransactions, transaction]);
    }

    /**
     * Get transaction history
     * @param {Object} options - Filter options
     * @returns {Array} Transaction history
     */
    getTransactions(options = {}) {
        const { limit = 100, offset = 0, sender = null, receiver = null } = options;
        let transactions = this.get('transactions', []);

        if (sender) {
            transactions = transactions.filter(tx => tx.sender === sender);
        }

        if (receiver) {
            transactions = transactions.filter(tx => tx.receiver === receiver);
        }

        return transactions.slice(offset, offset + limit);
    }

    /**
     * Get balance for an address
     * @param {string} address - Address to check
     * @returns {number} Balance
     */
    getBalance(address) {
        return this.get(`balance:${address}`, 0);
    }

    /**
     * Set balance for an address
     * @param {string} address - Address to update
     * @param {number} balance - New balance
     */
    setBalance(address, balance) {
        if (typeof balance !== 'number' || balance < 0) {
            throw new Error('Balance must be a non-negative number');
        }
        this.set(`balance:${address}`, balance);
    }

    /**
     * Check if address has sufficient balance
     * @param {string} address - Address to check
     * @param {number} amount - Amount to check
     * @returns {boolean} True if balance is sufficient
     */
    hasSufficientBalance(address, amount) {
        const balance = this.getBalance(address);
        return balance >= amount;
    }

    /**
     * Update state with block data
     * @param {Object} block - Block to apply
     */
    applyBlock(block) {
        this.applyTransactions(block.transactions);
        this.blockHeight = block.index;
        this.lastUpdated = Date.now();
    }

    /**
     * Get state statistics
     * @returns {Object} State statistics
     */
    getStatistics() {
        const totalAddresses = Object.keys(this.state)
            .filter(key => key.startsWith('balance:'))
            .length;

        const totalTransactions = this.get('transactions', []).length;

        const totalSupply = Object.values(this.state)
            .filter((value, index, array) => index < Object.keys(this.state).filter(key => key.startsWith('balance:')).length)
            .reduce((sum, balance) => sum + (typeof balance === 'number' ? balance : 0), 0);

        return {
            totalAddresses,
            totalTransactions,
            totalSupply,
            blockHeight: this.blockHeight,
            lastUpdated: this.lastUpdated,
            stateSize: Object.keys(this.state).length
        };
    }

    /**
     * Get state history
     * @returns {Array} State history
     */
    getHistory() {
        return this.history;
    }

    /**
     * Save state to history
     */
    saveHistory() {
        this.history.push({
            blockHeight: this.blockHeight,
            timestamp: Date.now(),
            state: this.getState()
        });
    }

    /**
     * Revert state to previous block height
     * @param {number} targetHeight - Target block height to revert to
     * @returns {boolean} True if reversion was successful
     */
    revertToBlockHeight(targetHeight) {
        if (targetHeight < 0 || targetHeight > this.blockHeight) {
            return false;
        }

        // Find the state snapshot for the target height
        const stateSnapshot = this.history.find(snapshot => snapshot.blockHeight === targetHeight);
        if (stateSnapshot) {
            this.state = stateSnapshot.state;
            this.blockHeight = targetHeight;
            this.lastUpdated = Date.now();
            return true;
        }

        return false;
    }

    /**
     * Validate state consistency
     * @returns {Object} Validation result
     */
    validate() {
        const errors = [];

        // Check that all balances are non-negative
        Object.keys(this.state)
            .filter(key => key.startsWith('balance:'))
            .forEach(key => {
                const balance = this.state[key];
                if (typeof balance !== 'number' || balance < 0) {
                    errors.push(`Invalid balance for ${key}: ${balance}`);
                }
            });

        // Check transactions for validity
        const transactions = this.get('transactions', []);
        transactions.forEach((tx, index) => {
            if (!tx.id || !tx.sender || !tx.receiver || tx.amount <= 0) {
                errors.push(`Invalid transaction at index ${index}`);
            }
        });

        const isValid = errors.length === 0;

        return {
            isValid,
            errors,
            message: isValid ? 'State is valid' : `State validation failed: ${errors.join(', ')}`
        };
    }

    /**
     * Check if state is valid
     * @returns {boolean} True if state is valid
     */
    isValid() {
        return this.validate().isValid;
    }

    /**
     * Convert state to JSON
     * @returns {Object} State as JSON
     */
    toJSON() {
        return {
            state: this.getState(),
            blockHeight: this.blockHeight,
            lastUpdated: this.lastUpdated,
            history: this.history
        };
    }

    /**
     * Create state from JSON
     * @param {Object} data - State data
     * @returns {State} State instance
     */
    static fromJSON(data) {
        const state = new State(data.state);
        state.blockHeight = data.blockHeight;
        state.lastUpdated = data.lastUpdated;
        state.history = data.history || [];
        return state;
    }
}

/**
 * Create a new state instance
 * @param {Object} initialState - Initial state
 * @returns {State} New state instance
 */
export function create_state(initialState = {}) {
    return new State(initialState);
}
