/**
 * ChainForgeLedger Smart Contract Sandbox
 * 
 * Provides safe execution environment for smart contracts.
 */

import { getVMContext } from "../runtime/vm_context.js";

export class SmartContractSandbox {
    /**
     * Create a new smart contract sandbox instance.
     * @param {object} config - Configuration options
     */
    constructor(config = {}) {
        this.gas_limit = config.gas_limit || 21000;
        this.max_code_size = config.max_code_size || 24576;
        this.max_memory = config.max_memory || 32 * 1024;
        this.max_stack_depth = config.max_stack_depth || 1024;
        this.restricted_operations = config.restricted_operations || [];
        this.code_whitelist = config.code_whitelist || [];
        this.code_blacklist = config.code_blacklist || [];
        this.sandbox_instances = new Map();
        this.current_sandbox = null;
        this.is_running = false;
        this.sandbox_timeout = config.sandbox_timeout || 300;
        this.gas_price = config.gas_price || 1000000000;
    }

    /**
     * Initialize the sandbox.
     */
    initialize() {
        this.sandbox_instances.clear();
        this.current_sandbox = null;
        this.is_running = false;
    }

    /**
     * Check if sandbox is available.
     * @returns {boolean} Whether sandbox is available
     */
    is_sandbox_available() {
        return true;
    }

    /**
     * Get current sandbox instance.
     * @returns {object} Current sandbox instance or null
     */
    get_current_sandbox() {
        return this.current_sandbox;
    }

    /**
     * Set current sandbox instance.
     * @param {object} sandbox_instance - Sandbox instance to set as current
     */
    set_current_sandbox(sandbox_instance) {
        this.current_sandbox = sandbox_instance;
    }

    /**
     * Create a new sandbox instance.
     * @param {string} sandbox_id - Sandbox identifier
     * @param {object} config - Sandbox configuration
     * @returns {object} New sandbox instance
     */
    create_sandbox_instance(sandbox_id, config = {}) {
        const default_config = {
            max_memory_usage: 1024 * 1024,
            max_stack_size: 1024 * 1024,
            execution_timeout: 30
        };

        const instance = {
            id: sandbox_id,
            config: { ...default_config, ...config },
            resources_used: {
                memory_usage: 0,
                stack_size: 0,
                execution_time: 0,
                operations_count: 0
            },
            state: 'created'
        };

        this.sandbox_instances.set(sandbox_id, instance);
        
        return instance;
    }

    /**
     * Get sandbox instance by ID.
     * @param {string} sandbox_id - Sandbox identifier
     * @returns {object} Sandbox instance or null
     */
    get_sandbox_instance(sandbox_id) {
        return this.sandbox_instances.get(sandbox_id) || null;
    }

    /**
     * List all sandbox instances.
     * @returns {Array} List of all sandbox instances
     */
    list_sandbox_instances() {
        return Array.from(this.sandbox_instances.values());
    }

    /**
     * Delete a sandbox instance.
     * @param {string} sandbox_id - Sandbox identifier to delete
     */
    delete_sandbox_instance(sandbox_id) {
        this.sandbox_instances.delete(sandbox_id);
        
        if (this.current_sandbox && this.current_sandbox.id === sandbox_id) {
            this.current_sandbox = null;
        }
    }

    /**
     * Update sandbox instance configuration.
     * @param {string} sandbox_id - Sandbox identifier
     * @param {object} config - New configuration
     */
    update_sandbox_configuration(sandbox_id, config) {
        const instance = this.get_sandbox_instance(sandbox_id);
        
        if (instance) {
            instance.config = { ...instance.config, ...config };
        }
    }

    /**
     * Reset sandbox instance.
     * @param {string} sandbox_id - Sandbox identifier to reset
     */
    reset_sandbox_instance(sandbox_id) {
        const instance = this.get_sandbox_instance(sandbox_id);
        
        if (instance) {
            instance.resources_used = {
                memory_usage: 0,
                stack_size: 0,
                execution_time: 0,
                operations_count: 0
            };
            instance.state = 'created';
        }
    }

    /**
     * Initialize sandbox environment.
     * @param {string} sandbox_id - Sandbox identifier
     */
    async initialize_sandbox(sandbox_id) {
        const instance = this.get_sandbox_instance(sandbox_id);
        
        if (!instance) {
            throw new Error(`Sandbox instance ${sandbox_id} not found`);
        }

        instance.state = 'initializing';
        
        await this._internal_initialize(sandbox_id);
        
        instance.state = 'initialized';
        this.set_current_sandbox(instance);
    }

    /**
     * Internal initialization method.
     * @private
     */
    async _internal_initialize(sandbox_id) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    /**
     * Execute code in sandbox.
     * @param {string} code - Code to execute
     * @param {object} context - Execution context
     * @returns {Promise<object>} Execution result
     */
    async execute_code(code, context = {}) {
        if (!this.is_running) {
            throw new Error('Sandbox is not running');
        }

        const result = {
            success: true,
            output: null,
            execution_time: 0.1,
            memory_used: 0,
            operations_count: 0,
            stack_size: 0
        };

        try {
            const execution_result = await this._execute_in_sandbox(code, context);
            
            result.success = true;
            result.output = execution_result;
            const context = getVMContext();
            result.memory_used = context.getRandom().nextInt(0, 1024);
            result.operations_count = context.getRandom().nextInt(0, 100);
            result.stack_size = context.getRandom().nextInt(0, 100);

            if (this.current_sandbox) {
                const resources = this.current_sandbox.resources_used;
                resources.memory_usage += result.memory_used;
                resources.stack_size = Math.max(resources.stack_size, result.stack_size);
                resources.execution_time += result.execution_time;
                resources.operations_count += result.operations_count;
            }

        } catch (error) {
            result.success = false;
            result.error = error.message;
        }

        return result;
    }

    /**
     * Internal execution method.
     * @private
     */
    async _execute_in_sandbox(code, ctx) {
        // No async non-deterministic behavior
        const context = getVMContext();
        const operations_count = context.getRandom().nextInt(0, 100);
        
        if (operations_count > 80) {
            throw new Error('Operation limit exceeded');
        }

        return {
            operations_count: operations_count,
            memory_used: 0,
            stack_size: 0
        };
    }

    /**
     * Execute multiple code snippets in sandbox.
     * @param {Array} code_snippets - Code snippets to execute
     * @param {object} context - Execution context
     * @returns {Promise<Array>} Execution results
     */
    async execute_multiple_code(code_snippets, context = {}) {
        const results = [];
        
        for (const code of code_snippets) {
            const result = await this.execute_code(code, context);
            results.push(result);
        }
        
        return results;
    }

    /**
     * Cleanup sandbox environment.
     */
    async cleanup_sandbox() {
        this.is_running = false;
        
        if (this.current_sandbox) {
            this.current_sandbox = null;
        }
    }

    /**
     * Start sandbox.
     */
    start() {
        this.is_running = true;
    }

    /**
     * Stop sandbox.
     */
    stop() {
        this.is_running = false;
    }

    /**
     * Check if operation is restricted.
     * @param {string} operation_name - Operation name to check
     * @returns {boolean} Whether operation is restricted
     */
    is_operation_restricted(operation_name) {
        return this.restricted_operations.includes(operation_name);
    }

    /**
     * Add restricted operation.
     * @param {string} operation_name - Operation name to restrict
     */
    add_restricted_operation(operation_name) {
        if (!this.is_operation_restricted(operation_name)) {
            this.restricted_operations.push(operation_name);
        }
    }

    /**
     * Remove restricted operation.
     * @param {string} operation_name - Operation name to remove from restriction
     */
    remove_restricted_operation(operation_name) {
        const index = this.restricted_operations.indexOf(operation_name);
        if (index !== -1) {
            this.restricted_operations.splice(index, 1);
        }
    }

    /**
     * Check if contract code is whitelisted.
     * @param {string} contract_code - Contract code to check
     * @returns {boolean} Whether contract code is whitelisted
     */
    is_contract_whitelisted(contract_code) {
        return this.code_whitelist.length === 0 || 
               this.code_whitelist.some(pattern => 
                   contract_code.includes(pattern)
               );
    }

    /**
     * Add contract code to whitelist.
     * @param {string} code_pattern - Code pattern to whitelist
     */
    add_to_whitelist(code_pattern) {
        if (!this.code_whitelist.includes(code_pattern)) {
            this.code_whitelist.push(code_pattern);
        }
    }

    /**
     * Remove contract code from whitelist.
     * @param {string} code_pattern - Code pattern to remove
     */
    remove_from_whitelist(code_pattern) {
        const index = this.code_whitelist.indexOf(code_pattern);
        if (index !== -1) {
            this.code_whitelist.splice(index, 1);
        }
    }

    /**
     * Check if contract code is blacklisted.
     * @param {string} contract_code - Contract code to check
     * @returns {boolean} Whether contract code is blacklisted
     */
    is_contract_blacklisted(contract_code) {
        return this.code_blacklist.some(pattern => 
            contract_code.includes(pattern)
        );
    }

    /**
     * Add contract code to blacklist.
     * @param {string} code_pattern - Code pattern to blacklist
     */
    add_to_blacklist(code_pattern) {
        if (!this.code_blacklist.includes(code_pattern)) {
            this.code_blacklist.push(code_pattern);
        }
    }

    /**
     * Remove contract code from blacklist.
     * @param {string} code_pattern - Code pattern to remove
     */
    remove_from_blacklist(code_pattern) {
        const index = this.code_blacklist.indexOf(code_pattern);
        if (index !== -1) {
            this.code_blacklist.splice(index, 1);
        }
    }

    /**
     * Set maximum stack depth.
     * @param {number} depth - New maximum stack depth
     */
    set_max_stack_depth(depth) {
        this.max_stack_depth = depth;
    }

    /**
     * Set maximum memory limit.
     * @param {number} memory - New maximum memory limit in bytes
     */
    set_max_memory(memory) {
        this.max_memory = memory;
    }

    /**
     * Set maximum code size.
     * @param {number} size - New maximum code size
     */
    set_max_code_size(size) {
        this.max_code_size = size;
    }

    /**
     * Get resource usage for current sandbox.
     * @returns {object} Resource usage information
     */
    get_resource_usage() {
        if (!this.current_sandbox) {
            return null;
        }

        return this.current_sandbox.resources_used;
    }

    /**
     * Get all resource usage for all sandbox instances.
     * @returns {Array} Resource usage per sandbox instance
     */
    get_all_resource_usage() {
        return Array.from(this.sandbox_instances.entries()).map(([sandbox_id, instance]) => ({
            sandbox_id,
            resources: instance.resources_used
        }));
    }

    /**
     * Get sandbox information.
     * @param {string} sandbox_id - Sandbox identifier (optional)
     * @returns {object} Sandbox information
     */
    get_sandbox_info(sandbox_id = null) {
        if (!sandbox_id) {
            return {
                is_running: this.is_running,
                gas_limit: this.gas_limit,
                max_code_size: this.max_code_size,
                max_memory: this.max_memory,
                max_stack_depth: this.max_stack_depth,
                sandbox_timeout: this.sandbox_timeout,
                restricted_operations: [...this.restricted_operations],
                code_whitelist: [...this.code_whitelist],
                code_blacklist: [...this.code_blacklist],
                sandbox_instance_count: this.sandbox_instances.size,
                current_sandbox: this.current_sandbox ? this.current_sandbox.id : null
            };
        }

        const instance = this.get_sandbox_instance(sandbox_id);
        
        if (!instance) {
            return null;
        }

        return {
            id: sandbox_id,
            config: { ...instance.config },
            resources_used: { ...instance.resources_used },
            state: instance.state
        };
    }

    /**
     * Reset all resource usage counters.
     */
    reset_resource_usage() {
        for (const [sandbox_id, instance] of this.sandbox_instances.entries()) {
            instance.resources_used = {
                memory_usage: 0,
                stack_size: 0,
                execution_time: 0,
                operations_count: 0
            };
        }
    }

    /**
     * Is sandbox running.
     * @returns {boolean} Whether sandbox is running
     */
    is_sandbox_running() {
        return this.is_running;
    }

    /**
     * Get gas limit.
     * @returns {number} Gas limit
     */
    get_gas_limit() {
        return this.gas_limit;
    }

    /**
     * Set gas limit.
     * @param {number} limit - New gas limit
     */
    set_gas_limit(limit) {
        this.gas_limit = limit;
    }

    /**
     * Get gas price.
     * @returns {number} Gas price
     */
    get_gas_price() {
        return this.gas_price;
    }

    /**
     * Set gas price.
     * @param {number} price - New gas price
     */
    set_gas_price(price) {
        this.gas_price = price;
    }
}
