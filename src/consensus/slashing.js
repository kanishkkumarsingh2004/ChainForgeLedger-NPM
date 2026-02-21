/**
 * ChainForgeLedger Slashing Module
 * 
 * Implements validator slashing for malicious behavior.
 */

export class SlashingManager {
    /**
     * Create a new slashing manager instance.
     */
    constructor() {
        this.slash_events = [];
        this.slash_params = {
            double_signing_penalty: 0.1,     // 10% of stake
            downtime_penalty: 0.05,         // 5% of stake
            inactivity_threshold: 0.2,      // 20% inactivity over window
            slashing_cooldown_period: 7 * 24 * 60 * 60,  // 7 days
            validator_penalty: 0.02,        // 2% penalty per infraction
            misbehavior_penalty: 0.08,      // 8% penalty for misbehavior
            downtime_cooldown: 24 * 60 * 60 // 24 hours cooldown
        };
        this.validator_manager = null;
        this.blockchain = null;
        this.validator_penalties = new Map();
        this.validator_activity = new Map();
        this.validator_rewards = new Map();
        this.unbonding_period = 21 * 24 * 60 * 60;  // 21 days
        this.inactivity_window = 100;        // Blocks for inactivity check
        this.minimum_stake = 1000;
    }

    /**
     * Set validator manager instance.
     * @param {object} validator_manager - Validator manager instance
     */
    set_validator_manager(validator_manager) {
        this.validator_manager = validator_manager;
    }

    /**
     * Set blockchain instance.
     * @param {object} blockchain - Blockchain instance
     */
    set_blockchain(blockchain) {
        this.blockchain = blockchain;
    }

    /**
     * Apply slashing penalties to validators.
     * @param {string} validator_address - Validator address
     * @param {number} amount - Penalty amount
     * @param {string} reason - Slashing reason
     * @param {number} block_number - Block number where penalty is applied
     * @param {number} timestamp - Penalty timestamp
     */
    apply_slashing_penalty(validator_address, amount, reason, block_number, timestamp) {
        const validator = this.validator_manager.get_validator(validator_address);
        
        if (!validator) {
            throw new Error(`Validator ${validator_address} not found`);
        }

        if (validator.stake < amount) {
            throw new Error(`Validator ${validator_address} has insufficient stake: ${validator.stake}`);
        }

        validator.stake -= amount;
        validator.last_updated = timestamp;

        this.slash_events.push({
            validator_address,
            amount,
            reason,
            penalty_type: 'slashing',
            block_number,
            timestamp,
            previous_stake: validator.stake + amount,
            new_stake: validator.stake
        });

        if (validator.stake < this.minimum_stake) {
            this.validator_manager.unregister_validator(validator_address);
        }
    }

    /**
     * Handle double signing detection.
     * @param {string} validator_address - Validator address
     * @param {number} block_number - Block number
     * @param {number} timestamp - Detection timestamp
     */
    handle_double_signing(validator_address, block_number, timestamp) {
        const validator = this.validator_manager.get_validator(validator_address);
        if (!validator) return;

        const penalty = validator.stake * this.slash_params.double_signing_penalty;
        this.apply_slashing_penalty(validator_address, penalty, 'Double signing', block_number, timestamp);
    }

    /**
     * Handle downtime events.
     * @param {string} validator_address - Validator address
     * @param {number} block_number - Block number
     * @param {number} timestamp - Detection timestamp
     */
    handle_downtime(validator_address, block_number, timestamp) {
        const validator = this.validator_manager.get_validator(validator_address);
        if (!validator) return;

        const penalty = validator.stake * this.slash_params.downtime_penalty;
        this.apply_slashing_penalty(validator_address, penalty, 'Downtime', block_number, timestamp);
    }

    /**
     * Apply penalties for validator behavior issues.
     * @param {string} validator_address - Validator address
     * @param {number} amount - Penalty amount
     * @param {string} penalty_type - Penalty type
     */
    apply_validator_penalty(validator_address, amount, penalty_type) {
        if (!this.validator_penalties.has(validator_address)) {
            this.validator_penalties.set(validator_address, []);
        }

        const penalty = {
            penalty_type,
            amount,
            timestamp: Date.now() / 1000,
            block_number: this.blockchain.get_height()
        };

        this.validator_penalties.get(validator_address).push(penalty);
    }

    /**
     * Check and apply penalties for validator inactivity.
     * @param {number} current_block_height - Current block height
     */
    check_validator_inactivity(current_block_height) {
        const active_validators = this.validator_manager.get_active_validators();
        const inactive_validators = [];

        active_validators.forEach(validator => {
            const validator_activity = this.validator_activity.get(validator.address);
            
            if (validator_activity) {
                const activity_count = validator_activity.activity_history.slice(
                    -this.inactivity_window
                ).filter(active => active).length;
                
                const activity_ratio = activity_count / this.inactivity_window;
                
                if (activity_ratio < this.slash_params.inactivity_threshold) {
                    inactive_validators.push(validator.address);
                }
            }
        });

        inactive_validators.forEach(validator_address => {
            this.apply_validator_penalty(validator_address, this.slash_params.validator_penalty, 'Inactivity');
            this.handle_downtime(validator_address, current_block_height, Date.now() / 1000);
        });
    }

    /**
     * Apply validator penalties based on behavior score.
     * @param {string} validator_address - Validator address
     * @param {number} score - Behavior score (0-100)
     */
    apply_validator_penalty_score(validator_address, score) {
        if (!this.validator_rewards.has(validator_address)) {
            this.validator_rewards.set(validator_address, []);
        }

        if (score < 70) {
            this.apply_validator_penalty(validator_address, this.slash_params.misbehavior_penalty, 'Low performance');
        }
    }

    /**
     * Check validator behavior history and apply penalties.
     */
    check_validator_behavior() {
        const active_validators = this.validator_manager.get_active_validators();
        
        active_validators.forEach(validator => {
            const penalties = this.validator_penalties.get(validator.address) || [];
            const recent_penalties = penalties.filter(p => 
                Date.now() / 1000 - p.timestamp < 7 * 24 * 60 * 60
            );

            if (recent_penalties.length > 3) {
                this.apply_validator_penalty(validator.address, this.slash_params.validator_penalty * 2, 'Repeated infractions');
            }
        });
    }

    /**
     * Apply penalty to validator.
     * @param {string} validator_address - Validator address
     * @param {number} penalty_amount - Penalty amount
     * @param {string} reason - Penalty reason
     */
    apply_validator_penalty_amount(validator_address, penalty_amount, reason) {
        const penalty = {
            penalty_amount,
            reason,
            timestamp: Date.now() / 1000,
            block_number: this.blockchain.get_height()
        };

        if (!this.validator_penalties.has(validator_address)) {
            this.validator_penalties.set(validator_address, []);
        }

        this.validator_penalties.get(validator_address).push(penalty);
    }

    /**
     * Track validator activity.
     * @param {string} validator_address - Validator address
     * @param {number} block_number - Block number
     * @param {boolean} is_active - Activity status
     */
    track_validator_activity(validator_address, block_number, is_active) {
        if (!this.validator_activity.has(validator_address)) {
            this.validator_activity.set(validator_address, {
                validator_address,
                activity_history: [],
                last_active_block: null,
                total_blocks: 0,
                active_blocks: 0
            });
        }

        const activity = this.validator_activity.get(validator_address);
        activity.activity_history.push(is_active);
        activity.total_blocks++;
        
        if (is_active) {
            activity.active_blocks++;
            activity.last_active_block = block_number;
        }
    }

    /**
     * Get validator penalty history.
     * @param {string} validator_address - Validator address
     * @returns {Array} Penalty history
     */
    get_validator_penalties(validator_address) {
        return this.validator_penalties.get(validator_address) || [];
    }

    /**
     * Check if validator has active penalties.
     * @param {string} validator_address - Validator address
     * @param {number} block_number - Current block number
     * @param {string} penalty_type - Penalty type to check
     * @returns {boolean} Whether validator has active penalties
     */
    has_active_penalties(validator_address, block_number, penalty_type) {
        const penalties = this.validator_penalties.get(validator_address) || [];
        
        return penalties.some(penalty => {
            if (penalty_type && penalty.penalty_type !== penalty_type) {
                return false;
            }

            const penalty_age = block_number - penalty.block_number;
            
            switch (penalty.penalty_type) {
                case 'slashing':
                    return penalty_age < this.slash_params.slashing_cooldown_period;
                case 'downtime':
                    return penalty_age < this.slash_params.downtime_cooldown;
                default:
                    return true;
            }
        });
    }

    /**
     * Check if validator can be unbonded.
     * @param {string} validator_address - Validator address
     * @param {number} block_number - Current block number
     * @returns {boolean} Whether validator can be unbonded
     */
    can_unbond(validator_address, block_number) {
        const penalties = this.validator_penalties.get(validator_address) || [];
        
        const has_slashing_penalties = penalties.some(penalty => 
            penalty.penalty_type === 'slashing' && 
            (block_number - penalty.block_number) < this.unbonding_period
        );

        return !has_slashing_penalties;
    }

    /**
     * Get validator activity statistics.
     * @param {string} validator_address - Validator address
     * @returns {object} Activity statistics
     */
    get_validator_activity_statistics(validator_address) {
        const activity = this.validator_activity.get(validator_address);
        
        if (!activity) {
            return null;
        }

        const recent_activity = activity.activity_history.slice(-1000);
        const recent_active_blocks = recent_activity.filter(active => active).length;
        const activity_rate = recent_activity.length > 0 
            ? recent_active_blocks / recent_activity.length 
            : 0;

        return {
            validator_address,
            total_blocks: activity.total_blocks,
            active_blocks: activity.active_blocks,
            activity_rate,
            recent_activity_rate: activity_rate,
            last_active_block: activity.last_active_block
        };
    }

    /**
     * Get slashing statistics.
     * @returns {object} Slashing statistics
     */
    get_slashing_statistics() {
        const total_slash_amount = this.slash_events.reduce((sum, event) => sum + event.amount, 0);
        const slash_reasons = this.slash_events.reduce((acc, event) => {
            acc[event.reason] = (acc[event.reason] || 0) + 1;
            return acc;
        }, {});

        const validator_penalty_count = Array.from(this.validator_penalties.values())
            .reduce((sum, penalties) => sum + penalties.length, 0);

        return {
            total_slash_events: this.slash_events.length,
            total_slash_amount,
            average_slash_amount: this.slash_events.length > 0 
                ? total_slash_amount / this.slash_events.length 
                : 0,
            slash_reasons,
            validator_penalty_count
        };
    }

    /**
     * Reset validator penalties for a specific type.
     * @param {string} validator_address - Validator address
     * @param {string} penalty_type - Penalty type to reset
     */
    reset_validator_penalties(validator_address, penalty_type) {
        const penalties = this.validator_penalties.get(validator_address);
        
        if (!penalties) {
            return;
        }

        const filtered_penalties = penalty_type
            ? penalties.filter(penalty => penalty.penalty_type !== penalty_type)
            : [];

        this.validator_penalties.set(validator_address, filtered_penalties);
    }

    /**
     * Set slashing parameters.
     * @param {object} params - Slashing parameters (double_signing_penalty, downtime_penalty, etc.)
     */
    set_slashing_parameters(params) {
        Object.assign(this.slash_params, params);
    }

    /**
     * Get slashing configuration.
     * @returns {object} Slashing configuration
     */
    get_slashing_config() {
        return {
            slashing_params: this.slash_params,
            unbonding_period: this.unbonding_period,
            inactivity_window: this.inactivity_window,
            minimum_stake: this.minimum_stake
        };
    }
}
