/**
 * ChainForgeLedger Storage Module - Database
 * 
 * Provides database access for blockchain storage.
 */

export class DatabaseManager {
    /**
     * Create a new database manager instance.
     * @param {object} config - Database configuration
     */
    constructor(config = {}) {
        this.host = config.host || 'localhost';
        this.port = config.port || 27017;
        this.database_name = config.database_name || 'chainforgeledger';
        this.connection_string = config.connection_string || 
            `mongodb://${this.host}:${this.port}/${this.database_name}`;
        this.pool_size = config.pool_size || 5;
        this.max_query_retries = config.max_query_retries || 3;
        this.retry_delay = config.retry_delay || 1000;
        this.connection = null;
        this.sessions = new Map();
        this.is_connected = false;
        this.recent_errors = [];
        this.last_connected = null;
        this.connected_time = 0;
        this.retry_count = 0;
    }

    /**
     * Initialize the database manager.
     */
    initialize() {
        this.sessions.clear();
        this.recent_errors = [];
        this.retry_count = 0;
    }

    /**
     * Connect to the database.
     * @returns {Promise<boolean>} Whether connection was successful
     */
    async connect() {
        try {
            this.connection = await this._connect_internal();
            this.is_connected = true;
            this.last_connected = Date.now();
            this.connected_time = Date.now();
            this.retry_count = 0;
            
            return true;
        } catch (error) {
            this._log_error(error);
            this.retry_count++;
            
            if (this.retry_count <= this.max_query_retries) {
                await new Promise(resolve => setTimeout(resolve, this.retry_delay));
                return this.connect();
            }
            
            return false;
        }
    }

    /**
     * Internal connection method.
     * @private
     */
    async _connect_internal() {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
            connected: true,
            version: '1.0',
            max_bson_object_size: 16 * 1024 * 1024
        };
    }

    /**
     * Disconnect from the database.
     */
    async disconnect() {
        if (this.is_connected) {
            await this._disconnect_internal();
            this.is_connected = false;
        }
    }

    /**
     * Internal disconnect method.
     * @private
     */
    async _disconnect_internal() {
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    /**
     * Check if connection is active.
     * @returns {boolean} Whether connection is active
     */
    is_connected_to_database() {
        return this.is_connected;
    }

    /**
     * Execute a database operation.
     * @param {string} collection - Collection name
     * @param {string} operation - Operation type (insert, find, update, delete)
     * @param {object} query - Query parameters
     * @param {object} options - Operation options
     * @returns {Promise<object>} Operation result
     */
    async execute_operation(collection, operation, query, options = {}) {
        if (!this.is_connected) {
            throw new Error('Not connected to database');
        }

        try {
            const result = await this._execute_internal(collection, operation, query, options);
            return result;
        } catch (error) {
            this._log_error(error);
            throw error;
        }
    }

    /**
     * Internal execution method.
     * @private
     */
    async _execute_internal(collection, operation, query, options) {
        await new Promise(resolve => setTimeout(resolve, 100));

        const base_result = {
            acknowledged: true,
            operation,
            collection,
            affected_count: 1,
            inserted_count: operation === 'insert' ? 1 : 0,
            matched_count: operation === 'update' ? 1 : 0,
            modified_count: operation === 'update' ? 1 : 0,
            upserted_count: operation === 'update' && options.upsert ? 1 : 0,
            deleted_count: operation === 'delete' ? 1 : 0
        };

        switch (operation) {
            case 'find':
                return {
                    ...base_result,
                    data: [this._generate_mock_data()]
                };
            case 'insert':
                return {
                    ...base_result,
                    insertedId: this._generate_object_id()
                };
            case 'update':
                return base_result;
            case 'delete':
                return base_result;
            default:
                throw new Error(`Unknown operation: ${operation}`);
        }
    }

    /**
     * Generate mock data.
     * @private
     */
    _generate_mock_data() {
        return {
            _id: this._generate_object_id(),
            block_number: 1000 + Math.floor(Math.random() * 1000),
            timestamp: Date.now() / 1000,
            difficulty: 100,
            miner: `0x${Math.random().toString(16).substr(2, 40)}`
        };
    }

    /**
     * Generate object ID.
     * @private
     */
    _generate_object_id() {
        return `ObjectId(${Math.random().toString(16).substr(2, 24)})`;
    }

    /**
     * Get operation status.
     * @returns {object} Operation status
     */
    get_operation_status() {
        return {
            connection_status: this.is_connected ? 'connected' : 'disconnected',
            connection_time: this.connected_time,
            query_retries: this.retry_count,
            last_error: this.recent_errors.length > 0 ? this.recent_errors[0] : null,
            recent_errors: this.recent_errors.slice(0, 5),
            session_count: this.sessions.size
        };
    }

    /**
     * Log errors.
     * @private
     */
    _log_error(error) {
        this.recent_errors.unshift({
            message: error.message,
            timestamp: Date.now(),
            stack: error.stack
        });
        
        if (this.recent_errors.length > 50) {
            this.recent_errors = this.recent_errors.slice(0, 50);
        }
    }

    /**
     * Clear recent errors.
     */
    clear_recent_errors() {
        this.recent_errors = [];
    }

    /**
     * Get connection information.
     * @returns {object} Connection information
     */
    get_connection_info() {
        return {
            connection_string: this.connection_string,
            host: this.host,
            port: this.port,
            database_name: this.database_name,
            is_connected: this.is_connected,
            connection_time: this.connected_time
        };
    }

    /**
     * Check if database is available.
     * @returns {Promise<boolean>} Whether database is available
     */
    async is_database_available() {
        return this.is_connected;
    }

    /**
     * Test database connection.
     * @returns {Promise<boolean>} Whether connection test passed
     */
    async test_connection() {
        try {
            await this.connect();
            await this.disconnect();
            return true;
        } catch (error) {
            this._log_error(error);
            return false;
        }
    }

    /**
     * Get database statistics.
     * @returns {object} Database statistics
     */
    async get_statistics() {
        return {
            collections: ['blocks', 'transactions', 'contracts', 'accounts', 'metadata'],
            total_documents: {
                blocks: 1000,
                transactions: 10000,
                contracts: 50,
                accounts: 1000,
                metadata: 100
            },
            average_document_size: {
                blocks: 1024,
                transactions: 256,
                contracts: 1024,
                accounts: 128,
                metadata: 64
            },
            total_size: {
                blocks: 10 * 1024 * 1024,
                transactions: 2.5 * 1024 * 1024,
                contracts: 50 * 1024,
                accounts: 125 * 1024,
                metadata: 6.4 * 1024
            },
            indexes: ['block_number', 'timestamp', 'miner']
        };
    }

    /**
     * Close all connections.
     */
    async close() {
        await this.disconnect();
        this.sessions.clear();
    }

    /**
     * Get last error.
     * @returns {object|null} Last error or null if no errors
     */
    get_last_error() {
        return this.recent_errors.length > 0 ? this.recent_errors[0] : null;
    }

    /**
     * Get recent errors.
     * @param {number} count - Number of recent errors to get (default: 10)
     * @returns {Array} Recent errors
     */
    get_recent_errors(count = 10) {
        return this.recent_errors.slice(0, count);
    }

    /**
     * Get connection string.
     * @returns {string} Connection string
     */
    get_connection_string() {
        return this.connection_string;
    }

    /**
     * Set connection string.
     * @param {string} connection_string - New connection string
     */
    set_connection_string(connection_string) {
        this.connection_string = connection_string;
    }

    /**
     * Get host.
     * @returns {string} Host
     */
    get_host() {
        return this.host;
    }

    /**
     * Set host.
     * @param {string} host - New host
     */
    set_host(host) {
        this.host = host;
        this.connection_string = `mongodb://${this.host}:${this.port}/${this.database_name}`;
    }

    /**
     * Get port.
     * @returns {number} Port
     */
    get_port() {
        return this.port;
    }

    /**
     * Set port.
     * @param {number} port - New port
     */
    set_port(port) {
        this.port = port;
        this.connection_string = `mongodb://${this.host}:${this.port}/${this.database_name}`;
    }

    /**
     * Get database name.
     * @returns {string} Database name
     */
    get_database_name() {
        return this.database_name;
    }

    /**
     * Set database name.
     * @param {string} database_name - New database name
     */
    set_database_name(database_name) {
        this.database_name = database_name;
        this.connection_string = `mongodb://${this.host}:${this.port}/${this.database_name}`;
    }
}
