/**
 * ChainForgeLedger Staking Module
 * 
 * Implements staking and unstaking functionality.
 */

export class StakingManager {
    /**
     * Create a new staking manager instance.
     */
    constructor() {
        this.stakes = new Map();
        this.unstaking_requests = [];
        this.delegations = new Map();
        this.validator_registry = new Map();
        this.total_staked = 0;
        this.unstaking_period = 14 * 24 * 60 * 60; // 14 days
        this.minimum_stake = 1000;
        this.validator_requirement = 10000;
    }

    /**
     * Stake tokens to become a validator.
     * @param {string} validator_address - Validator address
     * @param {number} amount - Amount to stake
     * @param {string} from_address - Staker address
     */
    stake(validator_address, amount, from_address) {
        if (amount < this.minimum_stake) {
            throw new Error(`Minimum stake requirement not met: ${this.minimum_stake} tokens`);
        }

        if (!this.stakes.has(validator_address)) {
            this.stakes.set(validator_address, {
                validator_address,
                staking_address: from_address,
                staked_amount: 0,
                rewards: 0,
                unstaking_requests: []
            });
        }

        const stake_info = this.stakes.get(validator_address);
        stake_info.staked_amount += amount;
        this.total_staked += amount;

        if (stake_info.staked_amount >= this.validator_requirement) {
            this._register_validator(validator_address);
        }

        return stake_info;
    }

    /**
     * Unstake tokens.
     * @param {string} validator_address - Validator address
     * @param {number} amount - Amount to unstake
     * @param {string} from_address - Staker address
     */
    unstake(validator_address, amount, from_address) {
        const stake_info = this.stakes.get(validator_address);

        if (!stake_info) {
            throw new Error(`No stake found for validator ${validator_address}`);
        }

        if (stake_info.staked_amount < amount) {
            throw new Error(`Insufficient staked amount: ${stake_info.staked_amount}`);
        }

        const unstaking_request = {
            validator_address,
            staking_address: from_address,
            amount,
            unstaking_time: Date.now() / 1000,
            completed: false,
            withdrawal_address: from_address
        };

        this.unstaking_requests.push(unstaking_request);
        stake_info.unstaking_requests.push(unstaking_request);

        stake_info.staked_amount -= amount;
        this.total_staked -= amount;

        if (stake_info.staked_amount < this.validator_requirement) {
            this._unregister_validator(validator_address);
        }

        return unstaking_request;
    }

    /**
     * Process unstaking requests that have completed their period.
     */
    process_unstaking_requests() {
        const current_time = Date.now() / 1000;

        for (let i = this.unstaking_requests.length - 1; i >= 0; i--) {
            const request = this.unstaking_requests[i];

            if (!request.completed && current_time - request.unstaking_time >= this.unstaking_period) {
                request.completed = true;
                const stake_info = this.stakes.get(request.validator_address);
                if (stake_info) {
                    const request_index = stake_info.unstaking_requests.findIndex(r => r === request);
                    if (request_index !== -1) {
                        stake_info.unstaking_requests.splice(request_index, 1);
                    }
                }
            }
        }
    }

    /**
     * Delegate tokens to a validator.
     * @param {string} validator_address - Validator address
     * @param {string} delegator_address - Delegator address
     * @param {number} amount - Amount to delegate
     */
    delegate(validator_address, delegator_address, amount) {
        if (amount < this.minimum_stake) {
            throw new Error(`Minimum delegation requirement not met: ${this.minimum_stake} tokens`);
        }

        if (!this.validator_registry.has(validator_address)) {
            throw new Error(`Validator ${validator_address} not registered`);
        }

        if (!this.delegations.has(validator_address)) {
            this.delegations.set(validator_address, new Map());
        }

        const validator_delegations = this.delegations.get(validator_address);

        if (!validator_delegations.has(delegator_address)) {
            validator_delegations.set(delegator_address, {
                validator_address,
                delegator_address,
                amount: 0,
                rewards: 0,
                delegate_time: Date.now() / 1000
            });
        }

        const delegation = validator_delegations.get(delegator_address);
        delegation.amount += amount;
        delegation.delegate_time = Date.now() / 1000;

        if (!this.stakes.has(validator_address)) {
            this.stakes.set(validator_address, {
                validator_address,
                staking_address: validator_address,
                staked_amount: 0,
                rewards: 0,
                unstaking_requests: []
            });
        }

        const stake_info = this.stakes.get(validator_address);
        stake_info.staked_amount += amount;
        this.total_staked += amount;

        return delegation;
    }

    /**
     * Undelegate tokens from a validator.
     * @param {string} validator_address - Validator address
     * @param {string} delegator_address - Delegator address
     * @param {number} amount - Amount to undelegate
     */
    undelegate(validator_address, delegator_address, amount) {
        if (!this.delegations.has(validator_address)) {
            throw new Error(`No delegations found for validator ${validator_address}`);
        }

        const validator_delegations = this.delegations.get(validator_address);

        if (!validator_delegations.has(delegator_address)) {
            throw new Error(`No delegation found for ${delegator_address}`);
        }

        const delegation = validator_delegations.get(delegator_address);

        if (delegation.amount < amount) {
            throw new Error(`Insufficient delegation amount: ${delegation.amount}`);
        }

        delegation.amount -= amount;
        this.total_staked -= amount;

        const stake_info = this.stakes.get(validator_address);
        if (stake_info) {
            stake_info.staked_amount -= amount;
        }

        if (delegation.amount === 0) {
            validator_delegations.delete(delegator_address);
            if (validator_delegations.size === 0) {
                this.delegations.delete(validator_address);
            }
        }

        return delegation;
    }

    /**
     * Get stake information for a validator.
     * @param {string} validator_address - Validator address
     * @returns {object} Stake information
     */
    get_stake_info(validator_address) {
        return this.stakes.get(validator_address);
    }

    /**
     * Get delegation information for a validator and delegator.
     * @param {string} validator_address - Validator address
     * @param {string} delegator_address - Delegator address
     * @returns {object} Delegation information
     */
    get_delegation_info(validator_address, delegator_address) {
        if (!this.delegations.has(validator_address)) {
            return null;
        }

        return this.delegations.get(validator_address).get(delegator_address);
    }

    /**
     * Get all active validators.
     * @returns {Array} List of validators
     */
    get_validators() {
        return Array.from(this.validator_registry.values());
    }

    /**
     * Get all active delegations.
     * @returns {Array} List of all delegations
     */
    get_all_delegations() {
        const all_delegations = [];
        for (const [validator_address, delegations] of this.delegations.entries()) {
            for (const [delegator_address, delegation] of delegations.entries()) {
                all_delegations.push(delegation);
            }
        }
        return all_delegations;
    }

    /**
     * Distribute staking rewards to validators and delegators.
     * @param {number} reward_amount - Total reward amount
     * @param {string} validator_address - Optional validator address to reward
     */
    distribute_rewards(reward_amount, validator_address = null) {
        const validators_to_reward = validator_address 
            ? [validator_address] 
            : this.get_validators().map(v => v.validator_address);

        const total_stake = this._calculate_total_reward_stake(validators_to_reward);
        const reward_per_token = total_stake > 0 ? reward_amount / total_stake : 0;

        for (const validator of validators_to_reward) {
            const stake_info = this.stakes.get(validator);
            if (stake_info) {
                const validator_reward = stake_info.staked_amount * reward_per_token;
                stake_info.rewards += validator_reward;

                if (this.delegations.has(validator)) {
                    for (const [delegator_address, delegation] of this.delegations.get(validator).entries()) {
                        const delegation_reward = delegation.amount * reward_per_token;
                        delegation.rewards += delegation_reward;
                    }
                }
            }
        }
    }

    /**
     * Calculate total staked amount eligible for rewards.
     * @param {Array} validators - List of validator addresses to include
     * @returns {number} Total eligible stake
     */
    _calculate_total_reward_stake(validators) {
        let total = 0;
        for (const validator of validators) {
            const stake_info = this.stakes.get(validator);
            if (stake_info) {
                total += stake_info.staked_amount;
            }
        }
        return total;
    }

    /**
     * Register a validator in the registry.
     * @param {string} validator_address - Validator address
     */
    _register_validator(validator_address) {
        if (!this.validator_registry.has(validator_address)) {
            this.validator_registry.set(validator_address, {
                validator_address,
                status: 'active',
                staked_amount: this.stakes.get(validator_address).staked_amount,
                registration_time: Date.now() / 1000
            });
        }
    }

    /**
     * Unregister a validator from the registry.
     * @param {string} validator_address - Validator address
     */
    _unregister_validator(validator_address) {
        if (this.validator_registry.has(validator_address)) {
            this.validator_registry.delete(validator_address);
        }
    }

    /**
     * Get staking statistics.
     * @returns {object} Staking statistics
     */
    get_statistics() {
        const validators = this.get_validators();
        const delegations = this.get_all_delegations();
        const unstaking_count = this.unstaking_requests.filter(r => !r.completed).length;
        const completed_unstaking = this.unstaking_requests.filter(r => r.completed).length;

        return {
            total_staked: this.total_staked,
            validator_count: validators.length,
            delegation_count: delegations.length,
            delegator_count: new Set(delegations.map(d => d.delegator_address)).size,
            unstaking_requests: unstaking_count,
            completed_unstaking_requests: completed_unstaking,
            total_staking_amount: this.total_staked,
            average_stake_per_validator: validators.length > 0 
                ? this.total_staked / validators.length 
                : 0,
            average_delegation_per_delegator: delegations.length > 0
                ? delegations.reduce((sum, d) => sum + d.amount, 0) / delegations.length
                : 0
        };
    }

    /**
     * Get total rewards for a validator.
     * @param {string} validator_address - Validator address
     * @returns {number} Total rewards
     */
    get_validator_total_rewards(validator_address) {
        const stake_info = this.stakes.get(validator_address);
        if (!stake_info) {
            return 0;
        }

        let total_rewards = stake_info.rewards;

        if (this.delegations.has(validator_address)) {
            for (const [delegator_address, delegation] of this.delegations.get(validator_address).entries()) {
                total_rewards += delegation.rewards;
            }
        }

        return total_rewards;
    }

    /**
     * Set unstaking period.
     * @param {number} period - Unstaking period in seconds
     */
    set_unstaking_period(period) {
        if (period <= 0) {
            throw new Error("Unstaking period must be positive");
        }
        this.unstaking_period = period;
    }

    /**
     * Set minimum stake requirement.
     * @param {number} amount - Minimum stake amount
     */
    set_minimum_stake(amount) {
        if (amount <= 0) {
            throw new Error("Minimum stake must be positive");
        }
        this.minimum_stake = amount;
    }

    /**
     * Set validator requirement.
     * @param {number} amount - Validator requirement amount
     */
    set_validator_requirement(amount) {
        if (amount <= 0) {
            throw new Error("Validator requirement must be positive");
        }
        this.validator_requirement = amount;
    }
}
