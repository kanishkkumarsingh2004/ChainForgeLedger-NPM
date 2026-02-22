/**
 * ChainForgeLedger Liquidity Module
 * 
 * Implements decentralized exchange and automated market maker functionality.
 */

export class LiquidityPool {
    /**
     * Create a new liquidity pool.
     * @param {string} token0 - First token in the pool
     * @param {string} token1 - Second token in the pool
     * @param {number} reserve0 - Initial reserve of token0
     * @param {number} reserve1 - Initial reserve of token1
     */
    constructor(token0, token1, reserve0, reserve1) {
        this.token0 = token0;
        this.token1 = token1;
        this.reserve0 = reserve0;
        this.reserve1 = reserve1;
        this.total_supply = Math.sqrt(reserve0 * reserve1);
        this.fee_rate = 0.003; 
        this.tracked_tokens0 = reserve0;
        this.tracked_tokens1 = reserve1;
        this.constant_product = reserve0 * reserve1;
    }

    /**
     * Add liquidity to the pool.
     * @param {number} amount0 - Amount of token0 to add
     * @param {number} amount1 - Amount of token1 to add
     * @returns {number} LP tokens minted
     */
    add_liquidity(amount0, amount1) {
        if (amount0 <= 0 || amount1 <= 0) {
            throw new Error("Amounts must be positive");
        }

        if (this.total_supply === 0) {
            this.reserve0 = amount0;
            this.reserve1 = amount1;
            this.total_supply = Math.sqrt(amount0 * amount1);
            this.tracked_tokens0 = amount0;
            this.tracked_tokens1 = amount1;
            this.constant_product = amount0 * amount1;
            return this.total_supply;
        }

        const expected_amount1 = (amount0 * this.reserve1) / this.reserve0;
        const slippage_tolerance = 0.005;
        
        if (Math.abs(amount1 - expected_amount1) / expected_amount1 > slippage_tolerance) {
            throw new Error("Invalid amount ratio");
        }

        const liquidity = (amount0 / this.reserve0) * this.total_supply;
        
        this.reserve0 += amount0;
        this.reserve1 += amount1;
        this.total_supply += liquidity;
        this.tracked_tokens0 += amount0;
        this.tracked_tokens1 += amount1;
        this.constant_product = this.reserve0 * this.reserve1;

        return liquidity;
    }

    /**
     * Remove liquidity from the pool.
     * @param {number} liquidity - Amount of LP tokens to burn
     * @returns {object} Amounts of token0 and token1 received
     */
    remove_liquidity(liquidity) {
        if (liquidity <= 0 || liquidity > this.total_supply) {
            throw new Error("Invalid liquidity amount");
        }

        const fraction = liquidity / this.total_supply;
        const amount0 = fraction * this.reserve0;
        const amount1 = fraction * this.reserve1;

        this.reserve0 -= amount0;
        this.reserve1 -= amount1;
        this.total_supply -= liquidity;
        this.tracked_tokens0 -= amount0;
        this.tracked_tokens1 -= amount1;
        this.constant_product = this.reserve0 * this.reserve1;

        return { amount0, amount1 };
    }

    /**
     * Swap tokens in the pool.
     * @param {string} token_in - Token to swap
     * @param {number} amount_in - Amount of token_in to swap
     * @returns {number} Amount of token_out received
     */
    swap(token_in, amount_in) {
        if (amount_in <= 0) {
            throw new Error("Amount must be positive");
        }

        if (token_in === this.token0) {
            return this._swap_token0(amount_in);
        } else if (token_in === this.token1) {
            return this._swap_token1(amount_in);
        } else {
            throw new Error(`Unknown token: ${token_in}`);
        }
    }

    _swap_token0(amount_in) {
        const amount_in_with_fee = amount_in * (1 - this.fee_rate);
        const amount_out = (this.reserve1 * amount_in_with_fee) / (this.reserve0 + amount_in_with_fee);

        this.reserve0 += amount_in;
        this.reserve1 -= amount_out;
        this.constant_product = this.reserve0 * this.reserve1;

        return amount_out;
    }

    _swap_token1(amount_in) {
        const amount_in_with_fee = amount_in * (1 - this.fee_rate);
        const amount_out = (this.reserve0 * amount_in_with_fee) / (this.reserve1 + amount_in_with_fee);

        this.reserve1 += amount_in;
        this.reserve0 -= amount_out;
        this.constant_product = this.reserve0 * this.reserve1;

        return amount_out;
    }

    /**
     * Calculate current token prices.
     * @returns {object} Token0 and token1 prices
     */
    get_prices() {
        return {
            [this.token0]: this.reserve1 / this.reserve0,
            [this.token1]: this.reserve0 / this.reserve1
        };
    }

    /**
     * Calculate slippage for a swap.
     * @param {string} token_in - Token to swap
     * @param {number} amount_in - Amount to swap
     * @returns {number} Slippage percentage
     */
    calculate_slippage(token_in, amount_in) {
        const prices_before = this.get_prices();
        const amount_out = this.swap(token_in, amount_in);
        
        this.swap(token_in === this.token0 ? this.token1 : this.token0, amount_out);
        
        const prices_after = this.get_prices();
        const price_change = Math.abs(prices_after[token_in] - prices_before[token_in]) / prices_before[token_in];
        
        return price_change * 100;
    }

    /**
     * Get pool information.
     * @returns {object} Pool statistics
     */
    get_pool_info() {
        const prices = this.get_prices();
        
        return {
            token0: this.token0,
            token1: this.token1,
            reserve0: this.reserve0,
            reserve1: this.reserve1,
            total_supply: this.total_supply,
            price0: prices[this.token0],
            price1: prices[this.token1],
            volume0: this.tracked_tokens0,
            volume1: this.tracked_tokens1,
            liquidity: this.total_supply,
            constant_product: this.constant_product,
            fee_rate: this.fee_rate
        };
    }

    /**
     * Update pool state with new reserves.
     * @param {number} reserve0 - New reserve0
     * @param {number} reserve1 - New reserve1
     */
    update_reserves(reserve0, reserve1) {
        if (reserve0 <= 0 || reserve1 <= 0) {
            throw new Error("Reserves must be positive");
        }

        this.reserve0 = reserve0;
        this.reserve1 = reserve1;
        this.constant_product = reserve0 * reserve1;
    }

    /**
     * Set fee rate for the pool.
     * @param {number} fee_rate - New fee rate (0.001 = 0.1%)
     */
    set_fee_rate(fee_rate) {
        if (fee_rate < 0 || fee_rate > 0.01) {
            throw new Error("Fee rate must be between 0 and 1%");
        }
        this.fee_rate = fee_rate;
    }
}

export class DEX {
    /**
     * Create a new DEX instance.
     */
    constructor() {
        this.pools = new Map();
        this.liquidity_tokens = new Map();
        this.transaction_history = [];
    }

    /**
     * Create a new liquidity pool.
     * @param {string} token0 - First token
     * @param {string} token1 - Second token
     * @param {number} reserve0 - Initial reserve0
     * @param {number} reserve1 - Initial reserve1
     * @returns {LiquidityPool} New pool instance
     */
    create_pool(token0, token1, reserve0, reserve1) {
        if (token0 === token1) {
            throw new Error("Cannot create pool with the same token");
        }

        const pool_key = this._get_pool_key(token0, token1);
        
        if (this.pools.has(pool_key)) {
            throw new Error("Pool already exists");
        }

        const pool = new LiquidityPool(token0, token1, reserve0, reserve1);
        this.pools.set(pool_key, pool);

        this.transaction_history.push({
            type: "create_pool",
            tokens: [token0, token1],
            reserves: [reserve0, reserve1],
            timestamp: Date.now()
        });

        return pool;
    }

    /**
     * Get pool by tokens.
     * @param {string} token0 - First token
     * @param {string} token1 - Second token
     * @returns {LiquidityPool} Pool instance
     */
    get_pool(token0, token1) {
        const pool_key = this._get_pool_key(token0, token1);
        return this.pools.get(pool_key);
    }

    /**
     * Get all pools.
     * @returns {Array} List of all pools
     */
    get_all_pools() {
        return Array.from(this.pools.values());
    }

    /**
     * Execute a swap.
     * @param {string} token_in - Token to swap
     * @param {string} token_out - Token to receive
     * @param {number} amount_in - Amount to swap
     * @returns {object} Swap result
     */
    swap(token_in, token_out, amount_in) {
        if (token_in === token_out) {
            throw new Error("Cannot swap the same token");
        }

        const pool = this.get_pool(token_in, token_out);
        
        if (!pool) {
            throw new Error(`No pool exists for ${token_in}/${token_out}`);
        }

        const amount_out = pool.swap(token_in, amount_in);

        this.transaction_history.push({
            type: "swap",
            token_in,
            token_out,
            amount_in,
            amount_out,
            pool: this._get_pool_key(token_in, token_out),
            timestamp: Date.now()
        });

        return {
            token_in,
            token_out,
            amount_in,
            amount_out,
            prices: pool.get_prices()
        };
    }

    /**
     * Add liquidity to a pool.
     * @param {string} token0 - First token
     * @param {string} token1 - Second token
     * @param {number} amount0 - Amount of token0
     * @param {number} amount1 - Amount of token1
     * @returns {object} Liquidity result
     */
    add_liquidity(token0, token1, amount0, amount1) {
        const pool = this.get_pool(token0, token1);
        
        if (!pool) {
            throw new Error(`No pool exists for ${token0}/${token1}`);
        }

        const liquidity = pool.add_liquidity(amount0, amount1);

        this.transaction_history.push({
            type: "add_liquidity",
            tokens: [token0, token1],
            amounts: [amount0, amount1],
            liquidity,
            pool: this._get_pool_key(token0, token1),
            timestamp: Date.now()
        });

        return {
            token0,
            token1,
            amount0,
            amount1,
            liquidity,
            pool_info: pool.get_pool_info()
        };
    }

    /**
     * Remove liquidity from a pool.
     * @param {string} token0 - First token
     * @param {string} token1 - Second token
     * @param {number} liquidity - Amount of LP tokens
     * @returns {object} Withdrawal result
     */
    remove_liquidity(token0, token1, liquidity) {
        const pool = this.get_pool(token0, token1);
        
        if (!pool) {
            throw new Error(`No pool exists for ${token0}/${token1}`);
        }

        const { amount0, amount1 } = pool.remove_liquidity(liquidity);

        this.transaction_history.push({
            type: "remove_liquidity",
            tokens: [token0, token1],
            liquidity,
            amounts: [amount0, amount1],
            pool: this._get_pool_key(token0, token1),
            timestamp: Date.now()
        });

        return {
            token0,
            token1,
            amount0,
            amount1,
            liquidity,
            pool_info: pool.get_pool_info()
        };
    }

    /**
     * Get DEX statistics.
     * @returns {object} DEX statistics
     */
    get_statistics() {
        const total_pools = this.pools.size;
        const total_liquidity = Array.from(this.pools.values()).reduce((sum, pool) => 
            sum + pool.total_supply, 0
        );

        const volume0 = Array.from(this.pools.values()).reduce((sum, pool) => 
            sum + pool.tracked_tokens0, 0
        );

        const volume1 = Array.from(this.pools.values()).reduce((sum, pool) => 
            sum + pool.tracked_tokens1, 0
        );

        const active_pools = Array.from(this.pools.values()).filter(pool => pool.total_supply > 0).length;

        return {
            total_pools,
            active_pools,
            total_liquidity,
            volume0,
            volume1,
            transaction_count: this.transaction_history.length,
            pools: Array.from(this.pools.values()).map(pool => pool.get_pool_info())
        };
    }

    _get_pool_key(token0, token1) {
        return token0 < token1 ? `${token0}-${token1}` : `${token1}-${token0}`;
    }
}
