/**
 * ChainForgeLedger Node Module
 * 
 * Implements network node functionality for blockchain communication.
 */

export class Node {
    /**
     * Create a new node instance.
     * @param {string} node_id - Node identifier
     * @param {string} public_key - Node public key
     * @param {string} address - Node address
     * @param {string} role - Node role (validator, miner, full_node, etc.)
     */
    constructor(node_id, public_key, address, role = 'full_node') {
        this.node_id = node_id;
        this.public_key = public_key;
        this.address = address;
        this.role = role;
        this.status = 'active';
        this.peers = new Set();
        this.connections = new Map();
        this.last_seen = Date.now() / 1000;
        this.latency = 0;
        this.is_active = true;
        this.blockchain = null;
        this.transaction_pool = null;
        this.validator_manager = null;
        this.vote_power = 0;
        this.participation_score = 0;
        this.stats = {
            connections: 0,
            blocks_produced: 0,
            blocks_validated: 0,
            transactions_validated: 0,
            votes_received: 0
        };
        this.stake_amount = 0;
        this.is_bootstrapped = false;
        this.bootstrapping_completed = false;
        this.blockchain_data = null;
    }

    /**
     * Initialize the node.
     */
    initialize() {
        this.blockchain = null;
        this.transaction_pool = null;
        this.validator_manager = null;
        this.vote_power = 0;
        this.participation_score = 0;
        this.stats = {
            connections: 0,
            blocks_produced: 0,
            blocks_validated: 0,
            transactions_validated: 0,
            votes_received: 0
        };
        this.stake_amount = 0;
        this.is_bootstrapped = false;
        this.bootstrapping_completed = false;
    }

    /**
     * Update node status.
     * @param {string} status - New status (active, inactive, disconnected, etc.)
     */
    update_status(status) {
        this.status = status;
        this.is_active = status === 'active';
    }

    /**
     * Add a peer to the node.
     * @param {Node} peer - Peer node
     * @param {boolean} bidirectional - Whether to add bidirectionally
     */
    add_peer(peer, bidirectional = true) {
        if (!this.peers.has(peer.node_id)) {
            this.peers.add(peer.node_id);
            this.stats.connections++;
        }
        
        if (bidirectional && !peer.peers.has(this.node_id)) {
            peer.add_peer(this, false);
        }
    }

    /**
     * Remove a peer from the node.
     * @param {Node} peer - Peer node to remove
     * @param {boolean} bidirectional - Whether to remove bidirectionally
     */
    remove_peer(peer, bidirectional = true) {
        if (this.peers.has(peer.node_id)) {
            this.peers.delete(peer.node_id);
            this.stats.connections--;
        }
        
        if (bidirectional && peer.peers.has(this.node_id)) {
            peer.remove_peer(this, false);
        }
    }

    /**
     * Get all peers.
     * @returns {Array} List of peer node IDs
     */
    get_peers() {
        return Array.from(this.peers);
    }

    /**
     * Get peer count.
     * @returns {number} Number of peers
     */
    get_peer_count() {
        return this.peers.size;
    }

    /**
     * Check if peer exists.
     * @param {string} node_id - Node ID
     * @returns {boolean} Whether peer exists
     */
    has_peer(node_id) {
        return this.peers.has(node_id);
    }

    /**
     * Get network information.
     * @returns {object} Network info
     */
    get_network_info() {
        return {
            node_id: this.node_id,
            public_key: this.public_key,
            address: this.address,
            role: this.role,
            status: this.status,
            peer_count: this.get_peer_count(),
            peers: this.get_peers(),
            latency: this.latency,
            last_seen: this.last_seen
        };
    }

    /**
     * Get statistics.
     * @returns {object} Statistics
     */
    get_statistics() {
        return this.stats;
    }

    /**
     * Update last seen timestamp.
     * @param {number} timestamp - Timestamp
     */
    update_last_seen(timestamp) {
        this.last_seen = timestamp;
    }

    /**
     * Update latency.
     * @param {number} latency - New latency
     */
    update_latency(latency) {
        this.latency = latency;
    }

    /**
     * Mark block as produced.
     */
    mark_block_produced() {
        this.stats.blocks_produced++;
    }

    /**
     * Mark block as validated.
     */
    mark_block_validated() {
        this.stats.blocks_validated++;
    }

    /**
     * Mark transaction as validated.
     */
    mark_transaction_validated() {
        this.stats.transactions_validated++;
    }

    /**
     * Mark vote as received.
     */
    mark_vote_received() {
        this.stats.votes_received++;
    }

    /**
     * Send a message to a peer.
     * @param {string} peer_id - Peer node ID
     * @param {object} message - Message to send
     * @returns {Promise} Promise that resolves with the result
     */
    async send_message(peer_id, message) {
        // In a real implementation, this would use actual network communication
        return Promise.resolve({ success: true, peer_id, message });
    }

    /**
     * Broadcast a message to all peers.
     * @param {object} message - Message to broadcast
     * @returns {Promise} Promise that resolves when all messages are sent
     */
    async broadcast_message(message) {
        const promises = Array.from(this.peers).map(peer_id => 
            this.send_message(peer_id, message)
        );
        
        return Promise.all(promises);
    }

    /**
     * Handle incoming message.
     * @param {string} peer_id - Peer node ID
     * @param {object} message - Received message
     */
    async handle_message(peer_id, message) {
        // Message handling logic would be implemented here
        // For now, just log the message
        console.log(`Received message from ${peer_id}:`, message);
    }

    /**
     * Get blockchain data.
     * @returns {object} Blockchain data
     */
    get_blockchain_data() {
        return this.blockchain_data;
    }

    /**
     * Set blockchain data.
     * @param {object} blockchain_data - Blockchain data
     */
    set_blockchain_data(blockchain_data) {
        this.blockchain_data = blockchain_data;
    }

    /**
     * Set block producer count.
     * @param {number} count - Number of blocks produced
     */
    set_block_producer_count(count) {
        this.stats.blocks_produced = count;
    }

    /**
     * Set block validation count.
     * @param {number} count - Number of blocks validated
     */
    set_block_validation_count(count) {
        this.stats.blocks_validated = count;
    }

    /**
     * Set transaction validation count.
     * @param {number} count - Number of transactions validated
     */
    set_transaction_validation_count(count) {
        this.stats.transactions_validated = count;
    }

    /**
     * Set vote received count.
     * @param {number} count - Number of votes received
     */
    set_vote_received_count(count) {
        this.stats.votes_received = count;
    }

    /**
     * Start node.
     */
    start() {
        this.update_status('active');
        this.bootstrapping_completed = true;
    }

    /**
     * Stop node.
     */
    stop() {
        this.update_status('inactive');
    }

    /**
     * Restart node.
     */
    restart() {
        this.stop();
        this.initialize();
        this.start();
    }

    /**
     * Check if node is bootstrapped.
     * @returns {boolean} Whether node is bootstrapped
     */
    is_bootstrapped_node() {
        return this.is_bootstrapped;
    }

    /**
     * Set bootstrap status.
     * @param {boolean} bootstrapped - Bootstrap status
     */
    set_bootstrap_status(bootstrapped) {
        this.is_bootstrapped = bootstrapped;
    }

    /**
     * Check if bootstrapping is completed.
     * @returns {boolean} Whether bootstrapping is completed
     */
    is_bootstrapping_completed() {
        return this.bootstrapping_completed;
    }

    /**
     * Update stake amount.
     * @param {number} amount - New stake amount
     */
    update_stake_amount(amount) {
        this.stake_amount = amount;
    }

    /**
     * Get stake amount.
     * @returns {number} Stake amount
     */
    get_stake_amount() {
        return this.stake_amount;
    }
}

export class NodeManager {
    /**
     * Create a new node manager instance.
     */
    constructor() {
        this.nodes = new Map();
        this.node_count = 0;
        this.validator_nodes = new Set();
        this.full_nodes = new Set();
        this.miner_nodes = new Set();
        this.peer_to_node_map = new Map();
    }

    /**
     * Add a node to the network.
     * @param {Node} node - Node to add
     * @param {string} role - Node role
     */
    add_node(node, role) {
        this.nodes.set(node.node_id, node);
        this.node_count++;
        
        switch (role) {
            case 'validator':
                this.validator_nodes.add(node.node_id);
                break;
            case 'miner':
                this.miner_nodes.add(node.node_id);
                break;
            default:
                this.full_nodes.add(node.node_id);
        }
    }

    /**
     * Remove a node from the network.
     * @param {string} node_id - Node ID to remove
     */
    remove_node(node_id) {
        const node = this.nodes.get(node_id);
        
        if (node) {
            if (this.validator_nodes.has(node_id)) {
                this.validator_nodes.delete(node_id);
            } else if (this.miner_nodes.has(node_id)) {
                this.miner_nodes.delete(node_id);
            } else if (this.full_nodes.has(node_id)) {
                this.full_nodes.delete(node_id);
            }
            
            this.nodes.delete(node_id);
            this.node_count--;
        }
    }

    /**
     * Get a node by ID.
     * @param {string} node_id - Node ID
     * @returns {Node} Node instance
     */
    get_node(node_id) {
        return this.nodes.get(node_id);
    }

    /**
     * Get all nodes.
     * @returns {Array} List of all nodes
     */
    get_all_nodes() {
        return Array.from(this.nodes.values());
    }

    /**
     * Get validator nodes.
     * @returns {Array} List of validator nodes
     */
    get_validator_nodes() {
        return Array.from(this.validator_nodes).map(id => this.nodes.get(id));
    }

    /**
     * Get full nodes.
     * @returns {Array} List of full nodes
     */
    get_full_nodes() {
        return Array.from(this.full_nodes).map(id => this.nodes.get(id));
    }

    /**
     * Get miner nodes.
     * @returns {Array} List of miner nodes
     */
    get_miner_nodes() {
        return Array.from(this.miner_nodes).map(id => this.nodes.get(id));
    }

    /**
     * Get active nodes.
     * @returns {Array} List of active nodes
     */
    get_active_nodes() {
        return Array.from(this.nodes.values())
            .filter(node => node.is_active);
    }

    /**
     * Check if node exists.
     * @param {string} node_id - Node ID
     * @returns {boolean} Whether node exists
     */
    has_node(node_id) {
        return this.nodes.has(node_id);
    }

    /**
     * Start all nodes.
     */
    start_all_nodes() {
        this.nodes.forEach(node => node.start());
    }

    /**
     * Stop all nodes.
     */
    stop_all_nodes() {
        this.nodes.forEach(node => node.stop());
    }

    /**
     * Get network statistics.
     * @returns {object} Network statistics
     */
    get_statistics() {
        const total_nodes = this.node_count;
        const active_nodes = this.get_active_nodes().length;
        const validator_nodes = this.validator_nodes.size;
        const full_nodes = this.full_nodes.size;
        const miner_nodes = this.miner_nodes.size;

        const total_blocks_produced = Array.from(this.nodes.values())
            .reduce((sum, node) => sum + node.stats.blocks_produced, 0);

        const total_blocks_validated = Array.from(this.nodes.values())
            .reduce((sum, node) => sum + node.stats.blocks_validated, 0);

        const total_transactions_validated = Array.from(this.nodes.values())
            .reduce((sum, node) => sum + node.stats.transactions_validated, 0);

        const avg_peers_per_node = total_nodes > 0 
            ? Array.from(this.nodes.values())
                .reduce((sum, node) => sum + node.get_peer_count(), 0) / total_nodes
            : 0;

        return {
            total_nodes,
            active_nodes,
            validator_nodes,
            full_nodes,
            miner_nodes,
            total_blocks_produced,
            total_blocks_validated,
            total_transactions_validated,
            avg_peers_per_node: parseFloat(avg_peers_per_node.toFixed(2)),
            network_health: active_nodes / total_nodes * 100
        };
    }

    /**
     * Get node by address.
     * @param {string} address - Node address
     * @returns {Node} Node instance
     */
    get_node_by_address(address) {
        return Array.from(this.nodes.values())
            .find(node => node.address === address) || null;
    }

    /**
     * Get nodes by role.
     * @param {string} role - Node role
     * @returns {Array} List of nodes with the specified role
     */
    get_nodes_by_role(role) {
        switch (role) {
            case 'validator':
                return this.get_validator_nodes();
            case 'miner':
                return this.get_miner_nodes();
            case 'full_node':
                return this.get_full_nodes();
            default:
                return this.get_all_nodes();
        }
    }
}
