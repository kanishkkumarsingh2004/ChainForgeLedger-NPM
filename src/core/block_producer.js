import { Block, create_block } from './block.js';
import { Transaction } from './transaction.js';
import { ExecutionPipeline, create_execution_pipeline, defaultPlugins } from './execution_pipeline.js';
import { logger } from '../utils/logger.js';
import { sha256_hash } from '../crypto/hashing.js';

/**
 * Block producer for creating and validating blocks
 */

export class BlockProducer {
    /**
     * Create a new BlockProducer instance
     * @param {Object} options - Block producer options
     */
    constructor(options = {}) {
        this.blockchain = options.blockchain || null;
        this.mempool = options.mempool || null;
        this.consensus = options.consensus || null;
        this.executionPipeline = options.executionPipeline || create_execution_pipeline({
            plugins: [defaultPlugins.logging, defaultPlugins.gasTracking]
        });
        this.maxBlockSize = options.maxBlockSize || 1000000; // 1MB
        this.maxTransactionsPerBlock = options.maxTransactionsPerBlock || 1000;
        this.blockTimeTarget = options.blockTimeTarget || 10000; // 10 seconds
        this.logger = logger;
    }

    /**
     * Produce a new block
     * @param {Object} options - Block production options
     * @returns {Object} Block production result
     */
    async produceBlock(options = {}) {
        this.logger.debug('Starting block production');

        try {
            // Get transactions from mempool
            const transactions = await this.selectTransactions(options);
            
            // Create new block
            const block = await this.createNewBlock(transactions, options);
            
            // Validate block
            const validation = await this.validateBlock(block);
            if (!validation.isValid) {
                throw new Error(`Block validation failed: ${validation.message}`);
            }

            // Add block to blockchain
            await this.blockchain.addBlock(block);
            
            // Execute block transactions
            const executionResult = await this.executionPipeline.processBlock(block);
            
            this.logger.debug(`Block ${block.index} produced successfully with ${transactions.length} transactions`);

            return {
                block,
                receipts: executionResult.receipts,
                success: true,
                message: `Block ${block.index} produced successfully`
            };

        } catch (error) {
            this.logger.error(`Block production failed: ${error.message}`);
            return {
                block: null,
                receipts: [],
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Select transactions from mempool for block
     * @param {Object} options - Transaction selection options
     * @returns {Transaction[]} Selected transactions
     */
    async selectTransactions(options = {}) {
        const { maxTransactions = this.maxTransactionsPerBlock } = options;
        
        if (!this.mempool) {
            this.logger.warn('No mempool available, returning empty transactions');
            return [];
        }

        // Get pending transactions
        const pendingTransactions = this.mempool.getTransactions();
        
        // Sort transactions by priority (fee per gas)
        const sortedTransactions = pendingTransactions.sort((a, b) => {
            const feePerGasA = a.fee / (a.data?.gasLimit || 21000);
            const feePerGasB = b.fee / (b.data?.gasLimit || 21000);
            return feePerGasB - feePerGasA;
        });

        // Select transactions that fit into block size
        const selectedTransactions = [];
        let blockSize = 0;

        for (const transaction of sortedTransactions) {
            const transactionSize = JSON.stringify(transaction.toJSON()).length;
            
            if (selectedTransactions.length < maxTransactions && 
                (blockSize + transactionSize) <= this.maxBlockSize) {
                
                selectedTransactions.push(transaction);
                blockSize += transactionSize;
            }

            if (selectedTransactions.length >= maxTransactions || blockSize >= this.maxBlockSize) {
                break;
            }
        }

        this.logger.debug(`Selected ${selectedTransactions.length} transactions from mempool`);
        return selectedTransactions;
    }

    /**
     * Create a new block
     * @param {Transaction[]} transactions - Transactions to include
     * @param {Object} options - Block creation options
     * @returns {Block} New block
     */
    async createNewBlock(transactions, options = {}) {
        const previousBlock = this.blockchain.getLatestBlock();
        const nextIndex = previousBlock.index + 1;

        const blockOptions = {
            index: nextIndex,
            timestamp: Date.now(),
            transactions: transactions,
            previousHash: previousBlock.hash,
            difficulty: this.calculateDifficulty(previousBlock),
            validator: options.validator || null
        };

        const block = create_block(blockOptions);
        
        // Perform consensus-specific block preparation
        if (this.consensus) {
            await this.consensus.prepareBlock(block);
        }

        // Calculate block hash
        block.hash = block.calculateHash();
        
        return block;
    }

    /**
     * Calculate block difficulty
     * @param {Block} previousBlock - Previous block
     * @returns {number} Difficulty value
     */
    calculateDifficulty(previousBlock) {
        // Simple difficulty adjustment based on block time
        const target = this.blockTimeTarget;
        const actual = Date.now() - previousBlock.timestamp;
        
        let difficulty = previousBlock.difficulty;
        
        if (actual < target * 0.5) {
            difficulty += 1;
        } else if (actual > target * 2 && difficulty > 1) {
            difficulty -= 1;
        }

        return Math.max(difficulty, 1);
    }

    /**
     * Validate block
     * @param {Block} block - Block to validate
     * @returns {Object} Validation result
     */
    async validateBlock(block) {
        const previousBlock = this.blockchain.getBlockByIndex(block.index - 1);
        const validation = block.validate(previousBlock);

        if (!validation.isValid) {
            return validation;
        }

        // Validate transactions in block
        const transactionValidation = this.validateBlockTransactions(block);
        if (!transactionValidation.isValid) {
            return transactionValidation;
        }

        // Validate block size
        if (block.size > this.maxBlockSize) {
            return {
                isValid: false,
                errors: [`Block size ${block.size} bytes exceeds maximum ${this.maxBlockSize} bytes`],
                message: `Block size exceeds maximum`
            };
        }

        // Validate transaction count
        if (block.getTransactionCount() > this.maxTransactionsPerBlock) {
            return {
                isValid: false,
                errors: [`Transaction count ${block.getTransactionCount()} exceeds maximum ${this.maxTransactionsPerBlock}`],
                message: `Transaction count exceeds maximum`
            };
        }

        // Execute consensus-specific validation
        if (this.consensus && typeof this.consensus.validateBlock === 'function') {
            const consensusValidation = await this.consensus.validateBlock(block);
            if (!consensusValidation.isValid) {
                return consensusValidation;
            }
        }

        return {
            isValid: true,
            errors: [],
            message: 'Block is valid'
        };
    }

    /**
     * Validate transactions in block
     * @param {Block} block - Block to validate
     * @returns {Object} Validation result
     */
    validateBlockTransactions(block) {
        const invalidTransactions = block.transactions.filter(tx => !tx.isValid());
        
        if (invalidTransactions.length > 0) {
            return {
                isValid: false,
                errors: invalidTransactions.map(tx => `Invalid transaction ${tx.id}: ${tx.validate().message}`),
                message: `Block contains ${invalidTransactions.length} invalid transactions`
            };
        }

        // Check for duplicate transactions
        const transactionIds = new Set();
        const duplicateTransactions = [];
        
        for (const transaction of block.transactions) {
            if (transactionIds.has(transaction.id)) {
                duplicateTransactions.push(transaction);
            }
            transactionIds.add(transaction.id);
        }
        
        if (duplicateTransactions.length > 0) {
            return {
                isValid: false,
                errors: duplicateTransactions.map(tx => `Duplicate transaction ${tx.id}`),
                message: `Block contains ${duplicateTransactions.length} duplicate transactions`
            };
        }

        return {
            isValid: true,
            errors: [],
            message: 'All transactions are valid'
        };
    }

    /**
     * Start block production
     * @param {Object} options - Production options
     */
    start(options = {}) {
        const { interval = this.blockTimeTarget } = options;
        
        this.logger.debug(`Starting block production with interval ${interval}ms`);
        
        this.productionInterval = setInterval(async () => {
            await this.produceBlock();
        }, interval);
    }

    /**
     * Stop block production
     */
    stop() {
        if (this.productionInterval) {
            clearInterval(this.productionInterval);
            this.productionInterval = null;
            this.logger.debug('Block production stopped');
        }
    }

    /**
     * Check if block production is running
     * @returns {boolean} True if running
     */
    isRunning() {
        return !!this.productionInterval;
    }

    /**
     * Get block producer statistics
     * @returns {Object} Statistics
     */
    getStatistics() {
        const latestBlock = this.blockchain.getLatestBlock();
        const transactionsInPool = this.mempool ? this.mempool.getTransactions().length : 0;
        
        return {
            isRunning: this.isRunning(),
            currentBlockIndex: latestBlock.index,
            transactionsInPool: transactionsInPool,
            maxBlockSize: this.maxBlockSize,
            maxTransactionsPerBlock: this.maxTransactionsPerBlock,
            blockTimeTarget: this.blockTimeTarget
        };
    }
}

/**
 * Create a new block producer
 * @param {Object} options - Block producer options
 * @returns {BlockProducer} New block producer instance
 */
export function create_block_producer(options = {}) {
    return new BlockProducer(options);
}

/**
 * Block production strategies
 */
export const blockProductionStrategies = {
    /**
     * Constant block time strategy
     */
    constantTime: {
        name: 'ConstantTimeStrategy',
        description: 'Produces blocks at a constant interval',
        create: (options = {}) => {
            return create_block_producer({
                blockTimeTarget: options.blockTime || 10000,
                maxTransactionsPerBlock: options.maxTransactions || 1000
            });
        }
    },

    /**
     * Dynamic block size strategy
     */
    dynamicSize: {
        name: 'DynamicSizeStrategy',
        description: 'Adjusts block size based on network conditions',
        create: (options = {}) => {
            return create_block_producer({
                maxBlockSize: options.initialSize || 1000000,
                blockTimeTarget: options.blockTime || 10000
            });
        }
    }
};
