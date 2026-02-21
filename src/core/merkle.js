import { sha256_hash } from '../crypto/hashing.js';

/**
 * Merkle Tree implementation
 */

export class MerkleTree {
    /**
     * Create a new MerkleTree instance
     * @param {Array} data - Data to build Merkle tree from
     */
    constructor(data = []) {
        this.data = data;
        this.tree = [];
        this.root = null;
        
        if (data.length > 0) {
            this.buildTree();
        }
    }

    /**
     * Build the Merkle tree
     */
    buildTree() {
        const leaves = this.data.map(item => {
            return typeof item === 'string' ? item : JSON.stringify(item);
        }).map(data => sha256_hash(data));

        this.tree = [leaves];

        while (this.tree[this.tree.length - 1].length > 1) {
            const nextLevel = [];
            const currentLevel = this.tree[this.tree.length - 1];
            
            for (let i = 0; i < currentLevel.length; i += 2) {
                const left = currentLevel[i];
                const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
                const combinedHash = sha256_hash(left + right);
                nextLevel.push(combinedHash);
            }
            
            this.tree.push(nextLevel);
        }

        if (this.tree.length > 0) {
            this.root = this.tree[this.tree.length - 1][0];
        }
    }

    /**
     * Get Merkle root
     * @returns {string} Merkle root hash
     */
    getRoot() {
        return this.root;
    }

    /**
     * Get Merkle tree structure
     * @returns {Array} Merkle tree levels
     */
    getTree() {
        return this.tree;
    }

    /**
     * Add new data to the Merkle tree
     * @param {*} data - Data to add
     */
    add(data) {
        this.data.push(data);
        this.buildTree();
    }

    /**
     * Add multiple data items to the Merkle tree
     * @param {Array} data - Array of data items
     */
    addAll(data) {
        this.data.push(...data);
        this.buildTree();
    }

    /**
     * Verify if data exists in the Merkle tree
     * @param {*} data - Data to verify
     * @param {Array} proof - Merkle proof
     * @returns {boolean} True if data is valid
     */
    verify(data, proof) {
        if (!this.root) {
            return false;
        }

        const dataHash = typeof data === 'string' ? sha256_hash(data) : sha256_hash(JSON.stringify(data));
        let currentHash = dataHash;

        for (const step of proof) {
            if (step.left) {
                currentHash = sha256_hash(step.left + currentHash);
            } else if (step.right) {
                currentHash = sha256_hash(currentHash + step.right);
            }
        }

        return currentHash === this.root;
    }

    /**
     * Generate Merkle proof for specific data
     * @param {*} data - Data to find proof for
     * @returns {Array} Merkle proof
     */
    getProof(data) {
        const dataString = typeof data === 'string' ? data : JSON.stringify(data);
        const dataHash = sha256_hash(dataString);
        const dataIndex = this.data.findIndex(item => {
            const itemString = typeof item === 'string' ? item : JSON.stringify(item);
            return sha256_hash(itemString) === dataHash;
        });

        if (dataIndex === -1) {
            return null;
        }

        const proof = [];
        let index = dataIndex;

        for (let level = 0; level < this.tree.length - 1; level++) {
            const currentLevel = this.tree[level];
            const siblingIndex = index % 2 === 0 ? index + 1 : index - 1;

            if (siblingIndex < currentLevel.length) {
                const siblingHash = currentLevel[siblingIndex];
                proof.push({
                    [index % 2 === 0 ? 'right' : 'left']: siblingHash
                });
            }

            index = Math.floor(index / 2);
        }

        return proof;
    }

    /**
     * Find data in the Merkle tree
     * @param {*} data - Data to find
     * @returns {Object} Data with index and proof
     */
    find(data) {
        const dataString = typeof data === 'string' ? data : JSON.stringify(data);
        const dataHash = sha256_hash(dataString);
        const index = this.data.findIndex(item => {
            const itemString = typeof item === 'string' ? item : JSON.stringify(item);
            return sha256_hash(itemString) === dataHash;
        });

        if (index === -1) {
            return null;
        }

        const proof = this.getProof(data);
        return {
            data,
            index,
            proof,
            hash: dataHash
        };
    }

    /**
     * Get number of leaves in the Merkle tree
     * @returns {number} Number of leaves
     */
    getSize() {
        return this.data.length;
    }

    /**
     * Check if Merkle tree is empty
     * @returns {boolean} True if empty
     */
    isEmpty() {
        return this.data.length === 0;
    }

    /**
     * Clear the Merkle tree
     */
    clear() {
        this.data = [];
        this.tree = [];
        this.root = null;
    }

    /**
     * Convert Merkle tree to JSON
     * @returns {Object} Merkle tree data
     */
    toJSON() {
        return {
            data: this.data,
            tree: this.tree,
            root: this.root
        };
    }

    /**
     * Create Merkle tree from JSON
     * @param {Object} json - Merkle tree data
     * @returns {MerkleTree} Merkle tree instance
     */
    static fromJSON(json) {
        const tree = new MerkleTree();
        tree.data = json.data || [];
        tree.tree = json.tree || [];
        tree.root = json.root || null;
        return tree;
    }
}

/**
 * Create a new Merkle tree
 * @param {Array} data - Data to build Merkle tree from
 * @returns {MerkleTree} New Merkle tree instance
 */
export function create_merkle_tree(data = []) {
    return new MerkleTree(data);
}

/**
 * Verify Merkle proof
 * @param {*} data - Data to verify
 * @param {Array} proof - Merkle proof
 * @param {string} root - Merkle root hash
 * @returns {boolean} True if data is valid
 */
export function verify_merkle_proof(data, proof, root) {
    const tree = new MerkleTree();
    tree.root = root;
    return tree.verify(data, proof);
}

/**
 * Build Merkle tree from data
 * @param {Array} data - Data to build Merkle tree from
 * @returns {MerkleTree} Merkle tree instance
 */
export function build_merkle_tree(data) {
    return new MerkleTree(data);
}
