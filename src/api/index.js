/**
 * ChainForgeLedger - API Module
 * 
 * RESTful API server for interacting with the ChainForgeLedger blockchain platform.
 * Provides endpoints for managing blocks, transactions, wallets, tokenomics, and more.
 */

import APIServer, { createAPIServer, createAPIServerInstance } from './server.js';

export { APIServer, createAPIServer, createAPIServerInstance };
export default APIServer;
