/**
 * ChainForgeLedger Tokenomics Module - Stablecoin
 * 
 * Implements stablecoin management and stabilization mechanisms.
 */

export class Stablecoin {
    /**
     * Create a new stablecoin instance.
     * @param {object} config - Stablecoin configuration
     */
    constructor(config = {}) {
        this.token_name = config.token_name || 'ChainForge USD';
        this.token_symbol = config.token_symbol || 'CFLUSD';
        this.token_type = config.token_type || 'stable';
        this.tokenomics = {
            total_supply: config.total_supply || 0,
            circulating_supply: config.circulating_supply || 0,
            reserve_distribution: {
                collateral: 0,
                operational: 0,
                marketing: 0,
                team: 0,
                other: 0
            },
            tokenomics_supply: config.total_supply || 0,
            tokenomics_price: 1.0
        };
        this.price = 1.0;
        this.reserve_manager = null;
        this.collateral_manager = null;
        this.supply_adjustment_manager = null;
        this.peg_manager = null;
        this.reward_manager = null;
        this.reward_distribution = {
            liquidity_pool: 0,
            yield_farming: 0,
            staking: 0,
            governance: 0,
            development: 0,
            operational: 0,
            marketing: 0,
            team: 0,
            other: 0
        };
        this.liquidity_pool_reward = null;
        this.yield_farming_reward = null;
        this.staking_reward = null;
        this.governance_reward = null;
        this.development_reward = null;
        this.operational_reward = null;
        this.marketing_reward = null;
        this.team_reward = null;
        this.other_reward = null;
    }

    /**
     * Get stablecoin data.
     * @returns {object} Stablecoin data
     */
    get_stablecoin_data() {
        return {
            token_name: this.token_name,
            token_symbol: this.token_symbol,
            token_type: this.token_type,
            tokenomics: {
                ...this.tokenomics,
                tokenomics_price: this.price
            },
            price: this.price
        };
    }

    /**
     * Calculate market cap.
     * @param {number} price - Token price (optional, uses current if not provided)
     * @returns {number} Market cap
     */
    calculate_market_cap(price = null) {
        const effective_price = price !== null ? price : this.price;
        return this.tokenomics.total_supply * effective_price;
    }

    /**
     * Calculate fully diluted valuation (FDV).
     * @param {number} price - Token price (optional, uses current if not provided)
     * @param {number} total_supply - Total supply (optional, uses current if not provided)
     * @returns {number} FDV
     */
    calculate_fdv(price = null, total_supply = null) {
        const effective_price = price !== null ? price : this.price;
        const effective_total_supply = total_supply !== null ? total_supply : this.tokenomics.total_supply;
        return effective_total_supply * effective_price;
    }

    /**
     * Update stablecoin price.
     * @param {number} new_price - New price
     */
    update_token_price(new_price) {
        this.price = new_price;
        this.tokenomics.tokenomics_price = new_price;
    }

    /**
     * Calculate token distribution by category.
     * @returns {object} Token distribution
     */
    calculate_token_distribution() {
        const distribution = {
            collateral: this.tokenomics.reserve_distribution.collateral,
            operational: this.tokenomics.reserve_distribution.operational,
            marketing: this.tokenomics.reserve_distribution.marketing,
            team: this.tokenomics.reserve_distribution.team,
            other: this.tokenomics.reserve_distribution.other
        };

        return {
            distribution,
            percentages: Object.keys(distribution).reduce((result, category) => {
                result[category] = (distribution[category] / this.tokenomics.total_supply) * 100;
                return result;
            }, {})
        };
    }

    /**
     * Calculate market statistics.
     * @param {number} price - Token price (optional)
     * @returns {object} Market statistics
     */
    calculate_market_statistics(price = null) {
        const effective_price = price !== null ? price : this.price;
        const market_cap = this.calculate_market_cap(effective_price);
        const fdv = this.calculate_fdv(effective_price);

        return {
            supply: this.tokenomics.total_supply,
            total_supply: this.tokenomics.total_supply,
            market_cap: market_cap,
            fdv: fdv,
            price: effective_price,
            distribution: this.calculate_token_distribution()
        };
    }

    /**
     * Calculate valuation metrics.
     * @param {number} price - Token price (optional)
     * @param {number} total_supply - Total supply (optional)
     * @returns {object} Valuation metrics
     */
    calculate_valuation(price = null, total_supply = null) {
        const market_cap = this.calculate_market_cap(price);
        const fdv = this.calculate_fdv(price, total_supply);
        
        return {
            market_cap,
            fdv,
            price: price || this.price,
            total_supply: total_supply || this.tokenomics.total_supply,
            circulating_supply: this.tokenomics.circulating_supply,
            market_depth: 10000000
        };
    }

    /**
     * Get tokenomics details.
     * @returns {object} Tokenomics details
     */
    get_tokenomics_details() {
        const stats = this.calculate_market_statistics();
        
        return {
            token_name: this.token_name,
            token_symbol: this.token_symbol,
            token_type: this.token_type,
            total_supply: this.tokenomics.total_supply,
            circulating_supply: this.tokenomics.circulating_supply,
            price: this.price,
            market_cap: stats.market_cap,
            fdv: stats.fdv,
            distribution: stats.distribution
        };
    }

    /**
     * Set stablecoin name.
     * @param {string} name - New stablecoin name
     */
    set_token_name(name) {
        this.token_name = name;
    }

    /**
     * Set stablecoin symbol.
     * @param {string} symbol - New stablecoin symbol
     */
    set_token_symbol(symbol) {
        this.token_symbol = symbol;
    }

    /**
     * Set stablecoin type.
     * @param {string} type - New stablecoin type
     */
    set_token_type(type) {
        this.token_type = type;
    }

    /**
     * Set reserve distribution.
     * @param {object} distribution - New reserve distribution
     */
    set_reserve_distribution(distribution) {
        this.tokenomics.reserve_distribution = {
            ...this.tokenomics.reserve_distribution,
            ...distribution
        };
    }

    /**
     * Get reserve distribution.
     * @returns {object} Reserve distribution
     */
    get_reserve_distribution() {
        return { ...this.tokenomics.reserve_distribution };
    }

    /**
     * Calculate distribution percentages.
     * @returns {object} Distribution percentages
     */
    calculate_distribution_percentages() {
        const distribution = this.calculate_token_distribution();
        return distribution.percentages;
    }

    /**
     * Get stablecoin statistics.
     * @param {number} price - Token price (optional)
     * @returns {object} Stablecoin statistics
     */
    get_statistics(price = null) {
        const stats = this.calculate_market_statistics(price);
        
        return {
            token: this.get_tokenomics_details(),
            market: stats,
            distribution: stats.distribution,
            liquidity: {
                total: 10000000,
                locked: 5000000,
                available: 5000000
            }
        };
    }

    /**
     * Set reward distribution.
     * @param {object} distribution - New reward distribution
     */
    set_reward_distribution(distribution) {
        this.reward_distribution = {
            ...this.reward_distribution,
            ...distribution
        };
    }

    /**
     * Calculate reward distribution percentages.
     * @returns {object} Reward distribution percentages
     */
    calculate_reward_distribution_percentages() {
        return Object.keys(this.reward_distribution).reduce((result, category) => {
            result[category] = this.reward_distribution[category];
            return result;
        }, {});
    }

    /**
     * Calculate peg deviation.
     * @param {number} current_price - Current price
     * @param {number} target_price - Target price
     * @returns {object} Peg deviation information
     */
    calculate_peg_deviation(current_price, target_price) {
        const deviation = ((current_price - target_price) / target_price) * 100;
        return {
            deviation,
            absolute_deviation: Math.abs(deviation),
            current_price,
            target_price,
            in_range: Math.abs(deviation) <= 2
        };
    }
}

export class StablecoinRewardDistributor {
    /**
     * Create a new stablecoin reward distributor instance.
     * @param {Stablecoin} stablecoin - Stablecoin instance
     */
    constructor(stablecoin) {
        this.stablecoin = stablecoin;
        this.reward_distribution = {
            liquidity_pool: 0,
            yield_farming: 0,
            staking: 0,
            governance: 0,
            development: 0,
            operational: 0,
            marketing: 0,
            team: 0,
            other: 0
        };
    }

    /**
     * Set reward distribution.
     * @param {object} distribution - New reward distribution
     */
    set_reward_distribution(distribution) {
        this.reward_distribution = {
            ...this.reward_distribution,
            ...distribution
        };
    }

    /**
     * Calculate reward distribution.
     * @param {number} total_reward - Total reward amount
     * @returns {object} Reward distribution by category
     */
    calculate_reward_distribution(total_reward) {
        const distribution = Object.keys(this.reward_distribution).reduce((result, category) => {
            result[category] = total_reward * (this.reward_distribution[category] / 100);
            return result;
        }, {});

        return distribution;
    }

    /**
     * Distribute rewards to liquidity providers.
     * @param {number} total_reward - Total reward amount
     * @param {Array} providers - List of liquidity providers
     */
    distribute_liquidity_pool_reward(total_reward, providers) {
        const liquidity_reward = this.calculate_reward_distribution(total_reward).liquidity_pool;
        
        providers.forEach(provider => {
            const share = provider.share || (1 / providers.length);
            provider.reward = liquidity_reward * share;
        });

        this.stablecoin.liquidity_pool_reward = liquidity_reward;
    }

    /**
     * Distribute yield farming rewards.
     * @param {number} total_reward - Total reward amount
     * @param {Array} farms - List of yield farms
     */
    distribute_yield_farming_reward(total_reward, farms) {
        const yield_reward = this.calculate_reward_distribution(total_reward).yield_farming;
        
        farms.forEach(farm => {
            farm.reward = yield_reward * (farm.share || 0.5);
        });

        this.stablecoin.yield_farming_reward = yield_reward;
    }

    /**
     * Distribute staking rewards.
     * @param {number} total_reward - Total reward amount
     * @param {Array} stakers - List of stakers
     */
    distribute_staking_reward(total_reward, stakers) {
        const staking_reward = this.calculate_reward_distribution(total_reward).staking;
        
        stakers.forEach(staker => {
            const share = staker.stake / stakers.reduce((sum, s) => sum + s.stake, 0);
            staker.reward = staking_reward * share;
        });

        this.stablecoin.staking_reward = staking_reward;
    }

    /**
     * Distribute governance rewards.
     * @param {number} total_reward - Total reward amount
     * @param {Array} governors - List of governors
     */
    distribute_governance_reward(total_reward, governors) {
        const governance_reward = this.calculate_reward_distribution(total_reward).governance;
        
        governors.forEach(governor => {
            governor.reward = governance_reward * (governor.voting_power / governors.reduce((sum, g) => sum + g.voting_power, 0));
        });

        this.stablecoin.governance_reward = governance_reward;
    }

    /**
     * Distribute development rewards.
     * @param {number} total_reward - Total reward amount
     * @param {Array} developers - List of developers
     */
    distribute_development_reward(total_reward, developers) {
        const development_reward = this.calculate_reward_distribution(total_reward).development;
        
        developers.forEach(developer => {
            developer.reward = development_reward * (developer.contribution / developers.reduce((sum, d) => sum + d.contribution, 0));
        });

        this.stablecoin.development_reward = development_reward;
    }

    /**
     * Distribute operational rewards.
     * @param {number} total_reward - Total reward amount
     * @param {Array} operations - List of operations
     */
    distribute_operational_reward(total_reward, operations) {
        const operational_reward = this.calculate_reward_distribution(total_reward).operational;
        
        operations.forEach(op => {
            op.reward = operational_reward * (op.effort / operations.reduce((sum, o) => sum + o.effort, 0));
        });

        this.stablecoin.operational_reward = operational_reward;
    }

    /**
     * Distribute marketing rewards.
     * @param {number} total_reward - Total reward amount
     * @param {Array} marketers - List of marketers
     */
    distribute_marketing_reward(total_reward, marketers) {
        const marketing_reward = this.calculate_reward_distribution(total_reward).marketing;
        
        marketers.forEach(marketer => {
            marketer.reward = marketing_reward * (marketer.effectiveness / marketers.reduce((sum, m) => sum + m.effectiveness, 0));
        });

        this.stablecoin.marketing_reward = marketing_reward;
    }

    /**
     * Distribute team rewards.
     * @param {number} total_reward - Total reward amount
     * @param {Array} team_members - List of team members
     */
    distribute_team_reward(total_reward, team_members) {
        const team_reward = this.calculate_reward_distribution(total_reward).team;
        
        team_members.forEach(member => {
            member.reward = team_reward * (member.contribution / team_members.reduce((sum, m) => sum + m.contribution, 0));
        });

        this.stablecoin.team_reward = team_reward;
    }

    /**
     * Distribute other rewards.
     * @param {number} total_reward - Total reward amount
     * @param {Array} other_participants - List of other participants
     */
    distribute_other_reward(total_reward, other_participants) {
        const other_reward = this.calculate_reward_distribution(total_reward).other;
        
        other_participants.forEach(participant => {
            participant.reward = other_reward * (participant.contribution / other_participants.reduce((sum, p) => sum + p.contribution, 0));
        });

        this.stablecoin.other_reward = other_reward;
    }
}
