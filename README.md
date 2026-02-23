# ChainForgeLedger - Research-Level Modular Blockchain Framework

ChainForgeLedger has been upgraded from an educational blockchain engine to a **research-level modular blockchain framework** with comprehensive support for:

## 🧪 Comprehensive Testing Suite

ChainForgeLedger includes an extensive test suite covering all aspects of the blockchain system:

### Test Files
- **`tests/test-all.js`**: Complete test suite covering all modules
- **`tests/nft-test.js`**: Comprehensive NFT (ERC721/ERC1155) functionality tests
- **`tests/block-roots-test.js`**: Block roots calculation and verification tests
- **`tests/receipt-test.js`**: Transaction receipt creation and validation tests
- **`tests/execution-pipeline-test.js`**: Execution pipeline processing tests
- **`tests/block-producer-test.js`**: Block production and management tests
- **`tests/modular-framework-test.js`**: Modular framework integration tests
- **`tests/simple-framework-test.js`**: Simple framework functionality tests
- **`tests/vm-context-test.js`**: Virtual machine context tests
- **`tests/hashing-test.js`**: Cryptographic hashing tests
- **`tests/demo.js`**: Demonstration and example usage

### Test Coverage
- **Blockchain Core**: Blockchain creation, block addition, chain validation
- **Consensus**: Proof of Work (PoW), Proof of Stake (PoS)
- **Tokenomics**: Token standards (ERC20/ERC721/ERC1155), supply management, treasury
- **DeFi**: Lending protocols, liquidity pools, DEX operations
- **Governance**: DAO functionality, voting systems
- **Networking**: Mempool, node communication, peer discovery
- **Smart Contracts**: Compilation, deployment, execution
- **Storage**: Block, transaction, and contract storage
- **Utilities**: Cryptography, random number generation, configuration management

### Running Tests
```bash
# Run all tests with detailed output
npm run test:detailed

# Run individual test files
node tests/nft-test.js
node tests/block-roots-test.js

# Run specific test categories
npm run test:receipts
npm run test:execution
npm run test:block-producer
```

## 🔥 New Features

### 1. Gas Engine
- **Dynamic gas pricing** based on network congestion
- **Gas metering and accounting** with detailed cost calculations
- **Block and transaction gas limits** with automatic adjustment
- **Gas refund mechanism** for storage cleanup
- **Gas price oracle** for real-time price recommendations
- **Extensible gas models** supporting custom operations and costs

### 2. Event System
- **Event bus architecture** with multiple event types (blocks, transactions, contracts, network)
- **Event filtering and subscription** with wildcard support
- **Event replay functionality** with historical event access
- **Event validation and schema checking**
- **Async event processing** for performance optimization
- **Plugin system integration** for modular event handlers

### 3. State Machine Separation
- **Complete state machine separation** from core blockchain logic
- **State transition system** with atomic operations
- **State versioning and history tracking** with snapshot functionality
- **State validation and integrity checks**
- **Pluggable state backends** (in-memory, file, database)
- **State synchronization and pruning**
- **Garbage collection** for old state versions

### 4. Finality Logic
- **Multiple finality mechanisms**:
  - PBFT-style three-phase commit
  - Casper FFG (Friendly Finality Gadget)
  - LMD-GHOST (Latest Message Driven GHOST)
  - GHOST (Greediest Heaviest Observed Subtree)
- **Checkpoint-based finality** with configurable intervals
- **Fork choice rules** for chain selection
- **Validator voting** and quorum requirements
- **Slashing conditions** for finality violations

### 5. Modular Plugin Architecture
- **Dynamic plugin loading/unloading** with dependency resolution
- **Plugin lifecycle management** (initialize, start, stop, destroy)
- **Plugin sandboxing and security** with resource limits
- **Plugin communication and messaging**
- **Plugin registry and discovery**
- **Category-based plugin organization**
- **Built-in core plugins** for essential functionality

### 6. Light Client Mode
- **Block header verification** without full state execution
- **Merkle proof validation** for transactions and state
- **Efficient blockchain syncing** using header chains
- **Lightweight operation** suitable for mobile and IoT devices
- **Trustless verification** of blockchain data
- **Header chain management** with sync verification

## 🚀 Getting Started

### Installation
```bash
npm install chainforgeledger
```

### Light Client Usage

```javascript
import { createLightClient } from 'chainforgeledger';

// Create a light client instance
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

// Process block headers
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

console.log('Current block height:', lightClient.getCurrentBlockHeight());
console.log('Sync verification:', lightClient.verifySync().isValid ? 'Valid' : 'Invalid');
```

### Basic Usage

### Basic Usage

```javascript
import {
    GasEngine,
    EventSystem,
    StateMachine,
    PluginSystem,
    FinalityManager
} from 'chainforgeledger';

// Initialize framework components
const gasEngine = new GasEngine();
const eventSystem = new EventSystem();
const stateMachine = new StateMachine();
const finalityManager = new FinalityManager();
const pluginSystem = new PluginSystem({
    eventSystem,
    stateMachine,
    gasEngine,
    finalityManager
});

// Initialize all components
await Promise.all([
    stateMachine.initialize(),
    pluginSystem.initialize(),
    finalityManager.initialize()
]);

console.log('ChainForgeLedger framework initialized!');
```

### Example: Using the Gas Engine

```javascript
import { GasEngine, GasPriceOracle } from 'chainforgeledger';

const gasEngine = new GasEngine();
const oracle = new GasPriceOracle();

// Calculate gas prices based on congestion
const lowCongestionPrice = gasEngine.calculateDynamicGasPrice(0.1);
const highCongestionPrice = gasEngine.calculateDynamicGasPrice(0.9);

console.log(`Low congestion: ${lowCongestionPrice} wei`);
console.log(`High congestion: ${highCongestionPrice} wei`);

// Start transaction tracking
gasEngine.startTransaction('tx1', 21000, 1000000000);
gasEngine.trackGasUsage('tx1', 'transaction', 21000);

const cost = gasEngine.calculateTransactionCost('tx1');
console.log(`Transaction cost: ${cost} wei`);
```

### Example: Using the Event System

```javascript
import { EventSystem } from 'chainforgeledger';

const eventSystem = new EventSystem();

// Register custom event type
eventSystem.registerEventType('contract.created', {
    contractAddress: 'string',
    creator: 'string',
    bytecode: 'string'
});

// Subscribe to events
eventSystem.subscribe('contract.created', (event) => {
    console.log('Contract created:', event.data.contractAddress);
});

// Publish event
eventSystem.publish('contract.created', {
    contractAddress: '0x1234',
    creator: '0x5678',
    bytecode: '0xabc123...'
});
```

## 🎨 Token Standards

ChainForgeLedger supports multiple token standards out of the box:

### ERC20 - Fungible Tokens
- **Basic functionality**: Transfer, balance tracking, allowances
- **Implementation**: `src/tokenomics/standards.js`
- **Test coverage**: Comprehensive tests in `tests/test-all.js` and `tests/nft-test.js`

### ERC721 - Non-Fungible Tokens (NFTs)
- **Basic functionality**: Ownership, transfer, approval, metadata
- **Implementation**: `src/tokenomics/standards.js`
- **Test coverage**: Detailed tests in `tests/nft-test.js`
  - Contract creation and initialization
  - NFT minting and burning
  - Ownership tracking and balance checks
  - Transfer and approval mechanisms
  - Metadata management
  - Batch operations

### ERC1155 - Multi-Token Standard
- **Basic functionality**: Multiple token types in single contract
- **Implementation**: `src/tokenomics/standards.js`
- **Test coverage**: Comprehensive tests in `tests/nft-test.js`
  - Contract creation and configuration
  - Balance management for multiple token types
  - Safe transfer and batch transfer
  - Approval mechanisms
  - Metadata URIs and batch operations

### Tokenomics System
- **Supply management**: Token distribution, vesting, and inflation
- **Treasury management**: Financial policy compliance and health monitoring
- **Stablecoin system**: Peg stability, rewards distribution, peg deviation monitoring
- **Fee system**: Dynamic fee calculation and distribution

## 🧱 Block Roots Calculation

ChainForgeLedger implements Merkle tree-based block roots calculation:

### Transaction Root (txRoot)
- **Purpose**: Verifies transaction integrity in a block
- **Implementation**: Merkle tree of transaction JSON data
- **Test coverage**: Detailed tests in `tests/block-roots-test.js`

### State Root (stateRoot)
- **Purpose**: Represents the entire blockchain state at block creation
- **Implementation**: Currently placeholder implementation (hardcoded zeros)
- **Future plans**: Merkle Patricia Tree implementation

### Receipt Root (receiptRoot)
- **Purpose**: Verifies transaction receipts in a block
- **Implementation**: Currently placeholder implementation (hardcoded zeros)
- **Future plans**: Merkle tree of transaction receipts

## 🚀 Quick Start

### Prerequisites
- Node.js v14 or higher
- npm or yarn
- Git

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd chainforgeledger

# Install dependencies
npm install

# Run tests
npm test

# Start the blockchain
npm start
```

### Examples
```javascript
// Import ChainForgeLedger
const { Blockchain, ProofOfWork, Wallet, TokenStandards } = require('chainforgeledger');

// Create blockchain instance
const blockchain = new Blockchain();

// Create wallet
const wallet = new Wallet();

// Create NFT contract (ERC721)
const tokenStandards = new TokenStandards();
tokenStandards.create_erc721_contract({
    name: 'My NFT Collection',
    symbol: 'MNFT'
});

// Mint NFT
tokenStandards.erc721.owners.set(1, wallet.getAddress());

// Check NFT balance
console.log('NFT Balance:', tokenStandards.erc721_implementation.balanceOf(wallet.getAddress()));

// Mine blocks
const pow = new ProofOfWork(blockchain);
pow.mineBlock(['tx1', 'tx2', 'tx3'], wallet.getAddress());

// Get blockchain status
console.log('Blockchain height:', blockchain.getHeight());
console.log('Chain valid:', blockchain.isValidChain());
```

### Example: Using the Plugin System

```javascript
import { PluginSystem } from 'chainforgeledger';

const pluginSystem = new PluginSystem();

// Register a custom plugin
pluginSystem.registerPlugin({
    id: 'my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
    category: 'custom',
    description: 'My custom plugin functionality',
    dependencies: ['core.transaction'],
    entryPoint: './my-plugin.js',
    enabled: true
});

// Load and activate plugin
const plugin = await pluginSystem.loadPlugin('my-plugin');
await pluginSystem.startPlugin('my-plugin');

console.log('Plugin active:', pluginSystem.isPluginActive('my-plugin'));
```

### Example: Using Finality Manager

```javascript
import { FinalityManager } from 'chainforgeledger';

const finalityManager = new FinalityManager({
    validators: [
        { id: 'v1', address: '0x1', stake: 1000 },
        { id: 'v2', address: '0x2', stake: 1000 },
        { id: 'v3', address: '0x3', stake: 1000 },
        { id: 'v4', address: '0x4', stake: 1000 }
    ],
    checkpointInterval: 4
});

await finalityManager.initialize();

// Record validator votes
for (const validator of finalityManager.getValidators()) {
    finalityManager.recordVote({
        blockNumber: 100,
        validatorId: validator.id,
        signature: '0x' + validator.id + 'signature'
    });
}

// Check finality
const status = finalityManager.getStatus();
console.log('Finality status:', status);
```

## 🏗️ Architecture Overview

### Modular Design

ChainForgeLedger's new architecture follows a **modular plugin-based approach** where each functionality is encapsulated in separate plugins:

```
ChainForgeLedger Framework
├── Core Plugins
│   ├── Transaction Processing
│   ├── Block Management  
│   ├── Gas Engine
│   ├── Event System
│   └── State Machine
├── Consensus Plugins
│   ├── PoW/PoS Mechanisms
│   └── Finality Logic
├── Storage Plugins
│   ├── Database Interfaces
│   └── Caching Systems
└── Extension Plugins
    ├── Smart Contracts
    ├── Token Standards
    ├── DeFi Protocols
    └── Custom Features
```

### Component Interfaces

Each major component exposes a well-defined interface:

- **GasEngine**: Manages gas pricing, metering, and limits
- **EventSystem**: Handles event registration, subscription, and dispatch
- **StateMachine**: Manages state transitions and versioning
- **FinalityManager**: Handles chain finality and fork resolution
- **PluginSystem**: Manages plugin lifecycle and communication

## 🔧 Configuration

### Gas Engine Configuration

```javascript
const gasEngine = new GasEngine({
    blockGasLimit: 10000000,        // 10 million gas
    baseGasPrice: 1000000000,       // 1 gwei
    gasPriceAdjustment: 1.1,        // 10% adjustment per block
    minGasPrice: 100000000,         // 0.1 gwei
    maxGasPrice: 100000000000       // 100 gwei
});
```

### Event System Configuration

```javascript
const eventSystem = new EventSystem({
    maxHistorySize: 10000,          // Store last 10,000 events
    enableAsyncProcessing: true     // Enable async event handling
});
```

### Plugin System Configuration

```javascript
const pluginSystem = new PluginSystem({
    enableSandboxing: true,         // Enable plugin sandboxing
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB memory limit per plugin
    executionTimeout: 30000         // 30 second execution timeout
});
```

### Finality Manager Configuration

```javascript
const finalityManager = new FinalityManager({
    validatorSet: [],               // Initial validators
    quorumThreshold: 0.67,          // 67% quorum required
    checkpointInterval: 4,          // Checkpoint every 4 blocks
    forkChoiceAlgorithm: 'LMD-GHOST' // Fork choice algorithm
});
```

## 📚 Advanced Topics

### Creating Custom Plugins

```javascript
import { Plugin } from 'chainforgeledger';

class MyCustomPlugin extends Plugin {
    constructor(options) {
        super(options);
    }
    
    async initialize() {
        console.log('MyCustomPlugin initialized');
        this.setupEventHandlers();
    }
    
    async start() {
        console.log('MyCustomPlugin started');
        this.startBackgroundTasks();
    }
    
    async stop() {
        console.log('MyCustomPlugin stopped');
        this.cleanupResources();
    }
    
    async destroy() {
        console.log('MyCustomPlugin destroyed');
        this.removeEventHandlers();
    }
}

// Usage
const plugin = new MyCustomPlugin({
    id: 'my-custom-plugin',
    name: 'My Custom Plugin',
    version: '1.0.0',
    category: 'custom',
    description: 'Custom plugin functionality'
});
```

### Custom State Transitions

```javascript
import { StateMachine, StateTransitionSystem } from 'chainforgeledger';

const stateMachine = new StateMachine();
const transitionSystem = new StateTransitionSystem(stateMachine);

// Register custom transition
transitionSystem.registerTransition('transferFunds', (state, from, to, amount) => {
    if (!state.accounts[from] || state.accounts[from].balance < amount) {
        throw new Error('Insufficient funds');
    }
    
    state.accounts[from].balance -= amount;
    state.accounts[to] = state.accounts[to] || { balance: 0 };
    state.accounts[to].balance += amount;
    
    return true;
});

// Apply transition
const result = await transitionSystem.applyTransition('transferFunds', ['0x123', '0x456', 100]);
console.log('Transfer successful:', result.success);
```

### Custom Gas Costs

```javascript
import { GasEngine } from 'chainforgeledger';

const gasEngine = new GasEngine();

// Add custom operation cost
gasEngine.gasCosts.customOperation = 100;

// Calculate custom operation cost
const cost = gasEngine.calculateOperationCost('customOperation', {
    params: 'value'
});
```

## 🚀 Performance Features

### Gas Optimization

- **Dynamic gas pricing** adjusts prices based on network congestion
- **Gas limit adjustment** prevents block stuffing
- **Efficient metering** reduces overhead with gas cost caches

### Event System Performance

- **Async event processing** offloads heavy operations
- **Event history pruning** manages memory usage
- **Efficient filtering** using optimized query patterns

### State Management Performance

- **State versioning** with copy-on-write semantics
- **Snapshot compression** reduces storage overhead
- **Lazy loading** of old state versions

### Plugin System Performance

- **Sandbox isolation** prevents resource contention
- **Dependency resolution** ensures efficient loading
- **Resource limits** prevent plugin crashes

## 🔒 Security Features

### Gas Engine Security

- **Gas limit enforcement** prevents infinite loops
- **Gas price minimums** prevent spam attacks
- **Execution time limits** stop denial-of-service attacks

### Event System Security

- **Event validation** prevents invalid data
- **Rate limiting** prevents event flooding
- **Access control** for event subscriptions

### Plugin System Security

- **Sandboxing** prevents plugin escapes
- **Code signing** verifies plugin authenticity
- **Resource limits** prevent resource exhaustion

## 📊 Monitoring and Analytics

### Gas Engine Metrics

- Gas price history and volatility
- Gas usage per transaction and block
- Congestion level and network health

### Event System Metrics

- Event rates per type
- Event processing latency
- Subscription count and activity

### State Machine Metrics

- State version count and size
- Transition times and成功率
- Snapshot creation and restore times

### Plugin System Metrics

- Plugin loading and activation times
- Plugin resource usage
- Plugin dependency resolution status

## 🔄 Compatibility

ChainForgeLedger's modular architecture ensures compatibility with:

- Existing blockchain implementations
- Smart contract platforms
- DeFi protocols
- Token standards
- Cross-chain bridges

## 🎯 Roadmap

- [ ] Enhanced consensus mechanisms
- [ ] Improved plugin sandboxing
- [ ] Advanced state synchronization
- [ ] Cross-chain interoperability
- [ ] WebAssembly smart contracts
- [ ] Zero-knowledge proof integration

## 📄 License

ChainForgeLedger is open source and available under the MIT License.

## 👥 Contributing

We welcome contributions from the community! Please see our [Contribution Guide](CONTRIBUTING.md) for more information.

## 📞 Support

For questions, issues, or support, please:

1. Check the [GitHub Issues](https://github.com/kanishkkumarsingh2004/ChainForgeLedger-NPM/issues)
2. Join our [Discord Server](https://discord.gg/chainforgeledger)
3. Email us at [kanishkkumar2004@gmail.com](mailto:kanishkkumar2004@gmail.com)

---

**ChainForgeLedger - Powering the future of modular blockchain research and development**