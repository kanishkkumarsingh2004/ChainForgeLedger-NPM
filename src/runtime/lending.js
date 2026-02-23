/**
 * ChainForgeLedger Lending Protocol
 * 
 * Implements borrowing and lending functionality.
 */

export class LendingProtocol {
    constructor() {
        this.markets = new Map();
        this.user_positions = new Map();
        this.collateral_types = new Set();
        this.interest_rates = new Map();
        this.liquidation_thresholds = new Map();
    }

    create_market(asset, collateral_requirement = 1.5, interest_rate = 0.05) {
        if (this.markets.has(asset)) {
            throw new Error(`Market for ${asset} already exists`);
        }

        const market = {
            asset,
            collateral_requirement,
            interest_rate,
            total_supply: 0,
            total_borrowed: 0,
            reserves: 0,
            utilization_rate: 0
        };

        this.markets.set(asset, market);
        this.interest_rates.set(asset, interest_rate);
        this.collateral_types.add(asset);

        return market;
    }

    get_market(asset) {
        return this.markets.get(asset);
    }

    deposit(user, asset, amount) {
        return this.add_liquidity(user, asset, amount);
    }

    add_liquidity(user, asset, amount) {
        if (!this.markets.has(asset)) {
            throw new Error(`Market for ${asset} does not exist`);
        }

        const market = this.markets.get(asset);
        market.total_supply += amount;
        market.reserves += amount;
        this._update_utilization_rate(market);

        if (!this.user_positions.has(user)) {
            this.user_positions.set(user, { deposits: new Map(), borrows: new Map(), collateral: new Map() });
        }

        const user_position = this.user_positions.get(user);
        if (!user_position.deposits.has(asset)) {
            user_position.deposits.set(asset, 0);
        }
        user_position.deposits.set(asset, user_position.deposits.get(asset) + amount);

        return this._calculate_interest(asset, amount);
    }

    remove_liquidity(user, asset, amount) {
        if (!this.markets.has(asset)) {
            throw new Error(`Market for ${asset} does not exist`);
        }

        const user_position = this.user_positions.get(user);
        if (!user_position || !user_position.deposits.has(asset) || user_position.deposits.get(asset) < amount) {
            throw new Error(`Insufficient liquidity for ${asset}`);
        }

        const market = this.markets.get(asset);
        market.total_supply -= amount;
        market.reserves -= amount;
        this._update_utilization_rate(market);

        user_position.deposits.set(asset, user_position.deposits.get(asset) - amount);

        return this._calculate_interest(asset, amount);
    }

    borrow(user, asset, amount, collateral_asset, collateral_amount) {
        if (!this.markets.has(asset)) {
            throw new Error(`Market for ${asset} does not exist`);
        }

        if (!this.collateral_types.has(collateral_asset)) {
            throw new Error(`Collateral type ${collateral_asset} not accepted`);
        }

        const market = this.markets.get(asset);
        if (market.reserves < amount) {
            throw new Error(`Insufficient liquidity to borrow ${amount} ${asset}`);
        }

        if (!this.user_positions.has(user)) {
            this.user_positions.set(user, { deposits: new Map(), borrows: new Map(), collateral: new Map() });
        }

        const user_position = this.user_positions.get(user);
        const collateral_value = collateral_amount * this._get_price(collateral_asset);
        const borrow_value = amount * this._get_price(asset);

        if (collateral_value < borrow_value * market.collateral_requirement) {
            throw new Error("Insufficient collateral");
        }

        market.total_borrowed += amount;
        market.reserves -= amount;
        this._update_utilization_rate(market);

        if (!user_position.borrows.has(asset)) {
            user_position.borrows.set(asset, 0);
        }
        user_position.borrows.set(asset, user_position.borrows.get(asset) + amount);

        if (!user_position.collateral.has(collateral_asset)) {
            user_position.collateral.set(collateral_asset, 0);
        }
        user_position.collateral.set(collateral_asset, user_position.collateral.get(collateral_asset) + collateral_amount);

        return this._calculate_interest(asset, amount);
    }

    repay(user, asset, amount) {
        if (!this.markets.has(asset)) {
            throw new Error(`Market for ${asset} does not exist`);
        }

        const user_position = this.user_positions.get(user);
        if (!user_position || !user_position.borrows.has(asset) || user_position.borrows.get(asset) < amount) {
            throw new Error(`Insufficient borrow balance for ${asset}`);
        }

        const market = this.markets.get(asset);
        market.total_borrowed -= amount;
        market.reserves += amount;
        this._update_utilization_rate(market);

        user_position.borrows.set(asset, user_position.borrows.get(asset) - amount);

        return this._calculate_interest(asset, amount);
    }

    withdraw_collateral(user, collateral_asset, amount) {
        const user_position = this.user_positions.get(user);
        if (!user_position || !user_position.collateral.has(collateral_asset) || user_position.collateral.get(collateral_asset) < amount) {
            throw new Error(`Insufficient collateral balance for ${collateral_asset}`);
        }

        user_position.collateral.set(collateral_asset, user_position.collateral.get(collateral_asset) - amount);

        if (!this._is_collateral_sufficient(user)) {
            throw new Error("Collateral becomes insufficient after withdrawal");
        }
    }

    get_user_position(user) {
        return this.user_positions.get(user) || { deposits: new Map(), borrows: new Map(), collateral: new Map() };
    }

    get_health_factor(user) {
        const user_position = this.user_positions.get(user);
        if (!user_position) {
            return Infinity;
        }

        const total_collateral = Array.from(user_position.collateral.entries()).reduce((sum, [asset, amount]) => 
            sum + amount * this._get_price(asset), 0
        );

        const total_debt = Array.from(user_position.borrows.entries()).reduce((sum, [asset, amount]) => 
            sum + amount * this._get_price(asset), 0
        );

        if (total_debt === 0) {
            return Infinity;
        }

        return total_collateral / total_debt;
    }

    get_liquidation_price(user) {
        const user_position = this.user_positions.get(user);
        if (!user_position) {
            return null;
        }

        const total_collateral = Array.from(user_position.collateral.entries()).reduce((sum, [asset, amount]) => 
            sum + amount * this._get_price(asset), 0
        );

        const total_debt = Array.from(user_position.borrows.entries()).reduce((sum, [asset, amount]) => 
            sum + amount * this._get_price(asset), 0
        );

        if (total_debt === 0) {
            return null;
        }

        const min_collateral_ratio = Array.from(this.markets.values()).reduce((min, market) => 
            Math.min(min, market.collateral_requirement), Infinity
        );

        return (total_debt * min_collateral_ratio) / total_collateral;
    }

    liquidate(user, liquidator, asset, amount) {
        const health_factor = this.get_health_factor(user);
        if (health_factor > 1) {
            throw new Error("Position is not undercollateralized");
        }

        const user_position = this.user_positions.get(user);
        if (!user_position.borrows.has(asset) || user_position.borrows.get(asset) < amount) {
            throw new Error(`Insufficient borrow balance for ${asset}`);
        }

        const market = this.markets.get(asset);
        user_position.borrows.set(asset, user_position.borrows.get(asset) - amount);
        market.total_borrowed -= amount;

        const collateral_asset = Array.from(user_position.collateral.keys())[0];
        const collateral_amount = amount * this._get_price(asset) / this._get_price(collateral_asset);
        user_position.collateral.set(collateral_asset, user_position.collateral.get(collateral_asset) - collateral_amount);

        return collateral_amount;
    }

    _update_utilization_rate(market) {
        if (market.total_supply === 0) {
            market.utilization_rate = 0;
        } else {
            market.utilization_rate = market.total_borrowed / market.total_supply;
        }
    }

    _is_collateral_sufficient(user) {
        const user_position = this.user_positions.get(user);
        if (!user_position) {
            return true;
        }

        const health_factor = this.get_health_factor(user);
        return health_factor >= 1;
    }

    _get_price(asset) {
        return 1;
    }

    _calculate_interest(asset, amount) {
        const market = this.markets.get(asset);
        const time = 1;
        return amount * market.interest_rate * time;
    }

    get_statistics() {
        const total_supply = Array.from(this.markets.values()).reduce((sum, market) => sum + market.total_supply, 0);
        const total_borrowed = Array.from(this.markets.values()).reduce((sum, market) => sum + market.total_borrowed, 0);
        const total_reserves = Array.from(this.markets.values()).reduce((sum, market) => sum + market.reserves, 0);

        const active_users = this.user_positions.size;
        const total_positions = Array.from(this.user_positions.values()).reduce((sum, position) => 
            sum + position.deposits.size + position.borrows.size + position.collateral.size, 0
        );

        return {
            total_supply,
            total_borrowed,
            total_reserves,
            active_users,
            total_positions,
            markets: Array.from(this.markets.values()).map(market => ({
                asset: market.asset,
                total_supply: market.total_supply,
                total_borrowed: market.total_borrowed,
                utilization_rate: market.utilization_rate,
                interest_rate: market.interest_rate
            }))
        };
    }
}
