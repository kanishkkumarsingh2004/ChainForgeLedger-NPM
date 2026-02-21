/**
 * ChainForgeLedger Multisig Module
 * 
 * Implements multi-signature wallet functionality.
 */

export class MultisigWallet {
    /**
     * Create a new multisig wallet instance.
     * @param {Array} public_keys - Array of public keys
     * @param {number} required - Number of signatures required
     */
    constructor(public_keys = [], required = 2) {
        this.public_keys = public_keys;
        this.required = required;
        this.signatures = new Map();
        this.balance = 0;
        this.pending_transactions = new Map();
        this.completed_transactions = [];
        this.created_at = Date.now() / 1000;
        this.updated_at = Date.now() / 1000;
        this.transaction_counter = 0;
        this.min_signatures = required;
        this.address = this._generate_address();
    }

    /**
     * Generate wallet address from public keys.
     * @private
     */
    _generate_address() {
        const keys_hash = this.public_keys
            .map(key => key.slice(0, 8))
            .sort()
            .join('_');
        return `msig_${keys_hash}`;
    }

    /**
     * Add a public key to the wallet.
     * @param {string} public_key - Public key to add
     */
    add_public_key(public_key) {
        if (!this.public_keys.includes(public_key)) {
            this.public_keys.push(public_key);
            this.address = this._generate_address();
            this.updated_at = Date.now() / 1000;
        }
    }

    /**
     * Remove a public key from the wallet.
     * @param {string} public_key - Public key to remove
     */
    remove_public_key(public_key) {
        const index = this.public_keys.indexOf(public_key);
        if (index !== -1) {
            this.public_keys.splice(index, 1);
            this.address = this._generate_address();
            this.updated_at = Date.now() / 1000;
        }
    }

    /**
     * Set the required number of signatures.
     * @param {number} required - Number of signatures required
     */
    set_required_signatures(required) {
        if (required < 1 || required > this.public_keys.length) {
            throw new Error(`Number of required signatures must be between 1 and ${this.public_keys.length}`);
        }
        this.required = required;
        this.updated_at = Date.now() / 1000;
    }

    /**
     * Create a new pending transaction.
     * @param {string} recipient_address - Recipient address
     * @param {number} amount - Amount to transfer
     * @param {string} transaction_data - Transaction data
     * @param {string} fee - Transaction fee
     * @param {string} asset_type - Asset type
     * @returns {string} Transaction ID
     */
    create_transaction(recipient_address, amount, transaction_data, fee, asset_type) {
        const transaction_id = `tx_${++this.transaction_counter}`;
        
        this.pending_transactions.set(transaction_id, {
            id: transaction_id,
            sender_address: this.address,
            recipient_address,
            amount,
            data: transaction_data,
            fee,
            asset_type,
            created_at: Date.now() / 1000,
            signatures: new Map(),
            confirmed: false,
            executed: false,
            block_number: null
        });

        this.updated_at = Date.now() / 1000;
        return transaction_id;
    }

    /**
     * Sign a transaction with a private key.
     * @param {string} transaction_id - Transaction ID
     * @param {string} signature - Signature
     * @param {string} signer_address - Signer address (public key)
     */
    sign_transaction(transaction_id, signature, signer_address) {
        const transaction = this.pending_transactions.get(transaction_id);
        
        if (!transaction) {
            throw new Error(`Transaction ${transaction_id} not found`);
        }

        if (!this.public_keys.includes(signer_address)) {
            throw new Error(`Signer ${signer_address} not authorized`);
        }

        transaction.signatures.set(signer_address, signature);
        this.updated_at = Date.now() / 1000;

        this._check_transaction_confirmation(transaction);
    }

    /**
     * Check if transaction has enough signatures.
     * @param {object} transaction - Transaction object
     * @private
     */
    _check_transaction_confirmation(transaction) {
        if (transaction.confirmed) {
            return;
        }

        if (transaction.signatures.size >= this.required) {
            transaction.confirmed = true;
            transaction.updated_at = Date.now() / 1000;
        }
    }

    /**
     * Add multiple signatures to a transaction.
     * @param {string} transaction_id - Transaction ID
     * @param {Array} signatures - Array of signature objects
     */
    add_multiple_signatures(transaction_id, signatures) {
        const transaction = this.pending_transactions.get(transaction_id);
        
        if (!transaction) {
            throw new Error(`Transaction ${transaction_id} not found`);
        }

        signatures.forEach(({ signature, signer_address }) => {
            if (this.public_keys.includes(signer_address)) {
                transaction.signatures.set(signer_address, signature);
            }
        });

        this.updated_at = Date.now() / 1000;
        this._check_transaction_confirmation(transaction);
    }

    /**
     * Check if a transaction has all required signatures.
     * @param {string} transaction_id - Transaction ID
     * @returns {boolean} Whether transaction is confirmed
     */
    is_transaction_confirmed(transaction_id) {
        const transaction = this.pending_transactions.get(transaction_id);
        
        if (!transaction) {
            return false;
        }

        return transaction.confirmed && transaction.signatures.size >= this.required;
    }

    /**
     * Get transaction by ID.
     * @param {string} transaction_id - Transaction ID
     * @returns {object|null} Transaction object
     */
    get_transaction(transaction_id) {
        const pending = this.pending_transactions.get(transaction_id);
        if (pending) {
            return pending;
        }

        return this.completed_transactions.find(tx => tx.id === transaction_id) || null;
    }

    /**
     * Get all pending transactions.
     * @returns {Array} List of pending transactions
     */
    get_pending_transactions() {
        return Array.from(this.pending_transactions.values());
    }

    /**
     * Get all completed transactions.
     * @returns {Array} List of completed transactions
     */
    get_completed_transactions() {
        return [...this.completed_transactions];
    }

    /**
     * Get transactions by asset type.
     * @param {string} asset_type - Asset type to filter by
     * @returns {Array} Filtered transactions
     */
    get_transactions_by_asset(asset_type) {
        const pending = Array.from(this.pending_transactions.values())
            .filter(tx => tx.asset_type === asset_type);
        
        const completed = this.completed_transactions.filter(tx => tx.asset_type === asset_type);
        
        return [...pending, ...completed];
    }

    /**
     * Execute confirmed transaction.
     * @param {string} transaction_id - Transaction ID
     * @returns {object} Execution result
     */
    execute_transaction(transaction_id) {
        const transaction = this.pending_transactions.get(transaction_id);
        
        if (!transaction) {
            throw new Error(`Transaction ${transaction_id} not found`);
        }

        if (!this.is_transaction_confirmed(transaction_id)) {
            throw new Error(`Transaction ${transaction_id} not confirmed`);
        }

        if (transaction.executed) {
            throw new Error(`Transaction ${transaction_id} already executed`);
        }

        transaction.executed = true;
        transaction.updated_at = Date.now() / 1000;
        transaction.block_number = 0;

        this.pending_transactions.delete(transaction_id);
        this.completed_transactions.push(transaction);

        return transaction;
    }

    /**
     * Verify transaction signatures.
     * @param {string} transaction_id - Transaction ID
     * @returns {object} Verification result
     */
    verify_transaction_signatures(transaction_id) {
        const transaction = this.get_transaction(transaction_id);
        
        if (!transaction) {
            return { valid: false, reason: 'Transaction not found' };
        }

        const valid_signers = transaction.signatures.keys().filter(signer => 
            this.public_keys.includes(signer)
        );

        if (valid_signers.length < this.required) {
            return {
                valid: false,
                reason: `Only ${valid_signers.length} out of ${this.required} signatures present`
            };
        }

        return {
            valid: true,
            signatures: valid_signers.length,
            required: this.required,
            details: Array.from(transaction.signatures.keys())
        };
    }

    /**
     * Set wallet balance.
     * @param {number} amount - New balance
     */
    set_balance(amount) {
        this.balance = amount;
        this.updated_at = Date.now() / 1000;
    }

    /**
     * Get wallet statistics.
     * @returns {object} Wallet statistics
     */
    get_statistics() {
        const pending = Array.from(this.pending_transactions.values());
        const completed = this.completed_transactions;
        
        const pending_with_sufficient_signatures = pending.filter(
            tx => tx.signatures.size >= this.required && tx.confirmed
        );

        const pending_transaction_count = pending.length;
        const completed_transaction_count = completed.length;
        const average_signatures = pending.length > 0 
            ? pending.reduce((sum, tx) => sum + tx.signatures.size, 0) / pending.length 
            : 0;

        return {
            total_signers: this.public_keys.length,
            required_signatures: this.required,
            pending_transactions: pending_transaction_count,
            completed_transactions: completed_transaction_count,
            pending_with_sufficient_signatures: pending_with_sufficient_signatures.length,
            average_signatures_per_transaction: average_signatures,
            balance: this.balance,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }

    /**
     * Check if a signer is authorized for this wallet.
     * @param {string} signer_address - Signer address
     * @returns {boolean} Whether signer is authorized
     */
    is_authorized_signer(signer_address) {
        return this.public_keys.includes(signer_address);
    }

    /**
     * Get signers who have signed a transaction.
     * @param {string} transaction_id - Transaction ID
     * @returns {Array} Array of signer addresses
     */
    get_transaction_signers(transaction_id) {
        const transaction = this.get_transaction(transaction_id);
        return transaction ? Array.from(transaction.signatures.keys()) : [];
    }

    /**
     * Get required signatures for a transaction.
     * @param {string} transaction_id - Transaction ID
     * @returns {number} Required signatures
     */
    get_required_signatures(transaction_id) {
        return this.required;
    }

    /**
     * Update transaction with block details.
     * @param {string} transaction_id - Transaction ID
     * @param {number} block_number - Block number
     */
    update_transaction_block_number(transaction_id, block_number) {
        const transaction = this.get_transaction(transaction_id);
        
        if (transaction && !transaction.block_number) {
            transaction.block_number = block_number;
            this.updated_at = Date.now() / 1000;
        }
    }

    /**
     * Convert to JSON serializable format.
     * @returns {object} JSON representation
     */
    to_json() {
        return {
            address: this.address,
            public_keys: this.public_keys,
            required_signatures: this.required,
            balance: this.balance,
            pending_transactions: Array.from(this.pending_transactions.values()),
            completed_transactions: this.completed_transactions,
            created_at: this.created_at,
            updated_at: this.updated_at,
            transaction_counter: this.transaction_counter,
            statistics: this.get_statistics()
        };
    }
}

export class MultisigWalletFactory {
    /**
     * Create a new multisig wallet.
     * @param {object} params - Creation parameters
     * @returns {MultisigWallet} New wallet instance
     */
    static create_wallet(params) {
        const { public_keys = [], required = 2 } = params;
        
        if (public_keys.length < 2) {
            throw new Error('Multisig wallet requires at least 2 public keys');
        }

        if (required < 1 || required > public_keys.length) {
            throw new Error(`Number of required signatures must be between 1 and ${public_keys.length}`);
        }

        return new MultisigWallet(public_keys, required);
    }

    /**
     * Create and initialize a wallet.
     * @param {object} params - Creation parameters
     * @returns {MultisigWallet} Initialized wallet
     */
    static async create_and_initialize(params) {
        const wallet = this.create_wallet(params);
        return wallet;
    }
}
