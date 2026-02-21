#!/usr/bin/env node

/**
 * ChainForgeLedger - Main CLI entry point
 * 
 * This module provides the command-line interface for the ChainForgeLedger blockchain platform.
 */

import { Blockchain, Transaction, ProofOfWork, ProofOfStake, Tokenomics, Wallet, Validator, ValidatorManager } from './index.js';

function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        showHelp();
        process.exit(0);
    }
    
    const command = args[0];
    
    switch (command) {
        case 'demo':
            runComprehensiveDemo();
            break;
        case 'basic':
            runBasicDemo();
            break;
        case 'pow':
            runPowOperations(args.slice(1));
            break;
        case 'pos':
            runPosOperations(args.slice(1));
            break;
        case 'token':
            runTokenOperations(args.slice(1));
            break;
        case 'version':
            console.log('ChainForgeLedger v1.0.0');
            break;
        default:
            console.log(`Unknown command: ${command}`);
            showHelp();
            process.exit(1);
    }
}

function showHelp() {
    console.log(`ChainForgeLedger - Complete Blockchain Platform CLI

Usage: chainforgeledger <command> [options]

Commands:
  demo               Run comprehensive platform demonstration
  basic              Run basic blockchain operations
  pow [options]      Proof of Work operations
  pos [options]      Proof of Stake operations
  token [options]    Tokenomics operations
  version            Show version information
  --help, -h         Show this help message

Examples:
  chainforgeledger demo
  chainforgeledger basic
  chainforgeledger pow --mine
  chainforgeledger pos --forge
  chainforgeledger token --create

Options for pow:
  --mine             Mine a block
  --difficulty <n>   Mining difficulty (default: 3)

Options for pos:
  --forge            Forge a block

Options for token:
  --create           Create tokenomics system
  --mint <n>         Mint tokens
  --supply <n>       Total supply (default: 1000000000)
`);
}

function runBasicDemo() {
    console.log('=== ChainForgeLedger - Basic Blockchain Operations ===');
    
    // Create blockchain with PoW
    console.log('\n1. Creating Proof of Work Blockchain...');
    const blockchain = new Blockchain();
    const powConsensus = new ProofOfWork(blockchain, { difficulty: 2 });
    console.log(`   Genesis Block Created: ${blockchain.chain[0].hash.slice(0, 16)}...`);
    
    // Create transactions
    console.log('\n2. Creating Transactions...');
    const transactions = [];
    for (let i = 0; i < 2; i++) {
        const tx = new Transaction({
            sender: `user${100 + i}`,
            receiver: `user${200 + i}`,
            amount: Math.random() * 100
        });
        transactions.push(tx.toJSON());
        console.log(`   Transaction ${i + 1} created: ${tx.sender} -> ${tx.receiver} (${tx.amount.toFixed(2)})`);
    }
    
    // Mine a block
    console.log('\n3. Mining Block...');
    const block = powConsensus.mineBlock(transactions, 'miner1');
    blockchain.addBlock(block);
    console.log(`   Block ${block.index} mined`);
    console.log(`   Block Hash: ${block.hash.slice(0, 16)}...`);
    console.log(`   Transactions in Block: ${block.transactions.length}`);
    
    // Verify blockchain
    console.log('\n4. Verifying Blockchain...');
    const isValid = blockchain.isChainValid();
    console.log(`   Blockchain Valid: ${isValid.isValid ? '✅' : '❌'}`);
    
    console.log('\n=== Basic Demo Complete ===');
}

function runComprehensiveDemo() {
    console.log('=== ChainForgeLedger - Comprehensive Platform Demonstration ===');
    
    // Create blockchain
    const blockchain = new Blockchain();
    const powConsensus = new ProofOfWork(blockchain, { difficulty: 3 });
    
    // Create transactions
    const transactions = [];
    for (let i = 0; i < 3; i++) {
        const tx = new Transaction({
            sender: `user${100 + i}`,
            receiver: `user${200 + i}`,
            amount: Math.random() * 100
        });
        transactions.push(tx.toJSON());
    }
    
    // Mine blocks
    for (let i = 0; i < 2; i++) {
        const block = powConsensus.mineBlock(transactions, `miner${i + 1}`);
        blockchain.addBlock(block);
        console.log(`Block ${block.index} mined: ${block.hash.slice(0, 16)}...`);
    }
    
    console.log(`Blockchain length: ${blockchain.chain.length} blocks`);
    console.log(`Total transactions: ${blockchain.getAllTransactions().length}`);
    console.log(`Blockchain valid: ${blockchain.isChainValid().isValid}`);
    
    console.log('\n=== Tokenomics System ===');
    const tokenomics = new Tokenomics({ totalSupply: 1000000000 });
    console.log(`Total Supply: ${tokenomics.totalSupply.toLocaleString()}`);
    console.log(`Circulating Supply: ${tokenomics.circulatingSupply.toLocaleString()}`);
    console.log(`Staking Rewards Pool: ${tokenomics.stakingRewardsPool.toLocaleString()}`);
    
    console.log('\n=== Wallet System ===');
    const wallet = new Wallet();
    console.log(`Wallet Address: ${wallet.address}`);
    console.log(`Wallet Balance: ${wallet.balance}`);
    
    console.log('\n=== Comprehensive Demo Complete ===');
}

function runPowOperations(options) {
    console.log('=== Proof of Work Operations ===');
    
    if (options.includes('--mine')) {
        const difficultyIndex = options.indexOf('--difficulty');
        const difficulty = difficultyIndex !== -1 ? parseInt(options[difficultyIndex + 1]) || 3 : 3;
        
        console.log(`\nMining with difficulty: ${difficulty}`);
        const blockchain = new Blockchain({ difficulty });
        const powConsensus = new ProofOfWork(blockchain, { difficulty });
        
        // Create transactions
        const transactions = [];
        for (let i = 0; i < 3; i++) {
            const tx = new Transaction({
                sender: `user${100 + i}`,
                receiver: `user${200 + i}`,
                amount: Math.random() * 100
            });
            transactions.push(tx.toJSON());
        }
        
        const block = powConsensus.mineBlock(transactions, `miner${difficulty}`);
        blockchain.addBlock(block);
        console.log(`Block ${block.index} mined`);
        console.log(`  Hash: ${block.hash.slice(0, 16)}...`);
        console.log(`  Nonce: ${block.nonce}`);
        console.log(`  Transactions: ${block.transactions.length}`);
    } else {
        console.log('Use --mine to mine a block');
    }
}

function runPosOperations(options) {
    console.log('=== Proof of Stake Operations ===');
    
    if (options.includes('--forge')) {
        // Create blockchain and validator manager
        const blockchain = new Blockchain();
        const validatorManager = new ValidatorManager();
        
        // Create initial validators
        const initialValidators = [
            { name: 'validator1', stake: 500 },
            { name: 'validator2', stake: 300 },
            { name: 'validator3', stake: 200 },
            { name: 'validator4', stake: 150 }
        ];
        
        initialValidators.forEach(({ name, stake }) => {
            const validator = new Validator({ name, stake });
            validatorManager.addValidator(validator);
        });
        
        const posConsensus = new ProofOfStake(blockchain, validatorManager);
        console.log(`✓ Blockchain created with ${posConsensus.validatorManager.getActiveValidators().length} validators`);
        
        // Create transactions
        const transactions = [];
        for (let i = 0; i < 2; i++) {
            const tx = new Transaction({
                sender: `validator${i}`,
                receiver: `user${100 + i}`,
                amount: Math.random() * 100
            });
            transactions.push(tx.toJSON());
        }
        
        const block = posConsensus.forgeBlock(transactions);
        blockchain.addBlock(block);
        console.log(`Block ${block.index} forged`);
        console.log(`  Hash: ${block.hash.slice(0, 16)}...`);
        console.log(`  Validator: ${block.validator}`);
        console.log(`  Transactions: ${block.transactions.length}`);
    } else {
        console.log('Use --forge to forge a block');
    }
}

function runTokenOperations(options) {
    console.log('=== Tokenomics Operations ===');
    
    if (options.includes('--create')) {
        const supplyIndex = options.indexOf('--supply');
        const supply = supplyIndex !== -1 ? parseInt(options[supplyIndex + 1]) || 1000000000 : 1000000000;
        
        const tokenomics = new Tokenomics({ totalSupply: supply });
        console.log('Tokenomics system created');
        console.log(`  Total Supply: ${tokenomics.totalSupply.toLocaleString()}`);
        console.log(`  Circulating Supply: ${tokenomics.circulatingSupply.toLocaleString()}`);
        console.log(`  Staking Rewards Pool: ${tokenomics.stakingRewardsPool.toLocaleString()}`);
    }
    
    if (options.includes('--mint')) {
        const mintIndex = options.indexOf('--mint');
        const mintAmount = mintIndex !== -1 ? parseInt(options[mintIndex + 1]) || 0 : 0;
        
        const supplyIndex = options.indexOf('--supply');
        const supply = supplyIndex !== -1 ? parseInt(options[supplyIndex + 1]) || 1000000000 : 1000000000;
        
        const tokenomics = new Tokenomics({ totalSupply: supply });
        tokenomics.mintTokens(mintAmount, 'staking_rewards');
        console.log(`Successfully minted ${mintAmount.toLocaleString()} tokens`);
        console.log(`New Total Supply: ${tokenomics.totalSupply.toLocaleString()}`);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    try {
        main();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        if (process.argv.includes('--debug')) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}
