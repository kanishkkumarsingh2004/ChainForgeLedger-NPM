#!/usr/bin/env node

import { 
    GasEngine, 
    EventSystem,
    StateMachine,
    PluginSystem,
    FinalityManager
} from '../src/index.js';

console.log('=== Simple Framework Test ===');

async function testBasicImports() {
    console.log('🔍 Testing module imports...');
    
    try {
        // Test core modules
        const gasEngine = new GasEngine();
        const eventSystem = new EventSystem();
        const stateMachine = new StateMachine();
        const pluginSystem = new PluginSystem();
        const finalityManager = new FinalityManager();
        
        console.log('✅ All core modules imported successfully');
        
        // Test plugin system initialization
        await pluginSystem.initialize();
        const pluginStatus = pluginSystem.getStatus();
        
        console.log(`✅ Plugin system: ${pluginStatus.totalPlugins} plugins registered`);
        console.log(`✅ Active plugins: ${pluginStatus.activePlugins}`);
        
        // Test event system - register custom event type
        eventSystem.registerEventType('test.event', {
            message: 'string',
            timestamp: 'number'
        });
        
        eventSystem.subscribe('test.event', (event) => {
            console.log(`✅ Event received: ${event.data.message}`);
        });
        
        eventSystem.publish('test.event', { 
            message: 'Hello from framework!',
            timestamp: Date.now()
        });
        
        // Test state machine
        await stateMachine.initialize();
        console.log(`✅ State machine initialized (version: ${stateMachine.getVersion()})`);
        
        // Test gas engine
        const basePrice = gasEngine.calculateDynamicGasPrice(0.5);
        console.log(`✅ Gas price at 50% congestion: ${basePrice} wei`);
        
        console.log('\n🎉 All simple tests passed!');
        
        return true;
    } catch (error) {
        console.error('❌ Test failed:', error);
        return false;
    }
}

// Run test
testBasicImports().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
});