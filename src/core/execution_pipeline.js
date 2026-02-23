import { TransactionReceipt, create_transaction_receipt } from './receipt.js';
import { logger } from '../utils/logger.js';

/**
 * Execution pipeline for processing transactions and blocks
 */

export class ExecutionPipeline {
    /**
     * Create a new ExecutionPipeline instance
     * @param {Object} options - Pipeline options
     */
    constructor(options = {}) {
        this.stateMachine = options.stateMachine || null;
        this.gasCalculator = options.gasCalculator || null;
        this.feeCalculator = options.feeCalculator || null;
        this.eventEmitter = options.eventEmitter || null;
        this.plugins = options.plugins || [];
        this.logger = logger;
    }

    /**
     * Process a single transaction
     * @param {Transaction} transaction - Transaction to process
     * @param {Object} context - Execution context
     * @returns {TransactionReceipt} Transaction receipt
     */
    async processTransaction(transaction, context = {}) {
        const receipt = create_transaction_receipt({
            transactionId: transaction.id,
            blockHash: context.blockHash || null,
            blockNumber: context.blockNumber || null
        });

        try {
            this.logger.debug(`Processing transaction ${transaction.id}`);

            // Validate transaction before execution
            const validation = transaction.validate();
            if (!validation.isValid) {
                receipt.setStatus('failed');
                receipt.addLog({
                    type: 'error',
                    message: validation.message,
                    timestamp: Date.now()
                });
                return receipt;
            }

            // Execute pre-processing plugins
            await this.executePlugins('preProcess', transaction, receipt, context);

            // Calculate gas requirements
            const gasLimit = transaction.data?.gasLimit || 21000;
            const gasPrice = transaction.fee || 0.001;
            receipt.setGasPrice(gasPrice);

            // Execute transaction
            const executionResult = await this.executeTransaction(transaction, context);
            
            // Update receipt with execution results
            receipt.setStatus('successful');
            receipt.setGasUsed(executionResult.gasUsed);
            receipt.setFee(executionResult.fee);
            receipt.addLogs(executionResult.logs || []);
            
            if (executionResult.contractAddress) {
                receipt.setContractAddress(executionResult.contractAddress);
            }

            // Execute post-processing plugins
            await this.executePlugins('postProcess', transaction, receipt, context);

            this.logger.debug(`Transaction ${transaction.id} processed successfully`);

        } catch (error) {
            this.logger.error(`Transaction ${transaction.id} failed: ${error.message}`);
            receipt.setStatus('failed');
            receipt.addLog({
                type: 'error',
                message: error.message,
                stack: error.stack,
                timestamp: Date.now()
            });
        }

        return receipt;
    }

    /**
     * Process multiple transactions
     * @param {Transaction[]} transactions - Transactions to process
     * @param {Object} context - Execution context
     * @returns {TransactionReceipt[]} Array of transaction receipts
     */
    async processTransactions(transactions, context = {}) {
        const receipts = [];
        let cumulativeGasUsed = 0;

        for (const transaction of transactions) {
            const receipt = await this.processTransaction(transaction, context);
            cumulativeGasUsed += receipt.gasUsed;
            receipt.setCumulativeGasUsed(cumulativeGasUsed);
            receipts.push(receipt);
        }

        return receipts;
    }

    /**
     * Process a complete block
     * @param {Block} block - Block to process
     * @param {Object} context - Execution context
     * @returns {Object} Block processing results
     */
    async processBlock(block, context = {}) {
        this.logger.debug(`Processing block ${block.index} with ${block.getTransactionCount()} transactions`);

        const blockContext = {
            ...context,
            blockHash: block.hash,
            blockNumber: block.index,
            validator: block.validator
        };

        try {
            // Execute block pre-processing plugins
            await this.executePlugins('preProcessBlock', block, blockContext);

            // Process all transactions in the block
            const receipts = await this.processTransactions(block.transactions, blockContext);

            // Calculate block statistics
            const successfulTransactions = receipts.filter(receipt => receipt.isSuccessful()).length;
            const failedTransactions = receipts.filter(receipt => receipt.isFailed()).length;
            const totalGasUsed = receipts.reduce((sum, receipt) => sum + receipt.gasUsed, 0);
            const totalFees = receipts.reduce((sum, receipt) => sum + receipt.fee, 0);

            // Execute block post-processing plugins
            await this.executePlugins('postProcessBlock', block, receipts, blockContext);

            this.logger.debug(`Block ${block.index} processed successfully: ${successfulTransactions} successful, ${failedTransactions} failed`);

            return {
                block,
                receipts,
                successfulTransactions,
                failedTransactions,
                totalGasUsed,
                totalFees
            };

        } catch (error) {
            this.logger.error(`Block ${block.index} processing failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Execute transaction logic
     * @param {Transaction} transaction - Transaction to execute
     * @param {Object} context - Execution context
     * @returns {Object} Execution results
     */
    async executeTransaction(transaction, context = {}) {
        const results = {
            gasUsed: 0,
            fee: 0,
            logs: []
        };

        // Calculate gas and fee
        const gasLimit = transaction.data?.gasLimit || 21000;
        const gasPrice = transaction.fee || 0.001;
        const fee = gasPrice * gasLimit;

        // Execute state transition
        if (this.stateMachine) {
            await this.stateMachine.transition(transaction, context);
        }

        results.gasUsed = gasLimit; // In real implementation, calculate actual gas used
        results.fee = fee;
        results.logs.push({
            type: 'execution',
            message: `Transaction executed successfully`,
            gasUsed: gasLimit,
            fee: fee,
            timestamp: Date.now()
        });

        // If this is a contract creation transaction
        if (transaction.data?.contractCode) {
            const contractAddress = this.generateContractAddress(transaction);
            results.contractAddress = contractAddress;
            results.logs.push({
                type: 'contract_creation',
                contractAddress: contractAddress,
                timestamp: Date.now()
            });
        }

        return results;
    }

    /**
     * Generate contract address from transaction
     * @param {Transaction} transaction - Contract creation transaction
     * @returns {string} Contract address
     */
    generateContractAddress(transaction) {
        // Simple contract address generation (in real implementation, use proper method)
        return `0x${Buffer.from(transaction.id).toString('hex').slice(0, 40)}`;
    }

    /**
     * Execute pipeline plugins
     * @param {string} hook - Hook name
     * @param {...*} args - Arguments to pass to plugins
     */
    async executePlugins(hook, ...args) {
        for (const plugin of this.plugins) {
            if (typeof plugin[hook] === 'function') {
                try {
                    await plugin[hook](...args);
                } catch (error) {
                    this.logger.error(`Plugin ${hook} failed: ${error.message}`);
                }
            }
        }
    }

    /**
     * Add a plugin to the pipeline
     * @param {Object} plugin - Plugin to add
     */
    addPlugin(plugin) {
        this.plugins.push(plugin);
        this.logger.debug(`Plugin added: ${plugin.name || 'Unnamed Plugin'}`);
    }

    /**
     * Remove a plugin from the pipeline
     * @param {Object} plugin - Plugin to remove
     */
    removePlugin(plugin) {
        const index = this.plugins.indexOf(plugin);
        if (index !== -1) {
            this.plugins.splice(index, 1);
            this.logger.debug(`Plugin removed: ${plugin.name || 'Unnamed Plugin'}`);
        }
    }

    /**
     * Clear all plugins from the pipeline
     */
    clearPlugins() {
        this.plugins = [];
        this.logger.debug('All plugins cleared');
    }

    /**
     * Get pipeline statistics
     * @returns {Object} Pipeline statistics
     */
    getStatistics() {
        return {
            pluginCount: this.plugins.length
        };
    }
}

/**
 * Create a new execution pipeline
 * @param {Object} options - Pipeline options
 * @returns {ExecutionPipeline} New pipeline instance
 */
export function create_execution_pipeline(options = {}) {
    return new ExecutionPipeline(options);
}

/**
 * Default execution pipeline plugins
 */
export const defaultPlugins = {
    /**
     * Logging plugin
     */
    logging: {
        name: 'LoggingPlugin',
        preProcess: (transaction, receipt) => {
            logger.debug(`Pre-processing transaction ${transaction.id}`);
        },
        postProcess: (transaction, receipt) => {
            logger.debug(`Post-processing transaction ${transaction.id}`);
        },
        preProcessBlock: (block) => {
            logger.debug(`Pre-processing block ${block.index}`);
        },
        postProcessBlock: (block, receipts) => {
            logger.debug(`Post-processing block ${block.index}`);
        }
    },

    /**
     * Gas tracking plugin
     */
    gasTracking: {
        name: 'GasTrackingPlugin',
        preProcess: (transaction, receipt) => {
            receipt.setGasPrice(transaction.fee || 0.001);
        },
        postProcess: (transaction, receipt) => {
            if (receipt.isSuccessful()) {
                logger.debug(`Transaction ${transaction.id} used ${receipt.gasUsed} gas`);
            }
        }
    }
};
