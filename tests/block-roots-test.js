#!/usr/bin/env node

/**
 * ChainForgeLedger - Block Roots Calculation Test Suite
 * 
 * Comprehensive test file for block roots (txRoot, stateRoot, receiptRoot)
 * calculation and verification.
 */

import { Block, Transaction, TransactionReceipt } from '../src/core/index.js';

console.log('🔍 Starting ChainForgeLedger Block Roots Tests...');
console.log('================================================');

// Test 1: Block creation with empty transactions
console.log('\n1️⃣  Testing block creation with empty transactions...');
try {
    const block = new Block({
        index: 1,
        timestamp: Date.now(),
        previousHash: '0'.repeat(64),
        nonce: 12345,
        difficulty: 2
    });
    
    console.log('✅ Block created successfully');
    console.log(`   txRoot: ${block.txRoot}`);
    console.log(`   stateRoot: ${block.stateRoot}`);
    console.log(`   receiptRoot: ${block.receiptRoot}`);
    
    // Verify roots are not empty
    if (!block.txRoot || !block.stateRoot || !block.receiptRoot) {
        throw new Error('Roots should not be empty for empty block');
    }
} catch (error) {
    console.error('❌ Failed to test block creation:', error.message);
    process.exit(1);
}

// Test 2: Block with single transaction
console.log('\n2️⃣  Testing block with single transaction...');
try {
    const block = new Block({
        index: 1,
        timestamp: Date.now(),
        previousHash: '0'.repeat(64),
        nonce: 12345,
        difficulty: 2
    });
    
    const tx = new Transaction({
        id: 'tx1',
        sender: '0x123',
        receiver: '0x456',  // Changed from recipient to receiver
        amount: 100,
        fee: 1,
        timestamp: Date.now(),
        signature: 'valid_signature'
    });
    
    block.addTransaction(tx);
    
    console.log('✅ Transaction added successfully');
    console.log(`   Number of transactions: ${block.getTransactionCount()}`);
    console.log(`   txRoot: ${block.txRoot}`);
    console.log(`   stateRoot: ${block.stateRoot}`);
    console.log(`   receiptRoot: ${block.receiptRoot}`);
} catch (error) {
    console.error('❌ Failed to test block with single transaction:', error.message);
    process.exit(1);
}

// Test 3: Block with multiple transactions
console.log('\n3️⃣  Testing block with multiple transactions...');
try {
    const block = new Block({
        index: 1,
        timestamp: Date.now(),
        previousHash: '0'.repeat(64),
        nonce: 12345,
        difficulty: 2
    });
    
    const tx1 = new Transaction({
        id: 'tx1',
        sender: '0x123',
        receiver: '0x456',  // Changed from recipient to receiver
        amount: 100,
        fee: 1,
        timestamp: Date.now(),
        signature: 'valid_signature'
    });
    
    const tx2 = new Transaction({
        id: 'tx2',
        sender: '0x456',
        receiver: '0x789',  // Changed from recipient to receiver
        amount: 50,
        fee: 0.5,
        timestamp: Date.now(),
        signature: 'valid_signature2'
    });
    
    block.addTransaction(tx1);
    block.addTransaction(tx2);
    
    console.log('✅ Transactions added successfully');
    console.log(`   Number of transactions: ${block.getTransactionCount()}`);
    console.log(`   txRoot: ${block.txRoot}`);
    console.log(`   stateRoot: ${block.stateRoot}`);
    console.log(`   receiptRoot: ${block.receiptRoot}`);
} catch (error) {
    console.error('❌ Failed to test block with multiple transactions:', error.message);
    process.exit(1);
}

// Test 4: Roots consistency with same transactions
console.log('\n4️⃣  Testing roots consistency with same transactions...');
try {
    const block1 = new Block({
        index: 1,
        timestamp: Date.now(),
        previousHash: '0'.repeat(64),
        nonce: 12345,
        difficulty: 2
    });
    
    const block2 = new Block({
        index: 1,
        timestamp: Date.now(),
        previousHash: '0'.repeat(64),
        nonce: 12345,
        difficulty: 2
    });
    
    const tx1 = new Transaction({
        id: 'tx1',
        sender: '0x123',
        receiver: '0x456',  // Changed from recipient to receiver
        amount: 100,
        fee: 1,
        timestamp: Date.now(),
        signature: 'valid_signature'
    });
    
    const tx2 = new Transaction({
        id: 'tx2',
        sender: '0x456',
        receiver: '0x789',  // Changed from recipient to receiver
        amount: 50,
        fee: 0.5,
        timestamp: Date.now(),
        signature: 'valid_signature2'
    });
    
    block1.addTransaction(tx1);
    block1.addTransaction(tx2);
    block2.addTransaction(tx1);
    block2.addTransaction(tx2);
    
    const txRootMatch = block1.txRoot === block2.txRoot;
    const stateRootMatch = block1.stateRoot === block2.stateRoot;
    const receiptRootMatch = block1.receiptRoot === block2.receiptRoot;
    
    console.log(`   txRoot matches: ${txRootMatch ? '✅' : '❌'}`);
    console.log(`   stateRoot matches: ${stateRootMatch ? '✅' : '❌'}`);
    console.log(`   receiptRoot matches: ${receiptRootMatch ? '✅' : '❌'}`);
    
    if (!txRootMatch || !stateRootMatch || !receiptRootMatch) {
        throw new Error('Roots should match for identical blocks');
    }
} catch (error) {
    console.error('❌ Failed to test roots consistency:', error.message);
    process.exit(1);
}

// Test 5: Roots change with different transactions
console.log('\n5️⃣  Testing roots change with different transactions...');
try {
    const block1 = new Block({
        index: 1,
        timestamp: Date.now(),
        previousHash: '0'.repeat(64),
        nonce: 12345,
        difficulty: 2
    });
    
    const block2 = new Block({
        index: 1,
        timestamp: Date.now(),
        previousHash: '0'.repeat(64),
        nonce: 12345,
        difficulty: 2
    });
    
    const tx1 = new Transaction({
        id: 'tx1',
        sender: '0x123',
        receiver: '0x456',  // Changed from recipient to receiver
        amount: 100,
        fee: 1,
        timestamp: Date.now(),
        signature: 'valid_signature'
    });
    
    const tx2 = new Transaction({
        id: 'tx2',
        sender: '0x456',
        receiver: '0x789',  // Changed from recipient to receiver
        amount: 50,
        fee: 0.5,
        timestamp: Date.now(),
        signature: 'valid_signature2'
    });
    
    const tx3 = new Transaction({
        id: 'tx3',
        sender: '0x123',
        receiver: '0x789',  // Changed from recipient to receiver
        amount: 75,
        fee: 0.75,
        timestamp: Date.now(),
        signature: 'valid_signature3'
    });
    
    block1.addTransaction(tx1);
    block1.addTransaction(tx2);
    block2.addTransaction(tx1);
    block2.addTransaction(tx3);
    
    const txRootMatch = block1.txRoot === block2.txRoot;
    
    console.log(`   txRoot differs: ${!txRootMatch ? '✅' : '❌'}`);
    
    if (txRootMatch) {
        throw new Error('txRoot should differ for different transactions');
    }
} catch (error) {
    console.error('❌ Failed to test roots change:', error.message);
    process.exit(1);
}

// Test 6: Transaction order affects roots
console.log('\n6️⃣  Testing transaction order affects roots...');
try {
    const block1 = new Block({
        index: 1,
        timestamp: Date.now(),
        previousHash: '0'.repeat(64),
        nonce: 12345,
        difficulty: 2
    });
    
    const block2 = new Block({
        index: 1,
        timestamp: Date.now(),
        previousHash: '0'.repeat(64),
        nonce: 12345,
        difficulty: 2
    });
    
    const tx1 = new Transaction({
        id: 'tx1',
        sender: '0x123',
        receiver: '0x456',  // Changed from recipient to receiver
        amount: 100,
        fee: 1,
        timestamp: Date.now(),
        signature: 'valid_signature'
    });
    
    const tx2 = new Transaction({
        id: 'tx2',
        sender: '0x456',
        receiver: '0x789',  // Changed from recipient to receiver
        amount: 50,
        fee: 0.5,
        timestamp: Date.now(),
        signature: 'valid_signature2'
    });
    
    block1.addTransaction(tx1);
    block1.addTransaction(tx2);
    block2.addTransaction(tx2);
    block2.addTransaction(tx1);
    
    const txRootMatch = block1.txRoot === block2.txRoot;
    
    console.log(`   txRoot differs: ${!txRootMatch ? '✅' : '❌'}`);
    
    if (txRootMatch) {
        throw new Error('txRoot should differ for different transaction order');
    }
} catch (error) {
    console.error('❌ Failed to test transaction order effect:', error.message);
    process.exit(1);
}

console.log('\n================================================');
console.log('🎉 All block roots tests passed!');
