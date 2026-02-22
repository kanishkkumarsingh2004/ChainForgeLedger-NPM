/**
 * ChainForgeLedger Fee Distribution System
 * 
 * Implements fee distribution to validators, treasury, and other stakeholders.
 */

export class FeeDistributionSystem {
    static DEFAULT_DISTRIBUTION = {
        'validators': 0.7,    // 70% to validators
        'treasury': 0.2,      // 20% to treasury
        'development': 0.1,   // 10% to development fund
        'community': 0.0      // 0% to community fund (can be activated)
    };

    /**
     * Fee distribution system for blockchain transaction fees.
     * 
     * @param {TreasuryManager} treasury - Treasury manager
     * @param {number} minimum_distribution_amount - Minimum fee amount to trigger distribution
     * @param {number} distribution_interval - Fee distribution interval in seconds
     */
    constructor(treasury, minimum_distribution_amount = 100, distribution_interval = 86400) {
        this.fee_distribution = { ...FeeDistributionSystem.DEFAULT_DISTRIBUTION };
        this.accumulated_fees = Object.keys(this.fee_distribution).reduce((acc, category) => {
            acc[category] = 0;
            return acc;
        }, {});
        this.distribution_history = [];
        this.validator_rewards = {};
        this.treasury_manager = treasury;
        this.minimum_distribution_amount = minimum_distribution_amount;
        this.distribution_interval = distribution_interval;
        this.last_distribution_time = Date.now() / 1000;
    }

    collect_transaction_fee(fee_amount, validator_address = null) {
        if (fee_amount <= 0) {
            return false;
        }

        for (const [category, percentage] of Object.entries(this.fee_distribution)) {
            const fee_part = Math.floor(fee_amount * percentage);
            this.accumulated_fees[category] += fee_part;

            if (category === 'validators' && validator_address) {
                if (!this.validator_rewards[validator_address]) {
                    this.validator_rewards[validator_address] = 0;
                }
                this.validator_rewards[validator_address] += fee_part;
            }
        }

        return true;
    }

    distribute_fees(force_distribution = false) {
        const total_fees = Object.values(this.accumulated_fees).reduce((sum, fee) => sum + fee, 0);

        if (!force_distribution) {
            if (total_fees < this.minimum_distribution_amount) {
                return { success: false, reason: 'Insufficient fee amount' };
            }

            const time_since_distribution = (Date.now() / 1000) - this.last_distribution_time;
            if (time_since_distribution < this.distribution_interval) {
                return { success: false, reason: 'Distribution interval not reached' };
            }
        }

        const distribution = Object.keys(this.accumulated_fees).reduce((acc, category) => {
            acc[category] = Math.floor(this.accumulated_fees[category]);
            return acc;
        }, {});

        this._distribute_to_treasury(distribution.treasury || 0);
        this._distribute_to_development_fund(distribution.development || 0);
        this._distribute_to_community_fund(distribution.community || 0);
        this._distribute_to_validators(distribution.validators || 0);

        const distribution_record = {
            timestamp: Date.now() / 1000,
            total_amount: total_fees,
            distribution,
            validator_rewards: { ...this.validator_rewards },
            method: force_distribution ? 'manual' : 'auto'
        };

        this.distribution_history.push(distribution_record);

        this.accumulated_fees = Object.keys(this.fee_distribution).reduce((acc, category) => {
            acc[category] = 0;
            return acc;
        }, {});
        this.validator_rewards = {};
        this.last_distribution_time = Date.now() / 1000;

        return {
            success: true,
            total_amount: total_fees,
            distribution,
            timestamp: distribution_record.timestamp
        };
    }

    _distribute_to_treasury(amount) {
        if (amount > 0) {
            this.treasury_manager.add_balance(amount);
        }
    }

    _distribute_to_development_fund(amount) {
        // This would implement development fund logic
    }

    _distribute_to_community_fund(amount) {
        // This would implement community fund logic
    }

    _distribute_to_validators(amount) {
        // In a real implementation, this would distribute based on validator performance
        // For now, we'll just track the total validator fees
    }

    get_fee_distribution_info() {
        const total_fees = Object.values(this.accumulated_fees).reduce((sum, fee) => sum + fee, 0);
        const time_since_distribution = (Date.now() / 1000) - this.last_distribution_time;
        const time_remaining = Math.max(0, this.distribution_interval - time_since_distribution);

        return {
            total_fees,
            minimum_distribution_amount: this.minimum_distribution_amount,
            time_since_distribution,
            time_remaining,
            distribution_interval: this.distribution_interval,
            distribution_percentages: this.fee_distribution,
            accumulated_fees: { ...this.accumulated_fees },
            validator_rewards: { ...this.validator_rewards }
        };
    }

    get_distribution_history(start_time = null, end_time = null, limit = 50) {
        let history = [...this.distribution_history];

        if (start_time) {
            history = history.filter(d => d.timestamp >= start_time);
        }

        if (end_time) {
            history = history.filter(d => d.timestamp <= end_time);
        }

        history = history.sort((a, b) => b.timestamp - a.timestamp);

        return history.slice(0, limit);
    }

    get_distribution_stats() {
        if (!this.distribution_history.length) {
            return {
                total_distributions: 0,
                total_fees_distributed: 0,
                avg_distribution_amount: 0,
                avg_time_between_distributions: 0
            };
        }

        const total_fees = this.distribution_history.reduce((sum, d) => sum + d.total_amount, 0);
        const avg_amount = total_fees / this.distribution_history.length;

        const time_between_distributions = [];
        for (let i = 1; i < this.distribution_history.length; i++) {
            const time_between = this.distribution_history[i].timestamp - this.distribution_history[i - 1].timestamp;
            time_between_distributions.push(time_between);
        }

        const avg_time_between = time_between_distributions.length > 0 
            ? time_between_distributions.reduce((sum, t) => sum + t, 0) / time_between_distributions.length 
            : 0;

        const distribution_counts = Object.keys(this.fee_distribution).reduce((acc, category) => {
            acc[category] = this.distribution_history.reduce((sum, d) => sum + d.distribution[category], 0);
            return acc;
        }, {});

        return {
            total_distributions: this.distribution_history.length,
            total_fees_distributed: total_fees,
            avg_distribution_amount: avg_amount,
            avg_time_between_distributions: avg_time_between,
            category_distribution: distribution_counts,
            method_distribution: {
                auto: this.distribution_history.filter(d => d.method === 'auto').length,
                manual: this.distribution_history.filter(d => d.method === 'manual').length
            }
        };
    }

    set_fee_distribution(distribution) {
        const total_percentage = Object.values(distribution).reduce((sum, percentage) => sum + percentage, 0);

        if (total_percentage < 0.99 || total_percentage > 1.01) {
            throw new Error("Total fee distribution must sum to approximately 100%");
        }

        for (const [category, percentage] of Object.entries(distribution)) {
            if (!Object.keys(this.fee_distribution).includes(category)) {
                throw new Error(`Unknown category: ${category}`);
            }

            if (percentage < 0 || percentage > 1) {
                throw new Error("Percentage must be between 0 and 1");
            }
        }

        Object.assign(this.fee_distribution, distribution);
    }

    set_minimum_distribution_amount(amount) {
        if (amount <= 0) {
            throw new Error("Minimum distribution amount must be positive");
        }

        this.minimum_distribution_amount = amount;
    }

    set_distribution_interval(interval) {
        if (interval <= 0) {
            throw new Error("Distribution interval must be positive");
        }

        this.distribution_interval = interval;
    }

    get_validator_rewards(validator_address = null) {
        if (validator_address) {
            if (!this.validator_rewards[validator_address]) {
                return { validator_address, reward: 0 };
            }

            return {
                validator_address,
                reward: this.validator_rewards[validator_address]
            };
        } else {
            return {
                validators: Object.keys(this.validator_rewards).map(address => ({
                    validator_address: address,
                    reward: this.validator_rewards[address]
                })),
                total_rewards: Object.values(this.validator_rewards).reduce((sum, reward) => sum + reward, 0)
            };
        }
    }

    get_stakeholder_distribution() {
        return Object.keys(this.fee_distribution).reduce((acc, category) => {
            acc[category] = {
                percentage: this.fee_distribution[category] * 100,
                accumulated_amount: this.accumulated_fees[category]
            };
            return acc;
        }, {});
    }

    get_fee_collection_stats() {
        const current_period_fees = Object.values(this.accumulated_fees).reduce((sum, fee) => sum + fee, 0);

        let avg_fees_per_period = 0;
        if (this.distribution_history.length) {
            const previous_periods = this.distribution_history.slice(-7);
            avg_fees_per_period = previous_periods.reduce((sum, d) => sum + d.total_amount, 0) / previous_periods.length;
        }

        const time_since_distribution = (Date.now() / 1000) - this.last_distribution_time;
        const fees_per_second = time_since_distribution > 0 ? current_period_fees / time_since_distribution : 0;
        const estimated_fees = fees_per_second * this.distribution_interval;

        return {
            current_period_fees,
            avg_fees_per_period,
            time_since_distribution,
            fees_per_second,
            estimated_period_fees
        };
    }

    toString() {
        const info = this.get_fee_distribution_info();
        const stats = this.get_distribution_stats();
        const stakeholder_dist = this.get_stakeholder_distribution();

        const distribution_str = Object.keys(this.fee_distribution).map(category => 
            `  ${category}: ${info.accumulated_fees[category]} (${stakeholder_dist[category].percentage.toFixed(1)}%)`
        ).join('\n');

        return (
            `Fee Distribution System\n` +
            `======================\n` +
            `Total Fees: ${info.total_fees}\n` +
            `Minimum Distribution: ${info.minimum_distribution_amount}\n` +
            `Distribution Interval: ${info.distribution_interval} seconds\n` +
            `Time Since Last Distribution: ${info.time_since_distribution.toFixed(0)} sec\n` +
            `Time Remaining: ${info.time_remaining.toFixed(0)} sec\n` +
            `\nStakeholder Distribution:\n` +
            `${distribution_str}\n` +
            `\nStatistics:\n` +
            `Total Distributions: ${stats.total_distributions}\n` +
            `Total Fees Distributed: ${stats.total_fees_distributed}\n` +
            `Average Distribution Amount: ${stats.avg_distribution_amount.toFixed(2)}\n` +
            `Average Time Between Distributions: ${stats.avg_time_between_distributions.toFixed(0)} sec`
        );
    }
}
