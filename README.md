# ChainForgeLedger

A complete blockchain platform library built from scratch with pure JavaScript. ChainForgeLedger provides a comprehensive set of tools and modules for building decentralized applications, including support for multiple consensus mechanisms, smart contracts, DeFi protocols, and more.

## Features

- **Multiple Consensus Mechanisms**: Support for Proof of Work (PoW), Proof of Stake (PoS), and validator-based consensus with slashing mechanisms
- **Smart Contract Execution**: Stack-based virtual machine with sandboxed execution and compiler support for ERC-20, ERC-721, and ERC-1155 standards
- **Decentralized Finance (DeFi)**: Built-in DEX, lending protocol, liquidity management, and stablecoin support with reward distribution
- **NFT Marketplace**: Digital asset creation, minting, and trading functionality with ERC-721 and ERC-1155 standards
- **Blockchain Explorer**: Analytics and visualization tools for blockchain data
- **Wallet System**: Multiple wallet types (single, multisig) with BIP-39 mnemonic support
- **Governance**: DAO framework with voting and proposal mechanisms
- **Security Architecture**: Multiple protection mechanisms including sharding, state pruning, slashing, and sandboxing
- **Tokenomics**: Comprehensive tokenomics system with vesting, staking, reward distribution, supply management, and treasury systems
- **Cross-Chain Bridge**: Interoperability between different blockchain networks
- **Caching Layer**: Performance optimizations through efficient caching mechanisms
- **Advanced Storage**: LevelDB and database abstraction layer for efficient data management
- **Networking**: Peer-to-peer network with mempool, protocol, and rate limiting
- **API Server**: RESTful API server for interacting with the blockchain platform

## Installation

```bash
npm install chainforgeledger
```

## Quick Start

### Using the CLI

ChainForgeLedger provides a command-line interface for quick access to core functionality:

```bash
# Run comprehensive platform demonstration
chainforgeledger demo

# Run basic blockchain operations
chainforgeledger basic

# Proof of Work operations
chainforgeledger pow --mine --difficulty 3

# Proof of Stake operations
chainforgeledger pos --forge

# Tokenomics operations
chainforgeledger token --create --supply 1000000000

# Show version information
chainforgeledger version
```

### Using as a Library

```javascript
import { Blockchain, Transaction, ProofOfWork, Tokenomics, Wallet } from 'chainforgeledger';

// Create a blockchain with PoW consensus
const blockchain = new Blockchain();
const powConsensus = new ProofOfWork(blockchain, { difficulty: 2 });

// Create and add transactions
const transaction = new Transaction({
    sender: 'user1',
    receiver: 'user2',
    amount: 100
});
blockchain.addTransaction(transaction);

// Mine a new block
const block = powConsensus.mineBlock(blockchain.getMempool(), 'miner1');
blockchain.addBlock(block);

// Verify blockchain validity
const isValid = blockchain.isChainValid();
console.log('Blockchain valid:', isValid.isValid);

// Create tokenomics system
const tokenomics = new Tokenomics({ totalSupply: 1000000000 });
console.log('Total Supply:', tokenomics.totalSupply);

// Create wallet
const wallet = new Wallet();
console.log('Wallet Address:', wallet.address);
```

## Core Modules

### Blockchain

- `Blockchain`: Main blockchain class for managing the chain
- `Block`: Individual block structure
- `Transaction`: Transaction management
- `MerkleTree`: Merkle tree implementation for data integrity
- `State`: World state management
- `CrossChainBridge, BridgeNetwork`: Cross-chain bridge functionality
- `BlockchainCache`: Performance optimization through caching
- `DifficultyAdjuster`: Dynamic difficulty adjustment
- `FeeDistributionSystem`: Transaction fee distribution
- `ForkHandler`: Blockchain fork management
- `LendingProtocol`: DeFi lending protocol
- `LiquidityPool, DEX`: Liquidity pool management and DEX functionality
- `Serialization`: Data serialization for network transmission
- `Shard, ShardingManager`: Scalability through sharding
- `StakingManager`: Staking and validator management
- `StatePruning`: Storage optimization through state pruning

### Consensus

- `ProofOfWork`: PoW consensus mechanism with mining functionality
- `ProofOfStake`: PoS consensus mechanism with validator management
- `Validator, ValidatorManager`: Validator entity and management for PoS
- `ConsensusInterface`: Common interface for all consensus mechanisms
- `SlashingManager`: Validator slashing mechanisms

### Cryptography

- `sha256_hash, keccak256_hash`: Hashing functions
- `generate_keys, KeyPair`: Key pair generation and management
- `Signature`: Digital signature operations
- `Wallet`: Wallet system with signing capabilities
- `Mnemonic`: BIP-39 mnemonic generation and recovery
- `MultisigWallet, MultisigWalletFactory`: Multisignature wallet functionality

### Tokenomics

- `Tokenomics`: Comprehensive tokenomics system
- `Stablecoin, StablecoinRewardDistributor`: Stablecoin management and stabilization
- `TokenStandards`: ERC-20, ERC-721, and ERC-1155 token standards with contract creation
- `SupplyManager, TokenSupplyTracker`: Token supply management and distribution tracking
- `TreasuryManager, TreasuryPolicy`: Treasury management and financial operations

### Governance

- `DAO`: Decentralized Autonomous Organization framework
- `Proposal`: Governance proposal management
- `VotingSystem, Vote`: Voting systems for proposals

### Networking

- `TransactionPool, TransactionPoolManager`: Transaction mempool management
- `Node`: Network node implementation
- `Peer`: Peer-to-peer network management
- `Protocol`: Network communication protocols
- `RateLimiter`: Network traffic rate limiting

### Smart Contracts

- `SmartContractCompiler, ContractDeployer`: Smart contract compiler and deployment
- `SmartContractExecutor`: Contract execution engine
- `SmartContractSandbox`: Execution sandbox for security
- `SmartContractVM`: Virtual machine for contract execution

### Storage

- `DatabaseManager`: Database abstraction layer
- `LevelDBStorage`: LevelDB storage implementation
- `BlockStorage, TransactionStorage, ContractStorage, AccountStorage, MetadataStorage, StorageManager`: Data models for blockchain entities

### Utils

- `ConfigManager, createConfigManager, DEFAULT_CONFIG, CONFIG_SCHEMA, loadDefaultConfig`: Configuration management
- `Logger, createLogger, createSystemLogger, createNetworkLogger, createTransactionLogger, createBlockLogger, createValidatorLogger, createContractLogger, createGovernanceLogger, createSecurityLogger, getLogger, setLogger, logger`: Comprehensive logging system
- `crypto` module: Cryptographic utility functions including:
  - Hashing: sha256, sha512, ripemd160, keccak256, sha1
  - Randomization: randomBytes, randomNumber, randomHex
  - Key generation: generateKeyPair, generateRSAKeyPair, generateECDSAKeyPair
  - Encryption: aes256gcmEncrypt, aes256gcmDecrypt
  - Signing: sign, verify, rsaSha256Sign, rsaSha256Verify, ecdsaSha256Sign, ecdsaSha256Verify
  - Encoding: bufferToHex, hexToBuffer, bufferToBase64, base64ToBuffer, hexToBase64, base64ToHex
  - Validators: isValidHex, isValidBase64, isValidUUID
  - Other utilities: hmac, pbkdf2, scrypt, uuidv4, generateSalt

### API

- `APIServer, createAPIServer, createAPIServerInstance`: RESTful API server for interacting with the blockchain platform

## Advanced Features

### Smart Contracts

```javascript
import { TokenStandards } from 'chainforgeledger/tokenomics';

// Create token standards instance
const tokenStandards = new TokenStandards();

// Create ERC20 token contract
tokenStandards.create_erc20_contract({
    name: 'MyToken',
    symbol: 'MTK',
    total_supply: 1000000000,
    decimals: 18
});

// Create ERC721 NFT contract
tokenStandards.create_erc721_contract({
    name: 'MyNFT',
    symbol: 'MNFT'
});

// Create ERC1155 multi-token contract
tokenStandards.create_erc1155_contract({
    uri: 'https://api.example.com/tokens/{id}.json'
});

// Get contract interfaces
const erc20Interface = tokenStandards.get_token_contract_interface('ERC20');
const erc721Interface = tokenStandards.get_token_contract_interface('ERC721');
const erc1155Interface = tokenStandards.get_token_contract_interface('ERC1155');
```

### Decentralized Exchange (DEX)

```javascript
import { DEX, LiquidityPool } from 'chainforgeledger/core/liquidity';

// Create DEX and liquidity pool
const dex = new DEX();
const pool = new LiquidityPool('TOKEN1', 'TOKEN2', 1000000, 500000);
dex.addLiquidityPool(pool);

// Perform swap
const swapResult = dex.swap('TOKEN1', 'TOKEN2', 1000);
console.log('Swap result:', swapResult);
```

### Lending Protocol

```javascript
import { LendingProtocol } from 'chainforgeledger/core/lending';

const lending = new LendingProtocol();

// Deposit collateral
lending.deposit('0x1234', 'ETH', 10);

// Borrow tokens
const borrowResult = lending.borrow('0x1234', 'DAI', 1000);
console.log('Borrow result:', borrowResult);

// Repay loan
lending.repay('0x1234', 'DAI', 1050);
```

### Governance (DAO)

```javascript
import { DAO, Proposal, VotingSystem, Vote } from 'chainforgeledger/governance';

// Create DAO and governance system
const dao = new DAO();
const voting = new VotingSystem(dao);

// Create and submit proposal
const proposal = new Proposal({
    id: '1',
    title: 'Increase block size',
    description: 'Increase block size from 1MB to 2MB',
    author: '0x1234',
    createdAt: Date.now()
});

dao.submitProposal(proposal);

// Vote on proposal
voting.vote('0x1234', '1', 'yes');
voting.vote('0x5678', '1', 'no');
```

### Stablecoin Management

```javascript
import { Stablecoin, StablecoinRewardDistributor } from 'chainforgeledger/tokenomics/stablecoin';

// Create stablecoin instance
const stablecoin = new Stablecoin({
    token_name: 'ChainForge USD',
    token_symbol: 'CFLUSD',
    total_supply: 1000000
});

// Create reward distributor
const distributor = new StablecoinRewardDistributor(stablecoin);

// Distribute rewards to liquidity providers
distributor.distribute_liquidity_pool_reward(10000, [
    { address: '0x1234', share: 0.6 },
    { address: '0x5678', share: 0.4 }
]);

// Calculate peg deviation
const deviation = stablecoin.calculate_peg_deviation(0.98, 1.00);
console.log('Peg deviation:', deviation);
```

### Token Supply Management

```javascript
import { SupplyManager, TokenSupplyTracker } from 'chainforgeledger/tokenomics/supply';

// Create supply manager with lockup periods
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

// Track supply changes
const tracker = new TokenSupplyTracker(supplyManager);
tracker.track_supply(0, 1000000000);
tracker.track_supply(5000, 1025000000);

// Calculate token distribution
const distribution = supplyManager.calculate_token_distribution(1000000000);
console.log('Token distribution:', distribution);
```

### Treasury Management

```javascript
import { TreasuryManager, TreasuryPolicy } from 'chainforgeledger/tokenomics/treasury';

// Create treasury manager
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

// Create treasury policy
const policy = new TreasuryPolicy(treasury);

// Check policy compliance
const compliance = policy.check_policy_compliance();
console.log('Policy compliance:', compliance);

// Calculate financial health metrics
const financialHealth = treasury.calculate_financial_health();
console.log('Financial health:', financialHealth);
```

## Architecture

ChainForgeLedger follows a modular architecture with clear separation of concerns:

```
├── core/              # Blockchain core functionality
│   ├── block.js       # Block structure and validation
│   ├── blockchain.js  # Main blockchain management
│   ├── transaction.js # Transaction management
│   ├── merkle.js      # Merkle tree implementation
│   ├── state.js       # World state management
│   ├── bridge.js      # Cross-chain bridge
│   ├── caching.js     # Caching layer
│   ├── difficulty.js  # Difficulty adjustment
│   ├── fee_distribution.js # Fee distribution
│   ├── fork.js        # Fork management
│   ├── lending.js     # Lending protocol
│   ├── liquidity.js   # Liquidity management
│   ├── serialization.js # Data serialization
│   ├── sharding.js    # Sharding support
│   ├── staking.js     # Staking system
│   └── state_pruning.js # State pruning
├── consensus/         # Consensus mechanisms (PoW/PoS)
│   ├── interface.js   # Consensus interface
│   ├── pow.js         # Proof of Work
│   ├── pos.js         # Proof of Stake
│   ├── slashing.js    # Validator slashing
│   └── validator.js   # Validator management
├── crypto/            # Cryptographic operations
│   ├── hashing.js     # Hashing functions
│   ├── keys.js        # Key management
│   ├── signature.js   # Digital signatures
│   ├── wallet.js      # Wallet system
│   ├── mnemonic.js    # BIP-39 mnemonics
│   └── multisig.js    # Multisignature wallets
├── governance/        # DAO and voting
│   ├── dao.js         # Decentralized Autonomous Organization
│   ├── proposal.js    # Governance proposals
│   └── voting.js      # Voting systems
├── networking/        # Peer-to-peer network
│   ├── mempool.js     # Transaction mempool
│   ├── node.js        # Network node
│   ├── peer.js        # Peer management
│   ├── protocol.js    # Communication protocols
│   └── rate_limiter.js # Rate limiting
├── smartcontracts/    # Smart contract execution
│   ├── compiler.js    # Contract compiler
│   ├── executor.js    # Contract execution
│   ├── sandbox.js     # Execution sandbox
│   └── vm.js          # Virtual machine
├── storage/           # Data storage
│   ├── database.js    # Database interface
│   ├── leveldb.js     # LevelDB implementation
│   └── models.js      # Data models
├── tokenomics/        # Token economics
│   ├── tokenomics.js  # Core tokenomics
│   ├── stablecoin.js  # Stablecoin management
│   ├── standards.js   # Token standards (ERC-20, ERC-721, ERC-1155)
│   ├── supply.js      # Supply management
│   └── treasury.js    # Treasury management
└── utils/             # Utility functions
    ├── config.js      # Configuration management
    ├── logger.js      # Logging system
    └── crypto.js      # Cryptographic utilities
```

## Testing

Run the comprehensive test suite:

```bash
npm test
```

## Build

Build the package for distribution:

```bash
npm run build
```

## Documentation

- [API Reference](./docs/api.md)
- [Architecture Guide](./docs/architecture.md)
- [Tutorials](./docs/tutorials/)

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on how to get started.

## License

ChainForgeLedger is released under the [MIT License](./LICENSE).

## Author

**Kanishk Kumar Singh**

- Email: kanishkkumar2004@gmail.com
- GitHub: [@kanishkkumarsingh2004](https://github.com/kanishkkumarsingh2004)

## Support

If you encounter any issues or have questions, please open an issue on the [GitHub repository](https://github.com/kanishkkumarsingh2004/ChainForgeLedger-NPM/issues).

## Roadmap

### Version 1.1.0
- [ ] Enhanced smart contract language support
- [ ] Cross-chain bridge implementation
- [ ] Sharding for scalability
- [ ] Enhanced state pruning

### Version 1.2.0
- [ ] Layer 2 solutions (Rollups)
- [ ] Privacy-preserving transactions
- [ ] ZK-SNARK integration
- [ ] Enhanced DeFi protocols

### Version 2.0.0
- [ ] Parallel transaction processing
- [ ] Dynamic consensus switching
- [ ] Enhanced governance mechanisms
- [ ] Advanced analytics and monitoring
