/**
 * ChainForgeLedger - Test and demonstration file
 * 
 * This file demonstrates how to use the ChainForgeLedger library and tests
 * the core functionality.
 */

import {
    Blockchain,
    Transaction,
    ProofOfWork,
    ProofOfStake,
    Tokenomics,
    Wallet,
    Validator,
    ValidatorManager,
    sha256_hash,
    keccak256_hash,
    generate_keys
} from '../src/index.js';

/**
 * Test blockchain functionality
 */
async function testBlockchain() {
    console.log('=== Testing Blockchain Functionality ===\n');

    // Create a new blockchain
    const blockchain = new Blockchain();
    console.log('1. Blockchain created successfully');

    // Test genesis block
    const genesisBlock = blockchain.getLatestBlock();
    console.log(`2. Genesis block created (index: ${genesisBlock.index})`);

    // Create transactions
    const transactions = [];
    for (let i = 0; i < 3; i++) {
        const tx = new Transaction({
            sender: `user${100 + i}`,
            receiver: `user${200 + i}`,
            amount: Math.random() * 100
        });
        transactions.push(tx.toJSON());
        blockchain.addTransaction(tx);
    }
    console.log(`3. Added ${transactions.length} transactions to mempool`);

    // Create PoW consensus
    const powConsensus = new ProofOfWork(blockchain, { difficulty: 2 });

    // Mine a block
    const minedBlock = powConsensus.mineBlock(transactions, 'miner1');
    blockchain.addBlock(minedBlock);
    console.log(`4. Block ${minedBlock.index} mined successfully`);

    // Validate blockchain
    const validationResult = blockchain.isChainValid();
    console.log(`5. Blockchain validation: ${validationResult.isValid ? '✅ Valid' : '❌ Invalid'}`);

    // Check block statistics
    console.log(`6. Total blocks in chain: ${blockchain.chain.length}`);
    console.log(`7. Total transactions: ${blockchain.getAllTransactions().length}`);
    console.log(`8. Mempool size: ${blockchain.getMempoolSize()}`);

    console.log('\n=== Blockchain Test Complete ===\n');
}

/**
 * Test tokenomics system
 */
function testTokenomics() {
    console.log('=== Testing Tokenomics System ===\n');

    // Create tokenomics
    const tokenomics = new Tokenomics({
        totalSupply: 1000000000,
        circulatingSupply: 500000000,
        tokenPrice: 0.10
    });
    console.log('1. Tokenomics system created');

    // Mint tokens
    tokenomics.mintTokens(10000000, 'staking_rewards');
    console.log(`2. Minted 10,000,000 tokens to staking rewards pool`);

    // Check distribution
    const distribution = tokenomics.getDistributionPercentages();
    console.log('3. Token distribution:', distribution);

    // Calculate market cap
    const marketCap = tokenomics.calculateMarketCap();
    const fdv = tokenomics.calculateFDV();
    console.log(`4. Market Cap: $${(marketCap * tokenomics.tokenPrice).toLocaleString()}`);
    console.log(`5. FDV: $${(fdv * tokenomics.tokenPrice).toLocaleString()}`);

    // Update token price
    tokenomics.updateTokenPrice(0.15);
    console.log(`6. Token price updated to $${tokenomics.tokenPrice}`);

    console.log('\n=== Tokenomics Test Complete ===\n');
}

/**
 * Test PoS consensus
 */
function testPoS() {
    console.log('=== Testing Proof of Stake ===\n');

    const blockchain = new Blockchain();
    const validatorManager = new ValidatorManager();

    // Create validators
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

    console.log(`1. Created ${validatorManager.validators.length} validators`);

    // Create PoS consensus
    const posConsensus = new ProofOfStake(blockchain, validatorManager);
    console.log('2. PoS consensus created');

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

    // Forge block
    const forgedBlock = posConsensus.forgeBlock(transactions);
    console.log(`3. Block ${forgedBlock.index} forged by ${forgedBlock.validator}`);

    // Validate block
    const isValid = posConsensus.validateBlock(forgedBlock);
    console.log(`4. Block validation: ${isValid ? '✅ Valid' : '❌ Invalid'}`);

    // Add block to blockchain
    blockchain.addBlock(forgedBlock);
    console.log(`5. Block added to chain`);

    console.log('\n=== PoS Test Complete ===\n');
}

/**
 * Test wallet system
 */
function testWallet() {
    console.log('=== Testing Wallet System ===\n');

    const wallet = new Wallet();
    console.log('1. Wallet created successfully');
    console.log(`2. Address: ${wallet.address}`);
    console.log(`3. Balance: ${wallet.getBalance()}`);

    // Create transactions
    const transactions = [
        { id: 'tx1', sender: wallet.address, receiver: '0x1234', amount: 10, fee: 0.1 },
        { id: 'tx2', sender: '0x5678', receiver: wallet.address, amount: 20, fee: 0.1 }
    ];

    transactions.forEach(tx => wallet.addTransaction(tx));
    console.log(`4. Added ${wallet.transactions.length} transactions`);

    // Sign a transaction
    const tx = transactions[0];
    const signature = wallet.signTransaction(tx);
    console.log('5. Transaction signed successfully');

    // Verify signature
    const isSignatureValid = wallet.verifyTransactionSignature(tx, signature);
    console.log(`6. Signature verification: ${isSignatureValid ? '✅ Valid' : '❌ Invalid'}`);

    // Update balance
    wallet.setBalance(100);
    console.log(`7. Balance updated to: ${wallet.getBalance()}`);

    console.log('\n=== Wallet Test Complete ===\n');
}

/**
 * Test cryptographic functions
 */
async function testCrypto() {
    console.log('=== Testing Cryptographic Functions ===\n');

    // Test hashing
    const data = 'ChainForgeLedger';
    const sha256Result = sha256_hash(data);
    const keccakResult = keccak256_hash(data);
    console.log('1. SHA-256 Hash:', sha256Result.slice(0, 16) + '...');
    console.log('2. Keccak-256 Hash:', keccakResult.slice(0, 16) + '...');

    // Test key generation
    const keyPair = await generate_keys();
    console.log('3. Key pair generated');

    console.log('\n=== Cryptography Test Complete ===\n');
}

/**
 * Run all tests
 */
async function runAllTests() {
    console.log('ChainForgeLedger - Library Test Suite\n');
    console.log('='.repeat(50));

    try {
        await testBlockchain();
        testTokenomics();
        testPoS();
        testWallet();
        await testCrypto();

        console.log('='.repeat(50));
        console.log('All tests completed successfully!');
    } catch (error) {
        console.error('Error during test:', error);
    }
}

// Run the tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests();
}

export {
    testBlockchain,
    testTokenomics,
    testPoS,
    testWallet,
    testCrypto,
    runAllTests
};
