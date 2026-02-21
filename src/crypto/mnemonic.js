/**
 * ChainForgeLedger Mnemonic Module
 * 
 * Implements BIP39-like mnemonic generation and seed derivation for cryptocurrency wallets.
 */

const WORDLIST = [
    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
    'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
    'action', 'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit',
    'adopt', 'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age',
    'agent', 'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol',
    'alert', 'alien', 'all', 'alley', 'allow', 'almost', 'alone', 'alpha', 'already', 'also',
    'alter', 'always', 'amateur', 'amazing', 'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient',
    'anger', 'angle', 'angry', 'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna',
    'antique', 'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'arch',
    'arctic', 'area', 'arena', 'argue', 'arm', 'armed', 'armor', 'army', 'around', 'arrange',
    'arrest', 'arrive', 'arrow', 'art', 'artefact', 'artist', 'artwork', 'ask', 'aspect', 'assault',
    'asset', 'assist', 'assume', 'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract',
    'auction', 'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average', 'avocado', 'avoid',
    'awake', 'aware', 'away', 'awesome', 'awful', 'award', 'aware', 'away', 'awesome', 'awful',
    'award', 'aware', 'away', 'awesome', 'awful', 'award', 'aware', 'away', 'awesome', 'awful'
];

const BIP39_ENTROPY_SIZES = [128, 160, 192, 224, 256];
const BIP39_MNEMONIC_LENGTHS = [12, 15, 18, 21, 24];

export class Mnemonic {
    /**
     * Generate a new mnemonic phrase.
     * @param {number} strength - Entropy strength in bits (128, 160, 192, 224, 256)
     * @returns {string} Mnemonic phrase
     */
    static generate(strength = 128) {
        if (!BIP39_ENTROPY_SIZES.includes(strength)) {
            throw new Error('Invalid entropy strength. Must be 128, 160, 192, 224, or 256 bits');
        }

        const entropy = this._generateEntropy(strength);
        return this.entropyToMnemonic(entropy);
    }

    /**
     * Generate random entropy.
     * @param {number} bits - Number of bits
     * @returns {Uint8Array} Random entropy
     */
    static _generateEntropy(bits) {
        const bytes = new Uint8Array(bits / 8);
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            crypto.getRandomValues(bytes);
        } else {
            for (let i = 0; i < bytes.length; i++) {
                bytes[i] = Math.floor(Math.random() * 256);
            }
        }
        return bytes;
    }

    /**
     * Convert entropy to mnemonic phrase.
     * @param {Uint8Array|string} entropy - Entropy to convert
     * @returns {string} Mnemonic phrase
     */
    static entropyToMnemonic(entropy) {
        let entropyBytes;
        
        if (typeof entropy === 'string') {
            if (entropy.length % 2 !== 0) {
                throw new Error('Invalid entropy string length');
            }
            entropyBytes = new Uint8Array(entropy.length / 2);
            for (let i = 0; i < entropy.length; i += 2) {
                entropyBytes[i / 2] = parseInt(entropy.substr(i, 2), 16);
            }
        } else if (entropy instanceof Uint8Array) {
            entropyBytes = entropy;
        } else {
            throw new Error('Invalid entropy format');
        }

        const entropyBits = this._bytesToBinary(entropyBytes);
        const checksumBits = this._calculateChecksum(entropyBytes);
        const combinedBits = entropyBits + checksumBits;

        const wordIndices = [];
        for (let i = 0; i < combinedBits.length; i += 11) {
            const wordBits = combinedBits.substr(i, 11);
            wordIndices.push(parseInt(wordBits, 2));
        }

        return wordIndices.map(index => WORDLIST[index]).join(' ');
    }

    /**
     * Convert mnemonic phrase to entropy.
     * @param {string} mnemonic - Mnemonic phrase
     * @returns {Uint8Array} Entropy bytes
     */
    static mnemonicToEntropy(mnemonic) {
        const words = mnemonic.split(/\s+/).filter(word => word.trim());
        
        if (!BIP39_MNEMONIC_LENGTHS.includes(words.length)) {
            throw new Error('Invalid mnemonic length');
        }

        const wordIndices = words.map(word => {
            const index = WORDLIST.indexOf(word);
            if (index === -1) {
                throw new Error(`Invalid word: ${word}`);
            }
            return index;
        });

        const wordBits = wordIndices.map(index => index.toString(2).padStart(11, '0')).join('');
        const entropyLength = wordBits.length * 32 / 33;
        const checksumLength = wordBits.length / 33;
        
        const entropyBits = wordBits.substr(0, entropyLength);
        const checksumBits = wordBits.substr(entropyLength);
        
        const entropyBytes = this._binaryToBytes(entropyBits);
        const calculatedChecksum = this._calculateChecksum(entropyBytes);

        if (calculatedChecksum !== checksumBits) {
            throw new Error('Invalid mnemonic checksum');
        }

        return entropyBytes;
    }

    /**
     * Derive seed from mnemonic and passphrase.
     * @param {string} mnemonic - Mnemonic phrase
     * @param {string} passphrase - Optional passphrase
     * @returns {Promise<Uint8Array>} Seed bytes
     */
    static async mnemonicToSeed(mnemonic, passphrase = '') {
        const salt = `mnemonic${passphrase}`;
        const encoder = new TextEncoder();
        
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(mnemonic.normalize('NFKD')),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );

        const key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: encoder.encode(salt.normalize('NFKD')),
                iterations: 2048,
                hash: 'SHA-512'
            },
            keyMaterial,
            { name: 'HMAC', hash: 'SHA-512', length: 512 },
            false,
            ['sign', 'verify']
        );

        const rawKey = await crypto.subtle.exportKey('raw', key);
        return new Uint8Array(rawKey);
    }

    /**
     * Validate mnemonic phrase.
     * @param {string} mnemonic - Mnemonic to validate
     * @returns {object} Validation result
     */
    static validate(mnemonic) {
        try {
            this.mnemonicToEntropy(mnemonic);
            return {
                valid: true,
                length: mnemonic.split(/\s+/).filter(word => word.trim()).length,
                entropy: this.mnemonicToEntropy(mnemonic).length * 8
            };
        } catch (error) {
            return {
                valid: false,
                error: error.message
            };
        }
    }

    /**
     * Generate mnemonic from a hex string.
     * @param {string} hexString - Hex string to convert
     * @returns {string} Mnemonic phrase
     */
    static fromHex(hexString) {
        const bytes = new Uint8Array(hexString.length / 2);
        for (let i = 0; i < hexString.length; i += 2) {
            bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
        }
        return this.entropyToMnemonic(bytes);
    }

    /**
     * Convert mnemonic to hex string.
     * @param {string} mnemonic - Mnemonic to convert
     * @returns {string} Hex string
     */
    static toHex(mnemonic) {
        const bytes = this.mnemonicToEntropy(mnemonic);
        return Array.from(bytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    /**
     * Check if entropy is valid.
     * @param {Uint8Array} entropy - Entropy to check
     * @returns {boolean} Whether entropy is valid
     */
    static isValidEntropy(entropy) {
        const length = entropy.length * 8;
        return BIP39_ENTROPY_SIZES.includes(length);
    }

    /**
     * Calculate checksum for entropy.
     * @param {Uint8Array} bytes - Entropy bytes
     * @returns {string} Checksum bits
     */
    static _calculateChecksum(bytes) {
        const entropyLength = bytes.length * 8;
        const checksumLength = entropyLength / 32;
        
        const hash = this._sha256(bytes);
        const firstByte = hash[0];
        const checksumBits = firstByte.toString(2).padStart(8, '0').substr(0, checksumLength);
        
        return checksumBits;
    }

    /**
     * SHA-256 hash.
     * @param {Uint8Array} data - Data to hash
     * @returns {Uint8Array} Hash bytes
     */
    static async _sha256(data) {
        const buffer = await crypto.subtle.digest('SHA-256', data);
        return new Uint8Array(buffer);
    }

    /**
     * Convert bytes to binary string.
     * @param {Uint8Array} bytes - Bytes to convert
     * @returns {string} Binary string
     */
    static _bytesToBinary(bytes) {
        return Array.from(bytes)
            .map(b => b.toString(2).padStart(8, '0'))
            .join('');
    }

    /**
     * Convert binary string to bytes.
     * @param {string} binary - Binary string
     * @returns {Uint8Array} Bytes
     */
    static _binaryToBytes(binary) {
        const bytes = new Uint8Array(Math.ceil(binary.length / 8));
        for (let i = 0; i < binary.length; i += 8) {
            const byteBits = binary.substr(i, 8).padEnd(8, '0');
            bytes[Math.floor(i / 8)] = parseInt(byteBits, 2);
        }
        return bytes;
    }
}
