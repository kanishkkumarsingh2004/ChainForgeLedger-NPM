import { Block } from '../core/block.js';

/**
 * Proof of Stake consensus mechanism
 */

export class Validator {
    /**
     * Create a new Validator instance
     * @param {Object} options - Validator options
     */
    constructor(options = {}) {
        this.name = options.name || 'anonymous';
        this.address = options.address || '0x' + Math.random().toString(16).substr(2, 40);
        this.stake = options.stake || 0;
        this.reward = options.reward || 0;
        this.status = options.status || 'active'; // active, inactive, suspended
        this.blocksForged = options.blocksForged || 0;
        this.totalStake = options.totalStake || 0;
    }

    /**
     * Increase validator's stake
     * @param {number} amount - Stake amount to add
     */
    increaseStake(amount) {
        if (typeof amount !== 'number' || amount <= 0) {
            throw new Error('Stake amount must be a positive number');
        }
        this.stake += amount;
        this.totalStake += amount;
    }

    /**
     * Decrease validator's stake
     * @param {number} amount - Stake amount to remove
     */
    decreaseStake(amount) {
        if (typeof amount !== 'number' || amount <= 0) {
            throw new Error('Stake amount must be a positive number');
        }
        this.stake = Math.max(0, this.stake - amount);
    }

    /**
     * Add reward to validator
     * @param {number} amount - Reward amount
     */
    addReward(amount) {
        if (typeof amount !== 'number' || amount < 0) {
            throw new Error('Reward must be a non-negative number');
        }
        this.reward += amount;
    }

    /**
     * Increment blocks forged count
     */
    incrementBlocksForged() {
        this.blocksForged++;
    }

    /**
     * Set validator status
     * @param {string} status - Validator status
     */
    setStatus(status) {
        const validStatuses = ['active', 'inactive', 'suspended'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status: ${status}`);
        }
        this.status = status;
    }

    /**
     * Check if validator is active
     * @returns {boolean} True if active
     */
    isActive() {
        return this.status === 'active';
    }

    /**
     * Get validator statistics
     * @returns {Object} Validator statistics
     */
    getStatistics() {
        return {
            name: this.name,
            address: this.address,
            stake: this.stake,
            reward: this.reward,
            status: this.status,
            blocksForged: this.blocksForged,
            totalStake: this.totalStake
        };
    }
}

export class ValidatorManager {
    /**
     * Create a new ValidatorManager instance
     * @param {Object} options - Manager options
     */
    constructor(options = {}) {
        this.validators = options.validators || [];
        this.minStake = options.minStake || 100;
        this.maxValidators = options.maxValidators || 100;
    }

    /**
     * Add a validator
     * @param {Validator} validator - Validator to add
     */
    addValidator(validator) {
        if (!(validator instanceof Validator)) {
            throw new Error('Must provide a Validator instance');
        }

        if (this.validators.length >= this.maxValidators) {
            throw new Error('Maximum number of validators reached');
        }

        if (validator.stake < this.minStake) {
            throw new Error(`Validator stake must be at least ${this.minStake}`);
        }

        const existingValidator = this.findValidatorByAddress(validator.address);
        if (existingValidator) {
            throw new Error('Validator already exists');
        }

        this.validators.push(validator);
    }

    /**
     * Remove a validator
     * @param {string} address - Validator address
     */
    removeValidator(address) {
        const index = this.validators.findIndex(validator => validator.address === address);
        if (index !== -1) {
            this.validators.splice(index, 1);
        }
    }

    /**
     * Find a validator by address
     * @param {string} address - Validator address
     * @returns {Validator|null} Validator or null if not found
     */
    findValidatorByAddress(address) {
        return this.validators.find(validator => validator.address === address) || null;
    }

    /**
     * Find a validator by name
     * @param {string} name - Validator name
     * @returns {Validator|null} Validator or null if not found
     */
    findValidatorByName(name) {
        return this.validators.find(validator => validator.name === name) || null;
    }

    /**
     * Get all active validators
     * @returns {Validator[]} Array of active validators
     */
    getActiveValidators() {
        return this.validators.filter(validator => validator.isActive());
    }

    /**
     * Get total stake of all validators
     * @returns {number} Total stake
     */
    getTotalStake() {
        return this.validators.reduce((sum, validator) => sum + validator.stake, 0);
    }

    /**
     * Select a validator based on stake-weighted random selection
     * @returns {Validator|null} Selected validator
     */
    selectValidator() {
        const activeValidators = this.getActiveValidators();
        if (activeValidators.length === 0) {
            return null;
        }

        const totalStake = activeValidators.reduce((sum, validator) => sum + validator.stake, 0);
        if (totalStake === 0) {
            return null;
        }

        let randomValue = Math.random() * totalStake;
        for (const validator of activeValidators) {
            if (randomValue < validator.stake) {
                return validator;
            }
            randomValue -= validator.stake;
        }

        return activeValidators[0]; // Fallback to first validator
    }
}

export class ProofOfStake {
    /**
     * Create a new ProofOfStake instance
     * @param {Blockchain} blockchain - Blockchain instance
     * @param {ValidatorManager} validatorManager - Validator manager instance
     * @param {Object} options - PoS options
     */
    constructor(blockchain, validatorManager, options = {}) {
        this.blockchain = blockchain;
        this.validatorManager = validatorManager || new ValidatorManager();
        this.reward = options.reward || 50;
    }

    /**
     * Forge a new block
     * @param {Transaction[]} transactions - Transactions to include
     * @returns {Block} Forged block
     */
    forgeBlock(transactions) {
        const latestBlock = this.blockchain.getLatestBlock();
        
        const validator = this.validatorManager.selectValidator();
        if (!validator) {
            throw new Error('No validators available to forge block');
        }

        const newBlock = new Block({
            index: latestBlock.index + 1,
            previousHash: latestBlock.hash,
            transactions: transactions,
            difficulty: this.blockchain.difficulty,
            validator: validator.address
        });

        newBlock.hash = newBlock.calculateHash();
        validator.incrementBlocksForged();
        
        console.log(`Block ${newBlock.index} forged by ${validator.name} (${validator.address.slice(0, 8)}...)`);
        
        return newBlock;
    }

    /**
     * Perform forging operation
     * @param {Object} options - Forging options
     * @returns {Block} Forged block
     */
    async forge(options = {}) {
        const { 
            transactions = this.blockchain.getMempoolTransactions().slice(0, this.blockchain.maxTransactionsPerBlock)
        } = options;

        return new Promise((resolve, reject) => {
            try {
                const block = this.forgeBlock(transactions);
                resolve(block);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Validate block against PoS rules
     * @param {Block} block - Block to validate
     * @returns {boolean} True if valid
     */
    validateBlock(block) {
        const validator = this.validatorManager.findValidatorByAddress(block.validator);
        
        if (!validator) {
            return false;
        }

        if (!validator.isActive()) {
            return false;
        }

        return block.isValid() && block.calculateHash() === block.hash;
    }

    /**
     * Distribute rewards to validator
     * @param {string} validatorAddress - Validator address
     * @param {number} amount - Reward amount
     */
    distributeReward(validatorAddress, amount = this.reward) {
        const validator = this.validatorManager.findValidatorByAddress(validatorAddress);
        
        if (validator) {
            validator.addReward(amount);
            return true;
        }
        
        return false;
    }

    /**
     * Set reward amount
     * @param {number} newReward - New reward amount
     */
    setReward(newReward) {
        if (typeof newReward !== 'number' || newReward < 0) {
            throw new Error('Reward must be a non-negative number');
        }
        this.reward = newReward;
    }

    /**
     * Get current reward
     * @returns {number} Current reward
     */
    getReward() {
        return this.reward;
    }

    /**
     * Get PoS statistics
     * @returns {Object} PoS statistics
     */
    getStatistics() {
        const activeValidators = this.validatorManager.getActiveValidators();
        const totalStake = this.validatorManager.getTotalStake();

        return {
            activeValidators: activeValidators.length,
            totalValidators: this.validatorManager.validators.length,
            totalStake: totalStake,
            averageStake: totalStake / (this.validatorManager.validators.length || 1),
            reward: this.reward
        };
    }
}

/**
 * Create a Proof of Stake consensus instance
 * @param {Blockchain} blockchain - Blockchain instance
 * @param {ValidatorManager} validatorManager - Validator manager
 * @param {Object} options - PoS options
 * @returns {ProofOfStake} PoS instance
 */
export function create_pos_consensus(blockchain, validatorManager = new ValidatorManager(), options = {}) {
    return new ProofOfStake(blockchain, validatorManager, options);
}

/**
 * Validate block against PoS rules
 * @param {Block} block - Block to validate
 * @param {ValidatorManager} validatorManager - Validator manager
 * @returns {boolean} True if valid
 */
export function validate_pos_block(block, validatorManager) {
    const validator = validatorManager.findValidatorByAddress(block.validator);
    return validator && validator.isActive() && block.isValid();
}
