/**
 * ChainForgeLedger State Pruning Module
 * 
 * Implements blockchain state pruning for storage optimization.
 */

export class StatePruning {
    /**
     * Create a new state pruning manager instance.
     * @param {object} options - Pruning configuration options
     */
    constructor(options = {}) {
        this.enabled = options.enabled || true;
        this.max_blocks_to_keep = options.max_blocks_to_keep || 1000;
        this.pruning_interval = options.pruning_interval || 600; // 10 minutes
        this.state_history = new Map();
        this.last_pruning_time = Date.now() / 1000;
        this.transaction_history = new Map();
        this.chain_history = [];
        this.prune_reward_threshold = options.prune_reward_threshold || 0;
        this.blocks_to_prune = [];
        this.state_delta_cache = new Map();
    }

    /**
     * Enable or disable state pruning.
     * @param {boolean} enabled - Whether to enable pruning
     */
    set_enabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Set maximum number of blocks to keep.
     * @param {number} blocks - Number of blocks to keep
     */
    set_max_blocks_to_keep(blocks) {
        if (blocks < 0) {
            throw new Error("Max blocks to keep must be positive");
        }
        this.max_blocks_to_keep = blocks;
    }

    /**
     * Set pruning interval.
     * @param {number} seconds - Pruning interval in seconds
     */
    set_pruning_interval(seconds) {
        if (seconds <= 0) {
            throw new Error("Pruning interval must be positive");
        }
        this.pruning_interval = seconds;
    }

    /**
     * Record block state before pruning.
     * @param {number} block_number - Block number
     * @param {object} state - Block state
     */
    record_block_state(block_number, state) {
        const current_time = Date.now() / 1000;

        if (!this.state_history.has(block_number)) {
            this.state_history.set(block_number, {
                block_number,
                state: { ...state },
                timestamp: current_time
            });
        }
    }

    /**
     * Record transaction details for history.
     * @param {string} tx_hash - Transaction hash
     * @param {object} transaction - Transaction data
     */
    record_transaction(tx_hash, transaction) {
        const current_time = Date.now() / 1000;

        if (!this.transaction_history.has(tx_hash)) {
            this.transaction_history.set(tx_hash, {
                tx_hash,
                transaction: { ...transaction },
                timestamp: current_time
            });
        }
    }

    /**
     * Get block state from history.
     * @param {number} block_number - Block number
     * @returns {object|null} Block state or null if not found
     */
    get_block_state(block_number) {
        if (this.state_history.has(block_number)) {
            return this.state_history.get(block_number).state;
        }
        return null;
    }

    /**
     * Get transaction from history.
     * @param {string} tx_hash - Transaction hash
     * @returns {object|null} Transaction or null if not found
     */
    get_transaction(tx_hash) {
        if (this.transaction_history.has(tx_hash)) {
            return this.transaction_history.get(tx_hash).transaction;
        }
        return null;
    }

    /**
     * Get block range from chain history.
     * @param {number} start_block - Start block number
     * @param {number} end_block - End block number
     * @returns {Array} List of blocks in range
     */
    get_block_range(start_block, end_block) {
        if (start_block < 0 || end_block >= this.chain_history.length) {
            return [];
        }
        return this.chain_history.slice(start_block, end_block + 1);
    }

    /**
     * Determine if pruning is due based on current time and last pruning time.
     * @param {number} current_time - Current time (Unix timestamp)
     * @returns {boolean} Whether pruning is due
     */
    is_pruning_due(current_time) {
        return current_time - this.last_pruning_time >= this.pruning_interval;
    }

    /**
     * Calculate block range for pruning.
     * @param {number} current_block_number - Current block number
     * @returns {Array} Block range to prune
     */
    calculate_prune_range(current_block_number) {
        if (!this.enabled) {
            return [];
        }

        if (current_block_number <= this.max_blocks_to_keep) {
            return [];
        }

        const prune_start = 0;
        const prune_end = current_block_number - this.max_blocks_to_keep;

        return this._prune_blocks(prune_start, prune_end);
    }

    /**
     * Process blocks to be pruned.
     * @param {number} prune_start - Start block number
     * @param {number} prune_end - End block number
     * @returns {Array} Blocks that were pruned
     */
    _prune_blocks(prune_start, prune_end) {
        const pruned_blocks = [];

        for (let block_number = prune_start; block_number <= prune_end; block_number++) {
            if (this.state_history.has(block_number)) {
                pruned_blocks.push(block_number);
                this.state_history.delete(block_number);
            }
        }

        return pruned_blocks;
    }

    /**
     * Prune transaction history older than specified threshold.
     * @param {number} max_age - Maximum transaction age in seconds
     * @param {number} current_time - Current time (Unix timestamp)
     */
    prune_transaction_history(max_age, current_time) {
        const to_remove = [];

        for (const [tx_hash, entry] of this.transaction_history.entries()) {
            if (current_time - entry.timestamp > max_age) {
                to_remove.push(tx_hash);
            }
        }

        to_remove.forEach(tx_hash => this.transaction_history.delete(tx_hash));
    }

    /**
     * Prune block metadata by age.
     * @param {number} max_age - Maximum block age in seconds
     * @param {number} current_time - Current time (Unix timestamp)
     */
    prune_block_metadata(max_age, current_time) {
        const to_remove = [];

        for (let i = 0; i < this.chain_history.length; i++) {
            const block = this.chain_history[i];
            if (current_time - block.timestamp > max_age) {
                to_remove.push(i);
            }
        }

        to_remove.reverse().forEach(index => this.chain_history.splice(index, 1));
    }

    /**
     * Prune old block metadata and update history.
     * @param {Array} blocks_to_prune_metadata - Blocks to prune metadata for
     */
    prune_block_metadata_internal(blocks_to_prune_metadata) {
        blocks_to_prune_metadata.forEach(block_number => {
            const block_index = this.chain_history.findIndex(block => block.index === block_number);
            if (block_index !== -1) {
                this.chain_history.splice(block_index, 1);
            }
        });
    }

    /**
     * Get statistics about current pruning state.
     * @returns {object} Pruning statistics
     */
    get_statistics() {
        const current_time = Date.now() / 1000;
        const time_since_last_prune = current_time - this.last_pruning_time;
        const next_prune_needed = time_since_last_prune >= this.pruning_interval;
        const next_prune_in = Math.max(0, this.pruning_interval - time_since_last_prune);

        return {
            enabled: this.enabled,
            max_blocks_to_keep: this.max_blocks_to_keep,
            pruning_interval: this.pruning_interval,
            state_history_count: this.state_history.size,
            transaction_history_count: this.transaction_history.size,
            block_metadata_count: this.chain_history.length,
            time_since_last_prune,
            next_prune_needed,
            next_prune_in
        };
    }

    /**
     * Prune old states from the cache.
     * @param {number} max_age - Maximum state age in seconds
     * @param {number} current_time - Current time (Unix timestamp)
     */
    prune_old_states(max_age, current_time) {
        const to_remove = [];

        for (const [block_number, entry] of this.state_history.entries()) {
            if (current_time - entry.timestamp > max_age) {
                to_remove.push(block_number);
            }
        }

        to_remove.forEach(block_number => this.state_history.delete(block_number));
    }

    /**
     * Prune states by timestamp range.
     * @param {number} start_timestamp - Start timestamp
     * @param {number} end_timestamp - End timestamp
     * @param {number} current_time - Current time (Unix timestamp)
     */
    prune_states_by_range(start_timestamp, end_timestamp, current_time) {
        const to_remove = [];

        for (const [block_number, entry] of this.state_history.entries()) {
            if (entry.timestamp >= start_timestamp && entry.timestamp <= end_timestamp) {
                to_remove.push(block_number);
            }
        }

        to_remove.forEach(block_number => this.state_history.delete(block_number));
    }

    /**
     * Prune old state deltas from cache.
     * @param {number} max_deltas - Maximum number of state deltas to keep
     * @returns {number} Number of deltas pruned
     */
    prune_state_deltas(max_deltas) {
        let pruned = 0;
        const deltas = Array.from(this.state_delta_cache.values());
        deltas.sort((a, b) => a.block_number - b.block_number);

        while (deltas.length > max_deltas) {
            const oldest = deltas.shift();
            this.state_delta_cache.delete(oldest.block_number);
            pruned++;
        }

        return pruned;
    }

    /**
     * Clear all pruning history.
     */
    clear() {
        this.state_history.clear();
        this.transaction_history.clear();
        this.chain_history = [];
        this.last_pruning_time = Date.now() / 1000;
    }
}
