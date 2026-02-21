/**
 * ChainForgeLedger Fork Handling Mechanism
 * 
 * Handles blockchain fork detection and resolution.
 */

export class ForkHandler {
    static RESOLUTION_STRATEGIES = ['longest_chain', 'cumulative_difficulty', 'latest_timestamp'];

    /**
     * Handles blockchain fork detection and resolution.
     * 
     * @param {Blockchain} blockchain - Blockchain instance to monitor
     * @param {number} fork_threshold - Block height difference to detect a fork
     * @param {string} resolution_strategy - Fork resolution strategy
     */
    constructor(blockchain, fork_threshold = 2, resolution_strategy = 'longest_chain') {
        this.blockchain = blockchain;
        this.fork_threshold = fork_threshold;
        this.resolution_strategy = resolution_strategy;
        this.forks = [];
        this.last_fork_check = 0;
        this.fork_check_interval = 60;
    }

    detect_fork(peer_chain) {
        if (peer_chain.length < 2 || this.blockchain.chain.length < 2) {
            return false;
        }

        const min_length = Math.min(this.blockchain.chain.length, peer_chain.length);
        let common_ancestor = null;

        for (let i = 0; i < min_length; i++) {
            if (this.blockchain.chain[i].hash === peer_chain[i].hash) {
                common_ancestor = i;
            } else {
                break;
            }
        }

        if (common_ancestor !== null && common_ancestor < min_length - 1) {
            const local_fork_length = this.blockchain.chain.length - common_ancestor - 1;
            const peer_fork_length = peer_chain.length - common_ancestor - 1;

            if (local_fork_length >= this.fork_threshold || peer_fork_length >= this.fork_threshold) {
                const fork_info = {
                    common_ancestor_index: common_ancestor,
                    common_ancestor_hash: this.blockchain.chain[common_ancestor].hash,
                    local_fork_length,
                    peer_fork_length,
                    detection_time: Date.now() / 1000
                };

                this.forks.push(fork_info);
                return true;
            }
        }

        return false;
    }

    resolve_fork(peer_chain) {
        if (!this.detect_fork(peer_chain)) {
            return false;
        }

        switch (this.resolution_strategy) {
            case 'longest_chain':
                return this._resolve_by_length(peer_chain);
            case 'cumulative_difficulty':
                return this._resolve_by_difficulty(peer_chain);
            case 'latest_timestamp':
                return this._resolve_by_timestamp(peer_chain);
            default:
                throw new Error(`Unknown resolution strategy: ${this.resolution_strategy}`);
        }
    }

    _resolve_by_length(peer_chain) {
        if (peer_chain.length > this.blockchain.chain.length) {
            if (this._is_chain_valid(peer_chain)) {
                this.blockchain.chain = peer_chain;
                this._update_block_hash_map();
                return true;
            }
        }

        return false;
    }

    _resolve_by_difficulty(peer_chain) {
        const local_difficulty = this.blockchain.chain.reduce((sum, block) => sum + block.difficulty, 0);
        const peer_difficulty = peer_chain.reduce((sum, block) => sum + block.difficulty, 0);

        if (peer_difficulty > local_difficulty) {
            if (this._is_chain_valid(peer_chain)) {
                this.blockchain.chain = peer_chain;
                this._update_block_hash_map();
                return true;
            }
        }

        return false;
    }

    _resolve_by_timestamp(peer_chain) {
        const local_timestamp = this.blockchain.get_last_block().timestamp;
        const peer_timestamp = peer_chain[peer_chain.length - 1].timestamp;

        if (peer_timestamp > local_timestamp) {
            if (this._is_chain_valid(peer_chain)) {
                this.blockchain.chain = peer_chain;
                this._update_block_hash_map();
                return true;
            }
        }

        return false;
    }

    _is_chain_valid(chain) {
        for (let i = 1; i < chain.length; i++) {
            const current_block = chain[i];
            const previous_block = chain[i - 1];

            if (current_block.index !== previous_block.index + 1) {
                return false;
            }

            if (current_block.previous_hash !== previous_block.hash) {
                return false;
            }

            if (!current_block.validate_block()) {
                return false;
            }
        }

        return true;
    }

    _update_block_hash_map() {
        this.blockchain._block_hash_map = {};
        for (const block of this.blockchain.chain) {
            this.blockchain._block_hash_map[block.hash] = block;
        }
    }

    get_fork_info() {
        return [...this.forks];
    }

    get_fork_statistics() {
        if (!this.forks.length) {
            return {
                total_forks: 0,
                average_fork_depth: 0,
                last_fork_time: 0
            };
        }

        const average_fork_depth = this.forks.reduce((sum, fork) => 
            sum + fork.local_fork_length + fork.peer_fork_length, 0
        ) / this.forks.length;

        return {
            total_forks: this.forks.length,
            average_fork_depth,
            last_fork_time: this.forks[this.forks.length - 1].detection_time
        };
    }

    clean_up_old_forks(max_age = 3600) {
        const current_time = Date.now() / 1000;
        this.forks = this.forks.filter(fork => 
            current_time - fork.detection_time <= max_age
        );
    }

    set_resolution_strategy(strategy) {
        if (!ForkHandler.RESOLUTION_STRATEGIES.includes(strategy)) {
            throw new Error(`Unsupported resolution strategy: ${strategy}`);
        }

        this.resolution_strategy = strategy;
    }

    set_fork_threshold(threshold) {
        if (threshold < 1) {
            throw new Error("Fork threshold must be at least 1");
        }

        this.fork_threshold = threshold;
    }

    toString() {
        const stats = this.get_fork_statistics();
        return (
            `Fork Handler\n` +
            `=============\n` +
            `Resolution Strategy: ${this.resolution_strategy}\n` +
            `Fork Threshold: ${this.fork_threshold} blocks\n` +
            `Total Forks Detected: ${stats.total_forks}\n` +
            `Average Fork Depth: ${stats.average_fork_depth.toFixed(1)} blocks\n` +
            `Last Fork Time: ${new Date(stats.last_fork_time * 1000).toString()}`
        );
    }
}
