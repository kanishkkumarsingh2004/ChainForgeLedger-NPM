/**
 * ChainForgeLedger Rate Limiter Module
 * 
 * Implements rate limiting functionality for blockchain operations.
 */

export class RateLimiter {
    /**
     * Create a new rate limiter instance.
     * @param {object} config - Configuration options
     */
    constructor(config = {}) {
        this.tokens_per_second = config.tokens_per_second || 10;
        this.token_max_balance = config.token_max_balance || 100;
        this.cost_per_request = config.cost_per_request || 1;
        this.block_duration = config.block_duration || 3600;
        this.whitelist = config.whitelist || [];
        this.blacklist = config.blacklist || [];
        
        this.user_tokens = new Map();
        this.user_blocked_until = new Map();
        this.user_request_counts = new Map();
        this.last_refill_time = Date.now();
        this.block_time = this.block_duration;
    }

    /**
     * Initialize rate limiter.
     */
    initialize() {
        this.user_tokens.clear();
        this.user_blocked_until.clear();
        this.user_request_counts.clear();
        this.last_refill_time = Date.now();
    }

    /**
     * Refill tokens for all users.
     */
    refill_tokens() {
        const now = Date.now();
        const seconds_since_last_refill = (now - this.last_refill_time) / 1000;
        const tokens_to_add = seconds_since_last_refill * this.tokens_per_second;

        this.user_tokens.forEach((current_tokens, user) => {
            const new_tokens = Math.min(
                current_tokens + tokens_to_add,
                this.token_max_balance
            );
            this.user_tokens.set(user, new_tokens);
        });

        this.last_refill_time = now;
    }

    /**
     * Check if user is whitelisted.
     * @param {string} user_id - User ID
     * @returns {boolean} Whether user is whitelisted
     */
    is_whitelisted(user_id) {
        return this.whitelist.includes(user_id);
    }

    /**
     * Check if user is blacklisted.
     * @param {string} user_id - User ID
     * @returns {boolean} Whether user is blacklisted
     */
    is_blacklisted(user_id) {
        return this.blacklist.includes(user_id);
    }

    /**
     * Check if user is blocked.
     * @param {string} user_id - User ID
     * @returns {boolean} Whether user is blocked
     */
    is_blocked(user_id) {
        if (this.user_blocked_until.has(user_id)) {
            const blocked_until = this.user_blocked_until.get(user_id);
            if (blocked_until > Date.now()) {
                return true;
            }
            this.user_blocked_until.delete(user_id);
        }
        return false;
    }

    /**
     * Block a user.
     * @param {string} user_id - User ID
     * @param {number} duration - Block duration in seconds
     */
    block_user(user_id, duration = null) {
        if (duration === null) {
            duration = this.block_time;
        }

        this.user_blocked_until.set(user_id, Date.now() + (duration * 1000));
    }

    /**
     * Unblock a user.
     * @param {string} user_id - User ID
     */
    unblock_user(user_id) {
        this.user_blocked_until.delete(user_id);
    }

    /**
     * Check rate limit for a user.
     * @param {string} user_id - User ID
     * @returns {object} Result object with status and details
     */
    check_rate_limit(user_id) {
        if (this.is_blacklisted(user_id)) {
            return { allowed: false, reason: 'User is blacklisted' };
        }

        if (this.is_whitelisted(user_id)) {
            return { allowed: true, reason: 'User is whitelisted' };
        }

        if (this.is_blocked(user_id)) {
            return { allowed: false, reason: 'User is blocked' };
        }

        this.refill_tokens();

        if (!this.user_tokens.has(user_id)) {
            this.user_tokens.set(user_id, this.token_max_balance);
        }

        const available_tokens = this.user_tokens.get(user_id);

        if (available_tokens < this.cost_per_request) {
            this.block_user(user_id, this.block_duration);
            return { allowed: false, reason: 'Rate limit exceeded' };
        }

        return { allowed: true, reason: 'Rate limit not exceeded' };
    }

    /**
     * Try to consume tokens for a request.
     * @param {string} user_id - User ID
     * @param {number} cost - Cost of the request (in tokens)
     * @returns {object} Result object
     */
    try_consume_tokens(user_id, cost = null) {
        if (cost === null) {
            cost = this.cost_per_request;
        }

        const check_result = this.check_rate_limit(user_id);
        
        if (!check_result.allowed) {
            return { allowed: false, reason: check_result.reason };
        }

        if (!this.user_tokens.has(user_id)) {
            this.user_tokens.set(user_id, this.token_max_balance);
        }

        const available_tokens = this.user_tokens.get(user_id);

        if (available_tokens < cost) {
            this.block_user(user_id, this.block_duration);
            return { allowed: false, reason: 'Not enough tokens' };
        }

        this.user_tokens.set(user_id, available_tokens - cost);

        if (!this.user_request_counts.has(user_id)) {
            this.user_request_counts.set(user_id, []);
        }

        this.user_request_counts.get(user_id).push(Date.now());

        return { allowed: true, reason: 'Request allowed' };
    }

    /**
     * Record request details.
     * @param {string} user_id - User ID
     * @param {string} request_type - Request type
     */
    record_request(user_id, request_type) {
        const now = Date.now();
        
        if (!this.user_request_counts.has(user_id)) {
            this.user_request_counts.set(user_id, []);
        }

        this.user_request_counts.get(user_id).push({
            timestamp: now,
            request_type,
            cost: this.cost_per_request
        });
    }

    /**
     * Get remaining rate limit for a user.
     * @param {string} user_id - User ID
     * @returns {object} Rate limit information
     */
    get_remaining_rate_limit(user_id) {
        if (this.is_whitelisted(user_id)) {
            return {
                allowed: true,
                reason: 'User is whitelisted',
                remaining_tokens: Infinity,
                total_tokens: Infinity,
                cost_per_request: 0
            };
        }

        if (this.is_blocked(user_id) || this.is_blacklisted(user_id)) {
            return {
                allowed: false,
                reason: this.is_blocked(user_id) ? 'User is blocked' : 'User is blacklisted',
                remaining_tokens: 0,
                total_tokens: this.token_max_balance,
                cost_per_request: this.cost_per_request
            };
        }

        const available_tokens = this.user_tokens.get(user_id) || this.token_max_balance;
        
        return {
            allowed: available_tokens >= this.cost_per_request,
            reason: available_tokens >= this.cost_per_request ? 'Rate limit not exceeded' : 'Rate limit exceeded',
            remaining_tokens: available_tokens,
            total_tokens: this.token_max_balance,
            cost_per_request: this.cost_per_request
        };
    }

    /**
     * Check if user is allowed to send messages.
     * @param {string} user_id - User ID
     * @param {number} message_count - Number of messages to send
     * @returns {object} Result object
     */
    check_send_message(user_id, message_count = 1) {
        const cost = message_count * this.cost_per_request;
        return this.try_consume_tokens(user_id, cost);
    }

    /**
     * Check if user is allowed to send transactions.
     * @param {string} user_id - User ID
     * @param {number} transaction_count - Number of transactions to send
     * @returns {object} Result object
     */
    check_send_transaction(user_id, transaction_count = 1) {
        const cost = transaction_count * (this.cost_per_request * 2); // Transactions cost more
        return this.try_consume_tokens(user_id, cost);
    }

    /**
     * Check if user is allowed to send blocks.
     * @param {string} user_id - User ID
     * @param {number} block_count - Number of blocks to send
     * @returns {object} Result object
     */
    check_send_block(user_id, block_count = 1) {
        const cost = block_count * (this.cost_per_request * 10); // Blocks cost the most
        return this.try_consume_tokens(user_id, cost);
    }

    /**
     * Clean up old request data.
     * @param {number} max_age - Maximum age of data to keep in milliseconds
     */
    clean_up_old_data(max_age = 24 * 60 * 60 * 1000) {
        const now = Date.now();

        for (let [user_id, timestamps] of this.user_request_counts.entries()) {
            const filtered_timestamps = timestamps.filter(time => now - time < max_age);
            this.user_request_counts.set(user_id, filtered_timestamps);
        }
    }

    /**
     * Get statistics.
     * @returns {object} Statistics
     */
    get_statistics() {
        const total_users = this.user_tokens.size;
        const blocked_users = Array.from(this.user_blocked_until.entries())
            .filter(([user, blocked_until]) => blocked_until > Date.now()).length;
        const whitelisted_count = this.whitelist.length;
        const blacklisted_count = this.blacklist.length;

        let total_tokens = 0;
        let total_request_counts = 0;
        let request_types = new Map();

        for (let [user, count] of this.user_tokens.entries()) {
            total_tokens += count;
            
            if (this.user_request_counts.has(user)) {
                const requests = this.user_request_counts.get(user);
                total_request_counts += requests.length;
                
                requests.forEach(request => {
                    if (typeof request === 'object' && request.request_type) {
                        const type = request.request_type;
                        request_types.set(type, (request_types.get(type) || 0) + 1);
                    }
                });
            }
        }

        return {
            total_users,
            blocked_users,
            whitelisted_count,
            blacklisted_count,
            average_tokens: total_users > 0 ? total_tokens / total_users : 0,
            total_requests: total_request_counts,
            request_types: Array.from(request_types.entries()),
            config: {
                tokens_per_second: this.tokens_per_second,
                token_max_balance: this.token_max_balance,
                cost_per_request: this.cost_per_request,
                block_duration: this.block_duration
            }
        };
    }

    /**
     * Get user request history.
     * @param {string} user_id - User ID
     * @param {number} limit - Maximum number of history entries to return
     * @returns {Array} Request history
     */
    get_user_request_history(user_id, limit = 50) {
        if (!this.user_request_counts.has(user_id)) {
            return [];
        }

        const history = this.user_request_counts.get(user_id).slice(-limit);
        return history.map(entry => {
            if (typeof entry === 'number') {
                return {
                    timestamp: entry,
                    request_type: 'unknown',
                    cost: this.cost_per_request
                };
            }
            return entry;
        });
    }

    /**
     * Calculate current limits for a user.
     * @param {string} user_id - User ID
     * @returns {object} Limit information
     */
    calculate_current_limits(user_id) {
        if (this.is_whitelisted(user_id)) {
            return { rate_limit: 0, cost_per_request: 0, limit_per_window: 0 };
        }

        const available_tokens = this.user_tokens.get(user_id) || this.token_max_balance;
        const cost = this.cost_per_request;

        return {
            rate_limit: this.tokens_per_second,
            cost_per_request: cost,
            limit_per_window: available_tokens
        };
    }

    /**
     * Get rate limiting configuration.
     * @returns {object} Configuration
     */
    get_rate_limiter_config() {
        return {
            tokens_per_second: this.tokens_per_second,
            token_max_balance: this.token_max_balance,
            cost_per_request: this.cost_per_request,
            block_duration: this.block_duration,
            whitelist: this.whitelist,
            blacklist: this.blacklist,
            block_time: this.block_time
        };
    }
}
