import { Block } from './block.js';
import { Transaction } from './transaction.js';
import { sha256_hash } from '../crypto/hashing.js';

/**
 * Blockchain management system
 */

export class Blockchain {
    /**
     * Create a new Blockchain instance
     * @param {Object} options - Blockchain options
     */
    constructor(options = {}) {
        this.chain = options.chain || [this.createGenesisBlock()];
        this.difficulty = options.difficulty || 2;
        this.miningReward = options.miningReward || 50;
        this.mempool = options.mempool || [];
        this.blockTime = options.blockTime || 60000; // 60 seconds
        this.maxTransactionsPerBlock = options.maxTransactionsPerBlock || 100;
        this.validatorRewards = options.validatorRewards || [];
    }

    /**
     * Create genesis block
     * @returns {Block} Genesis block
     */
    createGenesisBlock() {
        return new Block({
            index: 0,
            timestamp: Date.now(),
            transactions: [],
            previousHash: '0'.repeat(64),
            nonce: 0,
            difficulty: this.difficulty
        });
    }

    /**
     * Get the latest block in the chain
     * @returns {Block} Latest block
     */
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    /**
     * Get block by index
     * @param {number} index - Block index
     * @returns {Block|null} Block or null if not found
     */
    getBlockByIndex(index) {
        return this.chain[index] || null;
    }

    /**
     * Get block by hash
     * @param {string} hash - Block hash
     * @returns {Block|null} Block or null if not found
     */
    getBlockByHash(hash) {
        return this.chain.find(block => block.hash === hash) || null;
    }

    /**
     * Get block height
     * @returns {number} Block height
     */
    getBlockHeight() {
        return this.chain.length - 1;
    }

    /**
     * Add a transaction to the mempool
     * @param {Transaction} transaction - Transaction to add
     * @returns {boolean} True if transaction was added
     */
    addTransaction(transaction) {
        if (!(transaction instanceof Transaction)) {
            throw new Error('Must provide a Transaction instance');
        }

        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction');
        }

        const existingTx = this.mempool.find(tx => tx.id === transaction.id);
        if (existingTx) {
            return false;
        }

        this.mempool.push(transaction);
        return true;
    }

    /**
     * Add multiple transactions to the mempool
     * @param {Transaction[]} transactions - Transactions to add
     * @returns {number} Number of transactions added
     */
    addTransactions(transactions) {
        let count = 0;
        transactions.forEach(transaction => {
            try {
                if (this.addTransaction(transaction)) {
                    count++;
                }
            } catch (error) {
                console.error('Error adding transaction:', error);
            }
        });
        return count;
    }

    /**
     * Get all transactions in mempool
     * @returns {Transaction[]} Array of transactions
     */
    getMempoolTransactions() {
        return [...this.mempool];
    }

    /**
     * Get number of transactions in mempool
     * @returns {number} Transaction count
     */
    getMempoolSize() {
        return this.mempool.length;
    }

    /**
     * Add a new block to the blockchain
     * @param {Block} block - Block to add
     * @returns {boolean} True if block was added
     */
    addBlock(block) {
        if (!(block instanceof Block)) {
            throw new Error('Must provide a Block instance');
        }

        const latestBlock = this.getLatestBlock();
        
        // Validate block
        if (!block.isValid(latestBlock)) {
            return false;
        }

        // Validate block index
        if (block.index !== latestBlock.index + 1) {
            return false;
        }

        // Validate previous hash
        if (block.previousHash !== latestBlock.hash) {
            return false;
        }

        this.chain.push(block);

        // Remove transactions from mempool that are in the new block
        this.mempool = this.mempool.filter(
            tx => !block.getTransactions().some(blockTx => blockTx.id === tx.id)
        );

        // Adjust difficulty
        this.adjustDifficulty();

        return true;
    }

    /**
     * Adjust mining difficulty based on block time
     */
    adjustDifficulty() {
        const latestBlock = this.getLatestBlock();
        
        if (latestBlock.index % 10 === 0 && latestBlock.index > 0) {
            const previousBlock = this.getBlockByIndex(latestBlock.index - 10);
            const timeDifference = latestBlock.timestamp - previousBlock.timestamp;
            const expectedTime = this.blockTime * 10;

            if (timeDifference < expectedTime / 2) {
                this.difficulty++;
            } else if (timeDifference > expectedTime * 2) {
                this.difficulty = Math.max(1, this.difficulty - 1);
            }
        }
    }

    /**
     * Validate the entire blockchain
     * @returns {Object} Validation result
     */
    isValidChain() {
        const errors = [];

        // Validate genesis block
        const genesisBlock = this.chain[0];
        if (!genesisBlock.isValid()) {
            errors.push(genesisBlock.validate().errors);
        }

        // Validate subsequent blocks
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
            
            if (!currentBlock.isValid(previousBlock)) {
                errors.push(`Block ${i}: ${currentBlock.validate(previousBlock).errors}`);
            }
        }

        const isValid = errors.length === 0;

        return {
            isValid,
            errors,
            message: isValid ? 'Blockchain is valid' : `Blockchain validation failed: ${errors.join(', ')}`
        };
    }

    /**
     * Check if blockchain is valid
     * @returns {boolean} True if valid
     */
    isChainValid() {
        return this.isValidChain().isValid;
    }

    /**
     * Replace the blockchain with a new chain
     * @param {Block[]} newChain - New chain to replace with
     * @returns {boolean} True if chain was replaced
     */
    replaceChain(newChain) {
        if (!Array.isArray(newChain) || newChain.length <= this.chain.length) {
            return false;
        }

        // Validate the new chain
        const tempChain = new Blockchain({ chain: newChain });
        if (!tempChain.isChainValid()) {
            return false;
        }

        this.chain = newChain;
        return true;
    }

    /**
     * Find a transaction in the blockchain
     * @param {string} transactionId - Transaction ID to find
     * @returns {Object|null} Transaction with block information or null
     */
    findTransaction(transactionId) {
        // Check mempool
        const mempoolTx = this.mempool.find(tx => tx.id === transactionId);
        if (mempoolTx) {
            return {
                block: null,
                transaction: mempoolTx,
                status: 'pending'
            };
        }

        // Check blocks
        for (const block of this.chain) {
            const transaction = block.findTransaction(transactionId);
            if (transaction) {
                return {
                    block,
                    transaction,
                    status: 'confirmed'
                };
            }
        }

        return null;
    }

    /**
     * Get all transactions in the blockchain
     * @returns {Transaction[]} Array of all transactions
     */
    getAllTransactions() {
        const transactions = [];
        this.chain.forEach(block => {
            transactions.push(...block.getTransactions());
        });
        transactions.push(...this.mempool);
        return transactions;
    }

    /**
     * Calculate total transaction value in the blockchain
     * @returns {number} Total transaction value
     */
    getTotalTransactionValue() {
        return this.getAllTransactions().reduce((sum, tx) => sum + tx.amount, 0);
    }

    /**
     * Calculate total fees collected
     * @returns {number} Total fees
     */
    getTotalFees() {
        return this.getAllTransactions().reduce((sum, tx) => sum + tx.fee, 0);
    }

    /**
     * Get blockchain statistics
     * @returns {Object} Blockchain statistics
     */
    getStatistics() {
        const totalTransactions = this.getAllTransactions().length;
        const totalBlocks = this.chain.length;
        const blockHeight = this.getBlockHeight();

        return {
            blockHeight,
            totalBlocks,
            totalTransactions,
            mempoolSize: this.getMempoolSize(),
            totalTransactionValue: this.getTotalTransactionValue(),
            totalFees: this.getTotalFees(),
            difficulty: this.difficulty,
            miningReward: this.miningReward,
            blockTime: this.blockTime,
            latestBlock: this.getLatestBlock().getStatistics()
        };
    }

    /**
     * Convert blockchain to JSON object
     * @returns {Object} Blockchain as JSON
     */
    toJSON() {
        return {
            chain: this.chain.map(block => block.toJSON()),
            difficulty: this.difficulty,
            miningReward: this.miningReward,
            mempool: this.mempool.map(tx => tx.toJSON()),
            blockTime: this.blockTime,
            maxTransactionsPerBlock: this.maxTransactionsPerBlock,
            validatorRewards: this.validatorRewards
        };
    }

    /**
     * Create blockchain from JSON object
     * @param {Object} data - Blockchain data
     * @returns {Blockchain} Blockchain instance
     */
    static fromJSON(data) {
        return new Blockchain({
            chain: data.chain.map(blockData => Block.fromJSON(blockData)),
            difficulty: data.difficulty,
            miningReward: data.miningReward,
            mempool: data.mempool.map(txData => Transaction.fromJSON(txData)),
            blockTime: data.blockTime,
            maxTransactionsPerBlock: data.maxTransactionsPerBlock,
            validatorRewards: data.validatorRewards || []
        });
    }
}

/**
 * Create a new blockchain
 * @param {Object} options - Blockchain options
 * @returns {Blockchain} New blockchain instance
 */
export function create_blockchain(options = {}) {
    return new Blockchain(options);
}

/**
 * Create a blockchain from existing data
 * @param {Object} data - Blockchain data
 * @returns {Blockchain} Blockchain instance
 */
export function create_blockchain_from_data(data) {
    return Blockchain.fromJSON(data);
}

/**
 * Validate a blockchain
 * @param {Blockchain} blockchain - Blockchain to validate
 * @returns {Object} Validation result
 */
export function validate_blockchain(blockchain) {
    if (!(blockchain instanceof Blockchain)) {
        throw new Error('Must provide a Blockchain instance');
    }
    return blockchain.isValidChain();
}
