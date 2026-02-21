/**
 * ChainForgeLedger Utils Module - Configuration Management
 * 
 * Handles configuration loading and management for the blockchain platform.
 */

export class ConfigManager {
    /**
     * Create a new config manager instance.
     * @param {object} defaultConfig - Default configuration
     */
    constructor(defaultConfig = {}) {
        this.defaultConfig = defaultConfig;
        this.config = { ...defaultConfig };
        this.loaded = false;
    }

    /**
     * Load configuration from file or environment variables.
     * @param {string} configFile - Path to config file (optional)
     * @returns {object} Loaded configuration
     */
    loadConfig(configFile = null) {
        try {
            if (configFile) {
                const fs = require('fs');
                const configData = fs.readFileSync(configFile, 'utf8');
                const parsedConfig = JSON.parse(configData);
                this.config = { ...this.defaultConfig, ...parsedConfig };
            } else {
                this.config = { ...this.defaultConfig, ...this._loadFromEnvironment() };
            }
            
            this.loaded = true;
            return this.config;
        } catch (error) {
            console.error('Error loading configuration:', error);
            throw new Error(`Failed to load configuration: ${error.message}`);
        }
    }

    /**
     * Load configuration from environment variables.
     * @private
     * @returns {object} Configuration from environment variables
     */
    _loadFromEnvironment() {
        const envConfig = {};
        
        // Load environment variables with specific prefix
        Object.keys(process.env).forEach(key => {
            if (key.startsWith('CFL_')) {
                const configKey = key.substring(4).toLowerCase();
                const value = process.env[key];
                
                // Try to parse numbers and booleans
                if (!isNaN(value)) {
                    envConfig[configKey] = parseFloat(value);
                } else if (value.toLowerCase() === 'true') {
                    envConfig[configKey] = true;
                } else if (value.toLowerCase() === 'false') {
                    envConfig[configKey] = false;
                } else {
                    envConfig[configKey] = value;
                }
            }
        });
        
        return envConfig;
    }

    /**
     * Get configuration value.
     * @param {string} key - Configuration key
     * @param {any} defaultValue - Default value if key not found
     * @returns {any} Configuration value
     */
    get(key, defaultValue = null) {
        const parts = key.split('.');
        let value = this.config;
        
        for (const part of parts) {
            if (value && typeof value === 'object' && part in value) {
                value = value[part];
            } else {
                return defaultValue;
            }
        }
        
        return value !== undefined ? value : defaultValue;
    }

    /**
     * Set configuration value.
     * @param {string} key - Configuration key
     * @param {any} value - Configuration value
     */
    set(key, value) {
        const parts = key.split('.');
        let config = this.config;
        
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!config[part]) {
                config[part] = {};
            }
            config = config[part];
        }
        
        config[parts[parts.length - 1]] = value;
    }

    /**
     * Get all configuration.
     * @returns {object} Full configuration object
     */
    getAll() {
        return { ...this.config };
    }

    /**
     * Check if configuration is loaded.
     * @returns {boolean} Whether configuration is loaded
     */
    isLoaded() {
        return this.loaded;
    }

    /**
     * Save configuration to file.
     * @param {string} configFile - Path to config file
     */
    saveConfig(configFile) {
        try {
            const fs = require('fs');
            const configData = JSON.stringify(this.config, null, 2);
            fs.writeFileSync(configFile, configData, 'utf8');
        } catch (error) {
            console.error('Error saving configuration:', error);
            throw new Error(`Failed to save configuration: ${error.message}`);
        }
    }

    /**
     * Reset configuration to defaults.
     */
    reset() {
        this.config = { ...this.defaultConfig };
    }

    /**
     * Validate configuration against schema.
     * @param {object} schema - Validation schema
     * @returns {object} Validation results
     */
    validate(schema) {
        const errors = [];
        const warnings = [];
        
        // Validate required fields
        Object.keys(schema).forEach(key => {
            const field = schema[key];
            const value = this.get(key);
            
            if (field.required && value === undefined) {
                errors.push(`Required field '${key}' is missing`);
            }
            
            if (value !== undefined) {
                // Validate type
                if (field.type && typeof value !== field.type) {
                    errors.push(`Field '${key}' must be ${field.type}, got ${typeof value}`);
                }
                
                // Validate range (if numeric)
                if (typeof value === 'number') {
                    if (field.min !== undefined && value < field.min) {
                        errors.push(`Field '${key}' must be at least ${field.min}`);
                    }
                    if (field.max !== undefined && value > field.max) {
                        errors.push(`Field '${key}' must be at most ${field.max}`);
                    }
                }
                
                // Validate options (if enum)
                if (field.options && !field.options.includes(value)) {
                    errors.push(`Field '${key}' must be one of ${field.options.join(', ')}`);
                }
            }
        });
        
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
}

/**
 * Create a configuration manager instance.
 * @param {object} defaultConfig - Default configuration
 * @param {string} configFile - Path to config file (optional)
 * @returns {ConfigManager} Configuration manager instance
 */
export function createConfigManager(defaultConfig = {}, configFile = null) {
    const configManager = new ConfigManager(defaultConfig);
    
    if (configFile) {
        configManager.loadConfig(configFile);
    }
    
    return configManager;
}

/**
 * Default blockchain configuration.
 */
export const DEFAULT_CONFIG = {
    network: {
        name: 'mainnet',
        port: 8545,
        host: 'localhost',
        protocol: 'http',
        networkId: 1,
        chainId: 1
    },
    consensus: {
        type: 'pos',
        difficulty: 1,
        blockTime: 60,
        maxValidators: 100,
        minStake: 1000
    },
    storage: {
        type: 'leveldb',
        path: './data',
        cacheSize: 100,
        maxConnections: 10
    },
    mining: {
        enabled: false,
        minerAddress: '0x0',
        threads: 1
    },
    staking: {
        enabled: true,
        minStake: 1000,
        rewardRate: 0.05,
        lockupPeriod: 30
    },
    gas: {
        price: 0.000000001,
        limit: 21000
    },
    security: {
        enableWhitelist: false,
        whitelist: [],
        rateLimit: 100,
        maxTransactionsPerBlock: 1000
    },
    api: {
        enabled: true,
        port: 3000,
        cors: true,
        rateLimit: 100
    },
    logging: {
        level: 'info',
        format: 'json',
        directory: './logs'
    },
    metrics: {
        enabled: true,
        port: 9090
    }
};

/**
 * Configuration validation schema.
 */
export const CONFIG_SCHEMA = {
    'network.name': { type: 'string', required: true },
    'network.port': { type: 'number', required: true, min: 1, max: 65535 },
    'network.host': { type: 'string', required: true },
    'network.protocol': { type: 'string', required: true, options: ['http', 'https'] },
    'network.networkId': { type: 'number', required: true },
    'network.chainId': { type: 'number', required: true },
    'consensus.type': { type: 'string', required: true, options: ['pow', 'pos', 'poa'] },
    'consensus.difficulty': { type: 'number', required: true, min: 0 },
    'consensus.blockTime': { type: 'number', required: true, min: 1 },
    'consensus.maxValidators': { type: 'number', required: true, min: 1 },
    'consensus.minStake': { type: 'number', required: true, min: 0 },
    'storage.type': { type: 'string', required: true, options: ['leveldb', 'memory', 'postgres'] },
    'storage.path': { type: 'string', required: true },
    'storage.cacheSize': { type: 'number', required: true, min: 0 },
    'storage.maxConnections': { type: 'number', required: true, min: 1 },
    'mining.enabled': { type: 'boolean', required: true },
    'mining.minerAddress': { type: 'string', required: true },
    'mining.threads': { type: 'number', required: true, min: 1 },
    'staking.enabled': { type: 'boolean', required: true },
    'staking.minStake': { type: 'number', required: true, min: 0 },
    'staking.rewardRate': { type: 'number', required: true, min: 0, max: 1 },
    'staking.lockupPeriod': { type: 'number', required: true, min: 0 },
    'gas.price': { type: 'number', required: true, min: 0 },
    'gas.limit': { type: 'number', required: true, min: 1 },
    'security.enableWhitelist': { type: 'boolean', required: true },
    'security.whitelist': { type: 'array', required: true },
    'security.rateLimit': { type: 'number', required: true, min: 0 },
    'security.maxTransactionsPerBlock': { type: 'number', required: true, min: 1 },
    'api.enabled': { type: 'boolean', required: true },
    'api.port': { type: 'number', required: true, min: 1, max: 65535 },
    'api.cors': { type: 'boolean', required: true },
    'api.rateLimit': { type: 'number', required: true, min: 0 },
    'logging.level': { type: 'string', required: true, options: ['debug', 'info', 'warn', 'error'] },
    'logging.format': { type: 'string', required: true, options: ['json', 'text'] },
    'logging.directory': { type: 'string', required: true },
    'metrics.enabled': { type: 'boolean', required: true },
    'metrics.port': { type: 'number', required: true, min: 1, max: 65535 }
};

/**
 * Load default configuration.
 * @returns {ConfigManager} Configuration manager with default settings
 */
export function loadDefaultConfig() {
    const configManager = new ConfigManager(DEFAULT_CONFIG);
    configManager.loaded = true;
    return configManager;
}
