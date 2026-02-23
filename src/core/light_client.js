/**
 * ChainForgeLedger - Light Client
 * 
 * A light client implementation that verifies block headers and Merkle proofs
 * without executing full block states, providing a lightweight way to interact
 * with the blockchain network.
 */

import { sha256_hash } from '../crypto/hashing.js';
import { MerkleTree } from './merkle.js';

/**
 * LightClient class for blockchain verification
 */
export class LightClient {
    /**
     * Create a new LightClient instance
     * @param {Object} options - Configuration options
     * @param {string} options.network - Network identifier (mainnet, testnet)
     * @param {Object} options.genesisBlock - Genesis block header
     */
    constructor(options = {}) {
        this.network = options.network || 'mainnet';
        this.genesisBlock = options.genesisBlock;
        this.blockHeaders = new Map();
        this.currentBlockHeight = 0;
        
        if (this.genesisBlock) {
            this.blockHeaders.set(0, this.genesisBlock);
        }
    }

    /**
     * Verify a block header
     * @param {Object} header - Block header to verify
     * @param {number} header.index - Block index
     * @param {string} header.previousHash - Previous block hash
     * @param {string} header.txRoot - Transactions Merkle root
     * @param {string} header.stateRoot - State Merkle root
     * @param {string} header.receiptRoot - Receipts Merkle root
     * @param {string} header.validator - Block validator
     * @param {number} header.timestamp - Block timestamp
     * @param {string} header.hash - Block hash
     * @returns {Object} Verification result
     */
    verifyBlockHeader(header) {
        const errors = [];

        // Check block index
        if (typeof header.index !== 'number' || header.index < 0) {
            errors.push('Invalid block index');
        }

        // Check previous block hash
        if (typeof header.previousHash !== 'string' || header.previousHash.length !== 64) {
            errors.push('Invalid previous block hash');
        } else if (header.index > 0) {
            const previousHeader = this.blockHeaders.get(header.index - 1);
            if (!previousHeader) {
                errors.push('Previous block header not found');
            } else if (previousHeader.hash !== header.previousHash) {
                errors.push('Previous block hash mismatch');
            }
        }

        // Check transaction root
        if (typeof header.txRoot !== 'string' || header.txRoot.length !== 64) {
            errors.push('Invalid transactions Merkle root');
        }

        // Check state root
        if (typeof header.stateRoot !== 'string' || header.stateRoot.length !== 64) {
            errors.push('Invalid state Merkle root');
        }

        // Check receipt root
        if (typeof header.receiptRoot !== 'string' || header.receiptRoot.length !== 64) {
            errors.push('Invalid receipts Merkle root');
        }

        // Check validator
        if (typeof header.validator !== 'string') {
            errors.push('Invalid validator address');
        }

        // Check timestamp
        if (typeof header.timestamp !== 'number' || isNaN(header.timestamp)) {
            errors.push('Invalid timestamp');
        } else if (header.index > 0) {
            const previousHeader = this.blockHeaders.get(header.index - 1);
            if (previousHeader && header.timestamp <= previousHeader.timestamp) {
                errors.push('Invalid timestamp (must be greater than previous block)');
            }
        }

        // Verify block hash
        const calculatedHash = this.calculateBlockHash(header);
        if (calculatedHash !== header.hash) {
            errors.push(`Block hash mismatch: expected ${calculatedHash}, got ${header.hash}`);
        }

        const isValid = errors.length === 0;

        return {
            isValid,
            errors,
            message: isValid ? 'Block header valid' : `Block header invalid: ${errors.join(', ')}`
        };
    }

    /**
     * Calculate block hash from header
     * @param {Object} header - Block header
     * @returns {string} Block hash
     */
    calculateBlockHash(header) {
        const headerData = JSON.stringify({
            index: header.index,
            timestamp: header.timestamp,
            txRoot: header.txRoot,
            stateRoot: header.stateRoot,
            receiptRoot: header.receiptRoot,
            previousHash: header.previousHash,
            nonce: header.nonce,
            validator: header.validator,
            difficulty: header.difficulty
        });
        
        return sha256_hash(headerData);
    }

    /**
     * Verify a Merkle proof for a transaction
     * @param {string} txHash - Transaction hash to verify
     * @param {Array} proof - Merkle proof array
     * @param {string} txRoot - Expected transactions Merkle root
     * @returns {Object} Verification result
     */
    verifyTransactionProof(txHash, proof, txRoot) {
        let currentHash = txHash;

        for (let i = 0; i < proof.length; i++) {
            const { hash, position } = proof[i];
            if (position === 'left') {
                currentHash = sha256_hash(hash + currentHash);
            } else if (position === 'right') {
                currentHash = sha256_hash(currentHash + hash);
            } else {
                return {
                    isValid: false,
                    error: `Invalid proof position: ${position}`
                };
            }
        }

        const isValid = currentHash === txRoot;

        return {
            isValid,
            error: isValid ? null : `Root hash mismatch: expected ${txRoot}, got ${currentHash}`
        };
    }

    /**
     * Verify a Merkle proof for a state key-value pair
     * @param {string} key - State key to verify
     * @param {string} value - State value to verify
     * @param {Array} proof - Merkle proof array
     * @param {string} stateRoot - Expected state Merkle root
     * @returns {Object} Verification result
     */
    verifyStateProof(key, value, proof, stateRoot) {
        const keyValueHash = sha256_hash(key + value);
        let currentHash = keyValueHash;

        for (let i = 0; i < proof.length; i++) {
            const { hash, position } = proof[i];
            if (position === 'left') {
                currentHash = sha256_hash(hash + currentHash);
            } else if (position === 'right') {
                currentHash = sha256_hash(currentHash + hash);
            } else {
                return {
                    isValid: false,
                    error: `Invalid proof position: ${position}`
                };
            }
        }

        const isValid = currentHash === stateRoot;

        return {
            isValid,
            error: isValid ? null : `State root mismatch: expected ${stateRoot}, got ${currentHash}`
        };
    }

    /**
     * Process a new block header
     * @param {Object} header - Block header to process
     * @returns {Object} Processing result
     */
    processBlockHeader(header) {
        const verification = this.verifyBlockHeader(header);
        
        if (!verification.isValid) {
            return verification;
        }

        this.blockHeaders.set(header.index, header);
        
        if (header.index > this.currentBlockHeight) {
            this.currentBlockHeight = header.index;
        }

        return {
            isValid: true,
            message: `Block ${header.index} processed successfully`
        };
    }

    /**
     * Get block header at specified height
     * @param {number} height - Block height
     * @returns {Object|null} Block header or null if not found
     */
    getBlockHeader(height) {
        return this.blockHeaders.get(height) || null;
    }

    /**
     * Get current block height
     * @returns {number} Current block height
     */
    getCurrentBlockHeight() {
        return this.currentBlockHeight;
    }

    /**
     * Get block headers in range
     * @param {number} startHeight - Start height
     * @param {number} endHeight - End height
     * @returns {Array} Block headers in range
     */
    getBlockHeadersRange(startHeight, endHeight) {
        const headers = [];
        
        for (let i = startHeight; i <= endHeight; i++) {
            const header = this.blockHeaders.get(i);
            if (header) {
                headers.push(header);
            }
        }
        
        return headers;
    }

    /**
     * Verify blockchain sync by checking consecutive block headers
     * @returns {Object} Sync verification result
     */
    verifySync() {
        const errors = [];
        
        for (let i = 1; i <= this.currentBlockHeight; i++) {
            const currentHeader = this.blockHeaders.get(i);
            const previousHeader = this.blockHeaders.get(i - 1);
            
            if (!currentHeader || !previousHeader) {
                errors.push(`Missing block header at height ${!currentHeader ? i : i - 1}`);
                continue;
            }
            
            if (currentHeader.previousHash !== previousHeader.hash) {
                errors.push(`Hash mismatch at block ${i}`);
            }
            
            if (currentHeader.timestamp <= previousHeader.timestamp) {
                errors.push(`Invalid timestamp at block ${i}`);
            }
        }
        
        const isValid = errors.length === 0;
        
        return {
            isValid,
            errors,
            message: isValid ? 'Blockchain sync valid' : `Sync errors: ${errors.join(', ')}`
        };
    }
}

/**
 * Create a light client instance with default configuration
 * @param {Object} options - Configuration options
 * @returns {LightClient} Light client instance
 */
export function createLightClient(options = {}) {
    return new LightClient(options);
}

/**
 * Verify Merkle proof for multiple elements (batch verification)
 * @param {Array} proofRequests - Array of proof request objects
 * @returns {Array} Verification results
 */
export function verifyBatchProofs(proofRequests) {
    return proofRequests.map(request => {
        const { type, data, proof, root } = request;
        
        if (type === 'transaction') {
            const { txHash } = data;
            return verifyTransactionProof(txHash, proof, root);
        } else if (type === 'state') {
            const { key, value } = data;
            return verifyStateProof(key, value, proof, root);
        } else {
            return {
                isValid: false,
                error: `Invalid proof type: ${type}`
            };
        }
    });
}

/**
 * Generate a simple Merkle proof for demonstration purposes
 * @param {Array} elements - Array of elements to generate proof for
 * @param {string} targetHash - Target hash to find proof for
 * @returns {Array} Merkle proof
 */
export function generateMerkleProof(elements, targetHash) {
    const merkleTree = new MerkleTree(elements);
    return merkleTree.getProof(targetHash);
}
