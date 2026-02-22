# ChainForgeLedger - Research-Level Modular Blockchain Framework

ChainForgeLedger has been upgraded from an educational blockchain engine to a **research-level modular blockchain framework** with comprehensive support for:

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

## 🚀 Getting Started

### Installation
```bash
npm install chainforgeledger
```

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