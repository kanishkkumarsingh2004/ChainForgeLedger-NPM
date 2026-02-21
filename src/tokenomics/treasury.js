/**
 * ChainForgeLedger Tokenomics Module - Treasury Management
 * 
 * Implements treasury management and financial operations.
 */

export class TreasuryManager {
    /**
     * Create a new treasury manager instance.
     * @param {object} config - Treasury configuration
     */
    constructor(config = {}) {
        this.treasury_address = config.treasury_address || '0x1234567890abcdef';
        this.tokenomics = config.tokenomics || null;
        this.liquidity_pool = config.liquidity_pool || null;
        this.staking = config.staking || null;
        this.governance = config.governance || null;
        this.balance = config.balance || {
            native: 0,
            stablecoins: 0,
            other_tokens: 0
        };
        this.assets = config.assets || [];
        this.liabilities = config.liabilities || [];
        this.expenses = config.expenses || {
            development: 0,
            operational: 0,
            marketing: 0,
            other: 0
        };
        this.income = config.income || {
            fees: 0,
            staking_rewards: 0,
            trading_volume: 0,
            other: 0
        };
        this.reserves = config.reserves || {
            operational: 0,
            development: 0,
            marketing: 0,
            stability: 0
        };
        this.treasury_distribution = config.treasury_distribution || {
            operational: 0.4,
            development: 0.3,
            marketing: 0.15,
            stability: 0.15
        };
    }

    /**
     * Get treasury data.
     * @returns {object} Treasury data
     */
    get_treasury_data() {
        return {
            treasury_address: this.treasury_address,
            balance: this.balance,
            assets: this.assets,
            liabilities: this.liabilities,
            expenses: this.expenses,
            income: this.income,
            reserves: this.reserves,
            distribution: this.treasury_distribution
        };
    }

    /**
     * Calculate total treasury balance.
     * @returns {number} Total treasury balance
     */
    calculate_total_balance() {
        let total = 0;
        
        if (this.balance) {
            total += (this.balance.native || 0);
            total += (this.balance.stablecoins || 0);
            total += (this.balance.other_tokens || 0);
        }
        
        if (this.reserves) {
            total += Object.values(this.reserves).reduce((sum, value) => sum + value, 0);
        }
        
        return total;
    }

    /**
     * Calculate total assets.
     * @returns {number} Total assets
     */
    calculate_total_assets() {
        return this.assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
    }

    /**
     * Calculate total liabilities.
     * @returns {number} Total liabilities
     */
    calculate_total_liabilities() {
        return this.liabilities.reduce((sum, liability) => sum + (liability.value || 0), 0);
    }

    /**
     * Calculate net worth.
     * @returns {number} Net worth
     */
    calculate_net_worth() {
        const total_balance = this.calculate_total_balance();
        const total_assets = this.calculate_total_assets();
        const total_liabilities = this.calculate_total_liabilities();
        
        return total_balance + total_assets - total_liabilities;
    }

    /**
     * Calculate total expenses.
     * @returns {number} Total expenses
     */
    calculate_total_expenses() {
        return Object.values(this.expenses).reduce((sum, value) => sum + value, 0);
    }

    /**
     * Calculate total income.
     * @returns {number} Total income
     */
    calculate_total_income() {
        return Object.values(this.income).reduce((sum, value) => sum + value, 0);
    }

    /**
     * Calculate net income.
     * @returns {number} Net income
     */
    calculate_net_income() {
        const total_income = this.calculate_total_income();
        const total_expenses = this.calculate_total_expenses();
        
        return total_income - total_expenses;
    }

    /**
     * Calculate monthly expenses.
     * @param {number} monthly_multiplier - Monthly multiplier (optional)
     * @returns {number} Monthly expenses
     */
    calculate_monthly_expenses(monthly_multiplier = 1) {
        return this.calculate_total_expenses() * monthly_multiplier;
    }

    /**
     * Calculate quarterly expenses.
     * @param {number} quarterly_multiplier - Quarterly multiplier (optional)
     * @returns {number} Quarterly expenses
     */
    calculate_quarterly_expenses(quarterly_multiplier = 1) {
        return this.calculate_total_expenses() * quarterly_multiplier * 3;
    }

    /**
     * Calculate annual expenses.
     * @param {number} annual_multiplier - Annual multiplier (optional)
     * @returns {number} Annual expenses
     */
    calculate_annual_expenses(annual_multiplier = 1) {
        return this.calculate_total_expenses() * annual_multiplier * 12;
    }

    /**
     * Calculate monthly income.
     * @param {number} monthly_multiplier - Monthly multiplier (optional)
     * @returns {number} Monthly income
     */
    calculate_monthly_income(monthly_multiplier = 1) {
        return this.calculate_total_income() * monthly_multiplier;
    }

    /**
     * Calculate quarterly income.
     * @param {number} quarterly_multiplier - Quarterly multiplier (optional)
     * @returns {number} Quarterly income
     */
    calculate_quarterly_income(quarterly_multiplier = 1) {
        return this.calculate_total_income() * quarterly_multiplier * 3;
    }

    /**
     * Calculate annual income.
     * @param {number} annual_multiplier - Annual multiplier (optional)
     * @returns {number} Annual income
     */
    calculate_annual_income(annual_multiplier = 1) {
        return this.calculate_total_income() * annual_multiplier * 12;
    }

    /**
     * Calculate monthly net income.
     * @param {number} monthly_multiplier - Monthly multiplier (optional)
     * @returns {number} Monthly net income
     */
    calculate_monthly_net_income(monthly_multiplier = 1) {
        return this.calculate_monthly_income(monthly_multiplier) - this.calculate_monthly_expenses(monthly_multiplier);
    }

    /**
     * Calculate quarterly net income.
     * @param {number} quarterly_multiplier - Quarterly multiplier (optional)
     * @returns {number} Quarterly net income
     */
    calculate_quarterly_net_income(quarterly_multiplier = 1) {
        return this.calculate_quarterly_income(quarterly_multiplier) - this.calculate_quarterly_expenses(quarterly_multiplier);
    }

    /**
     * Calculate annual net income.
     * @param {number} annual_multiplier - Annual multiplier (optional)
     * @returns {number} Annual net income
     */
    calculate_annual_net_income(annual_multiplier = 1) {
        return this.calculate_annual_income(annual_multiplier) - this.calculate_annual_expenses(annual_multiplier);
    }

    /**
     * Calculate operational reserve.
     * @param {number} monthly_expenses - Monthly expenses (optional)
     * @returns {object} Operational reserve information
     */
    calculate_operational_reserve(monthly_expenses = null) {
        const effective_monthly = monthly_expenses !== null ? monthly_expenses : this.calculate_monthly_expenses();
        const reserve = this.reserves.operational;
        const months_covered = reserve / effective_monthly;
        
        return {
            reserve,
            monthly_expenses: effective_monthly,
            months_covered,
            years_covered: months_covered / 12,
            status: months_covered >= 6 ? 'sufficient' : 'insufficient'
        };
    }

    /**
     * Calculate reserve distribution.
     * @param {number} total_reserve - Total reserve amount (optional, uses current if not provided)
     * @returns {object} Reserve distribution
     */
    calculate_reserve_distribution(total_reserve = null) {
        const effective_total = total_reserve !== null ? total_reserve : Object.values(this.reserves).reduce((sum, value) => sum + value, 0);
        
        const distribution = Object.keys(this.treasury_distribution).reduce((result, category) => {
            result[category] = effective_total * this.treasury_distribution[category];
            return result;
        }, {});

        return {
            distribution,
            percentages: this.treasury_distribution
        };
    }

    /**
     * Set treasury address.
     * @param {string} address - New treasury address
     */
    set_treasury_address(address) {
        this.treasury_address = address;
    }

    /**
     * Set treasury distribution.
     * @param {object} distribution - New treasury distribution percentages
     */
    set_treasury_distribution(distribution) {
        const total = Object.values(distribution).reduce((sum, value) => sum + value, 0);
        
        if (Math.abs(total - 1) > 0.01) {
            throw new Error('Treasury distribution percentages must sum to 1');
        }
        
        this.treasury_distribution = distribution;
    }

    /**
     * Set balance.
     * @param {object} balance - New balance
     */
    set_balance(balance) {
        this.balance = {
            ...this.balance,
            ...balance
        };
    }

    /**
     * Set assets.
     * @param {Array} assets - New assets list
     */
    set_assets(assets) {
        this.assets = assets;
    }

    /**
     * Set liabilities.
     * @param {Array} liabilities - New liabilities list
     */
    set_liabilities(liabilities) {
        this.liabilities = liabilities;
    }

    /**
     * Set expenses.
     * @param {object} expenses - New expenses
     */
    set_expenses(expenses) {
        this.expenses = {
            ...this.expenses,
            ...expenses
        };
    }

    /**
     * Set income.
     * @param {object} income - New income
     */
    set_income(income) {
        this.income = {
            ...this.income,
            ...income
        };
    }

    /**
     * Set reserves.
     * @param {object} reserves - New reserves
     */
    set_reserves(reserves) {
        this.reserves = {
            ...this.reserves,
            ...reserves
        };
    }

    /**
     * Set tokenomics reference.
     * @param {object} tokenomics - Tokenomics instance
     */
    set_tokenomics(tokenomics) {
        this.tokenomics = tokenomics;
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
     * Calculate financial health metrics.
     * @returns {object} Financial health metrics
     */
    calculate_financial_health() {
        const total_balance = this.calculate_total_balance();
        const net_worth = this.calculate_net_worth();
        const net_income = this.calculate_net_income();
        const operational_reserve = this.calculate_operational_reserve();
        
        return {
            total_balance,
            net_worth,
            net_income,
            operational_reserve,
            balance_to_expenses_ratio: total_balance / this.calculate_total_expenses(),
            net_worth_to_expenses_ratio: net_worth / this.calculate_total_expenses(),
            income_to_expenses_ratio: this.calculate_total_income() / this.calculate_total_expenses(),
            operational_reserve_health: operational_reserve.status
        };
    }

    /**
     * Calculate financial overview.
     * @returns {object} Financial overview
     */
    calculate_financial_overview() {
        const health = this.calculate_financial_health();
        
        return {
            summary: {
                total_balance: health.total_balance,
                net_worth: health.net_worth,
                net_income: health.net_income
            },
            health: health,
            balance: this.balance,
            assets: this.assets,
            liabilities: this.liabilities,
            expenses: this.expenses,
            income: this.income,
            reserves: this.reserves
        };
    }

    /**
     * Calculate reserves by category.
     * @returns {object} Reserves by category
     */
    calculate_reserves_by_category() {
        const total_reserves = Object.values(this.reserves).reduce((sum, value) => sum + value, 0);
        
        return Object.keys(this.reserves).reduce((result, category) => {
            const amount = this.reserves[category];
            const percentage = total_reserves > 0 ? (amount / total_reserves) * 100 : 0;
            
            result[category] = {
                amount,
                percentage
            };
            
            return result;
        }, {});
    }

    /**
     * Calculate expenses by category.
     * @returns {object} Expenses by category
     */
    calculate_expenses_by_category() {
        const total_expenses = this.calculate_total_expenses();
        
        return Object.keys(this.expenses).reduce((result, category) => {
            const amount = this.expenses[category];
            const percentage = total_expenses > 0 ? (amount / total_expenses) * 100 : 0;
            
            result[category] = {
                amount,
                percentage
            };
            
            return result;
        }, {});
    }

    /**
     * Calculate income by category.
     * @returns {object} Income by category
     */
    calculate_income_by_category() {
        const total_income = this.calculate_total_income();
        
        return Object.keys(this.income).reduce((result, category) => {
            const amount = this.income[category];
            const percentage = total_income > 0 ? (amount / total_income) * 100 : 0;
            
            result[category] = {
                amount,
                percentage
            };
            
            return result;
        }, {});
    }

    /**
     * Calculate quarterly budget.
     * @param {number} quarterly_multiplier - Quarterly multiplier (optional)
     * @returns {object} Quarterly budget
     */
    calculate_quarterly_budget(quarterly_multiplier = 1) {
        const quarterly_income = this.calculate_quarterly_income(quarterly_multiplier);
        const quarterly_expenses = this.calculate_quarterly_expenses(quarterly_multiplier);
        const quarterly_net_income = this.calculate_quarterly_net_income(quarterly_multiplier);
        
        return {
            income: quarterly_income,
            expenses: quarterly_expenses,
            net_income: quarterly_net_income
        };
    }

    /**
     * Calculate annual budget.
     * @param {number} annual_multiplier - Annual multiplier (optional)
     * @returns {object} Annual budget
     */
    calculate_annual_budget(annual_multiplier = 1) {
        const annual_income = this.calculate_annual_income(annual_multiplier);
        const annual_expenses = this.calculate_annual_expenses(annual_multiplier);
        const annual_net_income = this.calculate_annual_net_income(annual_multiplier);
        
        return {
            income: annual_income,
            expenses: annual_expenses,
            net_income: annual_net_income
        };
    }

    /**
     * Calculate financial year-over-year comparison.
     * @param {object} previous_financials - Previous year financials
     * @returns {object} Year-over-year comparison
     */
    calculate_year_over_year_comparison(previous_financials) {
        const current = {
            income: this.calculate_annual_income(),
            expenses: this.calculate_annual_expenses(),
            net_income: this.calculate_annual_net_income(),
            total_balance: this.calculate_total_balance(),
            net_worth: this.calculate_net_worth()
        };
        
        return {
            income: {
                current: current.income,
                previous: previous_financials.income,
                change: current.income - previous_financials.income,
                percentage_change: previous_financials.income > 0 ? ((current.income - previous_financials.income) / previous_financials.income) * 100 : 0
            },
            expenses: {
                current: current.expenses,
                previous: previous_financials.expenses,
                change: current.expenses - previous_financials.expenses,
                percentage_change: previous_financials.expenses > 0 ? ((current.expenses - previous_financials.expenses) / previous_financials.expenses) * 100 : 0
            },
            net_income: {
                current: current.net_income,
                previous: previous_financials.net_income,
                change: current.net_income - previous_financials.net_income,
                percentage_change: previous_financials.net_income > 0 ? ((current.net_income - previous_financials.net_income) / previous_financials.net_income) * 100 : 0
            },
            total_balance: {
                current: current.total_balance,
                previous: previous_financials.total_balance,
                change: current.total_balance - previous_financials.total_balance,
                percentage_change: previous_financials.total_balance > 0 ? ((current.total_balance - previous_financials.total_balance) / previous_financials.total_balance) * 100 : 0
            },
            net_worth: {
                current: current.net_worth,
                previous: previous_financials.net_worth,
                change: current.net_worth - previous_financials.net_worth,
                percentage_change: previous_financials.net_worth > 0 ? ((current.net_worth - previous_financials.net_worth) / previous_financials.net_worth) * 100 : 0
            }
        };
    }
}

export class TreasuryPolicy {
    /**
     * Create a new treasury policy instance.
     * @param {TreasuryManager} treasury_manager - Treasury manager instance
     */
    constructor(treasury_manager) {
        this.treasury_manager = treasury_manager;
        this.policies = {
            operational_reserve: {
                minimum_months: 6,
                target_months: 12
            },
            expense_approval: {
                required_approvals: 2,
                maximum_single_expense: 100000
            },
            reserve_investment: {
                maximum_risk: 0.1,
                minimum_risk_free: 0.5
            },
            budget_approval: {
                required_approvals: 3,
                quarterly_budget: true,
                annual_budget: true
            }
        };
    }

    /**
     * Get treasury policies.
     * @returns {object} Treasury policies
     */
    get_treasury_policies() {
        return this.policies;
    }

    /**
     * Check policy compliance.
     * @returns {object} Policy compliance status
     */
    check_policy_compliance() {
        const operational_reserve = this.treasury_manager.calculate_operational_reserve();
        
        return {
            operational_reserve: {
                compliant: operational_reserve.months_covered >= this.policies.operational_reserve.minimum_months,
                current_months: operational_reserve.months_covered,
                minimum_months: this.policies.operational_reserve.minimum_months,
                target_months: this.policies.operational_reserve.target_months
            }
        };
    }

    /**
     * Set policy.
     * @param {string} policy_name - Policy name
     * @param {object} policy - Policy configuration
     */
    set_policy(policy_name, policy) {
        this.policies[policy_name] = {
            ...this.policies[policy_name],
            ...policy
        };
    }

    /**
     * Validate expense against policy.
     * @param {object} expense - Expense to validate
     * @returns {object} Validation result
     */
    validate_expense(expense) {
        const is_single_expense_compliant = expense.amount <= this.policies.expense_approval.maximum_single_expense;
        
        return {
            compliant: is_single_expense_compliant,
            reasons: is_single_expense_compliant ? [] : [
                `Expense amount exceeds maximum single expense limit of ${this.policies.expense_approval.maximum_single_expense}`
            ]
        };
    }

    /**
     * Calculate recommended reserve levels.
     * @param {number} monthly_expenses - Monthly expenses (optional)
     * @returns {object} Recommended reserve levels
     */
    calculate_recommended_reserve_levels(monthly_expenses = null) {
        const effective_monthly = monthly_expenses !== null ? monthly_expenses : this.treasury_manager.calculate_monthly_expenses();
        
        return {
            minimum_reserve: effective_monthly * this.policies.operational_reserve.minimum_months,
            target_reserve: effective_monthly * this.policies.operational_reserve.target_months
        };
    }

    /**
     * Calculate required approvals.
     * @param {string} request_type - Request type (expense, budget)
     * @returns {number} Required approvals
     */
    calculate_required_approvals(request_type) {
        if (request_type === 'expense') {
            return this.policies.expense_approval.required_approvals;
        } else if (request_type === 'budget') {
            return this.policies.budget_approval.required_approvals;
        }
        
        return 1;
    }
}
