/**
 * Modular Plugin Architecture - Research-level plugin system
 * 
 * A comprehensive plugin system for extending blockchain functionality.
 * Features:
 * - Dynamic plugin loading/unloading
 * - Plugin lifecycle management
 * - Plugin dependencies resolution
 * - Plugin configuration and validation
 * - Plugin communication and messaging
 * - Plugin sandboxing and security
 * - Plugin registry and discovery
 */

export class PluginSystem {
    /**
     * Create a new PluginSystem instance
     * @param {Object} options - Plugin system options
     */
    constructor(options = {}) {
        this.plugins = new Map();
        this.activePlugins = new Map();
        this.pluginRegistry = new Map();
        this.dependencyGraph = new Map();
        this.pluginCategories = new Map();
        this.sandboxOptions = {
            enableSandboxing: options.enableSandboxing || true,
            maxMemoryUsage: options.maxMemoryUsage || 100 * 1024 * 1024, // 100MB
            maxCPUUsage: options.maxCPUUsage || 0.5, // 50%
            executionTimeout: options.executionTimeout || 30000 // 30 seconds
        };
        
        this.eventSystem = options.eventSystem;
        this.stateMachine = options.stateMachine;
        this.gasEngine = options.gasEngine;
        this.finalityManager = options.finalityManager;
        
        this.initialized = false;
    }
    
    /**
     * Initialize plugin system
     */
    async initialize() {
        this.initialized = true;
        
        // Register built-in plugins
        this.registerBuiltInPlugins();
        
        // Load and initialize installed plugins
        await this.loadInstalledPlugins();
    }
    
    /**
     * Register built-in plugins
     */
    registerBuiltInPlugins() {
        // Example built-in plugins
        this.registerPlugin({
            id: 'core.transaction',
            name: 'Transaction Plugin',
            version: '1.0.0',
            category: 'core',
            description: 'Core transaction processing functionality',
            dependencies: [],
            entryPoint: './src/core/transaction.js',
            enabled: true,
            system: true
        });
        
        this.registerPlugin({
            id: 'core.block',
            name: 'Block Plugin',
            version: '1.0.0',
            category: 'core',
            description: 'Core block processing functionality',
            dependencies: [],
            entryPoint: './src/core/block.js',
            enabled: true,
            system: true
        });
        
        this.registerPlugin({
            id: 'core.gas',
            name: 'Gas Engine Plugin',
            version: '1.0.0',
            category: 'core',
            description: 'Gas metering and pricing system',
            dependencies: [],
            entryPoint: './src/core/gas.js',
            enabled: true,
            system: true
        });
        
        this.registerPlugin({
            id: 'core.events',
            name: 'Event System Plugin',
            version: '1.0.0',
            category: 'core',
            description: 'Event management and dispatching',
            dependencies: [],
            entryPoint: './src/core/events.js',
            enabled: true,
            system: true
        });
        
        this.registerPlugin({
            id: 'core.state',
            name: 'State Machine Plugin',
            version: '1.0.0',
            category: 'core',
            description: 'State management and transitions',
            dependencies: [],
            entryPoint: './src/core/state_machine.js',
            enabled: true,
            system: true
        });
    }
    
    /**
     * Register a plugin
     * @param {Object} pluginInfo - Plugin information
     */
    registerPlugin(pluginInfo) {
        const pluginId = pluginInfo.id;
        
        // Validate plugin information
        this.validatePluginInfo(pluginInfo);
        
        // Check for existing plugin
        if (this.pluginRegistry.has(pluginId)) {
            console.warn(`Plugin ${pluginId} already registered`);
            return false;
        }
        
        // Add to plugin registry
        this.pluginRegistry.set(pluginId, {
            ...pluginInfo,
            registeredAt: Date.now(),
            loaded: false,
            active: false,
            metadata: {}
        });
        
        // Add to category map
        const category = pluginInfo.category || 'general';
        if (!this.pluginCategories.has(category)) {
            this.pluginCategories.set(category, new Set());
        }
        this.pluginCategories.get(category).add(pluginId);
        
        // Build dependency graph
        this.buildDependencyGraph();
        
        return true;
    }
    
    /**
     * Validate plugin information
     * @param {Object} pluginInfo - Plugin information
     */
    validatePluginInfo(pluginInfo) {
        const requiredFields = ['id', 'name', 'version', 'description'];
        
        for (const field of requiredFields) {
            if (!pluginInfo[field]) {
                throw new Error(`Plugin validation failed: missing required field "${field}"`);
            }
        }
        
        // Validate plugin ID format
        if (!/^[a-zA-Z0-9._-]+$/.test(pluginInfo.id)) {
            throw new Error(`Plugin validation failed: invalid plugin ID format "${pluginInfo.id}"`);
        }
        
        // Validate plugin version
        if (!/^\d+\.\d+\.\d+$/.test(pluginInfo.version)) {
            throw new Error(`Plugin validation failed: invalid version format "${pluginInfo.version}"`);
        }
    }
    
    /**
     * Build plugin dependency graph
     */
    buildDependencyGraph() {
        this.dependencyGraph.clear();
        
        for (const [pluginId, plugin] of this.pluginRegistry.entries()) {
            const dependencies = plugin.dependencies || [];
            this.dependencyGraph.set(pluginId, dependencies);
        }
    }
    
    /**
     * Resolve plugin dependencies
     * @param {string} pluginId - Plugin ID
     * @param {Array} resolved - Already resolved dependencies
     * @param {Array} currentPath - Current resolution path
     * @returns {Array} Resolved dependencies
     */
    resolveDependencies(pluginId, resolved = [], currentPath = []) {
        const plugin = this.pluginRegistry.get(pluginId);
        if (!plugin) {
            throw new Error(`Plugin not found: ${pluginId}`);
        }
        
        // Check for circular dependencies
        if (currentPath.includes(pluginId)) {
            const cycle = [...currentPath, pluginId];
            throw new Error(`Circular dependency detected: ${cycle.join(' -> ')}`);
        }
        
        // If already resolved, skip
        if (resolved.includes(pluginId)) {
            return resolved;
        }
        
        const newPath = [...currentPath, pluginId];
        const dependencies = plugin.dependencies || [];
        
        // Resolve each dependency
        for (const depId of dependencies) {
            this.resolveDependencies(depId, resolved, newPath);
        }
        
        resolved.push(pluginId);
        return resolved;
    }
    
    /**
     * Load installed plugins
     */
    async loadInstalledPlugins() {
        // Load plugins from plugin registry
        for (const [pluginId, pluginInfo] of this.pluginRegistry.entries()) {
            if (pluginInfo.enabled && !pluginInfo.system) {
                await this.loadPlugin(pluginId);
            }
        }
    }
    
    /**
     * Load a plugin
     * @param {string} pluginId - Plugin ID
     * @returns {Object} Plugin instance
     */
    async loadPlugin(pluginId) {
        const pluginInfo = this.pluginRegistry.get(pluginId);
        
        if (!pluginInfo) {
            throw new Error(`Plugin not found: ${pluginId}`);
        }
        
        if (this.plugins.has(pluginId)) {
            return this.plugins.get(pluginId);
        }
        
        try {
            // Resolve dependencies
            const dependencies = this.resolveDependencies(pluginId);
            
            // Load dependencies first
            for (const depId of dependencies) {
                if (depId !== pluginId && !this.plugins.has(depId)) {
                    await this.loadPlugin(depId);
                }
            }
            
            // Load plugin entry point
            const pluginInstance = await this.loadPluginEntry(pluginInfo);
            
            // Create plugin context
            const pluginContext = this.createPluginContext(pluginId);
            
            // Initialize plugin
            await pluginInstance.initialize(pluginContext);
            
            // Store plugin instance
            this.plugins.set(pluginId, {
                ...pluginInfo,
                instance: pluginInstance,
                context: pluginContext,
                loaded: true,
                active: false,
                loadedAt: Date.now()
            });
            
            console.log(`Plugin loaded: ${pluginId}@${pluginInfo.version}`);
            
            return this.plugins.get(pluginId);
        } catch (error) {
            console.error(`Failed to load plugin ${pluginId}:`, error);
            throw error;
        }
    }
    
    /**
     * Load plugin entry point
     * @param {Object} pluginInfo - Plugin information
     * @returns {Object} Plugin instance
     */
    async loadPluginEntry(pluginInfo) {
        if (pluginInfo.system) {
            // System plugins are already available as modules
            const modulePath = pluginInfo.entryPoint;
            return await import(modulePath);
        }
        
        // Load external plugin
        return await this.loadExternalPlugin(pluginInfo);
    }
    
    /**
     * Load external plugin
     * @param {Object} pluginInfo - Plugin information
     * @returns {Object} Plugin instance
     */
    async loadExternalPlugin(pluginInfo) {
        // In real implementation, this would load external plugins from disk
        // For now, we'll simulate loading
        const mockPlugin = {
            initialize: async (context) => {
                console.log(`Initializing plugin: ${pluginInfo.name}`);
                return true;
            },
            start: async () => {
                console.log(`Starting plugin: ${pluginInfo.name}`);
                return true;
            },
            stop: async () => {
                console.log(`Stopping plugin: ${pluginInfo.name}`);
                return true;
            },
            destroy: async () => {
                console.log(`Destroying plugin: ${pluginInfo.name}`);
                return true;
            }
        };
        
        return mockPlugin;
    }
    
    /**
     * Create plugin context
     * @param {string} pluginId - Plugin ID
     * @returns {Object} Plugin context
     */
    createPluginContext(pluginId) {
        return {
            id: pluginId,
            pluginSystem: this,
            eventSystem: this.eventSystem,
            stateMachine: this.stateMachine,
            gasEngine: this.gasEngine,
            finalityManager: this.finalityManager,
            logger: this.createPluginLogger(pluginId),
            config: this.getPluginConfig(pluginId),
            sandbox: this.createSandbox(pluginId)
        };
    }
    
    /**
     * Create plugin logger
     * @param {string} pluginId - Plugin ID
     * @returns {Object} Logger
     */
    createPluginLogger(pluginId) {
        return {
            info: (message, ...args) => console.log(`[${pluginId}] INFO: ${message}`, ...args),
            warn: (message, ...args) => console.warn(`[${pluginId}] WARN: ${message}`, ...args),
            error: (message, ...args) => console.error(`[${pluginId}] ERROR: ${message}`, ...args),
            debug: (message, ...args) => console.debug(`[${pluginId}] DEBUG: ${message}`, ...args)
        };
    }
    
    /**
     * Get plugin configuration
     * @param {string} pluginId - Plugin ID
     * @returns {Object} Plugin config
     */
    getPluginConfig(pluginId) {
        // In real implementation, this would load config from file/database
        const plugin = this.pluginRegistry.get(pluginId);
        return plugin.config || {};
    }
    
    /**
     * Create plugin sandbox
     * @param {string} pluginId - Plugin ID
     * @returns {Object} Sandbox
     */
    createSandbox(pluginId) {
        return {
            // Sandbox API will be implemented here
            memory: { limit: this.sandboxOptions.maxMemoryUsage },
            cpu: { limit: this.sandboxOptions.maxCPUUsage },
            timeout: this.sandboxOptions.executionTimeout,
            network: { disabled: true },
            fileSystem: { disabled: true },
            process: { disabled: true }
        };
    }
    
    /**
     * Start a plugin
     * @param {string} pluginId - Plugin ID
     */
    async startPlugin(pluginId) {
        const plugin = this.plugins.get(pluginId);
        
        if (!plugin) {
            throw new Error(`Plugin not loaded: ${pluginId}`);
        }
        
        if (plugin.active) {
            return;
        }
        
        try {
            // Start plugin
            await plugin.instance.start();
            plugin.active = true;
            this.activePlugins.set(pluginId, plugin);
            
            console.log(`Plugin started: ${pluginId}`);
        } catch (error) {
            console.error(`Failed to start plugin ${pluginId}:`, error);
            throw error;
        }
    }
    
    /**
     * Stop a plugin
     * @param {string} pluginId - Plugin ID
     */
    async stopPlugin(pluginId) {
        const plugin = this.plugins.get(pluginId);
        
        if (!plugin) {
            throw new Error(`Plugin not found: ${pluginId}`);
        }
        
        if (!plugin.active) {
            return;
        }
        
        try {
            await plugin.instance.stop();
            plugin.active = false;
            this.activePlugins.delete(pluginId);
            
            console.log(`Plugin stopped: ${pluginId}`);
        } catch (error) {
            console.error(`Failed to stop plugin ${pluginId}:`, error);
            throw error;
        }
    }
    
    /**
     * Unload a plugin
     * @param {string} pluginId - Plugin ID
     */
    async unloadPlugin(pluginId) {
        const plugin = this.plugins.get(pluginId);
        
        if (!plugin) {
            throw new Error(`Plugin not loaded: ${pluginId}`);
        }
        
        // Stop if active
        if (plugin.active) {
            await this.stopPlugin(pluginId);
        }
        
        try {
            await plugin.instance.destroy();
            this.plugins.delete(pluginId);
            
            console.log(`Plugin unloaded: ${pluginId}`);
        } catch (error) {
            console.error(`Failed to unload plugin ${pluginId}:`, error);
            throw error;
        }
    }
    
    /**
     * Start all active plugins
     */
    async startAllPlugins() {
        for (const pluginId of this.getEnabledPlugins()) {
            if (!this.activePlugins.has(pluginId)) {
                await this.startPlugin(pluginId);
            }
        }
    }
    
    /**
     * Stop all active plugins
     */
    async stopAllPlugins() {
        for (const pluginId of [...this.activePlugins.keys()]) {
            await this.stopPlugin(pluginId);
        }
    }
    
    /**
     * Get plugin by ID
     * @param {string} pluginId - Plugin ID
     * @returns {Object|null} Plugin
     */
    getPlugin(pluginId) {
        return this.plugins.get(pluginId) || null;
    }
    
    /**
     * Get all loaded plugins
     * @returns {Array} Plugins
     */
    getLoadedPlugins() {
        return Array.from(this.plugins.values());
    }
    
    /**
     * Get all active plugins
     * @returns {Array} Active plugins
     */
    getActivePlugins() {
        return Array.from(this.activePlugins.values());
    }
    
    /**
     * Get enabled plugins from registry
     * @returns {Array} Enabled plugins
     */
    getEnabledPlugins() {
        return Array.from(this.pluginRegistry.values())
            .filter(plugin => plugin.enabled)
            .map(plugin => plugin.id);
    }
    
    /**
     * Get plugins by category
     * @param {string} category - Category name
     * @returns {Array} Plugins in category
     */
    getPluginsByCategory(category) {
        if (!this.pluginCategories.has(category)) {
            return [];
        }
        
        return Array.from(this.pluginCategories.get(category))
            .map(pluginId => this.getPlugin(pluginId))
            .filter(Boolean);
    }
    
    /**
     * Get plugin dependencies
     * @param {string} pluginId - Plugin ID
     * @returns {Array} Dependencies
     */
    getPluginDependencies(pluginId) {
        const dependencies = this.dependencyGraph.get(pluginId) || [];
        return dependencies.map(depId => this.getPlugin(depId)).filter(Boolean);
    }
    
    /**
     * Get dependent plugins
     * @param {string} pluginId - Plugin ID
     * @returns {Array} Dependent plugins
     */
    getDependentPlugins(pluginId) {
        const dependents = [];
        
        for (const [currentId, dependencies] of this.dependencyGraph.entries()) {
            if (currentId !== pluginId && dependencies.includes(pluginId)) {
                dependents.push(this.getPlugin(currentId));
            }
        }
        
        return dependents.filter(Boolean);
    }
    
    /**
     * Enable a plugin
     * @param {string} pluginId - Plugin ID
     */
    enablePlugin(pluginId) {
        const plugin = this.pluginRegistry.get(pluginId);
        if (plugin) {
            plugin.enabled = true;
        }
    }
    
    /**
     * Disable a plugin
     * @param {string} pluginId - Plugin ID
     */
    disablePlugin(pluginId) {
        const plugin = this.pluginRegistry.get(pluginId);
        if (plugin) {
            plugin.enabled = false;
        }
    }
    
    /**
     * Check if plugin exists
     * @param {string} pluginId - Plugin ID
     * @returns {boolean} True if exists
     */
    hasPlugin(pluginId) {
        return this.pluginRegistry.has(pluginId);
    }
    
    /**
     * Check if plugin is loaded
     * @param {string} pluginId - Plugin ID
     * @returns {boolean} True if loaded
     */
    isPluginLoaded(pluginId) {
        return this.plugins.has(pluginId);
    }
    
    /**
     * Check if plugin is active
     * @param {string} pluginId - Plugin ID
     * @returns {boolean} True if active
     */
    isPluginActive(pluginId) {
        return this.activePlugins.has(pluginId);
    }
    
    /**
     * Update plugin configuration
     * @param {string} pluginId - Plugin ID
     * @param {Object} config - New configuration
     */
    async updatePluginConfig(pluginId, config) {
        const plugin = this.plugins.get(pluginId);
        
        if (plugin) {
            plugin.config = { ...plugin.config, ...config };
            await this.savePluginConfig(pluginId, plugin.config);
            return true;
        }
        
        return false;
    }
    
    /**
     * Save plugin configuration
     * @param {string} pluginId - Plugin ID
     * @param {Object} config - Configuration
     */
    async savePluginConfig(pluginId, config) {
        // In real implementation, this would save to file/database
        console.log(`Saving plugin config: ${pluginId}`, config);
    }
    
    /**
     * Get plugin system status
     * @returns {Object} Status
     */
    getStatus() {
        return {
            totalPlugins: this.pluginRegistry.size,
            loadedPlugins: this.plugins.size,
            activePlugins: this.activePlugins.size,
            pluginCategories: Array.from(this.pluginCategories.keys()),
            sandboxOptions: this.sandboxOptions,
            dependencies: this.buildDependencyGraph()
        };
    }
}

export class Plugin {
    /**
     * Create a new Plugin instance
     * @param {Object} options - Plugin options
     */
    constructor(options = {}) {
        this.id = options.id;
        this.name = options.name;
        this.version = options.version;
        this.category = options.category || 'general';
        this.description = options.description || '';
        this.dependencies = options.dependencies || [];
        this.enabled = options.enabled !== false;
        this.system = options.system || false;
        this.entryPoint = options.entryPoint;
        this.config = options.config || {};
    }
    
    /**
     * Initialize plugin
     * @param {Object} context - Plugin context
     */
    async initialize(context) {
        this.context = context;
        this.logger = context.logger;
        this.config = context.config;
        
        this.logger.info(`Plugin initialized: ${this.name}`);
    }
    
    /**
     * Start plugin
     */
    async start() {
        this.logger.info(`Plugin started: ${this.name}`);
    }
    
    /**
     * Stop plugin
     */
    async stop() {
        this.logger.info(`Plugin stopped: ${this.name}`);
    }
    
    /**
     * Destroy plugin
     */
    async destroy() {
        this.logger.info(`Plugin destroyed: ${this.name}`);
    }
    
    /**
     * Get plugin metadata
     * @returns {Object} Metadata
     */
    getMetadata() {
        return {
            id: this.id,
            name: this.name,
            version: this.version,
            category: this.category,
            description: this.description,
            dependencies: this.dependencies,
            enabled: this.enabled,
            system: this.system,
            entryPoint: this.entryPoint,
            config: this.config
        };
    }
}

export class PluginEventManager {
    /**
     * Create a new PluginEventManager instance
     * @param {PluginSystem} pluginSystem - Plugin system
     * @param {EventSystem} eventSystem - Event system
     */
    constructor(pluginSystem, eventSystem) {
        this.pluginSystem = pluginSystem;
        this.eventSystem = eventSystem;
    }
    
    /**
     * Register plugin event handlers
     */
    registerHandlers() {
        this.eventSystem.subscribe('plugin.loaded', this.handlePluginLoaded.bind(this));
        this.eventSystem.subscribe('plugin.activated', this.handlePluginActivated.bind(this));
        this.eventSystem.subscribe('plugin.deactivated', this.handlePluginDeactivated.bind(this));
        this.eventSystem.subscribe('plugin.config.updated', this.handlePluginConfigUpdated.bind(this));
    }
    
    handlePluginLoaded(event) {
        console.log(`Plugin loaded event:`, event.data);
    }
    
    handlePluginActivated(event) {
        console.log(`Plugin activated event:`, event.data);
    }
    
    handlePluginDeactivated(event) {
        console.log(`Plugin deactivated event:`, event.data);
    }
    
    handlePluginConfigUpdated(event) {
        console.log(`Plugin config updated event:`, event.data);
    }
}