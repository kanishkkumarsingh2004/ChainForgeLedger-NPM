const assert = require('assert');
const { BlockProducer, create_block_producer, blockProductionStrategies } = require('../src/core/block_producer.js');
const { Block, create_block } = require('../src/core/block.js');
const { Transaction } = require('../src/core/transaction.js');

describe('BlockProducer', () => {
    describe('constructor', () => {
        it('should create a new BlockProducer instance', () => {
            const blockchain = {
                getLatestBlock: () => create_block(),
                getBlockByIndex: () => create_block(),
                addBlock: () => {}
            };
            
            const mempool = {
                getTransactions: () => []
            };
            
            const producer = new BlockProducer({
                blockchain,
                mempool
            });
            
            assert.strictEqual(producer instanceof BlockProducer, true);
            assert.strictEqual(typeof producer.produceBlock, 'function');
            assert.strictEqual(typeof producer.start, 'function');
            assert.strictEqual(typeof producer.stop, 'function');
            assert.strictEqual(typeof producer.isRunning, 'function');
        });

        it('should create block producer with create_block_producer', () => {
            const blockchain = {
                getLatestBlock: () => create_block(),
                getBlockByIndex: () => create_block(),
                addBlock: () => {}
            };
            
            const mempool = {
                getTransactions: () => []
            };
            
            const producer = create_block_producer({
                blockchain,
                mempool
            });
            
            assert.strictEqual(producer instanceof BlockProducer, true);
        });
    });

    describe('block production', () => {
        it('should produce empty block when no transactions available', async () => {
            const blockchain = {
                getLatestBlock: () => create_block(),
                getBlockByIndex: () => create_block(),
                addBlock: () => {}
            };
            
            const mempool = {
                getTransactions: () => []
            };
            
            const producer = new BlockProducer({
                blockchain,
                mempool
            });
            
            const result = await producer.produceBlock();
            
            assert.strictEqual(result.success, true);
            assert.strictEqual(result.block instanceof Block, true);
            assert.strictEqual(result.receipts.length, 0);
            assert.strictEqual(result.message.includes('produced successfully'), true);
        });

        it('should produce block with transactions', async () => {
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
                })
            ];
            
            const blockchain = {
                getLatestBlock: () => create_block(),
                getBlockByIndex: () => create_block(),
                addBlock: () => {}
            };
            
            const mempool = {
                getTransactions: () => transactions
            };
            
            const producer = new BlockProducer({
                blockchain,
                mempool
            });
            
            const result = await producer.produceBlock();
            
            assert.strictEqual(result.success, true);
            assert.strictEqual(result.block instanceof Block, true);
            assert.strictEqual(result.block.getTransactionCount(), transactions.length);
            assert.strictEqual(result.receipts.length, transactions.length);
            
            transactions.forEach((tx, index) => {
                assert.strictEqual(result.block.transactions[index], tx);
            });
        });
    });

    describe('transaction selection', () => {
        it('should select transactions based on fee per gas', async () => {
            const transactions = [
                new Transaction({
                    sender: '0x123',
                    receiver: '0x456',
                    amount: 100,
                    fee: 0.001,
                    data: { gasLimit: 21000 }
                }), // Fee per gas: ~0.0000476
                new Transaction({
                    sender: '0x456',
                    receiver: '0x789',
                    amount: 50,
                    fee: 0.003,
                    data: { gasLimit: 21000 }
                }), // Fee per gas: ~0.0001428
                new Transaction({
                    sender: '0x789',
                    receiver: '0x123',
                    amount: 25,
                    fee: 0.002,
                    data: { gasLimit: 21000 }
                }) // Fee per gas: ~0.0000952
            ];
            
            const blockchain = {
                getLatestBlock: () => create_block(),
                getBlockByIndex: () => create_block(),
                addBlock: () => {}
            };
            
            const mempool = {
                getTransactions: () => transactions
            };
            
            const producer = new BlockProducer({
                blockchain,
                mempool,
                maxTransactionsPerBlock: 2
            });
            
            // Accessing private method for testing purposes
            const selectedTransactions = await producer.selectTransactions();
            
            assert.strictEqual(selectedTransactions.length, 2);
            assert.strictEqual(selectedTransactions[0], transactions[1]);
            assert.strictEqual(selectedTransactions[1], transactions[2]);
        });
    });

    describe('block validation', () => {
        it('should validate valid block', async () => {
            const transactions = [
                new Transaction({
                    sender: '0x123',
                    receiver: '0x456',
                    amount: 100,
                    fee: 0.001
                })
            ];
            
            const previousBlock = create_block();
            const block = create_block({
                index: previousBlock.index + 1,
                previousHash: previousBlock.hash,
                transactions: transactions
            });
            
            const blockchain = {
                getLatestBlock: () => previousBlock,
                getBlockByIndex: (index) => index === previousBlock.index ? previousBlock : null,
                addBlock: () => {}
            };
            
            const mempool = {
                getTransactions: () => []
            };
            
            const producer = new BlockProducer({
                blockchain,
                mempool
            });
            
            const validation = await producer.validateBlock(block);
            
            assert.strictEqual(validation.isValid, true);
            assert.strictEqual(validation.errors.length, 0);
            assert.strictEqual(validation.message, 'Block is valid');
        });

        it('should invalidate block with invalid transactions', async () => {
            const invalidTransactions = [
                new Transaction({
                    sender: 'invalid',
                    receiver: '0x456',
                    amount: -100,
                    fee: -0.001
                })
            ];
            
            const previousBlock = create_block();
            const block = create_block({
                index: previousBlock.index + 1,
                previousHash: previousBlock.hash,
                transactions: invalidTransactions
            });
            
            const blockchain = {
                getLatestBlock: () => previousBlock,
                getBlockByIndex: (index) => index === previousBlock.index ? previousBlock : null,
                addBlock: () => {}
            };
            
            const mempool = {
                getTransactions: () => []
            };
            
            const producer = new BlockProducer({
                blockchain,
                mempool
            });
            
            const validation = await producer.validateBlock(block);
            
            assert.strictEqual(validation.isValid, false);
            assert.strictEqual(validation.errors.length > 0, true);
        });
    });

    describe('production control', () => {
        it('should start and stop block production', (done) => {
            const blockchain = {
                getLatestBlock: () => create_block(),
                getBlockByIndex: () => create_block(),
                addBlock: () => {}
            };
            
            const mempool = {
                getTransactions: () => []
            };
            
            const producer = new BlockProducer({
                blockchain,
                mempool,
                blockTimeTarget: 100 // Very short interval for testing
            });
            
            producer.start();
            assert.strictEqual(producer.isRunning(), true);
            
            setTimeout(() => {
                producer.stop();
                assert.strictEqual(producer.isRunning(), false);
                done();
            }, 50);
        });
    });

    describe('statistics', () => {
        it('should get block producer statistics', () => {
            const transactions = [
                new Transaction({
                    sender: '0x123',
                    receiver: '0x456',
                    amount: 100,
                    fee: 0.001
                })
            ];
            
            const blockchain = {
                getLatestBlock: () => create_block(),
                getBlockByIndex: () => create_block(),
                addBlock: () => {}
            };
            
            const mempool = {
                getTransactions: () => transactions
            };
            
            const producer = new BlockProducer({
                blockchain,
                mempool
            });
            
            const stats = producer.getStatistics();
            
            assert.strictEqual(typeof stats, 'object');
            assert.strictEqual(typeof stats.isRunning, 'boolean');
            assert.strictEqual(stats.isRunning, false);
            assert.strictEqual(typeof stats.currentBlockIndex, 'number');
            assert.strictEqual(stats.currentBlockIndex, 0);
            assert.strictEqual(typeof stats.transactionsInPool, 'number');
            assert.strictEqual(stats.transactionsInPool, transactions.length);
            assert.strictEqual(typeof stats.maxBlockSize, 'number');
            assert.strictEqual(typeof stats.maxTransactionsPerBlock, 'number');
            assert.strictEqual(typeof stats.blockTimeTarget, 'number');
        });
    });

    describe('production strategies', () => {
        it('should create constant time strategy', () => {
            const producer = blockProductionStrategies.constantTime.create({
                blockTime: 5000,
                maxTransactions: 500
            });
            
            assert.strictEqual(producer instanceof BlockProducer, true);
        });

        it('should create dynamic size strategy', () => {
            const producer = blockProductionStrategies.dynamicSize.create({
                initialSize: 500000,
                blockTime: 15000
            });
            
            assert.strictEqual(producer instanceof BlockProducer, true);
        });
    });
});
