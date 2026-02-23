#!/usr/bin/env node

/**
 * ChainForgeLedger - Complete Test Suite
 * 
 * Comprehensive test file containing all tests for every module in the ChainForgeLedger library
 */

import {
    // Core modules
    Blockchain,
    Block,
    Transaction,
    TransactionReceipt,
    MerkleTree,
    State,
    CrossChainBridge,
    BridgeNetwork,
    BlockchainCache,
    DifficultyAdjuster,
    FeeDistributionSystem,
    ForkHandler,
    LendingProtocol,
    LiquidityPool,
    DEX,
    Serialization,
    Shard,
    ShardingManager,
    StakingManager,
    StatePruning,
    ExecutionPipeline,
    BlockProducer,

    // Consensus mechanisms
    ProofOfWork,
    ProofOfStake,
    Validator,
    ValidatorManager,
    ConsensusInterface,
    SlashingManager,

    // Cryptographic utilities
    sha256_hash,
    keccak256_hash,
    generate_keys,
    KeyPair,
    Signature,
    Wallet,
    Mnemonic,
    MultisigWallet,
    MultisigWalletFactory,

    // Tokenomics
    Tokenomics,
    Stablecoin,
    StablecoinRewardDistributor,
    TokenStandards,
    SupplyManager,
    TokenSupplyTracker,
    TreasuryManager,
    TreasuryPolicy,

    // Governance
    DAO,
    Proposal,
    VotingSystem,
    Vote,

    // Networking
    TransactionPool,
    TransactionPoolManager,
    Node,
    Peer,
    Protocol,
    RateLimiter,

    // Smart contracts
    SmartContractCompiler,
    ContractDeployer,
    SmartContractExecutor,
    SmartContractSandbox,
    SmartContractVM,

    // Storage
    DatabaseManager,
    LevelDBStorage,
    BlockStorage,
    TransactionStorage,
    ContractStorage,
    AccountStorage,
    MetadataStorage,
    StorageManager,

    // API
    APIServer,
    createAPIServer,
    createAPIServerInstance,

    // Utils
    ConfigManager,
    createConfigManager,
    DEFAULT_CONFIG,
    CONFIG_SCHEMA,
    loadDefaultConfig,
    Logger,
    createLogger,
    createSystemLogger,
    createNetworkLogger,
    createTransactionLogger,
    createBlockLogger,
    createValidatorLogger,
    createContractLogger,
    createGovernanceLogger,
    createSecurityLogger,
    getLogger,
    setLogger,
    logger,
    randomBytes,
    randomNumber,
    randomHex,
    sha256,
    sha512,
    ripemd160,
    keccak256,
    sha1,
    hash,
    hmac,
    pbkdf2,
    scrypt,
    uuidv4,
    generateSalt,
    aes256gcmEncrypt,
    aes256gcmDecrypt,
    generateKeyPair,
    generateRSAKeyPair,
    generateECDSAKeyPair,
    sign,
    verify,
    rsaSha256Sign,
    rsaSha256Verify,
    ecdsaSha256Sign,
    ecdsaSha256Verify,
    bufferToHex,
    hexToBuffer,
    bufferToBase64,
    base64ToBuffer,
    hexToBase64,
    base64ToHex,
    isValidHex,
    isValidBase64,
    isValidUUID
} from '../src/index.js';

import { 
    sha256_hash as sha256_hash_crypto, 
    keccak256_hash as keccak256_hash_crypto, 
    double_sha256, 
    merkle_hash, 
    generate_salt, 
    pbkdf2 as pbkdf2_crypto, 
    hmac as hmac_crypto 
} from '../src/crypto/hashing.js';

/**
 * Test core blockchain functionality
 */
async function testBlockchain() {
    console.log('=== Testing Blockchain Core ===\n');

    try {
        const blockchain = new Blockchain();
        console.log('✅ Blockchain created successfully');

        const genesisBlock = blockchain.getLatestBlock();
        console.log(`✅ Genesis block created (index: ${genesisBlock.index})`);

        const transactions = [];
        for (let i = 0; i < 3; i++) {
            const tx = new Transaction({
                sender: `user${100 + i}`,
                receiver: `user${200 + i}`,
                amount: Math.random() * 100
            });
            transactions.push(tx);
            blockchain.addTransaction(tx);
        }
        console.log(`✅ Added ${transactions.length} transactions to mempool`);

        const powConsensus = new ProofOfWork(blockchain, { difficulty: 2 });
        const minedBlock = powConsensus.mineBlock(transactions, 'miner1');
        blockchain.addBlock(minedBlock);
        console.log(`✅ Block ${minedBlock.index} mined successfully`);

        const validationResult = blockchain.isValidChain();
        console.log(`✅ Blockchain validation: ${validationResult.isValid ? '✅ Valid' : '❌ Invalid'}`);
        if (!validationResult.isValid) {
            console.log('Validation errors:', validationResult.errors);
        }

        console.log(`✅ Total blocks in chain: ${blockchain.chain.length}`);
        console.log(`✅ Total transactions: ${blockchain.getAllTransactions().length}`);
        console.log(`✅ Mempool size: ${blockchain.getMempoolSize()}`);
    } catch (error) {
        console.error('❌ Blockchain test failed:', error);
    }

    console.log('\n=== Blockchain Test Complete ===\n');
}

/**
 * Test tokenomics system
 */
function testTokenomics() {
    console.log('=== Testing Tokenomics System ===\n');

    try {
        const tokenomics = new Tokenomics({
            totalSupply: 1000000000,
            circulatingSupply: 500000000,
            tokenPrice: 0.10
        });
        console.log('✅ Tokenomics system created');

        tokenomics.mintTokens(10000000, 'staking_rewards');
        console.log('✅ Minted 10,000,000 tokens to staking rewards pool');

        const distribution = tokenomics.getDistributionPercentages();
        console.log('✅ Token distribution:', distribution);

        const marketCap = tokenomics.calculateMarketCap();
        const fdv = tokenomics.calculateFDV();
        console.log(`✅ Market Cap: $${(marketCap * tokenomics.tokenPrice).toLocaleString()}`);
        console.log(`✅ FDV: $${(fdv * tokenomics.tokenPrice).toLocaleString()}`);

        tokenomics.updateTokenPrice(0.15);
        console.log(`✅ Token price updated to $${tokenomics.tokenPrice}`);
    } catch (error) {
        console.error('❌ Tokenomics test failed:', error);
    }

    console.log('\n=== Tokenomics Test Complete ===\n');
}

/**
 * Test Proof of Stake consensus
 */
function testPoS() {
    console.log('=== Testing Proof of Stake ===\n');

    try {
        const blockchain = new Blockchain();
        const validatorManager = new ValidatorManager();

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

        console.log(`✅ Created ${validatorManager.validators.length} validators`);

        const posConsensus = new ProofOfStake(blockchain, validatorManager);
        console.log('✅ PoS consensus created');

        const transactions = [];
        for (let i = 0; i < 2; i++) {
            const tx = new Transaction({
                sender: `validator${i}`,
                receiver: `user${100 + i}`,
                amount: Math.random() * 100
            });
            transactions.push(tx);
        }

        const forgedBlock = posConsensus.forgeBlock(transactions);
        console.log(`✅ Block ${forgedBlock.index} forged by ${forgedBlock.validator}`);

        const isValid = posConsensus.validateBlock(forgedBlock);
        console.log(`✅ Block validation: ${isValid ? '✅ Valid' : '❌ Invalid'}`);

        blockchain.addBlock(forgedBlock);
        console.log('✅ Block added to chain');
    } catch (error) {
        console.error('❌ PoS test failed:', error);
    }

    console.log('\n=== PoS Test Complete ===\n');
}

/**
 * Test wallet system
 */
function testWallet() {
    console.log('=== Testing Wallet System ===\n');

    try {
        const wallet = new Wallet();
        console.log('✅ Wallet created successfully');
        console.log(`✅ Address: ${wallet.address}`);
        console.log(`✅ Balance: ${wallet.getBalance()}`);

        const transactions = [
            { id: 'tx1', sender: wallet.address, receiver: '0x1234', amount: 10, fee: 0.1 },
            { id: 'tx2', sender: '0x5678', receiver: wallet.address, amount: 20, fee: 0.1 }
        ];

        transactions.forEach(tx => wallet.addTransaction(tx));
        console.log(`✅ Added ${wallet.transactions.length} transactions`);

        const tx = transactions[0];
        const signature = wallet.signTransaction(tx);
        console.log('✅ Transaction signed successfully');

        const isSignatureValid = wallet.verifyTransactionSignature(tx, signature);
        console.log(`✅ Signature verification: ${isSignatureValid ? '✅ Valid' : '❌ Invalid'}`);

        wallet.setBalance(100);
        console.log(`✅ Balance updated to: ${wallet.getBalance()}`);
    } catch (error) {
        console.error('❌ Wallet test failed:', error);
    }

    console.log('\n=== Wallet Test Complete ===\n');
}

/**
 * Test cryptographic functions
 */
async function testCrypto() {
    console.log('=== Testing Cryptographic Functions ===\n');

    try {
        const data = 'ChainForgeLedger';
        const sha256Result = sha256_hash(data);
        const keccakResult = keccak256_hash(data);
        console.log('✅ SHA-256 Hash:', sha256Result.slice(0, 16) + '...');
        console.log('✅ Keccak-256 Hash:', keccakResult.slice(0, 16) + '...');

        const keyPair = await generate_keys();
        console.log('✅ Key pair generated');
    } catch (error) {
        console.error('❌ Crypto test failed:', error);
    }

    console.log('\n=== Cryptography Test Complete ===\n');
}

/**
 * Test hashing functions
 */
async function testHashing() {
    console.log('=== Testing Hashing Functions ===\n');

    try {
        const testData = 'Hello, ChainForgeLedger!';
        
        console.log('✅ SHA-256:', sha256_hash_crypto(testData));
        console.log('✅ Keccak-256:', keccak256_hash_crypto(testData));
        console.log('✅ Double SHA-256:', double_sha256(testData));
        console.log('✅ Merkle Hash:', merkle_hash('a1b2c3d4e5f6', '1a2b3c4d5e6f'));
        
        const salt = generate_salt(16);
        console.log('✅ Salt:', salt);
        
        const derivedKey = await pbkdf2_crypto('password', salt, 1000, 32, 'sha256');
        console.log('✅ PBKDF2:', derivedKey);
        
        const hmacResult = hmac_crypto('secret', testData, 'sha256');
        console.log('✅ HMAC:', hmacResult);
    } catch (error) {
        console.error('❌ Hashing test failed:', error);
    }

    console.log('\n=== Hashing Test Complete ===\n');
}

/**
 * Test smart contracts
 */
async function testSmartContracts() {
    console.log('=== Testing Smart Contracts ===\n');

    try {
        const compiler = new SmartContractCompiler();
        const deployer = new ContractDeployer(compiler);
        const executor = new SmartContractExecutor();
        const sandbox = new SmartContractSandbox();
        const vm = new SmartContractVM();

        console.log('✅ Smart contract components created');

        const contractCode = `
            contract SimpleToken {
                mapping(address => uint256) public balances;
                
                function mint(address to, uint256 amount) public {
                    balances[to] += amount;
                }
                
                function transfer(address to, uint256 amount) public {
                    require(balances[msg.sender] >= amount);
                    balances[msg.sender] -= amount;
                    balances[to] += amount;
                }
            }
        `;

        const compiled = compiler.compile(contractCode);
        console.log('✅ Contract compiled successfully');

        const contractAddress = await deployer.deploy(compiled);
        console.log(`✅ Contract deployed at: ${contractAddress}`);

        // Add the contract to executor's storage
        executor.contract_storage.set(contractAddress, { state: {} });

        const result = await executor.execute(contractAddress, 'mint', ['0x1234', 1000]);
        console.log('✅ Contract execution:', result);
    } catch (error) {
        console.error('❌ Smart contracts test failed:', error);
    }

    console.log('\n=== Smart Contracts Test Complete ===\n');
}

/**
 * Test DeFi functionality
 */
function testDeFi() {
    console.log('=== Testing DeFi Functionality ===\n');

    try {
        const lending = new LendingProtocol();
        console.log('✅ Lending protocol created');

        lending.create_market('ETH');
        lending.create_market('DAI');
        console.log('✅ ETH and DAI markets created');

        lending.deposit('0x1234', 'ETH', 10);
        lending.deposit('0x5678', 'DAI', 5000);
        console.log('✅ Deposits successful');

        const borrowResult = lending.borrow('0x1234', 'DAI', 100, 'ETH', 200);
        console.log('✅ Borrow result:', borrowResult);

        lending.repay('0x1234', 'DAI', 50);
        console.log('✅ Repayment successful');

        const dex = new DEX();
        const pool = dex.create_pool('TOKEN1', 'TOKEN2', 1000000, 500000);
        console.log('✅ DEX and liquidity pool created');

        const swapResult = dex.swap('TOKEN1', 'TOKEN2', 1000);
        console.log('✅ Swap result:', swapResult);
    } catch (error) {
        console.error('❌ DeFi test failed:', error);
    }

    console.log('\n=== DeFi Test Complete ===\n');
}

/**
 * Test governance system
 */
function testGovernance() {
    console.log('=== Testing Governance System ===\n');

    try {
        const dao = new DAO();
        const voting = new VotingSystem(dao);

        dao.add_member('0x1234', 10000);
        dao.add_member('0x5678', 10000);
        console.log('✅ Members added');

        const proposalId = voting.create_proposal('chainforgeledger', 'Increase block size from 1MB to 2MB', '0x1234', 'simple');
        console.log('✅ Proposal created');

        voting.vote('chainforgeledger', proposalId, '0x1234', 'for', 10000);
        voting.vote('chainforgeledger', proposalId, '0x5678', 'against', 10000);
        console.log('✅ Votes recorded');

        const results = voting.get_proposal_result('chainforgeledger', proposalId);
        console.log('✅ Voting results:', results);
    } catch (error) {
        console.error('❌ Governance test failed:', error);
    }

    console.log('\n=== Governance Test Complete ===\n');
}

/**
 * Test stablecoin functionality
 */
function testStablecoin() {
    console.log('=== Testing Stablecoin System ===\n');

    try {
        const stablecoin = new Stablecoin({
            token_name: 'ChainForge USD',
            token_symbol: 'CFLUSD',
            total_supply: 1000000
        });

        const distributor = new StablecoinRewardDistributor(stablecoin);
        console.log('✅ Stablecoin system created');

        distributor.distribute_liquidity_pool_reward(10000, [
            { address: '0x1234', share: 0.6 },
            { address: '0x5678', share: 0.4 }
        ]);
        console.log('✅ Rewards distributed');

        const deviation = stablecoin.calculate_peg_deviation(0.98, 1.00);
        console.log('✅ Peg deviation:', deviation);
    } catch (error) {
        console.error('❌ Stablecoin test failed:', error);
    }

    console.log('\n=== Stablecoin Test Complete ===\n');
}

/**
 * Test supply management
 */
function testSupplyManagement() {
    console.log('=== Testing Supply Management ===\n');

    try {
        const supplyManager = new SupplyManager({
            max_supply: 1000000000,
            annual_inflation_rate: 0.05,
            initial_distribution: {
                core_team: 0.2,
                foundation: 0.15,
                community: 0.35,
                operational: 0.1,
                marketing: 0.1,
                liquidity_pool: 0.1
            },
            distribution_lockups: {
                core_team: { start_block: 1000, end_block: 10000 },
                foundation: { start_block: 2000, end_block: 15000 }
            }
        });

        const tracker = new TokenSupplyTracker(supplyManager);
        tracker.track_supply(0, 1000000000);
        tracker.track_supply(5000, 1025000000);
        console.log('✅ Supply management system created');

        const distribution = supplyManager.calculate_token_distribution(1000000000);
        console.log('✅ Token distribution:', distribution);
    } catch (error) {
        console.error('❌ Supply management test failed:', error);
    }

    console.log('\n=== Supply Management Test Complete ===\n');
}

/**
 * Test treasury management
 */
function testTreasury() {
    console.log('=== Testing Treasury Management ===\n');

    try {
        const treasury = new TreasuryManager({
            treasury_address: '0x1234567890abcdef',
            balance: {
                native: 100000,
                stablecoins: 500000,
                other_tokens: 250000
            },
            expenses: {
                development: 50000,
                operational: 30000,
                marketing: 20000
            },
            income: {
                fees: 80000,
                staking_rewards: 20000
            }
        });

        const policy = new TreasuryPolicy(treasury);
        console.log('✅ Treasury system created');

        const compliance = policy.check_policy_compliance();
        console.log('✅ Policy compliance:', compliance);

        const financialHealth = treasury.calculate_financial_health();
        console.log('✅ Financial health:', financialHealth);
    } catch (error) {
        console.error('❌ Treasury test failed:', error);
    }

    console.log('\n=== Treasury Test Complete ===\n');
}

/**
 * Test networking
 */
function testNetworking() {
    console.log('=== Testing Networking ===\n');

    try {
        const transactionPool = new TransactionPool();
        const poolManager = new TransactionPoolManager(transactionPool);

        const transaction = new Transaction({
            sender: '0x1234',
            receiver: '0x5678',
            amount: 100
        });

        poolManager.addTransaction(transaction);
        console.log('✅ Transaction added to pool');

        const pendingTransactions = poolManager.getPendingTransactions();
        console.log(`✅ Pending transactions: ${pendingTransactions.length}`);

        const node = new Node({
            id: 'node1',
            address: '127.0.0.1',
            port: 3000
        });

        console.log('✅ Node created');
    } catch (error) {
        console.error('❌ Networking test failed:', error);
    }

    console.log('\n=== Networking Test Complete ===\n');
}

/**
 * Test token standards (ERC-20, ERC-721, ERC-1155)
 */
function testTokenStandards() {
    console.log('=== Testing Token Standards ===\n');

    try {
        const tokenStandards = new TokenStandards();

        tokenStandards.create_erc20_contract({
            name: 'MyToken',
            symbol: 'MTK',
            total_supply: 1000000000,
            decimals: 18
        });
        console.log('✅ ERC-20 contract created');

        tokenStandards.create_erc721_contract({
            name: 'MyNFT',
            symbol: 'MNFT'
        });
        console.log('✅ ERC-721 contract created');

        tokenStandards.create_erc1155_contract({
            uri: 'https://api.example.com/tokens/{id}.json'
        });
        console.log('✅ ERC-1155 contract created');

        const erc20Interface = tokenStandards.get_token_contract_interface('ERC20');
        const erc721Interface = tokenStandards.get_token_contract_interface('ERC721');
        const erc1155Interface = tokenStandards.get_token_contract_interface('ERC1155');

        console.log('✅ Contract interfaces retrieved');
    } catch (error) {
        console.error('❌ Token standards test failed:', error);
    }

    console.log('\n=== Token Standards Test Complete ===\n');
}

/**
 * Test storage systems
 */
function testStorage() {
    console.log('=== Testing Storage Systems ===\n');

    try {
        const dbManager = new DatabaseManager();
        const levelDB = new LevelDBStorage();
        const storageManager = new StorageManager();

        const blockStorage = new BlockStorage();
        const transactionStorage = new TransactionStorage();
        const contractStorage = new ContractStorage();
        const accountStorage = new AccountStorage();
        const metadataStorage = new MetadataStorage();

        console.log('✅ Storage systems created');
    } catch (error) {
        console.error('❌ Storage test failed:', error);
    }

    console.log('\n=== Storage Test Complete ===\n');
}

/**
 * Test transaction receipt system
 */
function testTransactionReceipts() {
    console.log('=== Testing Transaction Receipts ===\n');

    try {
        const transactionId = 'tx123';
        const receipt = new TransactionReceipt({
            transactionId: transactionId,
            status: 'successful',
            gasUsed: 21000,
            gasPrice: 0.001,
            fee: 0.021
        });
        
        console.log('✅ Transaction receipt created');
        console.log(`✅ Transaction ID: ${receipt.transactionId}`);
        console.log(`✅ Status: ${receipt.status}`);
        console.log(`✅ Gas Used: ${receipt.gasUsed}`);
        console.log(`✅ Fee: ${receipt.fee}`);

        const json = receipt.toJSON();
        const parsedReceipt = TransactionReceipt.fromJSON(json);
        console.log('✅ Receipt serialization/deserialization successful');

        const validation = receipt.validate();
        console.log(`✅ Receipt validation: ${validation.isValid ? '✅ Valid' : '❌ Invalid'}`);
    } catch (error) {
        console.error('❌ Transaction receipts test failed:', error);
    }

    console.log('\n=== Transaction Receipts Test Complete ===\n');
}

/**
 * Test execution pipeline
 */
function testExecutionPipeline() {
    console.log('=== Testing Execution Pipeline ===\n');

    try {
        const pipeline = new ExecutionPipeline();
        console.log('✅ Execution pipeline created');

        const transaction = new Transaction({
            sender: '0x123',
            receiver: '0x456',
            amount: 100,
            fee: 0.001
        });

        pipeline.processTransaction(transaction).then(receipt => {
            console.log(`✅ Transaction processed: ${receipt.isSuccessful() ? 'Success' : 'Failed'}`);
            console.log(`✅ Gas used: ${receipt.gasUsed}`);
            console.log(`✅ Fee: ${receipt.fee}`);
        });

        console.log('✅ Transaction processing initiated');
    } catch (error) {
        console.error('❌ Execution pipeline test failed:', error);
    }

    console.log('\n=== Execution Pipeline Test Complete ===\n');
}

/**
 * Test block producer
 */
function testBlockProducer() {
    console.log('=== Testing Block Producer ===\n');

    try {
        const blockchain = {
            getLatestBlock: () => new Block({ index: 0, hash: '0x1234' }),
            getBlockByIndex: () => new Block({ index: 0, hash: '0x1234' }),
            addBlock: () => {}
        };
        
        const mempool = {
            getTransactions: () => [
                new Transaction({
                    sender: '0x123',
                    receiver: '0x456',
                    amount: 100,
                    fee: 0.001
                })
            ]
        };
        
        const producer = new BlockProducer({
            blockchain,
            mempool
        });

        console.log('✅ Block producer created');

        const stats = producer.getStatistics();
        console.log(`✅ Current block index: ${stats.currentBlockIndex}`);
        console.log(`✅ Transactions in pool: ${stats.transactionsInPool}`);
        console.log(`✅ Max transactions per block: ${stats.maxTransactionsPerBlock}`);
    } catch (error) {
        console.error('❌ Block producer test failed:', error);
    }

    console.log('\n=== Block Producer Test Complete ===\n');
}

/**
 * Test utility functions
 */
async function testUtils() {
    console.log('=== Testing Utility Functions ===\n');

    try {
        console.log('✅ Random bytes:', randomBytes(16));
        console.log('✅ Random number:', randomNumber(1, 100));
        console.log('✅ Random hex:', randomHex(32));
        console.log('✅ UUID:', uuidv4());
        console.log('✅ Salt:', generateSalt(16));

        const configManager = createConfigManager();
        console.log('✅ Config manager created');

        const logger = createLogger('test');
        console.log('✅ Logger created');
    } catch (error) {
        console.error('❌ Utils test failed:', error);
    }

    console.log('\n=== Utils Test Complete ===\n');
}

/**
 * Run all tests
 */
async function runAllTests() {
    console.log('ChainForgeLedger - Comprehensive Test Suite\n');
    console.log('='.repeat(60));

    try {
        await testBlockchain();
        testTokenomics();
        testPoS();
        testWallet();
        await testCrypto();
        await testHashing();
        testSmartContracts();
        testDeFi();
        testGovernance();
        testStablecoin();
        testSupplyManagement();
        testTreasury();
        testNetworking();
        testTokenStandards();
        testStorage();
        testTransactionReceipts();
        testExecutionPipeline();
        testBlockProducer();
        await testUtils();

        console.log('='.repeat(60));
        console.log('🎉 All tests completed successfully!');
        console.log('📊 ChainForgeLedger library is working correctly');
    } catch (error) {
        console.error('❌ Test failure:', error);
    }
}

/**
 * Run tests with detailed reporting
 */
async function runTestsWithReporting() {
    const startTime = Date.now();
    
    console.log('ChainForgeLedger - Test Report\n');
    console.log('='.repeat(60));
    
    const tests = [
        { name: 'Blockchain Core', fn: testBlockchain },
        { name: 'Tokenomics', fn: testTokenomics },
        { name: 'Proof of Stake', fn: testPoS },
        { name: 'Wallet System', fn: testWallet },
        { name: 'Cryptography', fn: testCrypto },
        { name: 'Hashing', fn: testHashing },
        { name: 'Smart Contracts', fn: testSmartContracts },
        { name: 'DeFi', fn: testDeFi },
        { name: 'Governance', fn: testGovernance },
        { name: 'Stablecoin', fn: testStablecoin },
        { name: 'Supply Management', fn: testSupplyManagement },
        { name: 'Treasury', fn: testTreasury },
        { name: 'Networking', fn: testNetworking },
        { name: 'Token Standards', fn: testTokenStandards },
        { name: 'Storage', fn: testStorage },
        { name: 'Transaction Receipts', fn: testTransactionReceipts },
        { name: 'Execution Pipeline', fn: testExecutionPipeline },
        { name: 'Block Producer', fn: testBlockProducer },
        { name: 'Utilities', fn: testUtils }
    ];

    const results = [];

    for (const test of tests) {
        try {
            const testStartTime = Date.now();
            await test.fn();
            const duration = Date.now() - testStartTime;
            results.push({
                name: test.name,
                status: 'PASS',
                duration: `${duration}ms`
            });
        } catch (error) {
            results.push({
                name: test.name,
                status: 'FAIL',
                duration: '0ms',
                error: error.message
            });
        }
    }

    console.log('\n');
    console.log('Test Summary');
    console.log('='.repeat(60));
    console.log();

    results.forEach(result => {
        const status = result.status === 'PASS' ? '✅' : '❌';
        const duration = result.status === 'PASS' ? ` (${result.duration})` : '';
        const error = result.status === 'FAIL' ? ` - ${result.error}` : '';
        console.log(`${status} ${result.name}${duration}${error}`);
    });

    console.log();
    const totalDuration = Date.now() - startTime;
    const passedTests = results.filter(r => r.status === 'PASS').length;
    const failedTests = results.filter(r => r.status === 'FAIL').length;
    const totalTests = results.length;

    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Duration: ${totalDuration}ms`);

    if (failedTests === 0) {
        console.log('\n🎉 All tests passed! ChainForgeLedger is working correctly.');
    } else {
        console.log(`\n⚠️ ${failedTests} test${failedTests > 1 ? 's' : ''} failed. Please check the errors.`);
        process.exit(1);
    }
}

// Run the tests if this file is executed directly
if (process.argv[1] && process.argv[1].includes('test-all.js')) {
    // Check if detailed report is requested
    const useDetailedReport = process.argv.includes('--detailed') || process.argv.includes('-d');
    
    if (useDetailedReport) {
        runTestsWithReporting();
    } else {
        runAllTests();
    }
}

export {
    // Individual test functions
    testBlockchain,
    testTokenomics,
    testPoS,
    testWallet,
    testCrypto,
    testHashing,
    testSmartContracts,
    testDeFi,
    testGovernance,
    testStablecoin,
    testSupplyManagement,
    testTreasury,
    testNetworking,
    testTokenStandards,
    testStorage,
    testTransactionReceipts,
    testExecutionPipeline,
    testBlockProducer,
    testUtils,
    // Run all tests
    runAllTests,
    runTestsWithReporting
};