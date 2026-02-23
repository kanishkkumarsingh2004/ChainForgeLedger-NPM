const assert = require('assert');
const { ExecutionPipeline, create_execution_pipeline, defaultPlugins } = require('../src/core/execution_pipeline.js');
const { Transaction } = require('../src/core/transaction.js');

describe('ExecutionPipeline', () => {
    describe('constructor', () => {
        it('should create a new ExecutionPipeline instance', () => {
            const pipeline = new ExecutionPipeline();
            
            assert.strictEqual(pipeline instanceof ExecutionPipeline, true);
            assert.strictEqual(typeof pipeline.processTransaction, 'function');
            assert.strictEqual(typeof pipeline.processTransactions, 'function');
            assert.strictEqual(typeof pipeline.processBlock, 'function');
            assert.strictEqual(typeof pipeline.addPlugin, 'function');
            assert.strictEqual(typeof pipeline.removePlugin, 'function');
        });

        it('should create execution pipeline with create_execution_pipeline', () => {
            const pipeline = create_execution_pipeline();
            
            assert.strictEqual(pipeline instanceof ExecutionPipeline, true);
        });

        it('should create execution pipeline with custom plugins', () => {
            const customPlugin = {
                name: 'CustomPlugin',
                preProcess: () => {}
            };
            
            const pipeline = create_execution_pipeline({
                plugins: [customPlugin]
            });
            
            assert.strictEqual(pipeline.getStatistics().pluginCount, 1);
        });
    });

    describe('plugin management', () => {
        it('should add and remove plugins', () => {
            const pipeline = new ExecutionPipeline();
            const plugin1 = { name: 'Plugin1' };
            const plugin2 = { name: 'Plugin2' };
            
            pipeline.addPlugin(plugin1);
            pipeline.addPlugin(plugin2);
            
            assert.strictEqual(pipeline.getStatistics().pluginCount, 2);
            
            pipeline.removePlugin(plugin1);
            assert.strictEqual(pipeline.getStatistics().pluginCount, 1);
            
            pipeline.clearPlugins();
            assert.strictEqual(pipeline.getStatistics().pluginCount, 0);
        });
    });

    describe('transaction processing', () => {
        it('should process valid transaction', async () => {
            const pipeline = new ExecutionPipeline();
            const transaction = new Transaction({
                sender: '0x123',
                receiver: '0x456',
                amount: 100,
                fee: 0.001
            });
            
            const receipt = await pipeline.processTransaction(transaction);
            
            assert.strictEqual(receipt.transactionId, transaction.id);
            assert.strictEqual(receipt.isSuccessful(), true);
            assert.strictEqual(receipt.gasUsed > 0, true);
            assert.strictEqual(receipt.fee > 0, true);
        });

        it('should fail to process invalid transaction', async () => {
            const pipeline = new ExecutionPipeline();
            const transaction = new Transaction({
                sender: 'invalid',
                receiver: '0x456',
                amount: -100,
                fee: -0.001
            });
            
            const receipt = await pipeline.processTransaction(transaction);
            
            assert.strictEqual(receipt.transactionId, transaction.id);
            assert.strictEqual(receipt.isFailed(), true);
            assert.strictEqual(receipt.logs.length > 0, true);
        });
    });

    describe('transactions processing', () => {
        it('should process multiple transactions', async () => {
            const pipeline = new ExecutionPipeline();
            const transactions = [
                new Transaction({
                    sender: '0x123',
                    receiver: '0x456',
                    amount: 100,
                    fee: 0.001
                }),
                new Transaction({
                    sender: '0x456',
                    receiver: '0x789',
                    amount: 50,
                    fee: 0.002
                }),
                new Transaction({
                    sender: '0x789',
                    receiver: '0x123',
                    amount: 25,
                    fee: 0.003
                })
            ];
            
            const receipts = await pipeline.processTransactions(transactions);
            
            assert.strictEqual(receipts.length, transactions.length);
            
            transactions.forEach((tx, index) => {
                assert.strictEqual(receipts[index].transactionId, tx.id);
                assert.strictEqual(receipts[index].isSuccessful(), true);
            });
        });
    });

    describe('block processing', () => {
        it('should process a block with transactions', async () => {
            const pipeline = new ExecutionPipeline();
            const block = {
                index: 1,
                hash: '0xabc123',
                transactions: [
                    new Transaction({
                        sender: '0x123',
                        receiver: '0x456',
                        amount: 100,
                        fee: 0.001
                    }),
                    new Transaction({
                        sender: '0x456',
                        receiver: '0x789',
                        amount: 50,
                        fee: 0.002
                    })
                ],
                getTransactionCount: function() {
                    return this.transactions.length;
                }
            };
            
            const result = await pipeline.processBlock(block);
            
            assert.strictEqual(result.successfulTransactions, block.transactions.length);
            assert.strictEqual(result.failedTransactions, 0);
            assert.strictEqual(result.totalGasUsed > 0, true);
            assert.strictEqual(result.totalFees > 0, true);
            assert.strictEqual(result.receipts.length, block.transactions.length);
        });
    });

    describe('default plugins', () => {
        it('should have default plugins available', () => {
            assert.strictEqual(typeof defaultPlugins.logging, 'object');
            assert.strictEqual(typeof defaultPlugins.logging.preProcess, 'function');
            assert.strictEqual(typeof defaultPlugins.logging.postProcess, 'function');
            
            assert.strictEqual(typeof defaultPlugins.gasTracking, 'object');
            assert.strictEqual(typeof defaultPlugins.gasTracking.preProcess, 'function');
            assert.strictEqual(typeof defaultPlugins.gasTracking.postProcess, 'function');
        });
    });

    describe('pipeline statistics', () => {
        it('should get pipeline statistics', () => {
            const pipeline = new ExecutionPipeline();
            const stats = pipeline.getStatistics();
            
            assert.strictEqual(typeof stats, 'object');
            assert.strictEqual(typeof stats.pluginCount, 'number');
            assert.strictEqual(stats.pluginCount, 0);
        });
    });
});
