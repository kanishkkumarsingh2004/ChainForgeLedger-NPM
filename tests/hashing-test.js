#!/usr/bin/env node

/**
 * Test script for hashing functions - Pure JavaScript implementations
 * This script verifies that the hashing functions work correctly
 */

import { 
    sha256_hash, 
    keccak256_hash, 
    double_sha256, 
    merkle_hash, 
    generate_salt, 
    pbkdf2, 
    hmac 
} from '../src/crypto/hashing.js';

async function runTests() {
    console.log('=== ChainForgeLedger Hashing Functions Test ===\n');
    
    // Test SHA-256
    console.log('1. Testing SHA-256...');
    const testData = 'Hello, ChainForgeLedger!';
    const sha256Result = sha256_hash(testData);
    console.log('   Input:', testData);
    console.log('   Output:', sha256Result);
    console.log('   Length:', sha256Result.length);
    console.log('   Valid:', sha256Result.length === 64);
    console.log();
    
    // Test Keccak-256
    console.log('2. Testing Keccak-256...');
    const keccak256Result = keccak256_hash(testData);
    console.log('   Input:', testData);
    console.log('   Output:', keccak256Result);
    console.log('   Length:', keccak256Result.length);
    console.log('   Valid:', keccak256Result.length === 64);
    console.log();
    
    // Test Double SHA-256
    console.log('3. Testing Double SHA-256...');
    const doubleSha256Result = double_sha256(testData);
    console.log('   Input:', testData);
    console.log('   Output:', doubleSha256Result);
    console.log('   Length:', doubleSha256Result.length);
    console.log('   Valid:', doubleSha256Result.length === 64);
    console.log();
    
    // Test Merkle Hash
    console.log('4. Testing Merkle Tree Hash...');
    const leftHash = 'a1b2c3d4e5f6';
    const rightHash = '1a2b3c4d5e6f';
    const merkleResult = merkle_hash(leftHash, rightHash);
    console.log('   Left:', leftHash);
    console.log('   Right:', rightHash);
    console.log('   Output:', merkleResult);
    console.log('   Length:', merkleResult.length);
    console.log('   Valid:', merkleResult.length === 64);
    console.log();
    
    // Test Random Salt Generation
    console.log('5. Testing Random Salt Generation...');
    const salt1 = generate_salt(16);
    const salt2 = generate_salt(16);
    console.log('   Salt 1 (16 bytes):', salt1);
    console.log('   Salt 2 (16 bytes):', salt2);
    console.log('   Length 1:', salt1.length);
    console.log('   Length 2:', salt2.length);
    console.log('   Unique:', salt1 !== salt2);
    console.log('   Valid:', salt1.length === 32 && salt2.length === 32);
    console.log();
    
    // Test PBKDF2
    console.log('6. Testing PBKDF2 Key Derivation...');
    try {
        const password = 'testpassword123';
        const salt = generate_salt(16);
        const derivedKey = await pbkdf2(password, salt, 1000, 32, 'sha256');
        console.log('   Password:', password);
        console.log('   Salt:', salt);
        console.log('   Derived Key:', derivedKey);
        console.log('   Length:', derivedKey.length);
        console.log('   Valid:', derivedKey.length === 64); // 32 bytes * 2 hex per byte
    } catch (error) {
        console.log('   Error:', error.message);
    }
    console.log();
    
    // Test HMAC
    console.log('7. Testing HMAC...');
    const secretKey = 'supersecretkey';
    const hmacResult = hmac(secretKey, testData, 'sha256');
    console.log('   Key:', secretKey);
    console.log('   Input:', testData);
    console.log('   HMAC:', hmacResult);
    console.log('   Length:', hmacResult.length);
    console.log('   Valid:', hmacResult.length === 64);
    console.log();
    
    // Test various data types
    console.log('8. Testing with Different Data Types...');
    const bufferData = Buffer.from(testData);
    const uint8Data = new Uint8Array(bufferData);
    
    const sha256Buffer = sha256_hash(bufferData);
    const sha256Uint8 = sha256_hash(uint8Data);
    const sha256String = sha256_hash(testData);
    
    console.log('   SHA-256 - Buffer:', sha256Buffer);
    console.log('   SHA-256 - Uint8Array:', sha256Uint8);
    console.log('   SHA-256 - String:', sha256String);
    console.log('   Consistent:', sha256Buffer === sha256Uint8 && sha256Uint8 === sha256String);
    console.log();
    
    // Performance test
    console.log('9. Performance Test...');
    const iterations = 10;
    const start = Date.now();
    for (let i = 0; i < iterations; i++) {
        sha256_hash(`Test data ${i}`);
    }
    const duration = Date.now() - start;
    console.log(`   ${iterations} SHA-256 hashes: ${duration}ms`);
    console.log(`   Average per hash: ${(duration / iterations).toFixed(2)}ms`);
    console.log();
    
    console.log('=== All Tests Completed ===');
}

runTests().catch(error => {
    console.error('Test error:', error);
    process.exit(1);
});
