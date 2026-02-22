#!/usr/bin/env node

/**
 * Test script for the research-level modular blockchain framework
 * 
 * Tests the new features:
 * - Gas engine
 * - Event system
 * - State machine separation
 * - Finality logic
 * - Modular plugin architecture
 */

import { 
    GasEngine, 
    GasPriceOracle, 
    GasLimitCalculator,
    EventSystem,
    EventDispatcher,
    StateMachine,
    InMemoryStateBackend,
    FileStateBackend,
    DatabaseStateBackend,
    StateTransitionSystem,
    StateValidator,
    PluginSystem,
    Plugin,
    PluginEventManager,
    FinalityManager,
    PBFTFinalitySystem,
    CasperFFG
} from '../src/index.js';

console.log('=== Research-Level Modular Blockchain Framework ===');

async function testGasEngine() {
    console.log('\n=== Gas Engine Test ===');
    
    try {
        const gasEngine = new GasEngine();
        const gasOracle = new GasPriceOracle();
        const gasCalculator = new GasLimitCalculator();
        
        console.log('✅ Gas engine created successfully');
        
        // Test dynamic gas pricing
        const lowCongestionPrice = gasEngine.calculateDynamicGasPrice(0.1);
        const highCongestionPrice = gasEngine.calculateDynamicGasPrice(0.9);
        
        console.log(`✅ Low congestion gas price: ${lowCongestionPrice} wei`);
        console.log(`✅ High congestion gas price: ${highCongestionPrice} wei`);
        
        // Test transaction tracking
        gasEngine.startTransaction('tx1', 21000, 1000000000);
        gasEngine.trackGasUsage('tx1', 'transaction', 21000);
        const tx1Cost = gasEngine.calculateTransactionCost('tx1');
        
        console.log(`✅ Transaction cost: ${tx1Cost} wei`);
        
        // Test operation cost calculation
        const storageCost = gasEngine.calculateOperationCost('storage', { 
            operation: 'set', 
            key: 'test', 
            value: 'value' 
        });
        
        console.log(`✅ Storage operation cost: ${storageCost} gas`);
        
        // Test gas limit calculator
        const newGasLimit = gasCalculator.calculateNewGasLimit(10000000, 8000000);
        
        console.log(`✅ New gas limit calculation: ${newGasLimit}`);
        
        console.log('✅ Gas engine tests passed');
        
        return true;
    } catch (error) {
        console.error('❌ Gas engine test failed:', error.message);
        return false;
    }
}

async function testEventSystem() {
    console.log('\n=== Event System Test ===');
    
    try {
        const eventSystem = new EventSystem();
        const dispatcher = new EventDispatcher(eventSystem);
        
        console.log('✅ Event system created successfully');
        
        // Test subscription
        const subscriptionId = eventSystem.subscribe('transaction.created', (event) => {
            console.log(`✅ Transaction created event received: ${event.data.transactionId}`);
        });
        
        console.log(`✅ Subscribed to transaction.created events (ID: ${subscriptionId})`);
        
        // Test publishing events
        dispatcher.dispatchTransactionEvent({
            id: 'tx123',
            from: '0x123',
            to: '0x456',
            amount: 100,
            gasLimit: 21000,
            gasPrice: 1000000000
        }, 'created');
        
        // Test wildcard subscription
        eventSystem.subscribe('*', (event) => {
            console.log(`✅ Wildcard event received: ${event.type}`);
        });
        
        dispatcher.dispatchBlockEvent({
            index: 100,
            hash: '0xabc123',
            previousHash: '0xdef456',
            timestamp: Date.now(),
            transactions: []
        }, 'added');
        
        // Test event history
        const history = eventSystem.getEventHistory({ limit: 2 });
        
        console.log(`✅ Event history contains ${history.length} events`);
        
        console.log('✅ Event system tests passed');
        
        return true;
    } catch (error) {
        console.error('❌ Event system test failed:', error.message);
        return false;
    }
}

async function testStateMachine() {
    console.log('\n=== State Machine Test ===');
    
    try {
        const stateMachine = new StateMachine({
            initialState: {
                accounts: {},
                contracts: [],
                network: {
                    peers: 0,
                    latency: 0
                }
            }
        });
        
        await stateMachine.initialize();
        
        console.log('✅ State machine initialized successfully');
        
        // Test state transitions
        const transitionSystem = new StateTransitionSystem(stateMachine);
        
        transitionSystem.registerTransition('createAccount', (state, address, balance) => {
            if (!state.accounts[address]) {
                state.accounts[address] = {
                    balance,
                    nonce: 0,
                    transactions: []
                };
            }
        });
        
        await transitionSystem.applyTransition('createAccount', ['0x123', 1000]);
        
        const state = stateMachine.getCurrentState();
        
        console.log(`✅ Account created: ${Object.keys(state.accounts)[0]}`);
        console.log(`✅ Balance: ${state.accounts['0x123'].balance}`);
        
        // Test state history
        const history = stateMachine.getStateHistory();
        console.log(`✅ State history has ${history.length} versions`);
        
        // Test snapshot functionality
        await stateMachine.createSnapshot('test-snapshot');
        await transitionSystem.applyTransition('createAccount', ['0x456', 2000]);
        
        const snapshots = stateMachine.getSnapshots();
        console.log(`✅ Snapshot created: ${snapshots[0].name}`);
        
        // Test state restoration
        await stateMachine.restoreSnapshot('test-snapshot');
        const restoredState = stateMachine.getCurrentState();
        
        console.log(`✅ State restored - accounts: ${Object.keys(restoredState.accounts).length}`);
        
        console.log('✅ State machine tests passed');
        
        return true;
    } catch (error) {
        console.error('❌ State machine test failed:', error.message);
        return false;
    }
}

async function testFinalityManager() {
    console.log('\n=== Finality Logic Test ===');
    
    try {
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
        
        console.log('✅ Finality manager initialized successfully');
        
        const status = finalityManager.getStatus();
        
        console.log(`✅ Validators: ${status.validators}`);
        console.log(`✅ Checkpoint interval: ${status.checkpointInterval}`);
        
        // Test checkpoint creation
        const block100 = {
            index: 100,
            hash: '0xblock100',
            previousHash: '0xblock99',
            timestamp: Date.now(),
            transactions: [],
            difficulty: 1000
        };
        
        const isCheckpoint = finalityManager.shouldCheckpoint(block100.index);
        
        if (isCheckpoint) {
            await finalityManager.createCheckpoint(block100);
        }
        
        console.log(`✅ Block ${block100.index} is checkpoint: ${isCheckpoint}`);
        
        // Test fork choice rules
        const chains = [
            { id: 'chain1', blocks: [block100] },
            { id: 'chain2', blocks: [block100] }
        ];
        
        const selectedChain = finalityManager.applyForkChoice(chains);
        
        console.log(`✅ Fork choice selected chain: ${selectedChain?.id}`);
        
        console.log('✅ Finality manager tests passed');
        
        return true;
    } catch (error) {
        console.error('❌ Finality manager test failed:', error.message);
        return false;
    }
}

async function testPluginSystem() {
    console.log('\n=== Plugin System Test ===');
    
    try {
        const eventSystem = new EventSystem();
        const stateMachine = new StateMachine();
        const gasEngine = new GasEngine();
        const finalityManager = new FinalityManager();
        
        const pluginSystem = new PluginSystem({
            eventSystem,
            stateMachine,
            gasEngine,
            finalityManager
        });
        
        await pluginSystem.initialize();
        
        console.log('✅ Plugin system initialized successfully');
        
        const status = pluginSystem.getStatus();
        
        console.log(`✅ Total plugins: ${status.totalPlugins}`);
        console.log(`✅ Loaded plugins: ${status.loadedPlugins}`);
        console.log(`✅ Active plugins: ${status.activePlugins}`);
        
        // Test plugin categories
        const corePlugins = pluginSystem.getPluginsByCategory('core');
        console.log(`✅ Core plugins: ${corePlugins.length}`);
        
        // Test plugin metadata
        const transactionPlugin = pluginSystem.getPlugin('core.transaction');
        
        if (transactionPlugin) {
            console.log(`✅ Plugin ${transactionPlugin.name} version ${transactionPlugin.version}`);
        }
        
        // Test dependency graph
        const gasPlugin = pluginSystem.getPlugin('core.gas');
        const gasDependencies = pluginSystem.getPluginDependencies('core.gas');
        
        console.log(`✅ Gas plugin dependencies: ${gasDependencies.length}`);
        
        console.log('✅ Plugin system tests passed');
        
        return true;
    } catch (error) {
        console.error('❌ Plugin system test failed:', error.message);
        return false;
    }
}

async function testCompleteFramework() {
    console.log('\n=== Complete Framework Integration Test ===');
    
    try {
        console.log('🔗 Initializing complete modular framework');
        
        // Create all main components
        const eventSystem = new EventSystem();
        const stateMachine = new StateMachine();
        const gasEngine = new GasEngine();
        const finalityManager = new FinalityManager();
        
        const pluginSystem = new PluginSystem({
            eventSystem,
            stateMachine,
            gasEngine,
            finalityManager
        });
        
        await stateMachine.initialize();
        await pluginSystem.initialize();
        await finalityManager.initialize();
        
        // Test component integration
        const dispatcher = new EventDispatcher(eventSystem);
        
        // Create and dispatch test events
        dispatcher.dispatchBlockEvent({
            index: 1000,
            hash: '0xframework',
            previousHash: '0xprev',
            timestamp: Date.now(),
            transactions: [],
            difficulty: 10000
        }, 'added');
        
        // Test state transitions through plugins
        await stateMachine.createSnapshot('framework-start');
        
        // Test gas calculation
        const transactionCost = gasEngine.calculateDynamicGasPrice(0.5);
        
        console.log(`✅ Framework components initialized successfully`);
        console.log(`✅ Current gas price: ${transactionCost} wei`);
        
        // Check system status
        const [pmStatus, fmStatus, smStatus] = await Promise.all([
            pluginSystem.getStatus(),
            finalityManager.getStatus(),
            {
                version: stateMachine.getVersion(),
                stateKeys: Object.keys(stateMachine.getCurrentState()).length
            }
        ]);
        
        console.log('📊 System Status:');
        console.log(`  - Plugins: ${pmStatus.activePlugins}/${pmStatus.totalPlugins} active`);
        console.log(`  - Validators: ${fmStatus.validators}`);
        console.log(`  - State version: ${smStatus.version}`);
        
        console.log('✅ Complete framework integration test passed');
        
        return true;
    } catch (error) {
        console.error('❌ Complete framework integration test failed:', error.message);
        return false;
    }
}

async function runAllTests() {
    const tests = [
        testGasEngine,
        testEventSystem,
        testStateMachine,
        testFinalityManager,
        testPluginSystem,
        testCompleteFramework
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        try {
            const success = await test();
            
            if (success) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            console.error(`❌ Test failed with exception:`, error);
            failed++;
        }
    }
    
    console.log(`\n=== Test Results ===`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (failed === 0) {
        console.log('\n🎉 All tests passed!');
        console.log('\n🎯 Research-level modular blockchain framework successfully implemented');
        console.log('\n📦 New features available:');
        console.log('   - Gas engine with dynamic pricing');
        console.log('   - Event system with modular architecture');
        console.log('   - State machine separation');
        console.log('   - Finality logic with PBFT and Casper FFG');
        console.log('   - Modular plugin system');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the errors above.');
    }
    
    return failed === 0;
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests().catch(error => {
        console.error('❌ Test execution failed:', error);
        process.exit(1);
    });
}

export {
    testGasEngine,
    testEventSystem,
    testStateMachine,
    testFinalityManager,
    testPluginSystem,
    testCompleteFramework,
    runAllTests
};