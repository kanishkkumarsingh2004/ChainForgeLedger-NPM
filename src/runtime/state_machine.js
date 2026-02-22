/**
 * State Machine - Full state machine separation architecture
 * 
 * A modular state management system with complete separation from core blockchain logic.
 * Features:
 * - State transition system
 * - State versioning and history
 * - State snapshotting and restoration
 * - State validation and integrity checks
 * - Pluggable state backends
 * - State synchronization
 * - State pruning and garbage collection
 * - Atomic operations
 */

export class StateMachine {
    /**
     * Create a new StateMachine instance
     * @param {Object} options - State machine options
     */
    constructor(options = {}) {
        this.state = options.initialState || {};
        this.stateVersion = 0;
        this.stateHistory = [];
        this.snapshots = new Map();
        this.maxHistoryLength = options.maxHistoryLength || 1000;
        this.backend = options.backend || new InMemoryStateBackend();
        this.transactionStack = [];
        this.callbacks = {
            beforeTransition: [],
            afterTransition: [],
            beforeSnapshot: [],
            afterSnapshot: [],
            beforeRestore: [],
            afterRestore: []
        };
        
        this.initialized = false;
    }
    
    /**
     * Initialize state machine
     */
    async initialize() {
        this.initialized = true;
        await this.backend.initialize();
        
        // Load initial state from backend
        const backendState = await this.backend.getState();
        if (backendState) {
            this.state = backendState;
        }
        
        this.addStateHistory(this.state);
    }
    
    /**
     * Add state change to history
     * @param {Object} state - New state
     */
    addStateHistory(state) {
        this.stateHistory.push({
            version: this.stateVersion,
            state: { ...state },
            timestamp: Date.now()
        });
        
        if (this.stateHistory.length > this.maxHistoryLength) {
            this.stateHistory.shift();
        }
    }
    
    /**
     * Register callback
     * @param {string} event - Event type
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
    }
    
    /**
     * Unregister callback
     * @param {string} event - Event type
     * @param {Function} callback - Callback function
     */
    off(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
        }
    }
    
    /**
     * Call registered callbacks
     * @param {string} event - Event type
     * @param {Object} data - Callback data
     */
    async callCallbacks(event, data) {
        for (const callback of this.callbacks[event]) {
            try {
                await callback(data);
            } catch (error) {
                console.error(`Callback error for event ${event}:`, error);
            }
        }
    }
    
    /**
     * Begin a transaction
     */
    beginTransaction() {
        const transaction = {
            id: this.generateId(),
            previousState: { ...this.state },
            changes: {},
            startTime: Date.now()
        };
        
        this.transactionStack.push(transaction);
    }
    
    /**
     * Commit the current transaction
     * @returns {Object} Transaction result
     */
    async commitTransaction() {
        if (this.transactionStack.length === 0) {
            throw new Error('No active transaction');
        }
        
        const transaction = this.transactionStack.pop();
        const duration = Date.now() - transaction.startTime;
        
        // Apply changes
        Object.assign(this.state, transaction.changes);
        
        // Increment version
        this.stateVersion++;
        
        // Add to state history
        this.addStateHistory(this.state);
        
        // Save to backend
        await this.backend.setState(this.state);
        
        return {
            id: transaction.id,
            duration,
            changes: transaction.changes,
            previousVersion: this.stateVersion - 1,
            newVersion: this.stateVersion,
            stateHash: this.calculateStateHash(this.state)
        };
    }
    
    /**
     * Rollback the current transaction
     */
    rollbackTransaction() {
        if (this.transactionStack.length === 0) {
            throw new Error('No active transaction');
        }
        
        const transaction = this.transactionStack.pop();
        this.state = transaction.previousState;
    }
    
    /**
     * Apply state transition
     * @param {string} name - Transition name
     * @param {Function} transition - Transition function
     * @param {Array} args - Transition arguments
     * @returns {Object} Transition result
     */
    async applyTransition(name, transition, args = []) {
        await this.callCallbacks('beforeTransition', {
            name,
            args,
            stateVersion: this.stateVersion
        });
        
        this.beginTransaction();
        
        try {
            const result = await transition(this.state, ...args);
            const commitResult = await this.commitTransaction();
            
            await this.callCallbacks('afterTransition', {
                name,
                args,
                result,
                commitResult,
                stateVersion: this.stateVersion
            });
            
            return {
                success: true,
                name,
                result,
                commitResult
            };
        } catch (error) {
            this.rollbackTransaction();
            
            await this.callCallbacks('afterTransition', {
                name,
                args,
                error: error.message,
                stateVersion: this.stateVersion,
                success: false
            });
            
            throw error;
        }
    }
    
    /**
     * Get state by version
     * @param {number} version - State version
     * @returns {Object|null} State
     */
    getStateByVersion(version) {
        const historyEntry = this.stateHistory.find(entry => entry.version === version);
        return historyEntry ? { ...historyEntry.state } : null;
    }
    
    /**
     * Get current state
     * @returns {Object} Current state
     */
    getCurrentState() {
        return { ...this.state };
    }
    
    /**
     * Get state version
     * @returns {number} Current version
     */
    getVersion() {
        return this.stateVersion;
    }
    
    /**
     * Get state history
     * @param {Object} options - Options
     * @returns {Array} State history
     */
    getStateHistory(options = {}) {
        let history = [...this.stateHistory];
        
        if (options.startVersion !== undefined) {
            history = history.filter(entry => entry.version >= options.startVersion);
        }
        
        if (options.endVersion !== undefined) {
            history = history.filter(entry => entry.version <= options.endVersion);
        }
        
        if (options.limit) {
            history = history.slice(-options.limit);
        }
        
        return history;
    }
    
    /**
     * Create state snapshot
     * @param {string} name - Snapshot name
     */
    async createSnapshot(name) {
        await this.callCallbacks('beforeSnapshot', {
            name,
            stateVersion: this.stateVersion
        });
        
        const snapshot = {
            name,
            version: this.stateVersion,
            state: { ...this.state },
            timestamp: Date.now(),
            stateHash: this.calculateStateHash(this.state)
        };
        
        this.snapshots.set(name, snapshot);
        
        await this.callCallbacks('afterSnapshot', {
            name,
            snapshot,
            stateVersion: this.stateVersion
        });
        
        return snapshot;
    }
    
    /**
     * Restore state from snapshot
     * @param {string} name - Snapshot name
     */
    async restoreSnapshot(name) {
        if (!this.snapshots.has(name)) {
            throw new Error(`Snapshot "${name}" not found`);
        }
        
        const snapshot = this.snapshots.get(name);
        
        await this.callCallbacks('beforeRestore', {
            name,
            snapshot,
            stateVersion: this.stateVersion
        });
        
        this.state = { ...snapshot.state };
        this.stateVersion = snapshot.version;
        
        // Add to state history
        this.addStateHistory(this.state);
        
        // Save to backend
        await this.backend.setState(this.state);
        
        await this.callCallbacks('afterRestore', {
            name,
            snapshot,
            stateVersion: this.stateVersion
        });
        
        return snapshot;
    }
    
    /**
     * Delete snapshot
     * @param {string} name - Snapshot name
     */
    deleteSnapshot(name) {
        return this.snapshots.delete(name);
    }
    
    /**
     * Get all snapshots
     * @returns {Array} Snapshots
     */
    getSnapshots() {
        return Array.from(this.snapshots.values());
    }
    
    /**
     * Calculate state hash
     * @param {Object} state - State to hash
     * @returns {string} Hash
     */
    calculateStateHash(state) {
        const serialized = JSON.stringify(state);
        const buffer = new TextEncoder().encode(serialized);
        const hashBuffer = crypto.subtle.digest('SHA-256', buffer);
        return Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
    
    /**
     * Validate state against hash
     * @param {Object} state - State to validate
     * @param {string} expectedHash - Expected hash
     * @returns {boolean} True if valid
     */
    validateState(state, expectedHash) {
        const actualHash = this.calculateStateHash(state);
        return actualHash === expectedHash;
    }
    
    /**
     * Prune old state history
     * @param {number} maxVersions - Maximum versions to keep
     */
    pruneHistory(maxVersions = 100) {
        if (this.stateHistory.length > maxVersions) {
            const versionsToRemove = this.stateHistory.length - maxVersions;
            this.stateHistory.splice(0, versionsToRemove);
        }
    }
    
    /**
     * Garbage collect unused snapshots
     * @param {number} maxAge - Maximum snapshot age in milliseconds
     */
    gcSnapshots(maxAge = 7 * 24 * 60 * 60 * 1000) {
        const now = Date.now();
        for (const [name, snapshot] of this.snapshots.entries()) {
            if (now - snapshot.timestamp > maxAge) {
                this.snapshots.delete(name);
            }
        }
    }
    
    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return 'tx_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    /**
     * Clear all state
     */
    async clear() {
        this.state = {};
        this.stateVersion = 0;
        this.stateHistory = [];
        this.snapshots.clear();
        this.transactionStack = [];
        
        await this.backend.clear();
    }
}

export class InMemoryStateBackend {
    /**
     * Initialize state backend
     */
    async initialize() {
        this.state = null;
    }
    
    /**
     * Get state from backend
     * @returns {Object|null} State
     */
    async getState() {
        return this.state;
    }
    
    /**
     * Set state in backend
     * @param {Object} state - State to set
     */
    async setState(state) {
        this.state = { ...state };
    }
    
    /**
     * Clear backend
     */
    async clear() {
        this.state = null;
    }
}

export class FileStateBackend {
    /**
     * Create a new FileStateBackend instance
     * @param {string} filePath - File path
     */
    constructor(filePath = './state.json') {
        this.filePath = filePath;
        this.fs = require('fs');
        this.path = require('path');
    }
    
    /**
     * Initialize state backend
     */
    async initialize() {
        const directory = this.path.dirname(this.filePath);
        if (!this.fs.existsSync(directory)) {
            this.fs.mkdirSync(directory, { recursive: true });
        }
    }
    
    /**
     * Get state from backend
     * @returns {Object|null} State
     */
    async getState() {
        if (this.fs.existsSync(this.filePath)) {
            const data = this.fs.readFileSync(this.filePath, 'utf8');
            return JSON.parse(data);
        }
        
        return null;
    }
    
    /**
     * Set state in backend
     * @param {Object} state - State to set
     */
    async setState(state) {
        const data = JSON.stringify(state, null, 2);
        this.fs.writeFileSync(this.filePath, data, 'utf8');
    }
    
    /**
     * Clear backend
     */
    async clear() {
        if (this.fs.existsSync(this.filePath)) {
            this.fs.unlinkSync(this.filePath);
        }
    }
}

export class DatabaseStateBackend {
    /**
     * Create a new DatabaseStateBackend instance
     * @param {Object} database - Database instance
     * @param {string} collectionName - Collection name
     */
    constructor(database, collectionName = 'state') {
        this.database = database;
        this.collectionName = collectionName;
    }
    
    /**
     * Initialize state backend
     */
    async initialize() {
        // Ensure collection exists
        await this.database.ensureCollection(this.collectionName);
    }
    
    /**
     * Get state from backend
     * @returns {Object|null} State
     */
    async getState() {
        const stateDoc = await this.database.findOne(this.collectionName, { _id: 'state' });
        return stateDoc ? stateDoc.state : null;
    }
    
    /**
     * Set state in backend
     * @param {Object} state - State to set
     */
    async setState(state) {
        await this.database.updateOne(
            this.collectionName,
            { _id: 'state' },
            { $set: { state, updatedAt: new Date() } },
            { upsert: true }
        );
    }
    
    /**
     * Clear backend
     */
    async clear() {
        await this.database.deleteOne(this.collectionName, { _id: 'state' });
    }
}

export class StateTransitionSystem {
    /**
     * Create a new StateTransitionSystem instance
     * @param {StateMachine} stateMachine - State machine
     */
    constructor(stateMachine) {
        this.stateMachine = stateMachine;
        this.transitions = new Map();
    }
    
    /**
     * Register a state transition
     * @param {string} name - Transition name
     * @param {Function} transition - Transition function
     */
    registerTransition(name, transition) {
        this.transitions.set(name, transition);
    }
    
    /**
     * Unregister a state transition
     * @param {string} name - Transition name
     */
    unregisterTransition(name) {
        this.transitions.delete(name);
    }
    
    /**
     * Apply registered transition
     * @param {string} name - Transition name
     * @param {Array} args - Transition arguments
     * @returns {Object} Transition result
     */
    async applyTransition(name, args = []) {
        if (!this.transitions.has(name)) {
            throw new Error(`Transition "${name}" not registered`);
        }
        
        const transition = this.transitions.get(name);
        return await this.stateMachine.applyTransition(name, transition, args);
    }
    
    /**
     * Get all registered transitions
     * @returns {Array} Transition names
     */
    getTransitions() {
        return Array.from(this.transitions.keys());
    }
    
    /**
     * Check if transition exists
     * @param {string} name - Transition name
     * @returns {boolean} True if exists
     */
    hasTransition(name) {
        return this.transitions.has(name);
    }
}

export class StateValidator {
    /**
     * Create a new StateValidator instance
     * @param {Object} schema - Validation schema
     */
    constructor(schema) {
        this.schema = schema;
    }
    
    /**
     * Validate state against schema
     * @param {Object} state - State to validate
     * @returns {Object} Validation result
     */
    validate(state) {
        const errors = [];
        const warnings = [];
        
        for (const [field, fieldSchema] of Object.entries(this.schema)) {
            if (!(field in state)) {
                if (fieldSchema.required) {
                    errors.push(`Required field "${field}" missing`);
                } else {
                    warnings.push(`Optional field "${field}" missing`);
                }
                continue;
            }
            
            const value = state[field];
            
            // Type validation
            if (fieldSchema.type && typeof value !== fieldSchema.type) {
                errors.push(`Field "${field}" must be of type "${fieldSchema.type}" (got "${typeof value}")`);
                continue;
            }
            
            // Value validation
            if (fieldSchema.validate) {
                try {
                    const validationResult = fieldSchema.validate(value);
                    if (!validationResult.isValid) {
                        errors.push(`Field "${field}": ${validationResult.error}`);
                    }
                } catch (error) {
                    errors.push(`Field "${field}": ${error.message}`);
                }
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
}