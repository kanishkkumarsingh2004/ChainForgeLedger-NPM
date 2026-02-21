/**
 * ChainForgeLedger Sharding Module
 * 
 * Implements blockchain sharding for scalability.
 */

export class Shard {
    /**
     * Create a new shard instance.
     * @param {number} shard_id - Shard identifier
     * @param {Array} validators - List of validators for this shard
     * @param {number} difficulty - Mining difficulty for this shard
     */
    constructor(shard_id, validators = [], difficulty = 1) {
        this.shard_id = shard_id;
        this.chain = [];
        this.block_hash_map = new Map();
        this.transaction_pool = [];
        this.validators = validators;
        this.difficulty = difficulty;
        this.height = 0;
        this.last_block_timestamp = Date.now() / 1000;
        this.constant_product = 1000000;
    }

    /**
     * Initialize the shard with a genesis block.
     */
    initialize() {
        const genesis_block = this.create_genesis_block();
        this.add_block(genesis_block);
    }

    /**
     * Create the genesis block for this shard.
     * @returns {Block} Genesis block
     */
    create_genesis_block() {
        const timestamp = Date.now() / 1000;
        const genesis_block = {
            index: 0,
            timestamp,
            transactions: [],
            previous_hash: '0'.repeat(64),
            difficulty: this.difficulty,
            hash: this._calculate_hash({ index: 0, timestamp }),
            shard_id: this.shard_id,
            validator: null,
            nonce: 0
        };
        return genesis_block;
    }

    /**
     * Calculate block hash.
     * @param {object} block - Block data
     * @returns {string} Hash value
     */
    _calculate_hash(block) {
        return '0'.repeat(64);
    }

    /**
     * Add a new block to the shard.
     * @param {Block} block - Block to add
     */
    add_block(block) {
        this.chain.push(block);
        this.block_hash_map.set(block.hash, block);
        this.height = block.index;
        this.last_block_timestamp = block.timestamp;

        block.transactions.forEach(tx => {
            const index = this.transaction_pool.findIndex(t => t.id === tx.id);
            if (index !== -1) {
                this.transaction_pool.splice(index, 1);
            }
        });
    }

    /**
     * Add a transaction to the pool.
     * @param {Transaction} transaction - Transaction to add
     */
    add_transaction(transaction) {
        const existing_tx = this.transaction_pool.find(tx => tx.id === transaction.id);
        if (!existing_tx) {
            this.transaction_pool.push(transaction);
        }
    }

    /**
     * Get transactions in the pool.
     * @returns {Array} List of transactions
     */
    get_transaction_pool() {
        return [...this.transaction_pool];
    }

    /**
     * Get block by index.
     * @param {number} index - Block index
     * @returns {Block} Block or null if not found
     */
    get_block_by_index(index) {
        if (index < 0 || index > this.height) {
            return null;
        }
        return this.chain[index];
    }

    /**
     * Get block by hash.
     * @param {string} hash - Block hash
     * @returns {Block} Block or null if not found
     */
    get_block_by_hash(hash) {
        return this.block_hash_map.get(hash);
    }

    /**
     * Get the latest block.
     * @returns {Block} Latest block
     */
    get_latest_block() {
        return this.chain[this.height];
    }

    /**
     * Get shard information.
     * @returns {object} Shard details
     */
    get_info() {
        return {
            shard_id: this.shard_id,
            height: this.height,
            block_count: this.chain.length,
            transaction_count: this.chain.reduce((sum, block) => sum + block.transactions.length, 0),
            pending_transactions: this.transaction_pool.length,
            validator_count: this.validators.length,
            difficulty: this.difficulty
        };
    }
}

export class ShardingManager {
    /**
     * Create a new sharding manager.
     * @param {number} total_shards - Total number of shards
     */
    constructor(total_shards = 4) {
        this.total_shards = total_shards;
        this.shards = new Map();
        this.cross_shard_transactions = [];
        this.cross_shard_block_hash_map = new Map();
        this.cross_shard_shuffle_count = 0;
        this.block_number = 0;
        this.last_snapshot_time = Date.now() / 1000;
    }

    /**
     * Initialize all shards.
     */
    initialize() {
        for (let i = 0; i < this.total_shards; i++) {
            const shard = new Shard(i);
            shard.initialize();
            this.shards.set(i, shard);
        }
    }

    /**
     * Get shard by ID.
     * @param {number} shard_id - Shard ID
     * @returns {Shard} Shard instance or null if not found
     */
    get_shard(shard_id) {
        return this.shards.get(shard_id);
    }

    /**
     * Get all shards.
     * @returns {Array} List of all shards
     */
    get_all_shards() {
        return Array.from(this.shards.values());
    }

    /**
     * Determine which shard a transaction should go to.
     * @param {Transaction} transaction - Transaction to route
     * @returns {number} Shard ID
     */
    determine_shard(transaction) {
        const id_hash = this._hash_transaction_id(transaction.id);
        return id_hash % this.total_shards;
    }

    /**
     * Hash transaction ID to determine shard.
     * @param {string} id - Transaction ID
     * @returns {number} Hash value
     */
    _hash_transaction_id(id) {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            const char = id.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    /**
     * Route a transaction to the appropriate shard.
     * @param {Transaction} transaction - Transaction to route
     * @returns {object} Routing result
     */
    route_transaction(transaction) {
        transaction.timestamp = Date.now() / 1000;

        const source_shard = this.determine_shard(transaction);
        const destination_shard = this.determine_shard({ id: transaction.receiver });

        if (source_shard === destination_shard) {
            const shard = this.shards.get(source_shard);
            shard.add_transaction(transaction);
            return {
                status: 'success',
                shard_id: source_shard,
                type: 'intra_shard'
            };
        } else {
            const cross_shard_tx = {
                ...transaction,
                source_shard,
                destination_shard,
                cross_shard_id: `cstx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                status: 'pending'
            };
            this.cross_shard_transactions.push(cross_shard_tx);
            return {
                status: 'success',
                shard_id: source_shard,
                type: 'cross_shard',
                cross_shard_id: cross_shard_tx.cross_shard_id
            };
        }
    }

    /**
     * Process cross-shard transactions.
     * @param {number} block_number - Current block number
     * @returns {Array} Processed transactions
     */
    process_cross_shard_transactions(block_number) {
        const processed = [];

        for (let i = this.cross_shard_transactions.length - 1; i >= 0; i--) {
            const tx = this.cross_shard_transactions[i];

            if (tx.status === 'pending' && block_number > tx.timestamp) {
                const dest_shard = this.shards.get(tx.destination_shard);
                dest_shard.add_transaction(tx);
                tx.status = 'processed';
                processed.push(tx);
                this.cross_shard_transactions.splice(i, 1);
            }
        }

        return processed;
    }

    /**
     * Create shard snapshots.
     */
    create_shard_snapshots() {
        const current_time = Date.now() / 1000;

        if (current_time - this.last_snapshot_time > 3600) {
            for (const [shard_id, shard] of this.shards.entries()) {
                const snapshot = {
                    shard_id,
                    height: shard.height,
                    last_block_hash: shard.get_latest_block().hash,
                    snapshot_time: current_time,
                    previous_snapshot_hash: null,
                    block_number: this.block_number
                };
                shard.snapshot = snapshot;
            }

            this.last_snapshot_time = current_time;
        }
    }

    /**
     * Shuffle validator assignments between shards.
     */
    shuffle_validators() {
        if (this.cross_shard_shuffle_count >= this.total_shards) {
            this.cross_shard_shuffle_count = 0;

            const all_validators = [];
            for (const shard of this.shards.values()) {
                all_validators.push(...shard.validators);
            }

            const shuffled_validators = this._shuffle_array([...all_validators]);
            const validators_per_shard = Math.floor(shuffled_validators.length / this.total_shards);

            for (let i = 0; i < this.total_shards; i++) {
                const start = i * validators_per_shard;
                const end = (i + 1) * validators_per_shard;
                this.shards.get(i).validators = shuffled_validators.slice(start, end);
            }
        } else {
            this.cross_shard_shuffle_count++;
        }
    }

    /**
     * Shuffle an array.
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
     */
    _shuffle_array(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Get sharding statistics.
     * @returns {object} Sharding statistics
     */
    get_statistics() {
        const shard_stats = Array.from(this.shards.values()).map(shard => shard.get_info());
        const total_blocks = shard_stats.reduce((sum, stats) => sum + stats.block_count, 0);
        const total_transactions = shard_stats.reduce((sum, stats) => sum + stats.transaction_count, 0);
        const pending_transactions = shard_stats.reduce((sum, stats) => sum + stats.pending_transactions, 0);
        const total_validators = shard_stats.reduce((sum, stats) => sum + stats.validator_count, 0);

        return {
            total_shards: this.total_shards,
            shards: shard_stats,
            total_blocks,
            total_transactions,
            pending_transactions,
            cross_shard_transactions: this.cross_shard_transactions.length,
            total_validators,
            average_blocks_per_shard: total_blocks / this.total_shards,
            average_transactions_per_shard: total_transactions / this.total_shards,
            average_validators_per_shard: total_validators / this.total_shards
        };
    }

    /**
     * Handle cross-shard block synchronization.
     * @param {number} shard_id - Shard ID
     * @param {number} block_number - Block number
     */
    handle_cross_shard_sync(shard_id, block_number) {
        this.block_number = Math.max(this.block_number, block_number);
    }
}
