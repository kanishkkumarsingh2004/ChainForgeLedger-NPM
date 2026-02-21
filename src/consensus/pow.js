import { Block } from '../core/block.js';

/**
 * Proof of Work consensus mechanism
 */

export class ProofOfWork {
    /**
     * Create a new ProofOfWork instance
     * @param {Blockchain} blockchain - Blockchain instance
     * @param {Object} options - PoW options
     */
    constructor(blockchain, options = {}) {
        this.blockchain = blockchain;
        this.difficulty = options.difficulty || blockchain.difficulty;
        this.reward = options.reward || blockchain.miningReward;
    }

    /**
     * Mine a new block
     * @param {Transaction[]} transactions - Transactions to include
     * @param {string} minerAddress - Miner's wallet address
     * @returns {Block} Mined block
     */
    mineBlock(transactions, minerAddress) {
        const latestBlock = this.blockchain.getLatestBlock();
        
        const newBlock = new Block({
            index: latestBlock.index + 1,
            previousHash: latestBlock.hash,
            transactions: transactions,
            difficulty: this.difficulty,
            validator: minerAddress
        });

        // Perform Proof of Work
        console.log(`Mining block ${newBlock.index} with difficulty ${this.difficulty}...`);
        
        const target = '0'.repeat(this.difficulty);
        let nonce = 0;
        
        while (true) {
            newBlock.nonce = nonce;
            newBlock.hash = newBlock.calculateHash();
            
            if (newBlock.hash.startsWith(target)) {
                console.log(`Block ${newBlock.index} mined! Hash: ${newBlock.hash.slice(0, 16)}... (nonce: ${nonce})`);
                break;
            }
            
            nonce++;
            
            // Optional: Add a small delay to prevent blocking the event loop
            if (nonce % 100000 === 0) {
                console.log(`Nonce: ${nonce}, Current hash: ${newBlock.hash.slice(0, 16)}...`);
            }
        }

        return newBlock;
    }

    /**
     * Perform mining operation
     * @param {Object} options - Mining options
     * @returns {Block} Mined block
     */
    async mine(options = {}) {
        const { 
            transactions = this.blockchain.getMempoolTransactions().slice(0, this.blockchain.maxTransactionsPerBlock),
            minerAddress = '0x' + Math.random().toString(16).substr(2, 40),
            timeout = 60000
        } = options;

        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('Mining timeout'));
            }, timeout);

            try {
                const block = this.mineBlock(transactions, minerAddress);
                clearTimeout(timeoutId);
                resolve(block);
            } catch (error) {
                clearTimeout(timeoutId);
                reject(error);
            }
        });
    }

    /**
     * Validate block hash against difficulty target
     * @param {Block} block - Block to validate
     * @param {number} difficulty - Target difficulty
     * @returns {boolean} True if hash meets difficulty target
     */
    validateBlock(block, difficulty) {
        const target = '0'.repeat(difficulty);
        return block.hash.startsWith(target) && block.calculateHash() === block.hash;
    }

    /**
     * Adjust mining difficulty
     * @param {number} newDifficulty - New difficulty level
     */
    setDifficulty(newDifficulty) {
        if (typeof newDifficulty !== 'number' || newDifficulty < 1) {
            throw new Error('Difficulty must be a positive integer');
        }
        this.difficulty = newDifficulty;
    }

    /**
     * Get current difficulty
     * @returns {number} Current difficulty
     */
    getDifficulty() {
        return this.difficulty;
    }

    /**
     * Set mining reward
     * @param {number} newReward - New reward amount
     */
    setReward(newReward) {
        if (typeof newReward !== 'number' || newReward < 0) {
            throw new Error('Reward must be a non-negative number');
        }
        this.reward = newReward;
    }

    /**
     * Get mining reward
     * @returns {number} Mining reward
     */
    getReward() {
        return this.reward;
    }

    /**
     * Calculate mining performance metrics
     * @param {number} blocksMined - Number of blocks mined
     * @param {number} timeElapsed - Time elapsed in seconds
     * @returns {Object} Performance metrics
     */
    calculatePerformance(blocksMined, timeElapsed) {
        if (timeElapsed === 0) {
            return {
                blocksPerSecond: 0,
                timePerBlock: 0,
                hashRate: 0
            };
        }

        const blocksPerSecond = blocksMined / timeElapsed;
        const timePerBlock = timeElapsed / blocksMined;

        return {
            blocksPerSecond,
            timePerBlock,
            hashRate: blocksPerSecond * Math.pow(10, this.difficulty)
        };
    }

    /**
     * Get mining statistics
     * @param {Block[]} blocks - Blocks to analyze
     * @returns {Object} Mining statistics
     */
    getMiningStatistics(blocks) {
        const validBlocks = blocks.filter(block => 
            this.validateBlock(block, this.difficulty)
        );

        const totalMiningTime = blocks.reduce((sum, block, index) => {
            if (index === 0) return 0;
            return sum + (block.timestamp - blocks[index - 1].timestamp);
        }, 0);

        return {
            validBlocks: validBlocks.length,
            totalBlocks: blocks.length,
            averageMiningTime: totalMiningTime / (blocks.length - 1 || 1),
            difficulty: this.difficulty
        };
    }
}

/**
 * Create a Proof of Work consensus instance
 * @param {Blockchain} blockchain - Blockchain instance
 * @param {Object} options - PoW options
 * @returns {ProofOfWork} PoW instance
 */
export function create_pow_consensus(blockchain, options = {}) {
    return new ProofOfWork(blockchain, options);
}

/**
 * Validate block against PoW difficulty
 * @param {Block} block - Block to validate
 * @param {number} difficulty - Difficulty level
 * @returns {boolean} True if valid
 */
export function validate_pow_block(block, difficulty) {
    const pow = new ProofOfWork(null, { difficulty });
    return pow.validateBlock(block, difficulty);
}
