/**
 * ChainForgeLedger Validator Module
 * 
 * Implements validator management functionality.
 */

export class Validator {
    /**
     * Create a new validator instance.
     * @param {string} address - Validator address
     * @param {string} public_key - Validator public key
     * @param {number} stake - Initial stake amount
     * @param {object} metadata - Validator metadata
     */
    constructor(address, public_key, stake = 0, metadata = {}) {
        this.address = address;
        this.public_key = public_key;
        this.stake = stake;
        this.status = 'pending'; // pending, active, inactive, jailed
        this.created_at = Date.now() / 1000;
        this.updated_at = Date.now() / 1000;
        this.metadata = metadata;
        this.blocks_proposed = 0;
        this.blocks_validated = 0;
        this.last_active_block = null;
        this.is_active = true;
        this.rewards = 0;
        this.penalties = 0;
        this.performance_score = 100;
        this.jailed_until = null;
    }

    /**
     * Set validator status.
     * @param {string} status - New status (pending, active, inactive, jailed)
     */
    set_status(status) {
        const valid_statuses = ['pending', 'active', 'inactive', 'jailed'];
        if (!valid_statuses.includes(status)) {
            throw new Error(`Invalid status: ${status}`);
        }
        this.status = status;
        this.updated_at = Date.now() / 1000;
    }

    /**
     * Add blocks proposed count.
     */
    add_blocks_proposed() {
        this.blocks_proposed++;
        this.updated_at = Date.now() / 1000;
    }

    /**
     * Add blocks validated count.
     */
    add_blocks_validated() {
        this.blocks_validated++;
        this.updated_at = Date.now() / 1000;
    }

    /**
     * Set last active block.
     * @param {number} block_number - Block number
     */
    set_last_active_block(block_number) {
        this.last_active_block = block_number;
        this.updated_at = Date.now() / 1000;
    }

    /**
     * Set active status.
     * @param {boolean} active - Whether validator is active
     */
    set_active(active) {
        this.is_active = active;
        this.updated_at = Date.now() / 1000;
    }

    /**
     * Add reward amount.
     * @param {number} amount - Reward amount
     */
    add_reward(amount) {
        if (amount <= 0) {
            throw new Error('Reward must be positive');
        }
        this.rewards += amount;
        this.updated_at = Date.now() / 1000;
    }

    /**
     * Add penalty amount.
     * @param {number} amount - Penalty amount
     */
    add_penalty(amount) {
        if (amount <= 0) {
            throw new Error('Penalty must be positive');
        }
        this.penalties += amount;
        this.updated_at = Date.now() / 1000;
    }

    /**
     * Set performance score.
     * @param {number} score - Performance score (0-100)
     */
    set_performance_score(score) {
        if (score < 0 || score > 100) {
            throw new Error('Performance score must be between 0 and 100');
        }
        this.performance_score = score;
        this.updated_at = Date.now() / 1000;
    }

    /**
     * Jail validator.
     * @param {number} duration - Jail duration in seconds
     */
    jail(duration) {
        this.status = 'jailed';
        this.jailed_until = Date.now() / 1000 + duration;
        this.is_active = false;
        this.updated_at = Date.now() / 1000;
    }

    /**
     * Unjail validator.
     */
    unjail() {
        this.status = 'pending';
        this.jailed_until = null;
        this.is_active = true;
        this.updated_at = Date.now() / 1000;
    }

    /**
     * Check if validator is currently jailed.
     * @returns {boolean} Whether validator is jailed
     */
    is_jailed() {
        return this.jailed_until > Date.now() / 1000;
    }

    /**
     * Get time remaining in jail.
     * @returns {number} Time remaining in seconds
     */
    get_jail_remaining() {
        if (!this.jailed_until || this.jailed_until <= Date.now() / 1000) {
            return 0;
        }
        return this.jailed_until - Date.now() / 1000;
    }

    /**
     * Get validator performance metrics.
     * @returns {object} Performance metrics
     */
    get_performance() {
        return {
            blocks_proposed: this.blocks_proposed,
            blocks_validated: this.blocks_validated,
            performance_score: this.performance_score,
            reward_ratio: this.rewards > 0 ? this.rewards / this.penalties : 0
        };
    }

    /**
     * Get validator statistics.
     * @returns {object} Validator statistics
     */
    get_statistics() {
        return {
            address: this.address,
            stake: this.stake,
            status: this.status,
            blocks_proposed: this.blocks_proposed,
            blocks_validated: this.blocks_validated,
            last_active_block: this.last_active_block,
            rewards: this.rewards,
            penalties: this.penalties,
            performance_score: this.performance_score,
            jail_remaining: this.get_jail_remaining()
        };
    }

    /**
     * Check if validator is eligible for rewards.
     * @param {number} minimum_score - Minimum performance score
     * @returns {boolean} Whether validator is eligible
     */
    is_eligible_for_rewards(minimum_score = 70) {
        return this.performance_score >= minimum_score && this.status === 'active' && !this.is_jailed();
    }

    /**
     * Convert to JSON serializable format.
     * @returns {object} JSON representation
     */
    to_json() {
        return {
            address: this.address,
            public_key: this.public_key,
            stake: this.stake,
            status: this.status,
            created_at: this.created_at,
            updated_at: this.updated_at,
            metadata: this.metadata,
            blocks_proposed: this.blocks_proposed,
            blocks_validated: this.blocks_validated,
            last_active_block: this.last_active_block,
            is_active: this.is_active,
            rewards: this.rewards,
            penalties: this.penalties,
            performance_score: this.performance_score,
            jailed_until: this.jailed_until
        };
    }
}

export class ValidatorManager {
    /**
     * Create a new validator manager instance.
     */
    constructor() {
        this.validators = new Map();
        this.active_validators = new Set();
        this.pending_validators = new Set();
        this.inactive_validators = new Set();
        this.jailed_validators = new Set();
        this.stake_threshold = 1000;
        this.min_validators = 4;
        this.max_validators = 100;
        this.validator_requirements = {
            minimum_stake: 1000,
            minimum_blocks_proposed: 100,
            minimum_performance_score: 70,
            maximum_penalties: 1000
        };
    }

    /**
     * Register a new validator.
     * @param {Validator} validator - Validator instance
     */
    register_validator(validator) {
        if (this.validators.has(validator.address)) {
            throw new Error(`Validator ${validator.address} already registered`);
        }

        this.validators.set(validator.address, validator);
        this.pending_validators.add(validator.address);
    }

    /**
     * Unregister a validator.
     * @param {string} validator_address - Validator address
     */
    unregister_validator(validator_address) {
        const validator = this.validators.get(validator_address);
        if (!validator) {
            throw new Error(`Validator ${validator_address} not found`);
        }

        this.validators.delete(validator_address);
        this._remove_from_sets(validator_address);
    }

    /**
     * Get validator by address.
     * @param {string} validator_address - Validator address
     * @returns {Validator|null} Validator instance or null if not found
     */
    get_validator(validator_address) {
        return this.validators.get(validator_address) || null;
    }

    /**
     * Get all validators.
     * @returns {Array} List of all validators
     */
    get_all_validators() {
        return Array.from(this.validators.values());
    }

    /**
     * Get active validators.
     * @returns {Array} List of active validators
     */
    get_active_validators() {
        return Array.from(this.active_validators).map(address => 
            this.validators.get(address)
        ).filter(validator => validator && !validator.is_jailed());
    }

    /**
     * Promote validator to active status.
     * @param {string} validator_address - Validator address
     */
    promote_validator(validator_address) {
        const validator = this.get_validator(validator_address);
        if (!validator) {
            throw new Error(`Validator ${validator_address} not found`);
        }

        if (validator.stake < this.validator_requirements.minimum_stake) {
            throw new Error('Validator does not meet minimum stake requirement');
        }

        this._remove_from_sets(validator_address);
        validator.set_status('active');
        validator.set_active(true);
        this.active_validators.add(validator_address);
    }

    /**
     * Demote validator to inactive status.
     * @param {string} validator_address - Validator address
     */
    demote_validator(validator_address) {
        const validator = this.get_validator(validator_address);
        if (!validator) {
            throw new Error(`Validator ${validator_address} not found`);
        }

        this._remove_from_sets(validator_address);
        validator.set_status('inactive');
        validator.set_active(false);
        this.inactive_validators.add(validator_address);
    }

    /**
     * Jail a validator.
     * @param {string} validator_address - Validator address
     * @param {number} duration - Jail duration in seconds
     */
    jail_validator(validator_address, duration) {
        const validator = this.get_validator(validator_address);
        if (!validator) {
            throw new Error(`Validator ${validator_address} not found`);
        }

        this._remove_from_sets(validator_address);
        validator.jail(duration);
        this.jailed_validators.add(validator_address);
    }

    /**
     * Unjail a validator.
     * @param {string} validator_address - Validator address
     */
    unjail_validator(validator_address) {
        const validator = this.get_validator(validator_address);
        if (!validator) {
            throw new Error(`Validator ${validator_address} not found`);
        }

        this._remove_from_sets(validator_address);
        validator.unjail();
        this.pending_validators.add(validator_address);
    }

    /**
     * Remove validator from all sets.
     * @private
     */
    _remove_from_sets(validator_address) {
        this.active_validators.delete(validator_address);
        this.pending_validators.delete(validator_address);
        this.inactive_validators.delete(validator_address);
        this.jailed_validators.delete(validator_address);
    }

    /**
     * Check validator eligibility.
     * @param {Validator} validator - Validator to check
     * @returns {object} Eligibility information
     */
    check_validator_eligibility(validator) {
        const eligibility = {
            eligible: true,
            reasons: [],
            details: {
                stake: validator.stake,
                minimum_stake: this.validator_requirements.minimum_stake,
                performance_score: validator.performance_score,
                minimum_score: this.validator_requirements.minimum_performance_score,
                blocks_proposed: validator.blocks_proposed,
                minimum_blocks: this.validator_requirements.minimum_blocks_proposed,
                penalties: validator.penalties,
                maximum_penalties: this.validator_requirements.maximum_penalties
            }
        };

        if (validator.stake < this.validator_requirements.minimum_stake) {
            eligibility.eligible = false;
            eligibility.reasons.push('Insufficient stake');
        }

        if (validator.performance_score < this.validator_requirements.minimum_performance_score) {
            eligibility.eligible = false;
            eligibility.reasons.push('Low performance score');
        }

        if (validator.blocks_proposed < this.validator_requirements.minimum_blocks_proposed) {
            eligibility.eligible = false;
            eligibility.reasons.push('Insufficient blocks proposed');
        }

        if (validator.penalties > this.validator_requirements.maximum_penalties) {
            eligibility.eligible = false;
            eligibility.reasons.push('Excessive penalties');
        }

        return eligibility;
    }

    /**
     * Update validator information.
     * @param {string} validator_address - Validator address
     * @param {object} updates - Fields to update
     */
    update_validator(validator_address, updates) {
        const validator = this.get_validator(validator_address);
        if (!validator) {
            throw new Error(`Validator ${validator_address} not found`);
        }

        if (updates.stake !== undefined) {
            validator.stake = updates.stake;
        }

        if (updates.metadata !== undefined) {
            validator.metadata = { ...validator.metadata, ...updates.metadata };
        }

        validator.updated_at = Date.now() / 1000;
    }

    /**
     * Track validator activity.
     * @param {string} validator_address - Validator address
     * @param {number} block_number - Block number
     * @param {boolean} is_active - Activity status
     */
    track_activity(validator_address, block_number, is_active) {
        const validator = this.get_validator(validator_address);
        if (!validator) {
            throw new Error(`Validator ${validator_address} not found`);
        }

        validator.set_last_active_block(block_number);
        validator.set_active(is_active);
    }

    /**
     * Update validator performance.
     * @param {string} validator_address - Validator address
     * @param {object} performance - Performance metrics
     */
    update_performance(validator_address, performance) {
        const validator = this.get_validator(validator_address);
        if (!validator) {
            throw new Error(`Validator ${validator_address} not found`);
        }

        if (performance.blocks_proposed) {
            validator.add_blocks_proposed();
        }

        if (performance.blocks_validated) {
            validator.add_blocks_validated();
        }

        if (performance.performance_score !== undefined) {
            validator.set_performance_score(performance.performance_score);
        }
    }

    /**
     * Distribute rewards to active validators.
     * @param {number} total_reward - Total reward amount
     * @returns {Array} Reward distribution
     */
    distribute_rewards(total_reward) {
        const active_validators = this.get_active_validators();
        const total_stake = active_validators.reduce((sum, validator) => sum + validator.stake, 0);
        const rewards = [];

        active_validators.forEach(validator => {
            if (validator.is_eligible_for_rewards()) {
                const reward = total_reward * (validator.stake / total_stake);
                validator.add_reward(reward);
                rewards.push({
                    validator_address: validator.address,
                    reward,
                    stake: validator.stake,
                    timestamp: Date.now() / 1000
                });
            }
        });

        return rewards;
    }

    /**
     * Apply penalty to validator.
     * @param {string} validator_address - Validator address
     * @param {number} penalty - Penalty amount
     */
    apply_penalty(validator_address, penalty) {
        const validator = this.get_validator(validator_address);
        if (!validator) {
            throw new Error(`Validator ${validator_address} not found`);
        }

        validator.add_penalty(penalty);

        if (validator.penalties > this.validator_requirements.maximum_penalties) {
            this.jail_validator(validator_address, 86400); // Jail for 24 hours
        }
    }

    /**
     * Calculate validator rankings.
     * @returns {Array} Ranked validators
     */
    get_validator_rankings() {
        const validators = this.get_all_validators();
        
        return validators.sort((a, b) => {
            if (a.performance_score !== b.performance_score) {
                return b.performance_score - a.performance_score;
            }
            return b.stake - a.stake;
        });
    }

    /**
     * Get validator statistics.
     * @returns {object} Validator manager statistics
     */
    get_statistics() {
        const total_validators = this.get_all_validators().length;
        const active = this.get_active_validators().length;
        const pending = this.pending_validators.size;
        const inactive = this.inactive_validators.size;
        const jailed = this.jailed_validators.size;

        return {
            total_validators,
            active_validators: active,
            pending_validators: pending,
            inactive_validators: inactive,
            jailed_validators: jailed,
            stake_threshold: this.stake_threshold,
            min_validators: this.min_validators,
            max_validators: this.max_validators,
            validator_requirements: this.validator_requirements
        };
    }
}
