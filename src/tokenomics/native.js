/**
 * ChainForgeLedger Tokenomics Module - Native Token
 * 
 * Implements native token management and distribution.
 */

export class NativeToken {
    /**
     * Create a new native token instance.
     * @param {object} config - Token configuration
     */
    constructor(config = {}) {
        this.supply = config.supply || 0;
        this.token_price = config.token_price || 0;
        this.token_name = config.token_name || 'ChainForge Ledger';
        this.token_symbol = config.token_symbol || 'CFL';
        this.token_type = config.token_type || 'native';
        this.tokenomics = {
            total_supply: config.total_supply || 0,
            circulating_supply: config.circulating_supply || 0,
            reserve_distribution: {
                development: 0,
                operational: 0,
                marketing: 0,
                team: 0,
                other: 0
            },
            tokenomics_supply: config.total_supply || 0,
            tokenomics_price: config.token_price || 0
        };
    }

    /**
     * Get tokenomics data.
     * @returns {object} Tokenomics data
     */
    get_tokenomics() {
        return {
            supply: this.supply,
            token_price: this.token_price,
            token_name: this.token_name,
            token_symbol: this.token_symbol,
            token_type: this.token_type,
            tokenomics: {
                ...this.tokenomics,
                total_supply: this.supply
            }
        };
    }

    /**
     * Calculate market capitalization.
     * @param {number} price - Token price (optional, uses current if not provided)
     * @returns {number} Market cap
     */
    calculate_market_cap(price = null) {
        const effective_price = price !== null ? price : this.token_price;
        return this.supply * effective_price;
    }

    /**
     * Calculate fully diluted valuation (FDV).
     * @param {number} price - Token price (optional, uses current if not provided)
     * @param {number} total_supply - Total supply (optional, uses current if not provided)
     * @returns {number} FDV
     */
    calculate_fdv(price = null, total_supply = null) {
        const effective_price = price !== null ? price : this.token_price;
        const effective_total_supply = total_supply !== null ? total_supply : this.tokenomics.total_supply;
        return effective_total_supply * effective_price;
    }

    /**
     * Update token price.
     * @param {number} new_price - New token price
     */
    update_token_price(new_price) {
        this.token_price = new_price;
        this.tokenomics.tokenomics_price = new_price;
    }

    /**
     * Update token supply.
     * @param {number} new_supply - New token supply
     */
    update_token_supply(new_supply) {
        this.supply = new_supply;
        this.tokenomics.total_supply = new_supply;
    }

    /**
     * Calculate token supply distribution.
     * @returns {object} Supply distribution by category
     */
    calculate_token_distribution() {
        const distribution = {
            development: this.tokenomics.reserve_distribution.development,
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
        const effective_price = price !== null ? price : this.token_price;
        const market_cap = this.calculate_market_cap(effective_price);
        const fdv = this.calculate_fdv(effective_price);

        return {
            supply: this.supply,
            total_supply: this.tokenomics.total_supply,
            market_cap: market_cap,
            fdv: fdv,
            price: effective_price,
            distribution: this.calculate_token_distribution()
        };
    }

    /**
     * Get token details.
     * @returns {object} Token details
     */
    get_token_details() {
        const stats = this.calculate_market_statistics();
        
        return {
            name: this.token_name,
            symbol: this.token_symbol,
            type: this.token_type,
            total_supply: this.tokenomics.total_supply,
            circulating_supply: this.tokenomics.circulating_supply,
            price: this.token_price,
            market_cap: stats.market_cap,
            fdv: stats.fdv,
            distribution: stats.distribution
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
            price: price || this.token_price,
            total_supply: total_supply || this.tokenomics.total_supply,
            circulating_supply: this.tokenomics.circulating_supply,
            market_depth: 10000000 // Mock value
        };
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
     * Get tokenomics statistics.
     * @param {number} price - Token price (optional)
     * @returns {object} Tokenomics statistics
     */
    get_statistics(price = null) {
        const stats = this.calculate_market_statistics(price);
        
        return {
            token: this.get_token_details(),
            market: stats,
            distribution: stats.distribution,
            liquidity: {
                total: 10000000, // Mock value
                locked: 5000000, // Mock value
                available: 5000000 // Mock value
            }
        };
    }

    /**
     * Set token name.
     * @param {string} name - New token name
     */
    set_token_name(name) {
        this.token_name = name;
    }

    /**
     * Set token symbol.
     * @param {string} symbol - New token symbol
     */
    set_token_symbol(symbol) {
        this.token_symbol = symbol;
    }

    /**
     * Set token type.
     * @param {string} type - New token type
     */
    set_token_type(type) {
        this.token_type = type;
    }

    /**
     * Set circulating supply.
     * @param {number} supply - New circulating supply
     */
    set_circulating_supply(supply) {
        this.tokenomics.circulating_supply = supply;
    }

    /**
     * Get circulating supply.
     * @returns {number} Circulating supply
     */
    get_circulating_supply() {
        return this.tokenomics.circulating_supply;
    }
}

export class TokenDistribution {
    /**
     * Create a new token distribution instance.
     * @param {object} distribution - Distribution data
     */
    constructor(distribution = {}) {
        this.distribution = {
            development: distribution.development || 0,
            operational: distribution.operational || 0,
            marketing: distribution.marketing || 0,
            team: distribution.team || 0,
            other: distribution.other || 0
        };
        this.total_supply = Object.values(this.distribution).reduce((sum, value) => sum + value, 0);
    }

    /**
     * Calculate distribution percentages.
     * @returns {object} Distribution percentages by category
     */
    calculate_distribution_percentages() {
        return Object.keys(this.distribution).reduce((result, category) => {
            result[category] = (this.distribution[category] / this.total_supply) * 100;
            return result;
        }, {});
    }

    /**
     * Get category distribution.
     * @param {string} category - Distribution category
     * @returns {number} Amount in category
     */
    get_category_distribution(category) {
        return this.distribution[category] || 0;
    }

    /**
     * Set category distribution.
     * @param {string} category - Distribution category
     * @param {number} amount - New amount
     */
    set_category_distribution(category, amount) {
        if (category in this.distribution) {
            const difference = amount - this.distribution[category];
            this.distribution[category] = amount;
            this.total_supply += difference;
        }
    }

    /**
     * Calculate distribution statistics.
     * @returns {object} Distribution statistics
     */
    calculate_statistics() {
        const percentages = this.calculate_distribution_percentages();
        const sorted = Object.entries(this.distribution).sort(([, a], [, b]) => b - a);
        
        return {
            total_supply: this.total_supply,
            distribution: this.distribution,
            percentages: percentages,
            largest_category: sorted[0][0],
            largest_category_percentage: percentages[sorted[0][0]],
            categories: Object.keys(this.distribution)
        };
    }

    /**
     * Get distribution data.
     * @returns {object} Distribution data
     */
    get_distribution() {
        return {
            ...this.distribution,
            total: this.total_supply
        };
    }
}
