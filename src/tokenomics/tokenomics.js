/**
 * Tokenomics system
 */

export class Tokenomics {
    /**
     * Create a new Tokenomics instance
     * @param {Object} options - Tokenomics options
     */
    constructor(options = {}) {
        this.totalSupply = options.totalSupply || 1000000000;
        this.circulatingSupply = options.circulatingSupply || 0;
        this.stakingRewardsPool = options.stakingRewardsPool || 0;
        this.treasury = options.treasury || 0;
        this.vestingPool = options.vestingPool || 0;
        this.developmentFund = options.developmentFund || 0;
        this.communityPool = options.communityPool || 0;
        this.stakingPercentage = options.stakingPercentage || 0;
        this.tokenPrice = options.tokenPrice || 0.01;
        this.marketCap = options.marketCap || 0;
        this.createdAt = options.createdAt || Date.now();
        this.updatedAt = options.updatedAt || Date.now();
    }

    /**
     * Calculate market capitalization
     * @returns {number} Market capitalization
     */
    calculateMarketCap() {
        return this.circulatingSupply * this.tokenPrice;
    }

    /**
     * Calculate fully diluted valuation (FDV)
     * @returns {number} Fully diluted valuation
     */
    calculateFDV() {
        return this.totalSupply * this.tokenPrice;
    }

    /**
     * Mint new tokens
     * @param {number} amount - Number of tokens to mint
     * @param {string} destination - Destination pool
     */
    mintTokens(amount, destination = 'circulating') {
        if (typeof amount !== 'number' || amount <= 0) {
            throw new Error('Mint amount must be a positive number');
        }

        if (this.circulatingSupply + amount > this.totalSupply) {
            throw new Error('Minting would exceed total supply');
        }

        switch (destination) {
            case 'circulating':
                this.circulatingSupply += amount;
                break;
            case 'staking_rewards':
                this.stakingRewardsPool += amount;
                this.circulatingSupply += amount;
                break;
            case 'treasury':
                this.treasury += amount;
                this.circulatingSupply += amount;
                break;
            case 'vesting':
                this.vestingPool += amount;
                break;
            case 'development':
                this.developmentFund += amount;
                break;
            case 'community':
                this.communityPool += amount;
                break;
            default:
                throw new Error(`Invalid destination pool: ${destination}`);
        }

        this.updatedAt = Date.now();
        this.marketCap = this.calculateMarketCap();
    }

    /**
     * Burn tokens
     * @param {number} amount - Number of tokens to burn
     */
    burnTokens(amount) {
        if (typeof amount !== 'number' || amount <= 0) {
            throw new Error('Burn amount must be a positive number');
        }

        if (amount > this.circulatingSupply) {
            throw new Error('Cannot burn more tokens than in circulation');
        }

        this.circulatingSupply -= amount;
        this.totalSupply -= amount;
        this.updatedAt = Date.now();
        this.marketCap = this.calculateMarketCap();
    }

    /**
     * Distribute staking rewards
     * @param {number} amount - Reward amount
     * @param {number} stakers - Number of stakers
     * @returns {number} Average reward per staker
     */
    distributeStakingRewards(amount, stakers) {
        if (typeof amount !== 'number' || amount <= 0) {
            throw new Error('Reward amount must be a positive number');
        }

        if (typeof stakers !== 'number' || stakers <= 0) {
            throw new Error('Number of stakers must be a positive number');
        }

        if (amount > this.stakingRewardsPool) {
            throw new Error('Insufficient rewards pool');
        }

        const rewardPerStaker = amount / stakers;
        this.stakingRewardsPool -= amount;
        this.updatedAt = Date.now();

        return rewardPerStaker;
    }

    /**
     * Calculate staking reward rate
     * @param {number} stakeAmount - Stake amount
     * @param {number} annualPercentageRate - Annual percentage rate
     * @param {number} duration - Duration in years
     * @returns {number} Reward amount
     */
    calculateStakingReward(stakeAmount, annualPercentageRate, duration) {
        return stakeAmount * (annualPercentageRate / 100) * duration;
    }

    /**
     * Calculate token distribution percentages
     * @returns {Object} Distribution percentages
     */
    getDistributionPercentages() {
        return {
            circulating: (this.circulatingSupply / this.totalSupply) * 100,
            stakingRewards: (this.stakingRewardsPool / this.totalSupply) * 100,
            treasury: (this.treasury / this.totalSupply) * 100,
            vesting: (this.vestingPool / this.totalSupply) * 100,
            development: (this.developmentFund / this.totalSupply) * 100,
            community: (this.communityPool / this.totalSupply) * 100
        };
    }

    /**
     * Calculate token velocity
     * @param {number} totalTransactionVolume - Total transaction volume
     * @param {number} timePeriod - Time period in days
     * @returns {number} Token velocity
     */
    calculateTokenVelocity(totalTransactionVolume, timePeriod = 30) {
        const averageSupply = (this.circulatingSupply * 0.5); // Simplified
        const annualizedVolume = totalTransactionVolume * (365 / timePeriod);
        return annualizedVolume / averageSupply;
    }

    /**
     * Update token price
     * @param {number} newPrice - New token price
     */
    updateTokenPrice(newPrice) {
        if (typeof newPrice !== 'number' || newPrice < 0) {
            throw new Error('Token price must be a non-negative number');
        }

        this.tokenPrice = newPrice;
        this.marketCap = this.calculateMarketCap();
        this.updatedAt = Date.now();
    }

    /**
     * Update staking percentage
     * @param {number} percentage - New staking percentage
     */
    updateStakingPercentage(percentage) {
        if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
            throw new Error('Staking percentage must be between 0 and 100');
        }

        this.stakingPercentage = percentage;
        this.updatedAt = Date.now();
    }

    /**
     * Get tokenomics summary
     * @returns {Object} Tokenomics summary
     */
    getSummary() {
        const distribution = this.getDistributionPercentages();

        return {
            totalSupply: this.totalSupply,
            circulatingSupply: this.circulatingSupply,
            stakingRewardsPool: this.stakingRewardsPool,
            treasury: this.treasury,
            vestingPool: this.vestingPool,
            developmentFund: this.developmentFund,
            communityPool: this.communityPool,
            stakingPercentage: this.stakingPercentage,
            tokenPrice: this.tokenPrice,
            marketCap: this.marketCap,
            fdv: this.calculateFDV(),
            distribution,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Generate tokenomics report
     * @returns {Object} Detailed tokenomics report
     */
    generateReport() {
        const summary = this.getSummary();

        return {
            basicMetrics: summary,
            detailedMetrics: {
                supplyMetrics: {
                    inflationRate: (this.circulatingSupply / this.totalSupply) * 100,
                    remainingSupply: this.totalSupply - this.circulatingSupply
                },
                priceMetrics: {
                    marketCapToFDVRatio: this.marketCap / this.calculateFDV(),
                    tokenPrice: this.tokenPrice
                },
                stakingMetrics: {
                    stakingPercentage: this.stakingPercentage,
                    rewardsPool: this.stakingRewardsPool
                },
                distributionMetrics: this.getDistributionPercentages()
            }
        };
    }
}

/**
 * Create a new tokenomics system
 * @param {Object} options - Tokenomics options
 * @returns {Tokenomics} Tokenomics instance
 */
export function create_tokenomics(options = {}) {
    return new Tokenomics(options);
}

/**
 * Calculate token valuation metrics
 * @param {Object} data - Valuation data
 * @returns {Object} Valuation metrics
 */
export function calculate_token_valuation(data) {
    const {
        circulatingSupply,
        tokenPrice,
        totalSupply,
        dailyVolume,
        stakingPercentage
    } = data;

    const marketCap = circulatingSupply * tokenPrice;
    const fdv = totalSupply * tokenPrice;
    const dailyVolumeToMarketCap = dailyVolume / marketCap;

    return {
        marketCap,
        fdv,
        marketCapToFDVRatio: marketCap / fdv,
        dailyVolume,
        dailyVolumeToMarketCap,
        stakingPercentage
    };
}

/**
 * Calculate token distribution
 * @param {number} totalSupply - Total token supply
 * @param {Object} distribution - Distribution percentages
 * @returns {Object} Token distribution
 */
export function calculate_token_distribution(totalSupply, distribution) {
    return Object.entries(distribution).reduce((result, [key, percentage]) => {
        result[key] = totalSupply * (percentage / 100);
        return result;
    }, {});
}

/**
 * Calculate vesting schedule
 * @param {number} totalAmount - Total amount to vest
 * @param {number} duration - Vesting duration in months
 * @param {number} cliff - Cliff period in months
 * @param {string} schedule - Vesting schedule type
 * @returns {Array} Monthly vesting amounts
 */
export function calculate_vesting_schedule(totalAmount, duration, cliff = 0, schedule = 'linear') {
    const scheduleData = [];
    
    for (let month = 1; month <= duration; month++) {
        let amount = 0;
        
        if (month > cliff) {
            if (schedule === 'linear') {
                amount = totalAmount / duration;
            } else if (schedule === 'monthly') {
                amount = totalAmount / (duration - cliff);
            }
        }

        scheduleData.push({
            month,
            amount: Math.max(0, amount),
            released: month > cliff
        });
    }

    return scheduleData;
}
