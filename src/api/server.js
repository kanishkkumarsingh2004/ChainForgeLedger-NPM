/**
 * ChainForgeLedger - API Server
 * 
 * A RESTful API server for interacting with the ChainForgeLedger blockchain platform.
 * Provides endpoints for managing blocks, transactions, wallets, tokenomics, and more.
 */

import { createServer } from 'http';
import { URL } from 'url';

/**
 * API Server class
 * 
 * Provides a RESTful API interface to the ChainForgeLedger blockchain platform.
 */
export class APIServer {
    /**
     * Create a new API server instance
     * @param {Object} options - Server configuration options
     * @param {number} options.port - Port to listen on (default: 3000)
     * @param {string} options.host - Host to bind to (default: 'localhost')
     * @param {Object} options.blockchain - Blockchain instance
     * @param {Object} options.consensus - Consensus mechanism instance
     * @param {Object} options.tokenomics - Tokenomics system instance
     * @param {Object} options.logger - Logger instance (default: console)
     */
    constructor(options = {}) {
        this.port = options.port || 3000;
        this.host = options.host || 'localhost';
        this.blockchain = options.blockchain;
        this.consensus = options.consensus;
        this.tokenomics = options.tokenomics;
        this.logger = options.logger || console;
        
        this.server = null;
        this.routes = new Map();
        
        this.initializeRoutes();
    }

    /**
     * Initialize API routes
     */
    initializeRoutes() {
        // Blockchain endpoints
        this.routes.set('GET:/api/blocks', this.getBlocks.bind(this));
        this.routes.set('GET:/api/blocks/:index', this.getBlockByIndex.bind(this));
        this.routes.set('GET:/api/blocks/hash/:hash', this.getBlockByHash.bind(this));
        this.routes.set('POST:/api/blocks', this.addBlock.bind(this));
        
        // Transaction endpoints
        this.routes.set('GET:/api/transactions', this.getTransactions.bind(this));
        this.routes.set('GET:/api/transactions/:id', this.getTransactionById.bind(this));
        this.routes.set('POST:/api/transactions', this.addTransaction.bind(this));
        
        // Wallet endpoints
        this.routes.set('GET:/api/wallets', this.getWallets.bind(this));
        this.routes.set('GET:/api/wallets/:address', this.getWallet.bind(this));
        this.routes.set('POST:/api/wallets', this.createWallet.bind(this));
        
        // Tokenomics endpoints
        this.routes.set('GET:/api/tokenomics', this.getTokenomics.bind(this));
        this.routes.set('GET:/api/tokenomics/supply', this.getTokenSupply.bind(this));
        this.routes.set('POST:/api/tokenomics/mint', this.mintTokens.bind(this));
        
        // Consensus endpoints
        this.routes.set('GET:/api/consensus', this.getConsensusInfo.bind(this));
        this.routes.set('POST:/api/consensus/mine', this.mineBlock.bind(this));
        this.routes.set('POST:/api/consensus/forge', this.forgeBlock.bind(this));
        
        // Health check
        this.routes.set('GET:/api/health', this.getHealth.bind(this));
    }

    /**
     * Parse request body as JSON
     * @param {Object} req - HTTP request object
     * @returns {Promise} Resolves with parsed JSON body
     */
    async parseRequestBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    resolve(body ? JSON.parse(body) : {});
                } catch (error) {
                    reject(error);
                }
            });
            req.on('error', reject);
        });
    }

    /**
     * Send JSON response
     * @param {Object} res - HTTP response object
     * @param {number} statusCode - HTTP status code
     * @param {Object} data - Response data
     */
    sendResponse(res, statusCode, data) {
        res.writeHead(statusCode, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end(JSON.stringify(data));
    }

    /**
     * Send error response
     * @param {Object} res - HTTP response object
     * @param {number} statusCode - HTTP status code
     * @param {string} message - Error message
     * @param {Object} error - Error object (optional)
     */
    sendError(res, statusCode, message, error = null) {
        const response = {
            error: {
                code: statusCode,
                message: message
            }
        };
        
        if (error) {
            response.error.details = error.message;
            if (process.env.NODE_ENV === 'development') {
                response.error.stack = error.stack;
            }
        }
        
        this.sendResponse(res, statusCode, response);
    }

    /**
     * Extract route parameters from URL path
     * @param {string} routePattern - Route pattern with parameters (e.g., /api/blocks/:index)
     * @param {string} urlPath - Actual URL path (e.g., /api/blocks/5)
     * @returns {Object} Extracted parameters
     */
    extractParams(routePattern, urlPath) {
        const params = {};
        const patternParts = routePattern.split('/').filter(part => part);
        const pathParts = urlPath.split('/').filter(part => part);
        
        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                const paramName = patternParts[i].slice(1);
                params[paramName] = pathParts[i];
            }
        }
        
        return params;
    }

    /**
     * Handle incoming HTTP requests
     * @param {Object} req - HTTP request object
     * @param {Object} res - HTTP response object
     */
    async handleRequest(req, res) {
        try {
            // Handle CORS preflight
            if (req.method === 'OPTIONS') {
                this.sendResponse(res, 200, {});
                return;
            }

            const url = new URL(req.url, `http://${req.headers.host}`);
            const pathname = url.pathname;

            this.logger.log(`API Request: ${req.method} ${pathname}`);

            // Find matching route handler
            let handler = null;
            let params = {};
            
            for (const [routeKey, routeHandler] of this.routes.entries()) {
                const [method, routePattern] = routeKey.split(':');
                
                if (req.method === method) {
                    // Check if route pattern matches
                    const pattern = new RegExp(
                        '^' + routePattern.replace(/:([\w]+)/g, '([\\w-]+)') + '$'
                    );
                    
                    if (pattern.test(pathname)) {
                        handler = routeHandler;
                        params = this.extractParams(routePattern, pathname);
                        break;
                    }
                }
            }

            if (handler) {
                // Process request with handler
                const body = req.method === 'POST' || req.method === 'PUT' 
                    ? await this.parseRequestBody(req)
                    : {};
                
                const queryParams = Object.fromEntries(url.searchParams.entries());
                const request = {
                    params,
                    query: queryParams,
                    body,
                    headers: req.headers
                };
                
                const result = await handler(request);
                this.sendResponse(res, 200, {
                    success: true,
                    data: result
                });
            } else {
                // Route not found
                this.sendError(res, 404, 'Route not found', null);
            }
        } catch (error) {
            this.logger.error(`API Error: ${error.message}`);
            this.sendError(res, 500, 'Internal server error', error);
        }
    }

    // ==================== Blockchain Endpoints ====================

    /**
     * Get all blocks from the blockchain
     * @param {Object} request - Request object
     * @returns {Array} List of blocks
     */
    getBlocks(request) {
        const { limit = '100', offset = '0' } = request.query;
        const blocks = this.blockchain.chain.slice(
            parseInt(offset),
            parseInt(offset) + parseInt(limit)
        );
        
        return blocks.map(block => ({
            index: block.index,
            hash: block.hash,
            previousHash: block.previousHash,
            timestamp: block.timestamp,
            transactions: block.transactions.length,
            nonce: block.nonce,
            validator: block.validator
        }));
    }

    /**
     * Get block by index
     * @param {Object} request - Request object
     * @returns {Object} Block data
     */
    getBlockByIndex(request) {
        const { index } = request.params;
        const block = this.blockchain.chain[parseInt(index)];
        
        if (!block) {
            throw new Error('Block not found');
        }
        
        return block;
    }

    /**
     * Get block by hash
     * @param {Object} request - Request object
     * @returns {Object} Block data
     */
    getBlockByHash(request) {
        const { hash } = request.params;
        const block = this.blockchain.chain.find(b => b.hash === hash);
        
        if (!block) {
            throw new Error('Block not found');
        }
        
        return block;
    }

    /**
     * Add a new block to the blockchain
     * @param {Object} request - Request object
     * @returns {Object} Added block
     */
    addBlock(request) {
        const { block } = request.body;
        
        if (!block) {
            throw new Error('Block data required');
        }
        
        const added = this.blockchain.addBlock(block);
        return added;
    }

    // ==================== Transaction Endpoints ====================

    /**
     * Get all transactions from the blockchain
     * @param {Object} request - Request object
     * @returns {Array} List of transactions
     */
    getTransactions(request) {
        return this.blockchain.getAllTransactions();
    }

    /**
     * Get transaction by ID
     * @param {Object} request - Request object
     * @returns {Object} Transaction data
     */
    getTransactionById(request) {
        const { id } = request.params;
        const transaction = this.blockchain.getAllTransactions().find(tx => tx.id === id);
        
        if (!transaction) {
            throw new Error('Transaction not found');
        }
        
        return transaction;
    }

    /**
     * Add a new transaction to the blockchain
     * @param {Object} request - Request object
     * @returns {Object} Added transaction
     */
    addTransaction(request) {
        const { transaction } = request.body;
        
        if (!transaction) {
            throw new Error('Transaction data required');
        }
        
        return this.blockchain.addTransaction(transaction);
    }

    // ==================== Wallet Endpoints ====================

    /**
     * Get all wallets (placeholder method)
     * @param {Object} request - Request object
     * @returns {Array} List of wallets
     */
    getWallets(request) {
        // In a real implementation, this would fetch wallets from the state
        return [];
    }

    /**
     * Get wallet by address
     * @param {Object} request - Request object
     * @returns {Object} Wallet data
     */
    getWallet(request) {
        const { address } = request.params;
        
        // In a real implementation, this would fetch wallet from the state
        return {
            address,
            balance: 0,
            transactions: []
        };
    }

    /**
     * Create a new wallet
     * @param {Object} request - Request object
     * @returns {Object} New wallet
     */
    createWallet(request) {
        // In a real implementation, this would create a new wallet
        return {
            address: 'new_wallet_address',
            publicKey: 'public_key',
            privateKey: 'private_key' // Note: In production, don't return private key!
        };
    }

    // ==================== Tokenomics Endpoints ====================

    /**
     * Get tokenomics information
     * @param {Object} request - Request object
     * @returns {Object} Tokenomics data
     */
    getTokenomics(request) {
        if (!this.tokenomics) {
            throw new Error('Tokenomics system not available');
        }
        
        return {
            totalSupply: this.tokenomics.totalSupply,
            circulatingSupply: this.tokenomics.circulatingSupply,
            stakingRewardsPool: this.tokenomics.stakingRewardsPool,
            inflationRate: this.tokenomics.inflationRate,
            blockReward: this.tokenomics.blockReward,
            stakingRewards: this.tokenomics.stakingRewards
        };
    }

    /**
     * Get token supply information
     * @param {Object} request - Request object
     * @returns {Object} Token supply data
     */
    getTokenSupply(request) {
        if (!this.tokenomics) {
            throw new Error('Tokenomics system not available');
        }
        
        return {
            totalSupply: this.tokenomics.totalSupply,
            circulatingSupply: this.tokenomics.circulatingSupply,
            stakingRewardsPool: this.tokenomics.stakingRewardsPool
        };
    }

    /**
     * Mint new tokens
     * @param {Object} request - Request object
     * @returns {Object} Minting result
     */
    mintTokens(request) {
        const { amount, to } = request.body;
        
        if (!this.tokenomics) {
            throw new Error('Tokenomics system not available');
        }
        
        if (!amount || amount <= 0) {
            throw new Error('Valid amount required');
        }
        
        this.tokenomics.mintTokens(amount, to);
        
        return {
            message: 'Tokens minted successfully',
            newSupply: this.tokenomics.totalSupply,
            amount: amount,
            to: to
        };
    }

    // ==================== Consensus Endpoints ====================

    /**
     * Get consensus information
     * @param {Object} request - Request object
     * @returns {Object} Consensus data
     */
    getConsensusInfo(request) {
        if (!this.consensus) {
            throw new Error('Consensus mechanism not available');
        }
        
        return {
            type: this.consensus.constructor.name,
            difficulty: this.consensus.difficulty,
            networkHashRate: null // In real implementation, calculate this
        };
    }

    /**
     * Mine a new block (PoW)
     * @param {Object} request - Request object
     * @returns {Object} Mined block
     */
    async mineBlock(request) {
        if (!this.consensus || !this.consensus.mineBlock) {
            throw new Error('Mining not available');
        }
        
        const { transactions = [], miner } = request.body;
        const block = await this.consensus.mineBlock(transactions, miner);
        
        this.blockchain.addBlock(block);
        
        return {
            message: 'Block mined successfully',
            block: {
                index: block.index,
                hash: block.hash,
                transactions: block.transactions.length
            }
        };
    }

    /**
     * Forge a new block (PoS)
     * @param {Object} request - Request object
     * @returns {Object} Forged block
     */
    async forgeBlock(request) {
        if (!this.consensus || !this.consensus.forgeBlock) {
            throw new Error('Forging not available');
        }
        
        const { transactions = [] } = request.body;
        const block = await this.consensus.forgeBlock(transactions);
        
        this.blockchain.addBlock(block);
        
        return {
            message: 'Block forged successfully',
            block: {
                index: block.index,
                hash: block.hash,
                validator: block.validator,
                transactions: block.transactions.length
            }
        };
    }

    // ==================== Health Check ====================

    /**
     * Get server health status
     * @param {Object} request - Request object
     * @returns {Object} Health status
     */
    getHealth(request) {
        const blockchainHealth = this.blockchain.isChainValid();
        
        return {
            status: 'healthy',
            timestamp: Date.now(),
            blockchain: {
                length: this.blockchain.chain.length,
                valid: blockchainHealth.isValid,
                error: blockchainHealth.error || null
            },
            server: {
                host: this.host,
                port: this.port,
                uptime: process.uptime()
            }
        };
    }

    /**
     * Start the API server
     * @returns {Promise} Resolves when server is listening
     */
    async start() {
        return new Promise((resolve, reject) => {
            this.server = createServer(this.handleRequest.bind(this));
            
            this.server.listen(this.port, this.host, () => {
                this.logger.log(`API Server listening on http://${this.host}:${this.port}`);
                resolve();
            });
            
            this.server.on('error', (error) => {
                if (error.code === 'EADDRINUSE') {
                    this.logger.error(`Port ${this.port} is already in use`);
                }
                reject(error);
            });
        });
    }

    /**
     * Stop the API server
     * @returns {Promise} Resolves when server is stopped
     */
    async stop() {
        return new Promise((resolve, reject) => {
            if (!this.server) {
                resolve();
                return;
            }
            
            this.server.close((error) => {
                if (error) {
                    reject(error);
                } else {
                    this.logger.log('API Server stopped');
                    resolve();
                }
            });
        });
    }

    /**
     * Get server address information
     * @returns {Object} Server address details
     */
    getAddress() {
        if (!this.server) {
            return {
                host: this.host,
                port: this.port
            };
        }
        
        const address = this.server.address();
        return {
            host: address.address === '::' ? 'localhost' : address.address,
            port: address.port
        };
    }
}

/**
 * Create and start a new API server
 * @param {Object} options - Server configuration options
 * @returns {Promise} Resolves with APIServer instance
 */
export async function createAPIServer(options = {}) {
    const server = new APIServer(options);
    await server.start();
    return server;
}

/**
 * Create a new API server instance without starting it
 * @param {Object} options - Server configuration options
 * @returns {APIServer} APIServer instance
 */
export function createAPIServerInstance(options = {}) {
    return new APIServer(options);
}

export default APIServer;
