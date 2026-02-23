const assert = require('assert');
const { TransactionReceipt, create_transaction_receipt, validate_transaction_receipts } = require('../src/core/receipt.js');

describe('TransactionReceipt', () => {
    describe('constructor', () => {
        it('should create a new TransactionReceipt instance with default values', () => {
            const receipt = new TransactionReceipt();
            
            assert.strictEqual(typeof receipt.id, 'string');
            assert.strictEqual(receipt.transactionId, null);
            assert.strictEqual(receipt.blockHash, null);
            assert.strictEqual(receipt.blockNumber, null);
            assert.strictEqual(typeof receipt.timestamp, 'number');
            assert.strictEqual(receipt.status, 'pending');
            assert.strictEqual(receipt.gasUsed, 0);
            assert.strictEqual(receipt.gasPrice, 0);
            assert.strictEqual(receipt.fee, 0);
            assert.deepStrictEqual(receipt.logs, []);
            assert.strictEqual(receipt.contractAddress, null);
            assert.strictEqual(receipt.root, null);
            assert.strictEqual(receipt.cumulativeGasUsed, 0);
            assert.strictEqual(receipt.effectiveGasPrice, 0);
        });

        it('should create a new TransactionReceipt instance with custom values', () => {
            const transactionId = 'tx123';
            const blockHash = '0xabc123';
            const blockNumber = 100;
            const status = 'successful';
            const gasUsed = 21000;
            const gasPrice = 0.001;
            const fee = 0.021;
            
            const receipt = new TransactionReceipt({
                transactionId,
                blockHash,
                blockNumber,
                status,
                gasUsed,
                gasPrice,
                fee
            });
            
            assert.strictEqual(receipt.transactionId, transactionId);
            assert.strictEqual(receipt.blockHash, blockHash);
            assert.strictEqual(receipt.blockNumber, blockNumber);
            assert.strictEqual(receipt.status, status);
            assert.strictEqual(receipt.gasUsed, gasUsed);
            assert.strictEqual(receipt.gasPrice, gasPrice);
            assert.strictEqual(receipt.fee, fee);
        });
    });

    describe('setters and getters', () => {
        it('should set and get transactionId', () => {
            const receipt = new TransactionReceipt();
            const transactionId = 'tx456';
            
            receipt.setTransactionId(transactionId);
            assert.strictEqual(receipt.transactionId, transactionId);
        });

        it('should set and get blockHash', () => {
            const receipt = new TransactionReceipt();
            const blockHash = '0xdef456';
            
            receipt.setBlockHash(blockHash);
            assert.strictEqual(receipt.blockHash, blockHash);
        });

        it('should set and get blockNumber', () => {
            const receipt = new TransactionReceipt();
            const blockNumber = 200;
            
            receipt.setBlockNumber(blockNumber);
            assert.strictEqual(receipt.blockNumber, blockNumber);
        });

        it('should throw error for negative blockNumber', () => {
            const receipt = new TransactionReceipt();
            
            assert.throws(() => receipt.setBlockNumber(-1), Error);
        });

        it('should set and get status', () => {
            const receipt = new TransactionReceipt();
            
            receipt.setStatus('successful');
            assert.strictEqual(receipt.status, 'successful');
            
            receipt.setStatus('failed');
            assert.strictEqual(receipt.status, 'failed');
        });

        it('should throw error for invalid status', () => {
            const receipt = new TransactionReceipt();
            
            assert.throws(() => receipt.setStatus('invalid'), Error);
        });

        it('should set and get gasUsed', () => {
            const receipt = new TransactionReceipt();
            const gasUsed = 15000;
            
            receipt.setGasUsed(gasUsed);
            assert.strictEqual(receipt.gasUsed, gasUsed);
        });

        it('should throw error for negative gasUsed', () => {
            const receipt = new TransactionReceipt();
            
            assert.throws(() => receipt.setGasUsed(-1), Error);
        });

        it('should set and get gasPrice', () => {
            const receipt = new TransactionReceipt();
            const gasPrice = 0.002;
            
            receipt.setGasPrice(gasPrice);
            assert.strictEqual(receipt.gasPrice, gasPrice);
        });

        it('should throw error for negative gasPrice', () => {
            const receipt = new TransactionReceipt();
            
            assert.throws(() => receipt.setGasPrice(-0.001), Error);
        });

        it('should set and get fee', () => {
            const receipt = new TransactionReceipt();
            const fee = 0.03;
            
            receipt.setFee(fee);
            assert.strictEqual(receipt.fee, fee);
        });

        it('should throw error for negative fee', () => {
            const receipt = new TransactionReceipt();
            
            assert.throws(() => receipt.setFee(-0.01), Error);
        });
    });

    describe('status checks', () => {
        it('should check if receipt is pending', () => {
            const receipt = new TransactionReceipt({ status: 'pending' });
            assert.strictEqual(receipt.isPending(), true);
            assert.strictEqual(receipt.isSuccessful(), false);
            assert.strictEqual(receipt.isFailed(), false);
        });

        it('should check if receipt is successful', () => {
            const receipt = new TransactionReceipt({ status: 'successful' });
            assert.strictEqual(receipt.isPending(), false);
            assert.strictEqual(receipt.isSuccessful(), true);
            assert.strictEqual(receipt.isFailed(), false);
        });

        it('should check if receipt is failed', () => {
            const receipt = new TransactionReceipt({ status: 'failed' });
            assert.strictEqual(receipt.isPending(), false);
            assert.strictEqual(receipt.isSuccessful(), false);
            assert.strictEqual(receipt.isFailed(), true);
        });
    });

    describe('logs management', () => {
        it('should add and retrieve log entries', () => {
            const receipt = new TransactionReceipt();
            const log1 = { type: 'info', message: 'Test log 1' };
            const log2 = { type: 'error', message: 'Test log 2', stack: 'Stack trace' };
            
            receipt.addLog(log1);
            receipt.addLogs([log2]);
            
            assert.strictEqual(receipt.logs.length, 2);
            assert.deepStrictEqual(receipt.logs[0], log1);
            assert.deepStrictEqual(receipt.logs[1], log2);
        });
    });

    describe('JSON serialization', () => {
        it('should convert receipt to JSON and back', () => {
            const transactionId = 'tx789';
            const blockHash = '0xghi789';
            const blockNumber = 300;
            const status = 'successful';
            const gasUsed = 25000;
            const gasPrice = 0.0015;
            const fee = 0.0375;
            const logs = [
                { type: 'info', message: 'Execution started' },
                { type: 'success', message: 'Execution completed' }
            ];
            const contractAddress = '0x123456';
            
            const receipt = new TransactionReceipt({
                transactionId,
                blockHash,
                blockNumber,
                status,
                gasUsed,
                gasPrice,
                fee,
                logs,
                contractAddress
            });
            
            const json = receipt.toJSON();
            assert.strictEqual(typeof json.id, 'string');
            assert.strictEqual(json.transactionId, transactionId);
            assert.strictEqual(json.blockHash, blockHash);
            assert.strictEqual(json.blockNumber, blockNumber);
            assert.strictEqual(json.status, status);
            assert.strictEqual(json.gasUsed, gasUsed);
            assert.strictEqual(json.gasPrice, gasPrice);
            assert.strictEqual(json.fee, fee);
            assert.deepStrictEqual(json.logs, logs);
            assert.strictEqual(json.contractAddress, contractAddress);
            
            const parsedReceipt = TransactionReceipt.fromJSON(json);
            assert.strictEqual(parsedReceipt.transactionId, transactionId);
            assert.strictEqual(parsedReceipt.blockHash, blockHash);
            assert.strictEqual(parsedReceipt.blockNumber, blockNumber);
            assert.strictEqual(parsedReceipt.status, status);
            assert.strictEqual(parsedReceipt.gasUsed, gasUsed);
            assert.strictEqual(parsedReceipt.gasPrice, gasPrice);
            assert.strictEqual(parsedReceipt.fee, fee);
            assert.strictEqual(parsedReceipt.contractAddress, contractAddress);
            assert.strictEqual(parsedReceipt.logs.length, logs.length);
            assert.deepStrictEqual(parsedReceipt.logs[0], logs[0]);
            assert.deepStrictEqual(parsedReceipt.logs[1], logs[1]);
        });
    });

    describe('validation', () => {
        it('should validate valid receipt', () => {
            const receipt = new TransactionReceipt({
                transactionId: 'tx101',
                blockNumber: 400,
                status: 'successful'
            });
            
            const validation = receipt.validate();
            assert.strictEqual(validation.isValid, true);
            assert.strictEqual(validation.errors.length, 0);
            assert.strictEqual(validation.message, 'Receipt is valid');
            assert.strictEqual(receipt.isValid(), true);
        });

        it('should invalidate receipt with missing transactionId', () => {
            const receipt = new TransactionReceipt({
                blockNumber: 400,
                status: 'successful'
            });
            
            const validation = receipt.validate();
            assert.strictEqual(validation.isValid, false);
            assert.strictEqual(validation.errors.includes('Invalid transaction ID'), true);
            assert.strictEqual(receipt.isValid(), false);
        });

        it('should invalidate receipt with invalid blockNumber', () => {
            const receipt = new TransactionReceipt({
                transactionId: 'tx102',
                blockNumber: 'invalid',
                status: 'successful'
            });
            
            const validation = receipt.validate();
            assert.strictEqual(validation.isValid, false);
            assert.strictEqual(validation.errors.includes('Invalid block number'), true);
            assert.strictEqual(receipt.isValid(), false);
        });
    });

    describe('utility functions', () => {
        it('should create transaction receipt with create_transaction_receipt', () => {
            const receipt = create_transaction_receipt({
                transactionId: 'tx103',
                status: 'failed'
            });
            
            assert.strictEqual(receipt instanceof TransactionReceipt, true);
            assert.strictEqual(receipt.transactionId, 'tx103');
            assert.strictEqual(receipt.status, 'failed');
        });

        it('should create multiple receipts with create_transaction_receipts', () => {
            const receiptsData = [
                { transactionId: 'tx104', status: 'successful' },
                { transactionId: 'tx105', status: 'failed' }
            ];
            
            const receipts = create_transaction_receipts(receiptsData);
            
            assert.strictEqual(receipts.length, 2);
            assert.strictEqual(receipts[0] instanceof TransactionReceipt, true);
            assert.strictEqual(receipts[1] instanceof TransactionReceipt, true);
            assert.strictEqual(receipts[0].transactionId, 'tx104');
            assert.strictEqual(receipts[1].transactionId, 'tx105');
        });

        it('should validate multiple receipts with validate_transaction_receipts', () => {
            const validReceipt = new TransactionReceipt({
                transactionId: 'tx106',
                blockNumber: 500,
                status: 'successful'
            });
            
            const invalidReceipt = new TransactionReceipt({
                blockNumber: 501,
                status: 'failed'
            });
            
            const results = validate_transaction_receipts([validReceipt, invalidReceipt]);
            
            assert.strictEqual(results.valid, 1);
            assert.strictEqual(results.invalid, 1);
            assert.strictEqual(results.allValid, false);
            assert.strictEqual(results.invalidReceipts.length, 1);
            assert.strictEqual(results.invalidReceipts[0], invalidReceipt);
        });

        it('should validate all valid receipts', () => {
            const validReceipts = [
                new TransactionReceipt({ transactionId: 'tx107', status: 'successful' }),
                new TransactionReceipt({ transactionId: 'tx108', status: 'failed' })
            ];
            
            const results = validate_transaction_receipts(validReceipts);
            
            assert.strictEqual(results.valid, 2);
            assert.strictEqual(results.invalid, 0);
            assert.strictEqual(results.allValid, true);
            assert.strictEqual(results.invalidReceipts.length, 0);
        });
    });
});
