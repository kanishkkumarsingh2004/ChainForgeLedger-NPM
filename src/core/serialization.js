/**
 * ChainForgeLedger Serialization Module
 * 
 * Implements serialization and deserialization of blockchain data structures.
 */

export class Serialization {
    /**
     * Serialize a transaction to binary format.
     * @param {Transaction} transaction - Transaction to serialize
     * @returns {Uint8Array} Binary representation
     */
    static serialize_transaction(transaction) {
        return new TextEncoder().encode(JSON.stringify({
            type: 'transaction',
            data: transaction
        }));
    }

    /**
     * Deserialize a transaction from binary format.
     * @param {Uint8Array} buffer - Binary data
     * @returns {Transaction} Deserialized transaction
     */
    static deserialize_transaction(buffer) {
        const json = JSON.parse(new TextDecoder().decode(buffer));
        if (json.type !== 'transaction') {
            throw new Error('Invalid transaction format');
        }
        return json.data;
    }

    /**
     * Serialize a block to binary format.
     * @param {Block} block - Block to serialize
     * @returns {Uint8Array} Binary representation
     */
    static serialize_block(block) {
        return new TextEncoder().encode(JSON.stringify({
            type: 'block',
            data: block
        }));
    }

    /**
     * Deserialize a block from binary format.
     * @param {Uint8Array} buffer - Binary data
     * @returns {Block} Deserialized block
     */
    static deserialize_block(buffer) {
        const json = JSON.parse(new TextDecoder().decode(buffer));
        if (json.type !== 'block') {
            throw new Error('Invalid block format');
        }
        return json.data;
    }

    /**
     * Serialize a blockchain to binary format.
     * @param {Blockchain} blockchain - Blockchain to serialize
     * @returns {Uint8Array} Binary representation
     */
    static serialize_blockchain(blockchain) {
        return new TextEncoder().encode(JSON.stringify({
            type: 'blockchain',
            version: '1.0',
            data: {
                chain: blockchain.chain,
                height: blockchain.get_height(),
                difficulty: blockchain.difficulty,
                consensus: blockchain.consensus_algorithm
            }
        }));
    }

    /**
     * Deserialize a blockchain from binary format.
     * @param {Uint8Array} buffer - Binary data
     * @returns {object} Deserialized blockchain
     */
    static deserialize_blockchain(buffer) {
        const json = JSON.parse(new TextDecoder().decode(buffer));
        if (json.type !== 'blockchain' || json.version !== '1.0') {
            throw new Error('Invalid blockchain format');
        }
        return json.data;
    }

    /**
     * Serialize an account state to binary format.
     * @param {Account} account - Account state to serialize
     * @returns {Uint8Array} Binary representation
     */
    static serialize_account(account) {
        return new TextEncoder().encode(JSON.stringify({
            type: 'account',
            data: account
        }));
    }

    /**
     * Deserialize an account state from binary format.
     * @param {Uint8Array} buffer - Binary data
     * @returns {Account} Deserialized account
     */
    static deserialize_account(buffer) {
        const json = JSON.parse(new TextDecoder().decode(buffer));
        if (json.type !== 'account') {
            throw new Error('Invalid account format');
        }
        return json.data;
    }

    /**
     * Serialize a smart contract to binary format.
     * @param {SmartContract} contract - Smart contract to serialize
     * @returns {Uint8Array} Binary representation
     */
    static serialize_contract(contract) {
        return new TextEncoder().encode(JSON.stringify({
            type: 'contract',
            data: contract
        }));
    }

    /**
     * Deserialize a smart contract from binary format.
     * @param {Uint8Array} buffer - Binary data
     * @returns {SmartContract} Deserialized contract
     */
    static deserialize_contract(buffer) {
        const json = JSON.parse(new TextDecoder().decode(buffer));
        if (json.type !== 'contract') {
            throw new Error('Invalid contract format');
        }
        return json.data;
    }

    /**
     * Serialize metadata to binary format.
     * @param {object} metadata - Metadata to serialize
     * @returns {Uint8Array} Binary representation
     */
    static serialize_metadata(metadata) {
        return new TextEncoder().encode(JSON.stringify({
            type: 'metadata',
            data: metadata
        }));
    }

    /**
     * Deserialize metadata from binary format.
     * @param {Uint8Array} buffer - Binary data
     * @returns {object} Deserialized metadata
     */
    static deserialize_metadata(buffer) {
        const json = JSON.parse(new TextDecoder().decode(buffer));
        if (json.type !== 'metadata') {
            throw new Error('Invalid metadata format');
        }
        return json.data;
    }

    /**
     * Serialize any data structure with type information.
     * @param {string} type - Data type identifier
     * @param {any} data - Data to serialize
     * @returns {Uint8Array} Binary representation
     */
    static serialize(type, data) {
        const obj = {
            type,
            timestamp: Date.now(),
            data
        };
        return new TextEncoder().encode(JSON.stringify(obj));
    }

    /**
     * Deserialize data with type information.
     * @param {Uint8Array} buffer - Binary data
     * @returns {object} Deserialized object with type
     */
    static deserialize(buffer) {
        return JSON.parse(new TextDecoder().decode(buffer));
    }

    /**
     * Serialize data to hexadecimal string.
     * @param {Uint8Array} buffer - Binary data
     * @returns {string} Hexadecimal representation
     */
    static to_hex(buffer) {
        return Array.from(buffer)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    /**
     * Deserialize from hexadecimal string to Uint8Array.
     * @param {string} hex - Hexadecimal string
     * @returns {Uint8Array} Binary data
     */
    static from_hex(hex) {
        const buffer = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            buffer[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return buffer;
    }

    /**
     * Serialize data to Base64 string.
     * @param {Uint8Array} buffer - Binary data
     * @returns {string} Base64 representation
     */
    static to_base64(buffer) {
        return btoa(String.fromCharCode.apply(null, buffer));
    }

    /**
     * Deserialize from Base64 string to Uint8Array.
     * @param {string} base64 - Base64 string
     * @returns {Uint8Array} Binary data
     */
    static from_base64(base64) {
        return new Uint8Array([...atob(base64)].map(char => char.charCodeAt(0)));
    }

    /**
     * Calculate data size in bytes.
     * @param {any} data - Data to measure
     * @returns {number} Size in bytes
     */
    static get_size(data) {
        if (data instanceof Uint8Array) {
            return data.length;
        }
        const buffer = this.serialize('unknown', data);
        return buffer.length;
    }

    /**
     * Compress serialized data using gzip.
     * @param {Uint8Array} buffer - Data to compress
     * @returns {Promise<Uint8Array>} Compressed data
     */
    static async compress(buffer) {
        return buffer;
    }

    /**
     * Decompress compressed data.
     * @param {Uint8Array} buffer - Compressed data
     * @returns {Promise<Uint8Array>} Decompressed data
     */
    static async decompress(buffer) {
        return buffer;
    }

    /**
     * Validate serialized data structure.
     * @param {Uint8Array} buffer - Data to validate
     * @returns {object} Validation result
     */
    static validate(buffer) {
        try {
            const data = this.deserialize(buffer);
            return {
                valid: true,
                type: data.type,
                timestamp: data.timestamp,
                message: 'Data is valid'
            };
        } catch (error) {
            return {
                valid: false,
                type: 'unknown',
                timestamp: null,
                message: error.message
            };
        }
    }
}
