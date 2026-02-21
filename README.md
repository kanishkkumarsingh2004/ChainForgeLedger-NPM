# ChainForgeLedger

A complete blockchain platform library built from scratch with pure JavaScript. ChainForgeLedger provides a comprehensive set of tools and modules for building decentralized applications, including support for multiple consensus mechanisms, smart contracts, DeFi protocols, and more.

## Features

- **Multiple Consensus Mechanisms**: Support for Proof of Work (PoW), Proof of Stake (PoS), and validator-based consensus
- **Smart Contract Execution**: Stack-based virtual machine with sandboxed execution and compiler support
- **Decentralized Finance (DeFi)**: Built-in DEX, lending protocol, liquidity management, and stablecoin support
- **NFT Marketplace**: Digital asset creation, minting, and trading functionality with ERC-721 and ERC-1155 standards
- **Blockchain Explorer**: Analytics and visualization tools for blockchain data
- **Wallet System**: Multiple wallet types (CLI, web, mobile, multisig, hardware) with BIP-39 mnemonic support
- **Governance**: DAO framework with voting and proposal mechanisms
- **Security Architecture**: Multiple protection mechanisms including sharding, state pruning, slashing, and sandboxing
- **Tokenomics**: Comprehensive tokenomics system with vesting, staking, reward distribution, supply management, and treasury systems
- **Cross-Chain Bridge**: Interoperability between different blockchain networks
- **Caching Layer**: Performance optimizations through efficient caching mechanisms
- **Advanced Storage**: LevelDB and database abstraction layer for efficient data management
- **Networking**: Peer-to-peer network with mempool, protocol, and rate limiting

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
- `Bridge`: Cross-chain bridge functionality
- `Caching`: Performance optimization through caching
- `DifficultyAdjustment`: Dynamic difficulty adjustment
- `FeeDistribution`: Transaction fee distribution
- `ForkHandler`: Blockchain fork management
- `Lending`: DeFi lending protocol
- `Liquidity`: Liquidity pool management
- `Serialization`: Data serialization for network transmission
- `Sharding`: Scalability through sharding
- `Staking`: Staking and validator management
- `StatePruning`: Storage optimization through state pruning

### Consensus

- `ProofOfWork`: PoW consensus mechanism with mining functionality
- `ProofOfStake`: PoS consensus mechanism with validator management
- `Validator`: Validator entity for PoS
- `ValidatorManager`: Manages validators in PoS system
- `ConsensusInterface`: Common interface for all consensus mechanisms
- `Slashing`: Validator slashing mechanisms

### Cryptography

- `sha256_hash`: SHA-256 hashing function
- `keccak256_hash`: Keccak-256 hashing function
- `generate_keys`: Key pair generation
- `KeyPair`: Key pair management
- `Signature`: Digital signature operations
- `Wallet`: Wallet system with signing capabilities
- `Mnemonic`: BIP-39 mnemonic generation and recovery
- `Multisig`: Multisignature wallet functionality

### Tokenomics

- `Tokenomics`: Comprehensive tokenomics system
- `Stablecoin`: Stablecoin management and stabilization
- `TokenStandards`: ERC-20, ERC-721, and ERC-1155 token standards
- `SupplyManager`: Token supply management and distribution
- `TreasuryManager`: Treasury management and financial operations
- Token distribution management
- Staking and reward mechanisms
- Vesting schedules
- Supply control (mint/burn)
- Stablecoin stabilization mechanisms
- Token standard compliance
- Treasury and reserve management

### Governance

- `DAO`: Decentralized Autonomous Organization framework
- `Proposal`: Governance proposal management
- `Voting`: Voting systems for proposals

### Networking

- `Mempool`: Transaction mempool management
- `Node`: Network node implementation
- `Peer`: Peer-to-peer network management
- `Protocol`: Network communication protocols
- `RateLimiter`: Network traffic rate limiting

### Smart Contracts

- `Compiler`: Smart contract compiler
- `Executor`: Contract execution engine
- `Sandbox`: Execution sandbox for security
- `VM`: Virtual machine for contract execution

### Storage

- `Database`: Database abstraction layer
- `LevelDB`: LevelDB storage implementation
- `Models`: Data models for blockchain entities

### Utils

- `ConfigManager`: Configuration management
- `Logger`: Comprehensive logging system
- `crypto`: Cryptographic utility functions

## Advanced Features

### Smart Contracts

```javascript
import { Compiler, Executor, Sandbox, VM } from 'chainforgeledger/smartcontracts';

// Create a simple smart contract
const contractCode = `
// Simple token contract
function mint(to, amount) {
    balances[to] += amount;
    totalSupply += amount;
}

function transfer(from, to, amount) {
    if (balances[from] >= amount) {
        balances[from] -= amount;
        balances[to] += amount;
        return true;
    }
    return false;
}
`;

// Compile contract
const compiler = new Compiler();
const compiledContract = compiler.compile(contractCode);

// Create sandbox and VM
const sandbox = new Sandbox();
const vm = new VM(compiledContract, sandbox);

// Execute contract methods
vm.call('mint', ['0x1234', 1000]);
vm.call('transfer', ['0x1234', '0x5678', 500]);
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
import { DAO, Proposal, Voting } from 'chainforgeledger/governance';

// Create DAO and governance system
const dao = new DAO();
const voting = new Voting(dao);

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
│   ├── bridge.js       # Cross-chain bridge
│   ├── caching.js      # Caching layer
│   ├── difficulty.js   # Difficulty adjustment
│   ├── fee_distribution.js # Fee distribution
│   ├── fork.js         # Fork management
│   ├── lending.js      # Lending protocol
│   ├── liquidity.js    # Liquidity management
│   ├── serialization.js # Data serialization
│   ├── sharding.js     # Sharding support
│   ├── staking.js      # Staking system
│   └── state_pruning.js # State pruning
├── consensus/         # Consensus mechanisms (PoW/PoS)
│   ├── interface.js    # Consensus interface
│   ├── pow.js          # Proof of Work
│   ├── pos.js          # Proof of Stake
│   ├── slashing.js     # Validator slashing
│   └── validator.js    # Validator management
├── crypto/            # Cryptographic operations
│   ├── hashing.js      # Hashing functions
│   ├── keys.js         # Key management
│   ├── signature.js    # Digital signatures
│   ├── wallet.js       # Wallet system
│   ├── mnemonic.js     # BIP-39 mnemonics
│   └── multisig.js     # Multisignature wallets
├── governance/        # DAO and voting
│   ├── dao.js          # Decentralized Autonomous Organization
│   ├── proposal.js     # Governance proposals
│   └── voting.js       # Voting systems
├── networking/        # Peer-to-peer network
│   ├── mempool.js      # Transaction mempool
│   ├── node.js         # Network node
│   ├── peer.js         # Peer management
│   ├── protocol.js     # Communication protocols
│   └── rate_limiter.js # Rate limiting
├── smartcontracts/    # Smart contract execution
│   ├── compiler.js     # Contract compiler
│   ├── executor.js     # Contract execution
│   ├── sandbox.js      # Execution sandbox
│   └── vm.js           # Virtual machine
├── storage/           # Data storage
│   ├── database.js     # Database interface
│   ├── leveldb.js      # LevelDB implementation
│   └── models.js       # Data models
├── tokenomics/        # Token economics
│   ├── tokenomics.js   # Core tokenomics
│   ├── stablecoin.js   # Stablecoin management
│   ├── standards.js    # Token standards (ERC-20, ERC-721, ERC-1155)
│   ├── supply.js       # Supply management
│   └── treasury.js     # Treasury management
└── utils/             # Utility functions
    ├── config.js       # Configuration management
    ├── logger.js       # Logging system
    └── crypto.js       # Cryptographic utilities
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
- GitHub: [@yourusername](https://github.com/yourusername)

## Support

If you encounter any issues or have questions, please open an issue on the [GitHub repository](https://github.com/yourusername/chainforgeledger/issues).

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
