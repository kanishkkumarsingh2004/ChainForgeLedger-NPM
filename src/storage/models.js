/**
 * ChainForgeLedger Storage Module - Models
 * 
 * Defines data models for blockchain storage.
 */

export class BlockStorage {
    /**
     * Create a new block storage instance.
     */
    constructor() {
        this.block_id = null;
        this.block_hash = null;
        this.previous_block_hash = null;
        this.block_number = null;
        this.timestamp = null;
        this.difficulty = null;
        this.miner = null;
        this.total_reward = null;
        this.stake_reward = null;
        this.coinbase_reward = null;
        this.transaction_fee_reward = null;
        this.validator_count = null;
        this.total_voting_power = null;
        this.merkle_root_hash = null;
        this.block_size = null;
        this.transaction_count = null;
        this.gas_limit = null;
        this.gas_used = null;
        this.extra_data = null;
    }

    /**
     * Initialize from block data.
     * @param {object} block_data - Block data to initialize from
     */
    static from_block_data(block_data) {
        const block = new BlockStorage();
        block.block_id = block_data.block_id || null;
        block.block_hash = block_data.block_hash || null;
        block.previous_block_hash = block_data.previous_block_hash || null;
        block.block_number = block_data.block_number || null;
        block.timestamp = block_data.timestamp || null;
        block.difficulty = block_data.difficulty || null;
        block.miner = block_data.miner || null;
        block.total_reward = block_data.total_reward || null;
        block.stake_reward = block_data.stake_reward || null;
        block.coinbase_reward = block_data.coinbase_reward || null;
        block.transaction_fee_reward = block_data.transaction_fee_reward || null;
        block.validator_count = block_data.validator_count || null;
        block.total_voting_power = block_data.total_voting_power || null;
        block.merkle_root_hash = block_data.merkle_root_hash || null;
        block.block_size = block_data.block_size || null;
        block.transaction_count = block_data.transaction_count || null;
        block.gas_limit = block_data.gas_limit || null;
        block.gas_used = block_data.gas_used || null;
        block.extra_data = block_data.extra_data || null;
        
        return block;
    }

    /**
     * Validate block data.
     * @returns {Array} Validation errors
     */
    validate() {
        const errors = [];
        
        if (!this.block_hash) {
            errors.push('block_hash is required');
        }
        
        if (!this.previous_block_hash) {
            errors.push('previous_block_hash is required');
        }
        
        if (this.block_number === null) {
            errors.push('block_number is required');
        }
        
        if (!this.timestamp) {
            errors.push('timestamp is required');
        }
        
        if (this.difficulty === null) {
            errors.push('difficulty is required');
        }
        
        if (!this.miner) {
            errors.push('miner is required');
        }
        
        if (this.total_reward === null) {
            errors.push('total_reward is required');
        }
        
        if (!this.merkle_root_hash) {
            errors.push('merkle_root_hash is required');
        }
        
        if (this.block_size === null) {
            errors.push('block_size is required');
        }
        
        if (this.transaction_count === null) {
            errors.push('transaction_count is required');
        }
        
        return errors;
    }

    /**
     * Convert to JSON object.
     * @returns {object} JSON representation
     */
    to_json() {
        return {
            block_id: this.block_id,
            block_hash: this.block_hash,
            previous_block_hash: this.previous_block_hash,
            block_number: this.block_number,
            timestamp: this.timestamp,
            difficulty: this.difficulty,
            miner: this.miner,
            total_reward: this.total_reward,
            stake_reward: this.stake_reward,
            coinbase_reward: this.coinbase_reward,
            transaction_fee_reward: this.transaction_fee_reward,
            validator_count: this.validator_count,
            total_voting_power: this.total_voting_power,
            merkle_root_hash: this.merkle_root_hash,
            block_size: this.block_size,
            transaction_count: this.transaction_count,
            gas_limit: this.gas_limit,
            gas_used: this.gas_used,
            extra_data: this.extra_data
        };
    }
}

export class TransactionStorage {
    /**
     * Create a new transaction storage instance.
     */
    constructor() {
        this.transaction_id = null;
        this.transaction_hash = null;
        this.block_number = null;
        this.timestamp = null;
        this.block_timestamp = null;
        this.block_hash = null;
        this.sender_address = null;
        this.recipient_address = null;
        this.amount = null;
        this.token_amount = null;
        this.transaction_type = null;
        this.token_type = null;
        this.fee = null;
        this.gas_used = null;
        this.blockchain = null;
        this.tokenomics = null;
        this.status = null;
        this.input_data = null;
        this.output_data = null;
    }

    /**
     * Initialize from transaction data.
     * @param {object} transaction_data - Transaction data to initialize from
     */
    static from_transaction_data(transaction_data) {
        const transaction = new TransactionStorage();
        transaction.transaction_id = transaction_data.transaction_id || null;
        transaction.transaction_hash = transaction_data.transaction_hash || null;
        transaction.block_number = transaction_data.block_number || null;
        transaction.timestamp = transaction_data.timestamp || null;
        transaction.block_timestamp = transaction_data.block_timestamp || null;
        transaction.block_hash = transaction_data.block_hash || null;
        transaction.sender_address = transaction_data.sender_address || null;
        transaction.recipient_address = transaction_data.recipient_address || null;
        transaction.amount = transaction_data.amount || null;
        transaction.token_amount = transaction_data.token_amount || null;
        transaction.transaction_type = transaction_data.transaction_type || null;
        transaction.token_type = transaction_data.token_type || null;
        transaction.fee = transaction_data.fee || null;
        transaction.gas_used = transaction_data.gas_used || null;
        transaction.blockchain = transaction_data.blockchain || null;
        transaction.tokenomics = transaction_data.tokenomics || null;
        transaction.status = transaction_data.status || null;
        transaction.input_data = transaction_data.input_data || null;
        transaction.output_data = transaction_data.output_data || null;
        
        return transaction;
    }

    /**
     * Validate transaction data.
     * @returns {Array} Validation errors
     */
    validate() {
        const errors = [];
        
        if (!this.transaction_hash) {
            errors.push('transaction_hash is required');
        }
        
        if (!this.sender_address) {
            errors.push('sender_address is required');
        }
        
        if (!this.recipient_address) {
            errors.push('recipient_address is required');
        }
        
        if (this.amount === null && this.token_amount === null) {
            errors.push('Either amount or token_amount is required');
        }
        
        if (this.transaction_type === 'token' && !this.token_type) {
            errors.push('token_type is required for token transactions');
        }
        
        if (this.fee === null) {
            errors.push('fee is required');
        }
        
        if (!this.timestamp) {
            errors.push('timestamp is required');
        }
        
        if (!this.status) {
            errors.push('status is required');
        }
        
        return errors;
    }

    /**
     * Convert to JSON object.
     * @returns {object} JSON representation
     */
    to_json() {
        return {
            transaction_id: this.transaction_id,
            transaction_hash: this.transaction_hash,
            block_number: this.block_number,
            timestamp: this.timestamp,
            block_timestamp: this.block_timestamp,
            block_hash: this.block_hash,
            sender_address: this.sender_address,
            recipient_address: this.recipient_address,
            amount: this.amount,
            token_amount: this.token_amount,
            transaction_type: this.transaction_type,
            token_type: this.token_type,
            fee: this.fee,
            gas_used: this.gas_used,
            blockchain: this.blockchain,
            tokenomics: this.tokenomics,
            status: this.status,
            input_data: this.input_data,
            output_data: this.output_data
        };
    }
}

export class ContractStorage {
    /**
     * Create a new contract storage instance.
     */
    constructor() {
        this.contract_address = null;
        this.contract_id = null;
        this.contract_name = null;
        this.contract_code = null;
        this.bytecode = null;
        this.abi = null;
        this.creator = null;
        this.deployment_time = null;
        this.deployment_block = null;
        this.address = null;
        this.gas_used = null;
        this.storage = null;
    }

    /**
     * Initialize from contract data.
     * @param {object} contract_data - Contract data to initialize from
     */
    static from_contract_data(contract_data) {
        const contract = new ContractStorage();
        contract.contract_address = contract_data.contract_address || null;
        contract.contract_id = contract_data.contract_id || null;
        contract.contract_name = contract_data.contract_name || null;
        contract.contract_code = contract_data.contract_code || null;
        contract.bytecode = contract_data.bytecode || null;
        contract.abi = contract_data.abi || null;
        contract.creator = contract_data.creator || null;
        contract.deployment_time = contract_data.deployment_time || null;
        contract.deployment_block = contract_data.deployment_block || null;
        contract.address = contract_data.address || null;
        contract.gas_used = contract_data.gas_used || null;
        contract.storage = contract_data.storage || null;
        
        return contract;
    }

    /**
     * Validate contract data.
     * @returns {Array} Validation errors
     */
    validate() {
        const errors = [];
        
        if (!this.contract_address) {
            errors.push('contract_address is required');
        }
        
        if (!this.contract_id) {
            errors.push('contract_id is required');
        }
        
        if (!this.contract_name) {
            errors.push('contract_name is required');
        }
        
        if (!this.bytecode) {
            errors.push('bytecode is required');
        }
        
        if (!this.abi) {
            errors.push('abi is required');
        }
        
        if (!this.creator) {
            errors.push('creator is required');
        }
        
        if (!this.deployment_time) {
            errors.push('deployment_time is required');
        }
        
        if (!this.deployment_block) {
            errors.push('deployment_block is required');
        }
        
        if (!this.address) {
            errors.push('address is required');
        }
        
        return errors;
    }

    /**
     * Convert to JSON object.
     * @returns {object} JSON representation
     */
    to_json() {
        return {
            contract_address: this.contract_address,
            contract_id: this.contract_id,
            contract_name: this.contract_name,
            contract_code: this.contract_code,
            bytecode: this.bytecode,
            abi: this.abi,
            creator: this.creator,
            deployment_time: this.deployment_time,
            deployment_block: this.deployment_block,
            address: this.address,
            gas_used: this.gas_used,
            storage: this.storage
        };
    }
}

export class AccountStorage {
    /**
     * Create a new account storage instance.
     */
    constructor() {
        this.address = null;
        this.balance = null;
        this.transaction_count = null;
        this.last_transaction_hash = null;
        this.blockchain_data = null;
    }

    /**
     * Initialize from account data.
     * @param {object} account_data - Account data to initialize from
     */
    static from_account_data(account_data) {
        const account = new AccountStorage();
        account.address = account_data.address || null;
        account.balance = account_data.balance || null;
        account.transaction_count = account_data.transaction_count || null;
        account.last_transaction_hash = account_data.last_transaction_hash || null;
        account.blockchain_data = account_data.blockchain_data || null;
        
        return account;
    }

    /**
     * Validate account data.
     * @returns {Array} Validation errors
     */
    validate() {
        const errors = [];
        
        if (!this.address) {
            errors.push('address is required');
        }
        
        if (this.balance === null) {
            errors.push('balance is required');
        }
        
        if (this.transaction_count === null) {
            errors.push('transaction_count is required');
        }
        
        return errors;
    }

    /**
     * Convert to JSON object.
     * @returns {object} JSON representation
     */
    to_json() {
        return {
            address: this.address,
            balance: this.balance,
            transaction_count: this.transaction_count,
            last_transaction_hash: this.last_transaction_hash,
            blockchain_data: this.blockchain_data
        };
    }
}

export class MetadataStorage {
    /**
     * Create a new metadata storage instance.
     */
    constructor() {
        this.metadata_type = null;
        this.data = null;
    }

    /**
     * Initialize from metadata data.
     * @param {object} metadata_data - Metadata data to initialize from
     */
    static from_metadata_data(metadata_data) {
        const metadata = new MetadataStorage();
        metadata.metadata_type = metadata_data.metadata_type || null;
        metadata.data = metadata_data.data || null;
        
        return metadata;
    }

    /**
     * Validate metadata data.
     * @returns {Array} Validation errors
     */
    validate() {
        const errors = [];
        
        if (!this.metadata_type) {
            errors.push('metadata_type is required');
        }
        
        if (!this.data) {
            errors.push('data is required');
        }
        
        return errors;
    }

    /**
     * Convert to JSON object.
     * @returns {object} JSON representation
     */
    to_json() {
        return {
            metadata_type: this.metadata_type,
            data: this.data
        };
    }
}

export class StorageManager {
    /**
     * Create a new storage manager instance.
     */
    constructor() {
        this.block_storage = [];
        this.transaction_storage = [];
        this.contract_storage = [];
        this.account_storage = [];
        this.metadata_storage = [];
    }

    /**
     * Add block to storage.
     * @param {BlockStorage} block - Block to add
     */
    add_block(block) {
        this.block_storage.push(block);
    }

    /**
     * Add transaction to storage.
     * @param {TransactionStorage} transaction - Transaction to add
     */
    add_transaction(transaction) {
        this.transaction_storage.push(transaction);
    }

    /**
     * Add contract to storage.
     * @param {ContractStorage} contract - Contract to add
     */
    add_contract(contract) {
        this.contract_storage.push(contract);
    }

    /**
     * Add account to storage.
     * @param {AccountStorage} account - Account to add
     */
    add_account(account) {
        this.account_storage.push(account);
    }

    /**
     * Add metadata to storage.
     * @param {MetadataStorage} metadata - Metadata to add
     */
    add_metadata(metadata) {
        this.metadata_storage.push(metadata);
    }

    /**
     * Get block by block number.
     * @param {number} block_number - Block number
     * @returns {BlockStorage|null} Block or null if not found
     */
    get_block_by_number(block_number) {
        return this.block_storage.find(block => block.block_number === block_number) || null;
    }

    /**
     * Get block by block hash.
     * @param {string} block_hash - Block hash
     * @returns {BlockStorage|null} Block or null if not found
     */
    get_block_by_hash(block_hash) {
        return this.block_storage.find(block => block.block_hash === block_hash) || null;
    }

    /**
     * Get all blocks.
     * @returns {Array} All blocks
     */
    get_all_blocks() {
        return [...this.block_storage];
    }

    /**
     * Get transactions in a block.
     * @param {number} block_number - Block number
     * @returns {Array} Transactions in block
     */
    get_transactions_in_block(block_number) {
        return this.transaction_storage.filter(transaction => 
            transaction.block_number === block_number
        );
    }

    /**
     * Get all transactions.
     * @returns {Array} All transactions
     */
    get_all_transactions() {
        return [...this.transaction_storage];
    }

    /**
     * Get contract by address.
     * @param {string} contract_address - Contract address
     * @returns {ContractStorage|null} Contract or null if not found
     */
    get_contract(contract_address) {
        return this.contract_storage.find(contract => 
            contract.contract_address === contract_address
        ) || null;
    }

    /**
     * Get all contracts.
     * @returns {Array} All contracts
     */
    get_all_contracts() {
        return [...this.contract_storage];
    }

    /**
     * Get account by address.
     * @param {string} address - Account address
     * @returns {AccountStorage|null} Account or null if not found
     */
    get_account(address) {
        return this.account_storage.find(account => account.address === address) || null;
    }

    /**
     * Get all accounts.
     * @returns {Array} All accounts
     */
    get_all_accounts() {
        return [...this.account_storage];
    }

    /**
     * Get metadata by type.
     * @param {string} metadata_type - Metadata type
     * @returns {Array} Metadata of the specified type
     */
    get_metadata_by_type(metadata_type) {
        return this.metadata_storage.filter(metadata => 
            metadata.metadata_type === metadata_type
        );
    }

    /**
     * Get all metadata.
     * @returns {Array} All metadata
     */
    get_all_metadata() {
        return [...this.metadata_storage];
    }

    /**
     * Clear all storage.
     */
    clear() {
        this.block_storage = [];
        this.transaction_storage = [];
        this.contract_storage = [];
        this.account_storage = [];
        this.metadata_storage = [];
    }

    /**
     * Get storage statistics.
     * @returns {object} Storage statistics
     */
    get_statistics() {
        return {
            block_count: this.block_storage.length,
            transaction_count: this.transaction_storage.length,
            contract_count: this.contract_storage.length,
            account_count: this.account_storage.length,
            metadata_count: this.metadata_storage.length,
            total_transactions: this.transaction_storage.length,
            total_blocks: this.block_storage.length
        };
    }
}
