/**
 * ChainForgeLedger Tokenomics Module - Supply Management
 * 
 * Implements token supply management and distribution mechanisms.
 */

export class SupplyManager {
    /**
     * Create a new supply manager instance.
     * @param {object} config - Supply management configuration
     */
    constructor(config = {}) {
        this.max_supply = config.max_supply || 0;
        this.annual_inflation_rate = config.annual_inflation_rate || 0;
        this.initial_distribution = config.initial_distribution || {
            core_team: 0,
            foundation: 0,
            community: 0,
            operational: 0,
            marketing: 0,
            liquidity_pool: 0,
            staking: 0,
            development: 0,
            other: 0
        };
        this.distribution_lockup_periods = config.distribution_lockup_periods || [];
        this.distribution_lockups = config.distribution_lockups || {};
        this.tokenomics = null;
        this.treasury = null;
        this.liquidity_pool = null;
        this.staking = null;
        this.governance = null;
    }

    /**
     * Get supply management data.
     * @returns {object} Supply management data
     */
    get_supply_data() {
        return {
            max_supply: this.max_supply,
            annual_inflation_rate: this.annual_inflation_rate,
            initial_distribution: this.initial_distribution,
            distribution_lockup_periods: this.distribution_lockup_periods,
            distribution_lockups: this.distribution_lockups
        };
    }

    /**
     * Calculate annual inflation.
     * @param {number} current_supply - Current token supply
     * @param {number} inflation_rate - Annual inflation rate (optional, uses config if not provided)
     * @returns {number} Annual inflation amount
     */
    calculate_annual_inflation(current_supply, inflation_rate = null) {
        const rate = inflation_rate !== null ? inflation_rate : this.annual_inflation_rate;
        return current_supply * rate;
    }

    /**
     * Calculate monthly inflation.
     * @param {number} current_supply - Current token supply
     * @param {number} inflation_rate - Annual inflation rate (optional)
     * @returns {number} Monthly inflation amount
     */
    calculate_monthly_inflation(current_supply, inflation_rate = null) {
        const annual_inflation = this.calculate_annual_inflation(current_supply, inflation_rate);
        return annual_inflation / 12;
    }

    /**
     * Calculate daily inflation.
     * @param {number} current_supply - Current token supply
     * @param {number} inflation_rate - Annual inflation rate (optional)
     * @returns {number} Daily inflation amount
     */
    calculate_daily_inflation(current_supply, inflation_rate = null) {
        const annual_inflation = this.calculate_annual_inflation(current_supply, inflation_rate);
        return annual_inflation / 365;
    }

    /**
     * Calculate token distribution.
     * @param {number} total_supply - Total token supply
     * @returns {object} Token distribution by category
     */
    calculate_token_distribution(total_supply) {
        const distribution = Object.keys(this.initial_distribution).reduce((result, category) => {
            result[category] = total_supply * this.initial_distribution[category];
            return result;
        }, {});

        return {
            distribution,
            percentages: this.initial_distribution
        };
    }

    /**
     * Calculate distribution lockup.
     * @param {string} category - Distribution category
     * @param {number} amount - Token amount
     * @param {number} block_number - Current block number
     * @returns {object} Lockup status
     */
    calculate_distribution_lockup(category, amount, block_number) {
        const lockup = this.distribution_lockups[category];
        
        if (!lockup) {
            return {
                locked: false,
                unlock_block: null,
                remaining_blocks: 0,
                release_amount: amount
            };
        }

        if (block_number < lockup.start_block) {
            return {
                locked: true,
                unlock_block: lockup.start_block,
                remaining_blocks: lockup.start_block - block_number,
                release_amount: 0
            };
        }

        if (block_number >= lockup.end_block) {
            return {
                locked: false,
                unlock_block: null,
                remaining_blocks: 0,
                release_amount: amount
            };
        }

        const elapsed_blocks = block_number - lockup.start_block;
        const total_lockup_blocks = lockup.end_block - lockup.start_block;
        const release_percentage = Math.min(elapsed_blocks / total_lockup_blocks, 1);
        
        return {
            locked: true,
            unlock_block: lockup.end_block,
            remaining_blocks: lockup.end_block - block_number,
            release_amount: amount * release_percentage
        };
    }

    /**
     * Calculate total locked tokens.
     * @param {number} total_supply - Total token supply
     * @param {number} block_number - Current block number
     * @returns {object} Locked tokens information
     */
    calculate_total_locked_tokens(total_supply, block_number) {
        const distribution = this.calculate_token_distribution(total_supply);
        const locked_tokens = Object.keys(distribution.distribution).reduce((result, category) => {
            const lockup = this.calculate_distribution_lockup(category, distribution.distribution[category], block_number);
            result.locked += distribution.distribution[category] - lockup.release_amount;
            result.available += lockup.release_amount;
            result.by_category[category] = {
                total: distribution.distribution[category],
                available: lockup.release_amount,
                locked: distribution.distribution[category] - lockup.release_amount,
                lockup
            };
            return result;
        }, {
            total: total_supply,
            locked: 0,
            available: 0,
            by_category: {}
        });

        return locked_tokens;
    }

    /**
     * Calculate inflationary supply.
     * @param {number} current_supply - Current token supply
     * @param {number} blocks_to_mine - Number of blocks to mine
     * @param {number} blocks_per_year - Blocks per year (optional, defaults to 525600)
     * @param {number} inflation_rate - Annual inflation rate (optional)
     * @returns {number} Inflationary supply
     */
    calculate_inflationary_supply(current_supply, blocks_to_mine, blocks_per_year = 525600, inflation_rate = null) {
        const rate = inflation_rate !== null ? inflation_rate : this.annual_inflation_rate;
        const inflation_per_block = (current_supply * rate) / blocks_per_year;
        return current_supply + (blocks_to_mine * inflation_per_block);
    }

    /**
     * Calculate token release schedule.
     * @param {number} total_supply - Total token supply
     * @param {number} start_block - Start block
     * @param {number} blocks_per_year - Blocks per year
     * @returns {Array} Token release schedule
     */
    calculate_token_release_schedule(total_supply, start_block, blocks_per_year) {
        const schedule = [];
        const distribution = this.calculate_token_distribution(total_supply);
        
        Object.keys(distribution.distribution).forEach(category => {
            const lockup = this.distribution_lockups[category];
            
            if (lockup) {
                const release_periods = Math.ceil((lockup.end_block - lockup.start_block) / blocks_per_year);
                
                for (let i = 0; i < release_periods; i++) {
                    const period_start = lockup.start_block + (i * blocks_per_year);
                    const period_end = Math.min(period_start + blocks_per_year, lockup.end_block);
                    const period_mid = Math.floor((period_start + period_end) / 2);
                    
                    const period_lockup = this.calculate_distribution_lockup(category, distribution.distribution[category], period_mid);
                    
                    schedule.push({
                        category,
                        period: i + 1,
                        start_block: period_start,
                        end_block: period_end,
                        estimated_release_block: period_mid,
                        total: distribution.distribution[category],
                        available: period_lockup.release_amount,
                        locked: distribution.distribution[category] - period_lockup.release_amount,
                        unlock_block: lockup.end_block,
                        remaining_blocks: Math.max(0, lockup.end_block - period_mid)
                    });
                }
            } else {
                schedule.push({
                    category,
                    period: 1,
                    start_block: start_block,
                    end_block: start_block + blocks_per_year,
                    estimated_release_block: start_block,
                    total: distribution.distribution[category],
                    available: distribution.distribution[category],
                    locked: 0,
                    unlock_block: null,
                    remaining_blocks: 0
                });
            }
        });

        return schedule;
    }

    /**
     * Set max token supply.
     * @param {number} supply - Maximum token supply
     */
    set_max_supply(supply) {
        this.max_supply = supply;
    }

    /**
     * Set annual inflation rate.
     * @param {number} rate - Annual inflation rate (between 0 and 1)
     */
    set_annual_inflation_rate(rate) {
        this.annual_inflation_rate = Math.max(0, Math.min(1, rate));
    }

    /**
     * Set initial distribution.
     * @param {object} distribution - Initial distribution percentages by category
     */
    set_initial_distribution(distribution) {
        const total = Object.values(distribution).reduce((sum, value) => sum + value, 0);
        
        if (Math.abs(total - 1) > 0.01) {
            throw new Error('Distribution percentages must sum to 1');
        }
        
        this.initial_distribution = distribution;
    }

    /**
     * Set distribution lockup.
     * @param {string} category - Distribution category
     * @param {number} start_block - Lockup start block
     * @param {number} end_block - Lockup end block
     */
    set_distribution_lockup(category, start_block, end_block) {
        this.distribution_lockups[category] = {
            start_block,
            end_block
        };
        
        if (!this.distribution_lockup_periods.includes(category)) {
            this.distribution_lockup_periods.push(category);
        }
    }

    /**
     * Calculate available supply.
     * @param {number} total_supply - Total token supply
     * @param {number} block_number - Current block number
     * @returns {number} Available token supply
     */
    calculate_available_supply(total_supply, block_number) {
        const locked_tokens = this.calculate_total_locked_tokens(total_supply, block_number);
        return locked_tokens.available;
    }

    /**
     * Calculate remaining supply to be released.
     * @param {number} total_supply - Total token supply
     * @param {number} block_number - Current block number
     * @returns {number} Remaining supply to be released
     */
    calculate_remaining_supply_to_release(total_supply, block_number) {
        const locked_tokens = this.calculate_total_locked_tokens(total_supply, block_number);
        return locked_tokens.locked;
    }

    /**
     * Calculate inflation rate.
     * @param {number} current_supply - Current token supply
     * @param {number} target_supply - Target token supply
     * @param {number} years - Number of years
     * @returns {number} Inflation rate per year
     */
    calculate_inflation_rate(current_supply, target_supply, years) {
        return Math.pow(target_supply / current_supply, 1 / years) - 1;
    }

    /**
     * Calculate supply at time.
     * @param {number} current_supply - Current token supply
     * @param {number} inflation_rate - Annual inflation rate
     * @param {number} years - Number of years
     * @returns {number} Supply after given years
     */
    calculate_supply_at_time(current_supply, inflation_rate, years) {
        return current_supply * Math.pow(1 + inflation_rate, years);
    }

    /**
     * Set tokenomics reference.
     * @param {object} tokenomics - Tokenomics instance
     */
    set_tokenomics(tokenomics) {
        this.tokenomics = tokenomics;
    }

    /**
     * Set treasury reference.
     * @param {object} treasury - Treasury instance
     */
    set_treasury(treasury) {
        this.treasury = treasury;
    }

    /**
     * Set liquidity pool reference.
     * @param {object} liquidity_pool - Liquidity pool instance
     */
    set_liquidity_pool(liquidity_pool) {
        this.liquidity_pool = liquidity_pool;
    }

    /**
     * Set staking reference.
     * @param {object} staking - Staking instance
     */
    set_staking(staking) {
        this.staking = staking;
    }

    /**
     * Set governance reference.
     * @param {object} governance - Governance instance
     */
    set_governance(governance) {
        this.governance = governance;
    }

    /**
     * Get supply statistics.
     * @param {number} total_supply - Total token supply
     * @param {number} block_number - Current block number
     * @returns {object} Supply statistics
     */
    get_supply_statistics(total_supply, block_number) {
        const locked_tokens = this.calculate_total_locked_tokens(total_supply, block_number);
        const inflation = this.calculate_annual_inflation(total_supply);
        const monthly_inflation = this.calculate_monthly_inflation(total_supply);
        const daily_inflation = this.calculate_daily_inflation(total_supply);
        
        return {
            total_supply,
            max_supply: this.max_supply,
            available_supply: locked_tokens.available,
            locked_supply: locked_tokens.locked,
            annual_inflation: inflation,
            monthly_inflation: monthly_inflation,
            daily_inflation: daily_inflation,
            inflation_rate: this.annual_inflation_rate,
            distribution: locked_tokens.by_category,
            lockup_periods: this.distribution_lockup_periods
        };
    }

    /**
     * Calculate distribution details.
     * @param {number} total_supply - Total token supply
     * @param {number} block_number - Current block number
     * @returns {object} Distribution details
     */
    calculate_distribution_details(total_supply, block_number) {
        const distribution = this.calculate_token_distribution(total_supply);
        const details = Object.keys(distribution.distribution).reduce((result, category) => {
            const lockup = this.calculate_distribution_lockup(category, distribution.distribution[category], block_number);
            
            result[category] = {
                amount: distribution.distribution[category],
                percentage: this.initial_distribution[category] * 100,
                available: lockup.release_amount,
                locked: distribution.distribution[category] - lockup.release_amount,
                lockup: lockup
            };
            
            return result;
        }, {});

        return details;
    }
}

export class TokenSupplyTracker {
    /**
     * Create a new token supply tracker instance.
     * @param {SupplyManager} supply_manager - Supply manager instance
     */
    constructor(supply_manager) {
        this.supply_manager = supply_manager;
        this.supply_history = [];
        this.inflation_history = [];
        this.distribution_history = [];
    }

    /**
     * Track supply changes.
     * @param {number} block_number - Current block number
     * @param {number} total_supply - Total token supply
     */
    track_supply(block_number, total_supply) {
        const statistics = this.supply_manager.get_supply_statistics(total_supply, block_number);
        
        this.supply_history.push({
            block_number,
            total_supply,
            ...statistics
        });
    }

    /**
     * Track inflation.
     * @param {number} block_number - Current block number
     * @param {number} total_supply - Total token supply
     */
    track_inflation(block_number, total_supply) {
        const inflation = this.supply_manager.calculate_annual_inflation(total_supply);
        const inflation_rate = this.supply_manager.annual_inflation_rate;
        
        this.inflation_history.push({
            block_number,
            inflation,
            inflation_rate
        });
    }

    /**
     * Track distribution.
     * @param {number} block_number - Current block number
     * @param {number} total_supply - Total token supply
     */
    track_distribution(block_number, total_supply) {
        const distribution = this.supply_manager.calculate_distribution_details(total_supply, block_number);
        
        this.distribution_history.push({
            block_number,
            distribution
        });
    }

    /**
     * Get supply history.
     * @returns {Array} Supply history
     */
    get_supply_history() {
        return [...this.supply_history];
    }

    /**
     * Get inflation history.
     * @returns {Array} Inflation history
     */
    get_inflation_history() {
        return [...this.inflation_history];
    }

    /**
     * Get distribution history.
     * @returns {Array} Distribution history
     */
    get_distribution_history() {
        return [...this.distribution_history];
    }

    /**
     * Get supply at block.
     * @param {number} block_number - Block number
     * @returns {object} Supply at block
     */
    get_supply_at_block(block_number) {
        const entry = this.supply_history.find(history => history.block_number === block_number);
        return entry || null;
    }

    /**
     * Calculate supply growth.
     * @param {number} start_block - Start block
     * @param {number} end_block - End block
     * @returns {object} Supply growth information
     */
    calculate_supply_growth(start_block, end_block) {
        const start_entry = this.get_supply_at_block(start_block);
        const end_entry = this.get_supply_at_block(end_block);
        
        if (!start_entry || !end_entry) {
            return null;
        }
        
        const growth = end_entry.total_supply - start_entry.total_supply;
        const growth_percentage = (growth / start_entry.total_supply) * 100;
        
        return {
            start_block,
            end_block,
            start_supply: start_entry.total_supply,
            end_supply: end_entry.total_supply,
            growth: growth,
            growth_percentage: growth_percentage
        };
    }
}
