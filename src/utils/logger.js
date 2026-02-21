/**
 * Simple logger module for the blockchain platform
 */

class Logger {
    /**
     * Create a new logger instance.
     * @param {object} options - Logger configuration
     */
    constructor(options = {}) {
        this.level = options.level || 'info';
        this.name = options.name || 'chainforgeledger';
        this.timestamp = options.timestamp !== false;
    }

    /**
     * Log a message.
     * @param {string} level - Log level
     * @param {string} message - Message to log
     * @param {object} metadata - Additional metadata
     */
    _log(level, message, metadata = {}) {
        const levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
        const currentLevelIndex = levels.indexOf(this.level);
        const messageLevelIndex = levels.indexOf(level);

        if (messageLevelIndex < currentLevelIndex) {
            return;
        }

        const timestamp = this.timestamp ? new Date().toISOString() : '';
        const prefix = timestamp ? `[${timestamp}] [${level.toUpperCase()}]${this.name ? ` [${this.name}]` : ''}` : `[${level.toUpperCase()}]`;
        const logMessage = `${prefix} ${message}`;

        if (metadata && Object.keys(metadata).length > 0) {
            console.log(logMessage, metadata);
        } else {
            console.log(logMessage);
        }
    }

    /**
     * Log trace message.
     * @param {string} message - Message to log
     * @param {object} metadata - Additional metadata
     */
    trace(message, metadata = {}) {
        this._log('trace', message, metadata);
    }

    /**
     * Log debug message.
     * @param {string} message - Message to log
     * @param {object} metadata - Additional metadata
     */
    debug(message, metadata = {}) {
        this._log('debug', message, metadata);
    }

    /**
     * Log info message.
     * @param {string} message - Message to log
     * @param {object} metadata - Additional metadata
     */
    info(message, metadata = {}) {
        this._log('info', message, metadata);
    }

    /**
     * Log warn message.
     * @param {string} message - Message to log
     * @param {object} metadata - Additional metadata
     */
    warn(message, metadata = {}) {
        this._log('warn', message, metadata);
    }

    /**
     * Log error message.
     * @param {string} message - Message to log
     * @param {object} metadata - Additional metadata
     */
    error(message, metadata = {}) {
        this._log('error', message, metadata);
    }

    /**
     * Log fatal message.
     * @param {string} message - Message to log
     * @param {object} metadata - Additional metadata
     */
    fatal(message, metadata = {}) {
        this._log('fatal', message, metadata);
    }

    /**
     * Log performance metrics.
     * @param {string} operation - Operation name
     * @param {number} duration - Duration in milliseconds
     * @param {object} metadata - Additional metadata
     */
    performance(operation, duration, metadata = {}) {
        this._log('info', `Performance: ${operation} took ${duration}ms`, { operation, duration, ...metadata });
    }

    /**
     * Log system status.
     * @param {string} status - System status
     * @param {object} metadata - Additional metadata
     */
    system(status, metadata = {}) {
        this._log('info', `System Status: ${status}`, metadata);
    }

    /**
     * Log network activity.
     * @param {string} activity - Network activity
     * @param {object} metadata - Additional metadata
     */
    network(activity, metadata = {}) {
        this._log('info', `Network: ${activity}`, metadata);
    }

    /**
     * Log transaction activity.
     * @param {string} transactionId - Transaction ID
     * @param {string} status - Transaction status
     * @param {object} metadata - Additional metadata
     */
    transaction(transactionId, status, metadata = {}) {
        this._log('info', `Transaction ${transactionId}: ${status}`, { transactionId, status, ...metadata });
    }

    /**
     * Log block creation.
     * @param {number} blockNumber - Block number
     * @param {string} status - Block status
     * @param {object} metadata - Additional metadata
     */
    block(blockNumber, status, metadata = {}) {
        this._log('info', `Block ${blockNumber}: ${status}`, { blockNumber, status, ...metadata });
    }

    /**
     * Log validator activity.
     * @param {string} validatorId - Validator ID
     * @param {string} activity - Activity description
     * @param {object} metadata - Additional metadata
     */
    validator(validatorId, activity, metadata = {}) {
        this._log('info', `Validator ${validatorId}: ${activity}`, { validatorId, activity, ...metadata });
    }

    /**
     * Log smart contract activity.
     * @param {string} contractAddress - Contract address
     * @param {string} activity - Activity description
     * @param {object} metadata - Additional metadata
     */
    contract(contractAddress, activity, metadata = {}) {
        this._log('info', `Contract ${contractAddress}: ${activity}`, { contractAddress, activity, ...metadata });
    }

    /**
     * Log governance activity.
     * @param {string} proposalId - Proposal ID
     * @param {string} activity - Activity description
     * @param {object} metadata - Additional metadata
     */
    governance(proposalId, activity, metadata = {}) {
        this._log('info', `Governance ${proposalId}: ${activity}`, { proposalId, activity, ...metadata });
    }

    /**
     * Log security events.
     * @param {string} event - Security event
     * @param {string} severity - Severity level
     * @param {object} metadata - Additional metadata
     */
    security(event, severity, metadata = {}) {
        const level = severity.toLowerCase();
        
        if (level === 'critical') {
            this.fatal(event, metadata);
        } else if (level === 'high') {
            this.error(event, metadata);
        } else if (level === 'medium') {
            this.warn(event, metadata);
        } else if (level === 'low') {
            this.info(event, metadata);
        } else {
            this.debug(event, metadata);
        }
    }

    /**
     * Log error with stack trace.
     * @param {Error} error - Error object
     * @param {object} metadata - Additional metadata
     */
    errorStack(error, metadata = {}) {
        this._log('error', error.message, {
            stack: error.stack,
            ...metadata
        });
    }

    /**
     * Set log level.
     * @param {string} level - Log level (debug, info, warn, error)
     */
    setLevel(level) {
        this.level = level;
    }

    /**
     * Get current log level.
     * @returns {string} Current log level
     */
    getLevel() {
        return this.level;
    }

    /**
     * Configure logger.
     * @param {object} options - Configuration options
     */
    configure(options) {
        Object.assign(this, options);
    }

    /**
     * Create child logger.
     * @param {string} name - Child logger name
     * @param {object} metadata - Additional metadata
     * @returns {Logger} Child logger instance
     */
    child(name, metadata = {}) {
        return new Logger({
            ...this,
            name: `${this.name}:${name}`
        });
    }
}

/**
 * Create a logger instance.
 * @param {object} options - Logger configuration
 * @returns {Logger} Logger instance
 */
export function createLogger(options = {}) {
    return new Logger(options);
}

/**
 * Create a system logger.
 * @param {object} options - Logger configuration
 * @returns {Logger} System logger instance
 */
export function createSystemLogger(options = {}) {
    return createLogger({
        name: 'system',
        level: 'info',
        ...options
    });
}

/**
 * Create a network logger.
 * @param {object} options - Logger configuration
 * @returns {Logger} Network logger instance
 */
export function createNetworkLogger(options = {}) {
    return createLogger({
        name: 'network',
        level: 'debug',
        ...options
    });
}

/**
 * Create a transaction logger.
 * @param {object} options - Logger configuration
 * @returns {Logger} Transaction logger instance
 */
export function createTransactionLogger(options = {}) {
    return createLogger({
        name: 'transactions',
        level: 'info',
        ...options
    });
}

/**
 * Create a block logger.
 * @param {object} options - Logger configuration
 * @returns {Logger} Block logger instance
 */
export function createBlockLogger(options = {}) {
    return createLogger({
        name: 'blocks',
        level: 'info',
        ...options
    });
}

/**
 * Create a validator logger.
 * @param {object} options - Logger configuration
 * @returns {Logger} Validator logger instance
 */
export function createValidatorLogger(options = {}) {
    return createLogger({
        name: 'validators',
        level: 'info',
        ...options
    });
}

/**
 * Create a contract logger.
 * @param {object} options - Logger configuration
 * @returns {Logger} Contract logger instance
 */
export function createContractLogger(options = {}) {
    return createLogger({
        name: 'contracts',
        level: 'debug',
        ...options
    });
}

/**
 * Create a governance logger.
 * @param {object} options - Logger configuration
 * @returns {Logger} Governance logger instance
 */
export function createGovernanceLogger(options = {}) {
    return createLogger({
        name: 'governance',
        level: 'info',
        ...options
    });
}

/**
 * Create a security logger.
 * @param {object} options - Logger configuration
 * @returns {Logger} Security logger instance
 */
export function createSecurityLogger(options = {}) {
    return createLogger({
        name: 'security',
        level: 'error',
        ...options
    });
}

/**
 * Global logger instance.
 */
let globalLogger = null;

/**
 * Get global logger instance.
 * @param {object} options - Logger configuration (optional)
 * @returns {Logger} Global logger instance
 */
export function getLogger(options = {}) {
    if (!globalLogger) {
        globalLogger = createLogger(options);
    }
    
    return globalLogger;
}

/**
 * Set global logger instance.
 * @param {Logger} logger - Logger instance
 */
export function setLogger(logger) {
    globalLogger = logger;
}

/**
 * Global logger methods for direct usage.
 */
export const logger = new Proxy({}, {
    get(target, prop) {
        const log = getLogger();
        return (...args) => log[prop](...args);
    }
});

export { Logger };
