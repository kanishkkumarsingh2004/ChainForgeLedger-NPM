/**
 * ChainForgeLedger Peer Module
 * 
 * Implements peer-to-peer network functionality.
 */

export class Peer {
    /**
     * Create a new peer instance.
     * @param {string} node_id - Node ID
     * @param {string} address - Peer address
     * @param {number} port - Port number
     * @param {string} peer_address - Peer address
     */
    constructor(node_id, address, port, peer_address) {
        this.node_id = node_id;
        this.address = address;
        this.port = port;
        this.peer_address = peer_address;
        this.is_connected = false;
        this.last_checked_time = Date.now() / 1000;
        this.connection_attempts = 0;
        this.last_failure_reason = null;
        this.stats = {
            latency: 0,
            connection_time: 0,
            last_seen: Date.now() / 1000
        };
    }

    /**
     * Get peer information.
     * @returns {object} Peer info
     */
    get_info() {
        return {
            node_id: this.node_id,
            address: this.address,
            port: this.port,
            peer_address: this.peer_address,
            is_connected: this.is_connected,
            last_checked_time: this.last_checked_time,
            connection_attempts: this.connection_attempts,
            last_failure_reason: this.last_failure_reason,
            stats: this.stats
        };
    }

    /**
     * Check if peer is connected.
     * @returns {boolean} Whether peer is connected
     */
    is_connected_peer() {
        return this.is_connected;
    }

    /**
     * Update connected status.
     * @param {boolean} connected - New connected status
     */
    update_connected_status(connected) {
        this.is_connected = connected;
    }

    /**
     * Update connection attempt count.
     * @param {number} attempts - Number of attempts
     */
    update_connection_attempts(attempts) {
        this.connection_attempts = attempts;
    }

    /**
     * Get connection attempt count.
     * @returns {number} Connection attempts
     */
    get_connection_attempts() {
        return this.connection_attempts;
    }

    /**
     * Check if peer has been connected in the last hour.
     * @returns {boolean} Whether peer has been active
     */
    is_active() {
        return Date.now() / 1000 - this.stats.last_seen < 3600;
    }

    /**
     * Get formatted address.
     * @returns {string} Formatted address
     */
    get_formatted_address() {
        if (this.port) {
            return `${this.address}:${this.port}`;
        }
        return this.address;
    }
}

export class PeerManager {
    /**
     * Create a new peer manager instance.
     */
    constructor() {
        this.peers = new Map();
        this.active_connections = new Map();
        this.stats = {
            total_peers: 0,
            active_peers: 0,
            connected_peers: 0,
            disconnected_peers: 0,
            failed_peers: 0,
            average_latency: 0,
            last_update_time: Date.now() / 1000,
            network_health: 0
        };
        this.connection_settings = {
            max_connections: 100,
            connection_timeout: 30,
            ping_interval: 10,
            max_attempts: 5
        };
        this.peer_discovery = {
            enabled: true,
            peer_discovery_interval: 60,
            peer_lookup_interval: 30,
            peer_recheck_interval: 600
        };
        this.peer_blacklist = new Set();
        this.peer_whitelist = new Set();
        this.connection_callbacks = {
            on_connect: null,
            on_disconnect: null
        };
    }

    /**
     * Initialize peer manager.
     */
    initialize() {
        this.stats.total_peers = 0;
        this.stats.active_peers = 0;
        this.stats.connected_peers = 0;
        this.stats.disconnected_peers = 0;
        this.stats.failed_peers = 0;
        this.stats.average_latency = 0;
        this.stats.last_update_time = Date.now() / 1000;
        this.stats.network_health = 0;
    }

    /**
     * Update network health.
     */
    update_network_health() {
        const active_count = this.get_active_connections();
        const total_count = this.get_total_peers();
        
        this.stats.network_health = total_count > 0 ? (active_count / total_count) * 100 : 0;
    }

    /**
     * Add a peer.
     * @param {Peer} peer - Peer instance
     * @returns {boolean} Whether peer was added successfully
     */
    add_peer(peer) {
        if (this.peers.has(peer.node_id)) {
            return false;
        }

        this.peers.set(peer.node_id, peer);
        this.stats.total_peers++;
        
        if (peer.is_connected) {
            this.stats.connected_peers++;
        } else {
            this.stats.disconnected_peers++;
        }

        return true;
    }

    /**
     * Remove a peer.
     * @param {string} node_id - Node ID
     * @returns {boolean} Whether peer was removed successfully
     */
    remove_peer(node_id) {
        const peer = this.peers.get(node_id);
        
        if (peer) {
            this.peers.delete(node_id);
            this.stats.total_peers--;
            
            if (peer.is_connected) {
                this.stats.connected_peers--;
                this.active_connections.delete(node_id);
            } else {
                this.stats.disconnected_peers--;
            }
            
            return true;
        }
        
        return false;
    }

    /**
     * Get a peer by node ID.
     * @param {string} node_id - Node ID
     * @returns {Peer} Peer instance or null
     */
    get_peer(node_id) {
        return this.peers.get(node_id) || null;
    }

    /**
     * Get all peers.
     * @returns {Array} List of all peers
     */
    get_all_peers() {
        return Array.from(this.peers.values());
    }

    /**
     * Get connected peers.
     * @returns {Array} List of connected peers
     */
    get_connected_peers() {
        return Array.from(this.peers.values())
            .filter(peer => peer.is_connected);
    }

    /**
     * Get disconnected peers.
     * @returns {Array} List of disconnected peers
     */
    get_disconnected_peers() {
        return Array.from(this.peers.values())
            .filter(peer => !peer.is_connected);
    }

    /**
     * Get active peer connections.
     * @returns {number} Number of active connections
     */
    get_active_connections() {
        return this.stats.connected_peers;
    }

    /**
     * Get total peer count.
     * @returns {number} Total number of peers
     */
    get_total_peers() {
        return this.stats.total_peers;
    }

    /**
     * Update peer statistics.
     */
    update_statistics() {
        const peers = this.get_all_peers();
        
        this.stats.connected_peers = this.get_connected_peers().length;
        this.stats.disconnected_peers = this.get_disconnected_peers().length;
        
        const active_peers = peers.filter(peer => peer.is_active());
        this.stats.active_peers = active_peers.length;
        
        const failed_peers = peers.filter(peer => peer.connection_attempts > 0 && !peer.is_connected);
        this.stats.failed_peers = failed_peers.length;
        
        const connected_peers = this.get_connected_peers();
        if (connected_peers.length > 0) {
            this.stats.average_latency = connected_peers.reduce((sum, peer) => sum + peer.stats.latency, 0) / connected_peers.length;
        } else {
            this.stats.average_latency = 0;
        }
        
        this.update_network_health();
    }

    /**
     * Check if peer is in blacklist.
     * @param {string} node_id - Node ID
     * @returns {boolean} Whether peer is blacklisted
     */
    is_blacklisted(node_id) {
        return this.peer_blacklist.has(node_id);
    }

    /**
     * Check if peer is in whitelist.
     * @param {string} node_id - Node ID
     * @returns {boolean} Whether peer is whitelisted
     */
    is_whitelisted(node_id) {
        return this.peer_whitelist.has(node_id);
    }

    /**
     * Update peer latency.
     * @param {string} node_id - Node ID
     * @param {number} latency - New latency
     */
    update_latency(node_id, latency) {
        const peer = this.peers.get(node_id);
        if (peer) {
            peer.stats.latency = latency;
        }
    }

    /**
     * Update peer's last seen time.
     * @param {string} node_id - Node ID
     */
    update_last_seen(node_id) {
        const peer = this.peers.get(node_id);
        if (peer) {
            peer.stats.last_seen = Date.now() / 1000;
        }
    }

    /**
     * Set on connect callback.
     * @param {function} callback - Callback function
     */
    set_on_connect(callback) {
        this.connection_callbacks.on_connect = callback;
    }

    /**
     * Set on disconnect callback.
     * @param {function} callback - Callback function
     */
    set_on_disconnect(callback) {
        this.connection_callbacks.on_disconnect = callback;
    }

    /**
     * Attempt to connect to a peer.
     * @param {string} node_id - Node ID
     */
    async connect_peer(node_id) {
        const peer = this.peers.get(node_id);
        
        if (!peer || peer.is_connected) {
            return false;
        }

        try {
            await this._establish_connection(peer);
            return true;
        } catch (error) {
            peer.last_failure_reason = error.message;
            peer.connection_attempts++;
            return false;
        }
    }

    /**
     * Establish a connection to a peer.
     * @private
     */
    async _establish_connection(peer) {
        // In a real implementation, this would establish a network connection
        await new Promise(resolve => setTimeout(resolve, 100));
        
        peer.is_connected = true;
        peer.last_checked_time = Date.now() / 1000;
        this.active_connections.set(peer.node_id, {});
        
        if (this.connection_callbacks.on_connect) {
            this.connection_callbacks.on_connect(peer.node_id);
        }
    }

    /**
     * Disconnect from a peer.
     * @param {string} node_id - Node ID
     */
    async disconnect_peer(node_id) {
        const peer = this.peers.get(node_id);
        
        if (!peer || !peer.is_connected) {
            return false;
        }

        peer.is_connected = false;
        peer.last_checked_time = Date.now() / 1000;
        this.active_connections.delete(node_id);
        
        if (this.connection_callbacks.on_disconnect) {
            this.connection_callbacks.on_disconnect(node_id);
        }

        return true;
    }

    /**
     * Start peer discovery.
     */
    start_peer_discovery() {
        if (!this.peer_discovery.enabled) {
            return;
        }

        this._discover_peers();
        this._periodic_peer_discovery();
    }

    /**
     * Discover new peers.
     * @private
     */
    async _discover_peers() {
        // In a real implementation, this would discover peers using various methods
        console.log('Discovering peers...');
    }

    /**
     * Periodically discover peers.
     * @private
     */
    _periodic_peer_discovery() {
        setInterval(() => {
            if (this.peer_discovery.enabled) {
                this._discover_peers();
            }
        }, this.peer_discovery.peer_discovery_interval * 1000);
    }

    /**
     * Ping all peers to check connectivity.
     */
    async ping_peers() {
        const peers = this.get_all_peers();
        
        for (const peer of peers) {
            try {
                const startTime = Date.now();
                await this._send_ping(peer);
                const endTime = Date.now();
                
                peer.stats.latency = endTime - startTime;
                peer.stats.last_seen = Date.now() / 1000;
                
                if (!peer.is_connected) {
                    peer.is_connected = true;
                    this.active_connections.set(peer.node_id, {});
                }
            } catch (error) {
                peer.last_failure_reason = error.message;
                peer.is_connected = false;
                this.active_connections.delete(peer.node_id);
            }
        }
    }

    /**
     * Send a ping to a peer.
     * @private
     */
    async _send_ping(peer) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() < 0.95) {
                    resolve();
                } else {
                    reject(new Error('Ping failed'));
                }
            }, 100);
        });
    }

    /**
     * Run a peer connectivity check.
     */
    async run_connectivity_check() {
        await this.ping_peers();
        this.update_statistics();
    }
}
