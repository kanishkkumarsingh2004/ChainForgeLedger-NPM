/**
 * Gas Engine - Research-level gas management system
 * 
 * A modular, extensible gas engine for blockchain transaction execution.
 * Features:
 * - Dynamic gas pricing based on network congestion
 * - Gas metering and accounting
 * - Gas limit enforcement
 * - Extensible gas models
 * - Gas refund mechanism
 * - Block gas limits
 * - Transaction gas limits
 */

export class GasEngine {
    /**
     * Create a new GasEngine instance
     * @param {Object} options - Gas engine options
     */
    constructor(options = {}) {
        this.blockGasLimit = options.blockGasLimit || 10000000; // 10 million gas
        this.baseGasPrice = options.baseGasPrice || 1000000000; // 1 gwei
        this.gasPriceAdjustment = options.gasPriceAdjustment || 1.1; // 10% adjustment
        this.minGasPrice = options.minGasPrice || 100000000; // 0.1 gwei
        this.maxGasPrice = options.maxGasPrice || 100000000000; // 100 gwei
        
        // Gas cost configuration
        this.gasCosts = {
            transaction: 21000,
            contractCreation: 53000,
            bytecode: {
                zero: 4,
                nonZero: 16,
                initCode: 2
            },
            storage: {
                set: 20000,
                update: 5000,
                read: 800,
                delete: 15000
            },
            computation: {
                base: 3,
                arithmatic: {
                    add: 3,
                    sub: 3,
                    mul: 5,
                    div: 5,
                    mod: 5,
                    exp: 10
                },
                comparison: {
                    lt: 3,
                    gt: 3,
                    eq: 3,
                    and: 3,
                    or: 3
                }
            },
            memory: {
                word: 3,
                expansion: 6
            },
            log: {
                base: 375,
                perTopic: 375,
                perByte: 8
            }
        };
        
        this.currentBlockGasUsed = 0;
        this.transactionGasRecords = new Map();
    }
    
    /**
     * Calculate dynamic gas price based on network congestion
     * @param {number} congestionLevel - Congestion level (0-1)
     * @returns {number} Gas price in wei
     */
    calculateDynamicGasPrice(congestionLevel = 0) {
        const adjustedPrice = this.baseGasPrice * Math.pow(this.gasPriceAdjustment, congestionLevel * 10);
        return Math.max(this.minGasPrice, Math.min(this.maxGasPrice, adjustedPrice));
    }
    
    /**
     * Get block gas limit
     * @returns {number} Block gas limit
     */
    getBlockGasLimit() {
        return this.blockGasLimit;
    }
    
    /**
     * Get remaining gas in block
     * @returns {number} Remaining gas
     */
    getRemainingBlockGas() {
        return this.blockGasLimit - this.currentBlockGasUsed;
    }
    
    /**
     * Check if transaction can fit in block
     * @param {number} gasLimit - Transaction gas limit
     * @returns {boolean} True if transaction can fit
     */
    canFitTransaction(gasLimit) {
        return this.currentBlockGasUsed + gasLimit <= this.blockGasLimit;
    }
    
    /**
     * Start tracking gas for a transaction
     * @param {string} transactionId - Transaction ID
     * @param {number} gasLimit - Transaction gas limit
     * @param {number} gasPrice - Transaction gas price
     */
    startTransaction(transactionId, gasLimit, gasPrice) {
        this.transactionGasRecords.set(transactionId, {
            gasLimit,
            gasPrice,
            gasUsed: 0,
            gasRefund: 0,
            startTime: Date.now()
        });
    }
    
    /**
     * Track gas usage for a transaction
     * @param {string} transactionId - Transaction ID
     * @param {string} operation - Operation type
     * @param {number} gasAmount - Gas amount used
     * @param {Object} context - Operation context
     */
    trackGasUsage(transactionId, operation, gasAmount, context = {}) {
        const record = this.transactionGasRecords.get(transactionId);
        if (!record) {
            throw new Error(`Transaction ${transactionId} not found`);
        }
        
        record.gasUsed += gasAmount;
        
        if (record.gasUsed > record.gasLimit) {
            throw new Error(`Out of gas: used ${record.gasUsed}, limit ${record.gasLimit}`);
        }
        
        // Track block gas usage
        this.currentBlockGasUsed += gasAmount;
        
        if (this.currentBlockGasUsed > this.blockGasLimit) {
            throw new Error(`Block gas limit exceeded: ${this.currentBlockGasUsed}/${this.blockGasLimit}`);
        }
    }
    
    /**
     * Add gas refund
     * @param {string} transactionId - Transaction ID
     * @param {number} refundAmount - Refund amount
     */
    addGasRefund(transactionId, refundAmount) {
        const record = this.transactionGasRecords.get(transactionId);
        if (!record) {
            throw new Error(`Transaction ${transactionId} not found`);
        }
        
        record.gasRefund += refundAmount;
    }
    
    /**
     * Get transaction gas record
     * @param {string} transactionId - Transaction ID
     * @returns {Object} Gas record
     */
    getTransactionGasRecord(transactionId) {
        return this.transactionGasRecords.get(transactionId);
    }
    
    /**
     * Calculate total gas cost for transaction
     * @param {string} transactionId - Transaction ID
     * @returns {number} Total gas cost in wei
     */
    calculateTransactionCost(transactionId) {
        const record = this.transactionGasRecords.get(transactionId);
        if (!record) {
            throw new Error(`Transaction ${transactionId} not found`);
        }
        
        const effectiveGasUsed = record.gasUsed - Math.min(record.gasRefund, Math.floor(record.gasUsed / 2));
        return effectiveGasUsed * record.gasPrice;
    }
    
    /**
     * Finalize transaction gas tracking
     * @param {string} transactionId - Transaction ID
     * @returns {Object} Final gas report
     */
    finalizeTransaction(transactionId) {
        const record = this.transactionGasRecords.get(transactionId);
        if (!record) {
            throw new Error(`Transaction ${transactionId} not found`);
        }
        
        const cost = this.calculateTransactionCost(transactionId);
        const duration = Date.now() - record.startTime;
        
        this.transactionGasRecords.delete(transactionId);
        
        return {
            ...record,
            cost,
            duration,
            effectiveGasUsed: record.gasUsed - Math.min(record.gasRefund, Math.floor(record.gasUsed / 2))
        };
    }
    
    /**
     * Reset gas engine for new block
     */
    resetForNewBlock() {
        this.currentBlockGasUsed = 0;
        this.transactionGasRecords.clear();
    }
    
    /**
     * Calculate gas cost for specific operations
     * @param {string} operation - Operation type
     * @param {Object} params - Operation parameters
     * @returns {number} Gas cost
     */
    calculateOperationCost(operation, params = {}) {
        switch (operation) {
            case 'transaction':
                return this.gasCosts.transaction;
            case 'contractCreation':
                return this.gasCosts.contractCreation;
            case 'bytecode':
                return this.calculateBytecodeCost(params);
            case 'storage':
                return this.calculateStorageCost(params);
            case 'computation':
                return this.calculateComputationCost(params);
            case 'memory':
                return this.calculateMemoryCost(params);
            case 'log':
                return this.calculateLogCost(params);
            default:
                return this.gasCosts.computation.base;
        }
    }
    
    /**
     * Calculate bytecode gas cost
     * @param {Object} params - Parameters
     * @returns {number} Gas cost
     */
    calculateBytecodeCost(params) {
        const { data = '', isInitCode = false } = params;
        let cost = 0;
        
        for (let i = 0; i < data.length; i++) {
            const byte = data.charCodeAt(i);
            cost += byte === 0 ? this.gasCosts.bytecode.zero : this.gasCosts.bytecode.nonZero;
        }
        
        return isInitCode ? cost * this.gasCosts.bytecode.initCode : cost;
    }
    
    /**
     * Calculate storage gas cost
     * @param {Object} params - Parameters
     * @returns {number} Gas cost
     */
    calculateStorageCost(params) {
        const { operation, key, value, previousValue } = params;
        
        switch (operation) {
            case 'set':
                return previousValue ? this.gasCosts.storage.update : this.gasCosts.storage.set;
            case 'update':
                return this.gasCosts.storage.update;
            case 'read':
                return this.gasCosts.storage.read;
            case 'delete':
                return this.gasCosts.storage.delete;
            default:
                return 0;
        }
    }
    
    /**
     * Calculate computation gas cost
     * @param {Object} params - Parameters
     * @returns {number} Gas cost
     */
    calculateComputationCost(params) {
        const { operation, type } = params;
        
        if (type) {
            return this.gasCosts.computation[type]?.[operation] || this.gasCosts.computation.base;
        }
        
        return this.gasCosts.computation.base;
    }
    
    /**
     * Calculate memory gas cost
     * @param {Object} params - Parameters
     * @returns {number} Gas cost
     */
    calculateMemoryCost(params) {
        const { size, expansion = false } = params;
        const wordSize = Math.ceil(size / 32);
        
        if (expansion) {
            return wordSize * this.gasCosts.memory.expansion;
        }
        
        return wordSize * this.gasCosts.memory.word;
    }
    
    /**
     * Calculate log gas cost
     * @param {Object} params - Parameters
     * @returns {number} Gas cost
     */
    calculateLogCost(params) {
        const { topics = [], data = '' } = params;
        
        return this.gasCosts.log.base + 
               (topics.length * this.gasCosts.log.perTopic) + 
               (data.length * this.gasCosts.log.perByte);
    }
}

export class GasPriceOracle {
    /**
     * Create a new GasPriceOracle instance
     * @param {Object} options - Oracle options
     */
    constructor(options = {}) {
        this.historySize = options.historySize || 100;
        this.priceHistory = [];
        this.minBlockConfirmations = options.minBlockConfirmations || 6;
    }
    
    /**
     * Add block price data
     * @param {number} blockNumber - Block number
     * @param {number} averageGasPrice - Average gas price
     * @param {number} gasUsed - Gas used
     * @param {number} gasLimit - Gas limit
     */
    addBlockData(blockNumber, averageGasPrice, gasUsed, gasLimit) {
        const congestion = gasUsed / gasLimit;
        
        this.priceHistory.push({
            blockNumber,
            averageGasPrice,
            gasUsed,
            gasLimit,
            congestion,
            timestamp: Date.now()
        });
        
        if (this.priceHistory.length > this.historySize) {
            this.priceHistory.shift();
        }
    }
    
    /**
     * Get recommended gas prices (slow, standard, fast)
     * @param {number} blockCount - Number of blocks to consider
     * @returns {Object} Recommended prices
     */
    getRecommendedPrices(blockCount = 20) {
        const recentBlocks = this.priceHistory.slice(-blockCount);
        
        if (recentBlocks.length === 0) {
            return {
                slow: 1000000000,   // 1 gwei
                standard: 2000000000, // 2 gwei
                fast: 3000000000    // 3 gwei
            };
        }
        
        // Calculate percentiles
        const sortedPrices = recentBlocks.map(b => b.averageGasPrice).sort((a, b) => a - b);
        
        return {
            slow: sortedPrices[Math.floor(sortedPrices.length * 0.3)],
            standard: sortedPrices[Math.floor(sortedPrices.length * 0.5)],
            fast: sortedPrices[Math.floor(sortedPrices.length * 0.8)]
        };
    }
    
    /**
     * Get network congestion level
     * @returns {number} Congestion level (0-1)
     */
    getCongestionLevel() {
        const recentBlocks = this.priceHistory.slice(-20);
        
        if (recentBlocks.length === 0) {
            return 0.1;
        }
        
        return recentBlocks.reduce((sum, block) => sum + block.congestion, 0) / recentBlocks.length;
    }
    
    /**
     * Get gas price history
     * @returns {Array} Price history
     */
    getPriceHistory() {
        return [...this.priceHistory];
    }
}

export class GasLimitCalculator {
    /**
     * Create a new GasLimitCalculator instance
     * @param {Object} options - Calculator options
     */
    constructor(options = {}) {
        this.targetGasUtilization = options.targetGasUtilization || 0.5; // 50%
        this.maxGasLimitChange = options.maxGasLimitChange || 0.1; // 10% per block
        this.minGasLimit = options.minGasLimit || 1000000; // 1 million gas
        this.maxGasLimit = options.maxGasLimit || 30000000; // 30 million gas
    }
    
    /**
     * Calculate new gas limit based on previous block
     * @param {number} previousGasLimit - Previous block gas limit
     * @param {number} previousGasUsed - Previous block gas used
     * @returns {number} New gas limit
     */
    calculateNewGasLimit(previousGasLimit, previousGasUsed) {
        const utilization = previousGasUsed / previousGasLimit;
        const adjustmentFactor = 1 + (utilization - this.targetGasUtilization) * 0.1;
        
        let newGasLimit = previousGasLimit * adjustmentFactor;
        
        // Limit change per block
        const maxChange = previousGasLimit * this.maxGasLimitChange;
        const minAllowed = previousGasLimit - maxChange;
        const maxAllowed = previousGasLimit + maxChange;
        
        newGasLimit = Math.max(minAllowed, Math.min(maxAllowed, newGasLimit));
        
        // Clamp to min/max values
        newGasLimit = Math.max(this.minGasLimit, Math.min(this.maxGasLimit, newGasLimit));
        
        return Math.floor(newGasLimit);
    }
}