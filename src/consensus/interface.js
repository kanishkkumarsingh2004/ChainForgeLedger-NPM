/**
 * ChainForgeLedger Consensus Interface
 * 
 * Defines the standard interface for all consensus mechanisms.
 */

export class ConsensusInterface {
    /**
     * Create a new consensus interface instance.
     */
    constructor() {
        this.mining_reward = 50;
        this.reward_decay_rate = 0.1;
        this.block_reward = 0;
        this.fee_distribution_ratio = 0;
        this.reward_history = [];
        this.max_tx_per_block = 100;
        this.transaction_limit = 100;
    }

    /**
     * Check if a block is valid.
     * @param {Block} block - Block to validate
     * @param {Blockchain} blockchain - Blockchain instance
     * @param {State} state - State instance
     * @returns {Promise<boolean>} Whether block is valid
     */
    async is_block_valid(block, blockchain, state) {
        throw new Error('Method not implemented');
    }

    /**
     * Handle block validation result.
     * @param {string} block_hash - Block hash
     * @param {boolean} is_valid - Validation result
     */
    async on_block_validation_result(block_hash, is_valid) {
        throw new Error('Method not implemented');
    }

    /**
     * Verify block using cryptographic proof.
     * @param {Block} block - Block to verify
     * @param {number} difficulty - Current difficulty
     * @param {ProofOfWork|ProofOfStake} consensus - Consensus mechanism
     * @returns {Promise<boolean>} Whether block is valid
     */
    async verify_block(block, difficulty, consensus) {
        throw new Error('Method not implemented');
    }

    /**
     * Validate block transactions.
     * @param {Block} block - Block to validate
     * @returns {Promise<boolean>} Whether transactions are valid
     */
    async validate_transactions(block) {
        for (const tx of block.transactions) {
            if (!this.is_transaction_valid(tx)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Validate individual transaction.
     * @param {Transaction} transaction - Transaction to validate
     * @returns {boolean} Whether transaction is valid
     */
    is_transaction_valid(transaction) {
        if (!transaction.sender || !transaction.receiver) {
            return false;
        }
        if (transaction.amount <= 0) {
            return false;
        }
        if (typeof transaction.timestamp !== 'number' || transaction.timestamp <= 0) {
            return false;
        }
        return true;
    }

    /**
     * Calculate block reward.
     * @param {number} block_index - Block index
     * @returns {number} Block reward
     */
    calculate_block_reward(block_index) {
        return this.mining_reward * Math.pow(1 - this.reward_decay_rate, Math.floor(block_index / 1000));
    }

    /**
     * Distribute block reward to miners.
     * @param {Block} block - Block containing reward
     * @param {string} miner_address - Miner address
     * @param {State} state - State instance
     * @returns {Promise<object>} Distribution result
     */
    async distribute_block_reward(block, miner_address, state) {
        const block_reward = this.calculate_block_reward(block.index);
        const transaction_fees = this.calculate_transaction_fees(block);
        
        const total_reward = block_reward + transaction_fees;
        const proposer_reward = total_reward * this.fee_distribution_ratio;
        const validator_reward = total_reward - proposer_reward;

        this.reward_history.push({
            block_number: block.index,
            timestamp: block.timestamp,
            block_reward,
            transaction_fees,
            proposer_reward,
            validator_reward,
            miner_address,
            reward_type: 'block_reward'
        });

        return {
            total_reward,
            block_reward,
            transaction_fees,
            proposer_reward,
            validator_reward,
            miner_address
        };
    }

    /**
     * Calculate total transaction fees in a block.
     * @param {Block} block - Block to calculate fees for
     * @returns {number} Total transaction fees
     */
    calculate_transaction_fees(block) {
        return block.transactions.reduce((sum, tx) => sum + (tx.fee || 0), 0);
    }

    /**
     * Determine if a new block should be minted based on time interval.
     * @param {number} last_block_time - Last block timestamp
     * @param {number} block_interval - Target block interval in seconds
     * @returns {boolean} Whether to mint a new block
     */
    should_mint_block(last_block_time, block_interval) {
        const current_time = Date.now() / 1000;
        return current_time - last_block_time >= block_interval;
    }

    /**
     * Get mining reward configuration.
     * @returns {object} Mining reward configuration
     */
    get_mining_reward_config() {
        return {
            initial_reward: this.mining_reward,
            reward_decay_rate: this.reward_decay_rate,
            block_interval: 60
        };
    }

    /**
     * Check if a transaction can be added to the current block.
     * @param {number} current_tx_count - Current transaction count
     * @returns {boolean} Whether transaction can be added
     */
    can_add_transaction(current_tx_count) {
        return current_tx_count < this.transaction_limit;
    }

    /**
     * Distribute accumulated transaction fees to validator.
     * @param {number} accumulated_fees - Total fees to distribute
     * @param {string} validator_address - Validator address
     * @param {State} state - State instance
     */
    async distribute_transaction_fees(accumulated_fees, validator_address, state) {
        if (accumulated_fees <= 0) {
            return { amount: 0, validator_address };
        }

        return {
            amount: accumulated_fees,
            validator_address,
            timestamp: Date.now() / 1000
        };
    }

    /**
     * Set fee distribution ratio.
     * @param {number} ratio - Fee distribution ratio (0-1)
     */
    set_fee_distribution_ratio(ratio) {
        if (ratio < 0 || ratio > 1) {
            throw new Error('Fee distribution ratio must be between 0 and 1');
        }
        this.fee_distribution_ratio = ratio;
    }

    /**
     * Set transaction limit per block.
     * @param {number} limit - Maximum transactions per block
     */
    set_transaction_limit(limit) {
        if (limit <= 0) {
            throw new Error('Transaction limit must be positive');
        }
        this.transaction_limit = limit;
    }

    /**
     * Get consensus statistics.
     * @returns {object} Consensus statistics
     */
    get_statistics() {
        return {
            mining_reward: this.mining_reward,
            reward_decay_rate: this.reward_decay_rate,
            transaction_limit: this.transaction_limit,
            fee_distribution_ratio: this.fee_distribution_ratio,
            reward_history_count: this.reward_history.length
        };
    }
}

export class ProofOfWork extends ConsensusInterface {
    /**
     * Create a new Proof of Work consensus instance.
     */
    constructor(difficulty = 4) {
        super();
        this.difficulty = difficulty;
        this.current_difficulty = difficulty;
        this.difficulty_adjustment_blocks = 10;
        this.block_time_target = 60;
        this.difficulty_history = [];
        this.blockchain = null;
        this.last_block_time = null;
        this.block_times = [];
    }

    /**
     * Mine a block.
     * @param {Array} transactions - Transactions to include
     * @param {string} miner_address - Miner address
     * @param {Blockchain} blockchain - Blockchain instance
     * @returns {Promise<Block>} Mined block
     */
    async mine_block(transactions, miner_address, blockchain) {
        throw new Error('Method not implemented');
    }

    /**
     * Calculate block difficulty.
     * @param {Blockchain} blockchain - Blockchain instance
     * @returns {number} New difficulty
     */
    calculate_difficulty(blockchain) {
        if (blockchain.chain.length % this.difficulty_adjustment_blocks !== 0) {
            return this.current_difficulty;
        }

        const recent_blocks = blockchain.chain.slice(-this.difficulty_adjustment_blocks);
        const total_time = recent_blocks.reduce((sum, block) => sum + block.timestamp, 0);
        const average_time = total_time / recent_blocks.length;

        if (average_time < this.block_time_target) {
            this.current_difficulty = Math.floor(this.current_difficulty * 1.1);
        } else if (average_time > this.block_time_target) {
            this.current_difficulty = Math.max(1, Math.floor(this.current_difficulty * 0.9));
        }

        this.difficulty_history.push(this.current_difficulty);
        return this.current_difficulty;
    }

    /**
     * Get mining difficulty.
     * @returns {number} Current mining difficulty
     */
    get_mining_difficulty() {
        return this.current_difficulty;
    }

    /**
     * Verify PoW for a block.
     * @param {Block} block - Block to verify
     * @param {number} difficulty - Expected difficulty
     * @returns {boolean} Whether PoW is valid
     */
    async verify_block(block, difficulty) {
        const hash = block.hash;
        return hash.startsWith('0'.repeat(difficulty));
    }

    /**
     * Set mining difficulty.
     * @param {number} difficulty - New mining difficulty
     */
    set_mining_difficulty(difficulty) {
        if (difficulty < 1) {
            throw new Error('Difficulty must be at least 1');
        }
        this.difficulty = difficulty;
        this.current_difficulty = difficulty;
    }
}

export class ProofOfStake extends ConsensusInterface {
    /**
     * Create a new Proof of Stake consensus instance.
     */
    constructor(validator_manager) {
        super();
        this.validator_manager = validator_manager;
        this.stake_reward = 0.05;
        this.staking_threshold = 1000;
        this.current_validator = null;
        this.stake_history = [];
        this.total_stake = 0;
        this.stake_distribution = new Map();
        this.block_proposal_interval = 30;
        this.last_block_proposal_time = null;
        this.stake_cache = new Map();
    }

    /**
     * Select validators for block validation.
     * @param {number} num_validators - Number of validators to select
     * @returns {Array} Selected validators
     */
    select_validators(num_validators) {
        const all_validators = this.validator_manager.get_active_validators();
        const eligible_validators = all_validators.filter(v => 
            v.stake >= this.staking_threshold
        );

        eligible_validators.sort((a, b) => b.stake - a.stake);
        return eligible_validators.slice(0, num_validators);
    }

    /**
     * Select validator based on stake.
     * @param {Array} validators - Eligible validators
     * @returns {string|number} Selected validator
     */
    select_validator_by_stake(validators) {
        if (validators.length === 0) {
            return null;
        }

        const total_stake = validators.reduce((sum, validator) => sum + validator.stake, 0);
        const random_value = Math.random() * total_stake;
        let cumulative_stake = 0;

        for (const validator of validators) {
            cumulative_stake += validator.stake;
            if (cumulative_stake >= random_value) {
                return validator;
            }
        }

        return validators[validators.length - 1];
    }

    /**
     * Calculate staking reward.
     * @param {number} stake_amount - Stake amount
     * @param {number} time_period - Time period in seconds
     * @returns {number} Staking reward
     */
    calculate_staking_reward(stake_amount, time_period) {
        const time_in_years = time_period / (365 * 24 * 60 * 60);
        return stake_amount * this.stake_reward * time_in_years;
    }

    /**
     * Distribute staking rewards.
     * @param {Array} validators - Validators to reward
     * @param {number} time_period - Time period in seconds
     * @returns {Promise<Array>} Reward distribution
     */
    async distribute_staking_rewards(validators, time_period) {
        const rewards = [];
        for (const validator of validators) {
            const reward = this.calculate_staking_reward(validator.stake, time_period);
            rewards.push({
                validator_address: validator.address,
                stake: validator.stake,
                reward,
                timestamp: Date.now() / 1000
            });
        }
        return rewards;
    }

    /**
     * Update stake distribution.
     * @param {Array} validators - Validator information
     */
    update_stake_distribution(validators) {
        const total_stake = validators.reduce((sum, validator) => sum + validator.stake, 0);
        this.total_stake = total_stake;
        
        this.stake_distribution.clear();
        validators.forEach(validator => {
            this.stake_distribution.set(validator.address, validator.stake);
        });
    }

    /**
     * Forge a block in PoS consensus.
     * @param {Array} transactions - Transactions to include
     * @param {number} difficulty - Mining difficulty
     * @param {number} block_index - Block index
     * @returns {Promise<Block>} Forged block
     */
    async forge_block(transactions, difficulty, block_index) {
        const timestamp = Date.now() / 1000;
        const validators = this.validator_manager.get_active_validators();
        const selected_validator = this.select_validator_by_stake(validators);

        if (!selected_validator) {
            throw new Error('No valid validator available');
        }

        const block = {
            index: block_index,
            timestamp,
            transactions: this._select_transactions(transactions),
            difficulty,
            validator: selected_validator.address,
            previous_hash: this.blockchain.get_last_block().hash,
            hash: this._calculate_hash(block)
        };

        return block;
    }

    /**
     * Calculate validator performance.
     * @param {Array} validator_addresses - Validator addresses to evaluate
     * @param {Blockchain} blockchain - Blockchain instance
     * @returns {object} Performance metrics
     */
    calculate_validator_performance(validator_addresses, blockchain) {
        return validator_addresses.reduce((acc, address) => {
            const performance = {
                blocks_proposed: 0,
                blocks_validated: 0,
                uptime: 0.99,
                latency: 100
            };
            acc[address] = performance;
            return acc;
        }, {});
    }

    /**
     * Calculate validator eligibility score.
     * @param {string} validator_address - Validator address
     * @param {object} performance - Performance metrics
     * @returns {number} Eligibility score
     */
    calculate_validator_eligibility(validator_address, performance) {
        const stake = this.stake_cache.get(validator_address) || 0;
        return stake * performance.uptime;
    }

    /**
     * Determine block validation order.
     * @param {Array} validators - Validators to order
     * @param {number} block_index - Block index
     * @returns {Array} Ordered validators
     */
    determine_validation_order(validators, block_index) {
        return [...validators].sort((a, b) => {
            const a_stake = this.stake_cache.get(a.address) || 0;
            const b_stake = this.stake_cache.get(b.address) || 0;
            
            if (a_stake !== b_stake) {
                return b_stake - a_stake;
            }
            return a.address.localeCompare(b.address);
        });
    }

    /**
     * Set staking parameters.
     * @param {object} params - Staking parameters (staking_threshold, stake_reward, etc.)
     */
    set_staking_parameters(params) {
        if (params.staking_threshold !== undefined) {
            this.staking_threshold = params.staking_threshold;
        }
        if (params.stake_reward !== undefined) {
            this.stake_reward = params.stake_reward;
        }
        if (params.block_proposal_interval !== undefined) {
            this.block_proposal_interval = params.block_proposal_interval;
        }
    }

    /**
     * _select_transactions
     * @private
     */
    _select_transactions(transactions) {
        return transactions.slice(0, this.transaction_limit);
    }

    /**
     * _calculate_hash
     * @private
     */
    _calculate_hash(block) {
        return '0'.repeat(64);
    }
}
