#!/usr/bin/env node

/**
 * ChainForgeLedger - Light Client Test Suite
 * 
 * Comprehensive test file for the LightClient functionality
 */

import { LightClient, createLightClient, verifyBatchProofs, generateMerkleProof } from '../src/core/index.js';

console.log('🔍 Starting ChainForgeLedger Light Client Tests...');
console.log('============================================');

// Test 1: Initialize LightClient class
console.log('\n1️⃣  Testing LightClient class initialization...');
try {
    const lightClient = new LightClient();
    console.log('✅ LightClient instance created successfully');
} catch (error) {
    console.error('❌ Failed to create LightClient instance:', error.message);
    process.exit(1);
}

// Test 2: Create light client with createLightClient function
console.log('\n2️⃣  Testing createLightClient function...');
try {
    const options = {
        network: 'testnet',
        genesisBlock: {
            index: 0,
            previousHash: '0'.repeat(64),
            txRoot: '0'.repeat(64),
            stateRoot: '0'.repeat(64),
            receiptRoot: '0'.repeat(64),
            validator: 'genesis',
            timestamp: Date.now(),
            hash: '0'.repeat(64)
        }
    };
    
    const lightClient = createLightClient(options);
    console.log('✅ LightClient created successfully with options');
    console.log(`   Network: ${lightClient.network}`);
    console.log(`   Genesis block: ${lightClient.getBlockHeader(0) ? '✅' : '❌'}`);
} catch (error) {
    console.error('❌ Failed to create LightClient with options:', error.message);
    process.exit(1);
}

// Test 3: Verify block header
console.log('\n3️⃣  Testing block header verification...');
try {
    const lightClient = createLightClient({
        network: 'testnet',
        genesisBlock: {
            index: 0,
            previousHash: '0'.repeat(64),
            txRoot: '0'.repeat(64),
            stateRoot: '0'.repeat(64),
            receiptRoot: '0'.repeat(64),
            validator: 'genesis',
            timestamp: Date.now() - 3600000,
            hash: '0'.repeat(64)
        }
    });
    
    // Create a valid block header
    const validHeader = {
        index: 1,
        previousHash: '0'.repeat(64),
        txRoot: 'a'.repeat(64),
        stateRoot: 'b'.repeat(64),
        receiptRoot: 'c'.repeat(64),
        validator: '0x123',
        timestamp: Date.now(),
        nonce: 12345,
        difficulty: 2,
        hash: lightClient.calculateBlockHash({
            index: 1,
            previousHash: '0'.repeat(64),
            txRoot: 'a'.repeat(64),
            stateRoot: 'b'.repeat(64),
            receiptRoot: 'c'.repeat(64),
            validator: '0x123',
            timestamp: Date.now(),
            nonce: 12345,
            difficulty: 2
        })
    };
    
    const verificationResult = lightClient.verifyBlockHeader(validHeader);
    console.log(`   Block verification: ${verificationResult.isValid ? '✅ Valid' : '❌ Invalid'}`);
    
    if (!verificationResult.isValid) {
        console.error('   Errors:', verificationResult.errors);
        process.exit(1);
    }
} catch (error) {
    console.error('❌ Failed to test block header verification:', error.message);
    process.exit(1);
}

// Test 4: Process block header
console.log('\n4️⃣  Testing block header processing...');
try {
    const lightClient = createLightClient({
        network: 'testnet',
        genesisBlock: {
            index: 0,
            previousHash: '0'.repeat(64),
            txRoot: '0'.repeat(64),
            stateRoot: '0'.repeat(64),
            receiptRoot: '0'.repeat(64),
            validator: 'genesis',
            timestamp: Date.now() - 3600000,
            hash: '0'.repeat(64)
        }
    });
    
    const validHeader = {
        index: 1,
        previousHash: '0'.repeat(64),
        txRoot: 'a'.repeat(64),
        stateRoot: 'b'.repeat(64),
        receiptRoot: 'c'.repeat(64),
        validator: '0x123',
        timestamp: Date.now(),
        nonce: 12345,
        difficulty: 2,
        hash: lightClient.calculateBlockHash({
            index: 1,
            previousHash: '0'.repeat(64),
            txRoot: 'a'.repeat(64),
            stateRoot: 'b'.repeat(64),
            receiptRoot: 'c'.repeat(64),
            validator: '0x123',
            timestamp: Date.now(),
            nonce: 12345,
            difficulty: 2
        })
    };
    
    const processResult = lightClient.processBlockHeader(validHeader);
    console.log(`   Block processing: ${processResult.isValid ? '✅ Success' : '❌ Failed'}`);
    
    if (!processResult.isValid) {
        console.error('   Errors:', processResult.errors);
        process.exit(1);
    }
    
    console.log(`   Current block height: ${lightClient.getCurrentBlockHeight()}`);
} catch (error) {
    console.error('❌ Failed to test block header processing:', error.message);
    process.exit(1);
}

// Test 5: Process multiple block headers
console.log('\n5️⃣  Testing multiple block headers processing...');
try {
    const lightClient = createLightClient({
        network: 'testnet',
        genesisBlock: {
            index: 0,
            previousHash: '0'.repeat(64),
            txRoot: '0'.repeat(64),
            stateRoot: '0'.repeat(64),
            receiptRoot: '0'.repeat(64),
            validator: 'genesis',
            timestamp: Date.now() - 3600000,
            hash: '0'.repeat(64)
        }
    });
    
    for (let i = 1; i <= 3; i++) {
        const previousHeader = lightClient.getBlockHeader(i - 1);
        const header = {
            index: i,
            previousHash: previousHeader.hash,
            txRoot: 'a'.repeat(64),
            stateRoot: 'b'.repeat(64),
            receiptRoot: 'c'.repeat(64),
            validator: `0x${i}`,
            timestamp: Date.now() + (i * 60000),
            nonce: 12345 + i,
            difficulty: 2,
            hash: lightClient.calculateBlockHash({
                index: i,
                previousHash: previousHeader.hash,
                txRoot: 'a'.repeat(64),
                stateRoot: 'b'.repeat(64),
                receiptRoot: 'c'.repeat(64),
                validator: `0x${i}`,
                timestamp: Date.now() + (i * 60000),
                nonce: 12345 + i,
                difficulty: 2
            })
        };
        
        const processResult = lightClient.processBlockHeader(header);
        console.log(`   Block ${i}: ${processResult.isValid ? '✅ Success' : '❌ Failed'}`);
        
        if (!processResult.isValid) {
            console.error('   Errors:', processResult.errors);
            process.exit(1);
        }
    }
    
    console.log(`   Current block height: ${lightClient.getCurrentBlockHeight()}`);
} catch (error) {
    console.error('❌ Failed to test multiple block headers processing:', error.message);
    process.exit(1);
}

// Test 6: Verify blockchain sync
console.log('\n6️⃣  Testing blockchain sync verification...');
try {
    const lightClient = createLightClient({
        network: 'testnet',
        genesisBlock: {
            index: 0,
            previousHash: '0'.repeat(64),
            txRoot: '0'.repeat(64),
            stateRoot: '0'.repeat(64),
            receiptRoot: '0'.repeat(64),
            validator: 'genesis',
            timestamp: Date.now() - 3600000,
            hash: '0'.repeat(64)
        }
    });
    
    for (let i = 1; i <= 3; i++) {
        const previousHeader = lightClient.getBlockHeader(i - 1);
        const header = {
            index: i,
            previousHash: previousHeader.hash,
            txRoot: 'a'.repeat(64),
            stateRoot: 'b'.repeat(64),
            receiptRoot: 'c'.repeat(64),
            validator: `0x${i}`,
            timestamp: Date.now() + (i * 60000),
            nonce: 12345 + i,
            difficulty: 2,
            hash: lightClient.calculateBlockHash({
                index: i,
                previousHash: previousHeader.hash,
                txRoot: 'a'.repeat(64),
                stateRoot: 'b'.repeat(64),
                receiptRoot: 'c'.repeat(64),
                validator: `0x${i}`,
                timestamp: Date.now() + (i * 60000),
                nonce: 12345 + i,
                difficulty: 2
            })
        };
        
        lightClient.processBlockHeader(header);
    }
    
    const syncResult = lightClient.verifySync();
    console.log(`   Sync verification: ${syncResult.isValid ? '✅ Valid' : '❌ Invalid'}`);
    
    if (!syncResult.isValid) {
        console.error('   Errors:', syncResult.errors);
        process.exit(1);
    }
} catch (error) {
    console.error('❌ Failed to test sync verification:', error.message);
    process.exit(1);
}

console.log('\n============================================');
console.log('🎉 All light client tests passed!');
