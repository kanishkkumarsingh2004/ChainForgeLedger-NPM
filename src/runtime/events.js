/**
 * Event System - Modular event management framework
 * 
 * A robust, extensible event system for blockchain operations.
 * Features:
 * - Event bus architecture
 * - Multiple event types (transaction, block, contract, network)
 * - Event filtering and subscription
 * - Event replay functionality
 * - Event validation and schema checking
 * - Performance optimization with async processing
 * - Plugin system integration
 */

export class EventSystem {
    /**
     * Create a new EventSystem instance
     * @param {Object} options - Event system options
     */
    constructor(options = {}) {
        this.subscribers = new Map();
        this.eventHistory = [];
        this.maxHistorySize = options.maxHistorySize || 10000;
        this.eventQueue = [];
        this.processingQueue = false;
        this.eventTypes = new Set([
            'block.created',
            'block.added',
            'block.finalized',
            'transaction.created',
            'transaction.added',
            'transaction.processed',
            'transaction.confirmed',
            'transaction.failed',
            'contract.created',
            'contract.executed',
            'contract.stopped',
            'contract.storage.updated',
            'network.peer.connected',
            'network.peer.disconnected',
            'network.message.received',
            'network.message.sent',
            'validator.elected',
            'validator.slash',
            'validator.rewarded',
            'state.updated',
            'gas.price.changed',
            'fork.detected',
            'fork.resolved',
            'bridge.transaction.created',
            'bridge.transaction.relayed',
            'bridge.transaction.confirmed'
        ]);
        
        this.eventSchemas = new Map();
        this.setupDefaultSchemas();
    }
    
    /**
     * Setup default event schemas
     */
    setupDefaultSchemas() {
        // Block events
        this.eventSchemas.set('block.created', {
            blockNumber: 'number',
            blockHash: 'string',
            timestamp: 'number',
            transactionCount: 'number'
        });
        
        this.eventSchemas.set('block.added', {
            blockNumber: 'number',
            blockHash: 'string',
            previousHash: 'string',
            timestamp: 'number',
            transactionCount: 'number'
        });
        
        this.eventSchemas.set('block.finalized', {
            blockNumber: 'number',
            blockHash: 'string',
            timestamp: 'number',
            confirmationCount: 'number'
        });
        
        // Transaction events
        this.eventSchemas.set('transaction.created', {
            transactionId: 'string',
            from: 'string',
            to: 'string',
            value: 'number',
            gasLimit: 'number',
            gasPrice: 'number'
        });
        
        this.eventSchemas.set('transaction.added', {
            transactionId: 'string',
            blockNumber: 'number',
            blockHash: 'string',
            index: 'number'
        });
        
        this.eventSchemas.set('transaction.processed', {
            transactionId: 'string',
            status: 'string',
            gasUsed: 'number',
            cumulativeGasUsed: 'number',
            logs: 'array'
        });
        
        this.eventSchemas.set('transaction.confirmed', {
            transactionId: 'string',
            confirmationCount: 'number',
            blockNumber: 'number',
            blockHash: 'string'
        });
        
        this.eventSchemas.set('transaction.failed', {
            transactionId: 'string',
            error: 'string',
            blockNumber: 'number',
            blockHash: 'string'
        });
        
        // Contract events
        this.eventSchemas.set('contract.created', {
            contractAddress: 'string',
            creator: 'string',
            bytecode: 'string',
            transactionId: 'string',
            blockNumber: 'number'
        });
        
        this.eventSchemas.set('contract.executed', {
            contractAddress: 'string',
            transactionId: 'string',
            functionName: 'string',
            args: 'array',
            returnValue: 'string',
            gasUsed: 'number'
        });
        
        this.eventSchemas.set('contract.stopped', {
            contractAddress: 'string',
            transactionId: 'string',
            reason: 'string',
            blockNumber: 'number'
        });
        
        this.eventSchemas.set('contract.storage.updated', {
            contractAddress: 'string',
            key: 'string',
            value: 'string',
            previousValue: 'string',
            transactionId: 'string'
        });
    }
    
    /**
     * Register a new event type with schema
     * @param {string} eventType - Event type
     * @param {Object} schema - Event schema
     */
    registerEventType(eventType, schema) {
        this.eventTypes.add(eventType);
        this.eventSchemas.set(eventType, schema);
    }
    
    /**
     * Subscribe to events
     * @param {string} eventType - Event type to subscribe to
     * @param {Function} callback - Callback function
     * @param {Object} options - Subscription options
     * @returns {string} Subscription ID
     */
    subscribe(eventType, callback, options = {}) {
        if (!this.eventTypes.has(eventType) && eventType !== '*') {
            throw new Error(`Event type "${eventType}" not registered`);
        }
        
        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, new Map());
        }
        
        const subscriberMap = this.subscribers.get(eventType);
        const subscriberId = this.generateId();
        
        subscriberMap.set(subscriberId, {
            callback,
            options
        });
        
        return subscriberId;
    }
    
    /**
     * Unsubscribe from events
     * @param {string} eventType - Event type
     * @param {string} subscriberId - Subscription ID
     */
    unsubscribe(eventType, subscriberId) {
        if (this.subscribers.has(eventType)) {
            const subscriberMap = this.subscribers.get(eventType);
            subscriberMap.delete(subscriberId);
            
            if (subscriberMap.size === 0) {
                this.subscribers.delete(eventType);
            }
        }
    }
    
    /**
     * Publish an event
     * @param {string} eventType - Event type
     * @param {Object} data - Event data
     */
    publish(eventType, data) {
        if (!this.eventTypes.has(eventType) && eventType !== '*') {
            throw new Error(`Event type "${eventType}" not registered`);
        }
        
        // Validate event data against schema
        if (this.eventSchemas.has(eventType)) {
            this.validateEventData(eventType, data);
        }
        
        const event = {
            id: this.generateId(),
            type: eventType,
            data: { ...data },
            timestamp: Date.now()
        };
        
        this.eventHistory.push(event);
        
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
        
        this.eventQueue.push(event);
        this.processQueue();
    }
    
    /**
     * Process the event queue
     */
    async processQueue() {
        if (this.processingQueue) {
            return;
        }
        
        this.processingQueue = true;
        
        while (this.eventQueue.length > 0) {
            const event = this.eventQueue.shift();
            
            try {
                // Notify subscribers to specific event type
                if (this.subscribers.has(event.type)) {
                    const subscribers = this.subscribers.get(event.type);
                    for (const [id, { callback, options }] of subscribers.entries()) {
                        if (options.async) {
                            this.invokeCallbackAsync(callback, event, id);
                        } else {
                            this.invokeCallback(callback, event, id);
                        }
                    }
                }
                
                // Notify wildcard subscribers
                if (this.subscribers.has('*')) {
                    const subscribers = this.subscribers.get('*');
                    for (const [id, { callback, options }] of subscribers.entries()) {
                        if (options.async) {
                            this.invokeCallbackAsync(callback, event, id);
                        } else {
                            this.invokeCallback(callback, event, id);
                        }
                    }
                }
            } catch (error) {
                console.error('Error processing event:', error);
            }
        }
        
        this.processingQueue = false;
    }
    
    /**
     * Invoke subscriber callback
     * @param {Function} callback - Callback function
     * @param {Object} event - Event
     * @param {string} subscriberId - Subscriber ID
     */
    invokeCallback(callback, event, subscriberId) {
        try {
            callback(event);
        } catch (error) {
            console.error(`Error invoking subscriber ${subscriberId}:`, error);
        }
    }
    
    /**
     * Invoke subscriber callback asynchronously
     * @param {Function} callback - Callback function
     * @param {Object} event - Event
     * @param {string} subscriberId - Subscriber ID
     */
    async invokeCallbackAsync(callback, event, subscriberId) {
        try {
            await callback(event);
        } catch (error) {
            console.error(`Error invoking async subscriber ${subscriberId}:`, error);
        }
    }
    
    /**
     * Validate event data against schema
     * @param {string} eventType - Event type
     * @param {Object} data - Event data
     */
    validateEventData(eventType, data) {
        const schema = this.eventSchemas.get(eventType);
        
        for (const [field, type] of Object.entries(schema)) {
            if (!(field in data)) {
                throw new Error(`Missing required field "${field}" for event type "${eventType}"`);
            }
            
            const fieldType = typeof data[field];
            let isValid = false;
            
            switch (type) {
                case 'string':
                    isValid = typeof data[field] === 'string';
                    break;
                case 'number':
                    isValid = typeof data[field] === 'number';
                    break;
                case 'boolean':
                    isValid = typeof data[field] === 'boolean';
                    break;
                case 'array':
                    isValid = Array.isArray(data[field]);
                    break;
                case 'object':
                    isValid = typeof data[field] === 'object' && data[field] !== null && !Array.isArray(data[field]);
                    break;
            }
            
            if (!isValid) {
                throw new Error(`Field "${field}" must be of type "${type}" for event type "${eventType}" (got "${fieldType}")`);
            }
        }
    }
    
    /**
     * Get event history
     * @param {Object} filters - Filters
     * @returns {Array} Event history
     */
    getEventHistory(filters = {}) {
        let history = [...this.eventHistory];
        
        if (filters.type) {
            history = history.filter(event => event.type === filters.type);
        }
        
        if (filters.startTime) {
            history = history.filter(event => event.timestamp >= filters.startTime);
        }
        
        if (filters.endTime) {
            history = history.filter(event => event.timestamp <= filters.endTime);
        }
        
        if (filters.limit) {
            history = history.slice(-filters.limit);
        }
        
        return history;
    }
    
    /**
     * Replay events
     * @param {Object} filters - Filters
     * @param {Function} callback - Replay callback
     */
    replayEvents(filters = {}, callback) {
        const events = this.getEventHistory(filters);
        
        events.forEach(event => {
            callback(event);
        });
    }
    
    /**
     * Get subscribers for event type
     * @param {string} eventType - Event type
     * @returns {Array} Subscribers
     */
    getSubscribers(eventType) {
        if (!this.subscribers.has(eventType)) {
            return [];
        }
        
        return Array.from(this.subscribers.get(eventType).entries()).map(([id, subscriber]) => ({
            id,
            ...subscriber
        }));
    }
    
    /**
     * Get registered event types
     * @returns {Array} Event types
     */
    getEventTypes() {
        return Array.from(this.eventTypes);
    }
    
    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return 'evt_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    /**
     * Clear event history
     */
    clearHistory() {
        this.eventHistory = [];
    }
    
    /**
     * Clear all subscribers
     */
    clearSubscribers() {
        this.subscribers.clear();
    }
}

export class EventDispatcher {
    /**
     * Create a new EventDispatcher instance
     * @param {EventSystem} eventSystem - Event system
     */
    constructor(eventSystem) {
        this.eventSystem = eventSystem;
    }
    
    /**
     * Dispatch block events
     * @param {Object} block - Block
     * @param {string} type - Event type
     */
    dispatchBlockEvent(block, type) {
        this.eventSystem.publish(`block.${type}`, {
            blockNumber: block.index,
            blockHash: block.hash,
            previousHash: block.previousHash,
            timestamp: block.timestamp,
            transactionCount: block.transactions.length
        });
    }
    
    /**
     * Dispatch transaction events
     * @param {Object} transaction - Transaction
     * @param {string} type - Event type
     * @param {Object} additionalData - Additional data
     */
    dispatchTransactionEvent(transaction, type, additionalData = {}) {
        this.eventSystem.publish(`transaction.${type}`, {
            transactionId: transaction.id,
            from: transaction.from,
            to: transaction.to,
            value: transaction.amount,
            gasLimit: transaction.gasLimit,
            gasPrice: transaction.gasPrice,
            ...additionalData
        });
    }
    
    /**
     * Dispatch contract events
     * @param {Object} contract - Contract
     * @param {string} type - Event type
     * @param {Object} additionalData - Additional data
     */
    dispatchContractEvent(contract, type, additionalData = {}) {
        this.eventSystem.publish(`contract.${type}`, {
            contractAddress: contract.address,
            ...additionalData
        });
    }
    
    /**
     * Dispatch network events
     * @param {Object} peer - Peer
     * @param {string} type - Event type
     * @param {Object} additionalData - Additional data
     */
    dispatchNetworkEvent(peer, type, additionalData = {}) {
        this.eventSystem.publish(`network.${type}`, {
            peerId: peer.id,
            peerAddress: peer.address,
            ...additionalData
        });
    }
    
    /**
     * Dispatch validator events
     * @param {Object} validator - Validator
     * @param {string} type - Event type
     * @param {Object} additionalData - Additional data
     */
    dispatchValidatorEvent(validator, type, additionalData = {}) {
        this.eventSystem.publish(`validator.${type}`, {
            validatorId: validator.id,
            validatorAddress: validator.address,
            ...additionalData
        });
    }
    
    /**
     * Dispatch state events
     * @param {string} key - State key
     * @param {*} value - New value
     * @param {*} previousValue - Previous value
     * @param {Object} additionalData - Additional data
     */
    dispatchStateEvent(key, value, previousValue, additionalData = {}) {
        this.eventSystem.publish('state.updated', {
            key,
            value,
            previousValue,
            ...additionalData
        });
    }
    
    /**
     * Dispatch gas events
     * @param {number} gasPrice - Current gas price
     * @param {Object} additionalData - Additional data
     */
    dispatchGasPriceChanged(gasPrice, additionalData = {}) {
        this.eventSystem.publish('gas.price.changed', {
            gasPrice,
            ...additionalData
        });
    }
    
    /**
     * Dispatch fork events
     * @param {number} blockNumber - Block number
     * @param {string} forkType - Fork type
     * @param {Object} additionalData - Additional data
     */
    dispatchForkEvent(blockNumber, forkType, additionalData = {}) {
        this.eventSystem.publish(`fork.${forkType}`, {
            blockNumber,
            ...additionalData
        });
    }
    
    /**
     * Dispatch bridge events
     * @param {Object} transaction - Bridge transaction
     * @param {string} type - Event type
     * @param {Object} additionalData - Additional data
     */
    dispatchBridgeEvent(transaction, type, additionalData = {}) {
        this.eventSystem.publish(`bridge.transaction.${type}`, {
            transactionId: transaction.id,
            sourceChain: transaction.sourceChain,
            destinationChain: transaction.destinationChain,
            amount: transaction.amount,
            ...additionalData
        });
    }
}