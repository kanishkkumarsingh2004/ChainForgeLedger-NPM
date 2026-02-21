/**
 * ChainForgeLedger Cross-Chain Bridge
 * 
 * Implements cross-chain communication and asset transfer functionality.
 */

import { sha256_hash } from '../crypto/hashing.js';
import { Signature } from '../crypto/signature.js';

export class CrossChainBridge {
    /**
     * Cross-chain bridge implementation for asset transfers between blockchains.
     * 
     * @param {string} source_chain - Source blockchain identifier
     * @param {string} destination_chain - Destination blockchain identifier
     * @param {number} relayer_threshold - Number of relayer signatures required
     * @param {number} fee_per_transfer - Fixed bridge fee
     * @param {number} min_transfer_amount - Minimum transfer amount
     * @param {number} max_transfer_amount - Maximum transfer amount
     * @param {number} transfer_timeout - Transfer timeout period
     */
    constructor(source_chain, destination_chain, relayer_threshold = 2, fee_per_transfer = 0, min_transfer_amount = 1, max_transfer_amount = 10000, transfer_timeout = 86400) {
        this.bridge_id = this._generate_bridge_id(source_chain, destination_chain);
        this.source_chain = source_chain;
        this.destination_chain = destination_chain;
        this.bridge_contract_address = null;
        this.counterpart_contract_address = null;
        this.relayers = [];
        this.relayer_threshold = relayer_threshold;
        this.pending_transfers = {};
        this.completed_transfers = {};
        this.failed_transfers = [];
        this.fee_per_transfer = fee_per_transfer;
        this.min_transfer_amount = min_transfer_amount;
        this.max_transfer_amount = max_transfer_amount;
        this.transfer_timeout = transfer_timeout;
        this.transfer_history = [];
    }

    _generate_bridge_id(source, destination) {
        return sha256_hash(`bridge:${source}:${destination}:${Date.now()}`).slice(0, 16);
    }

    add_relayer(relayer_address) {
        if (!this.relayers.includes(relayer_address)) {
            this.relayers.push(relayer_address);
        }
    }

    remove_relayer(relayer_address) {
        const index = this.relayers.indexOf(relayer_address);
        if (index !== -1) {
            this.relayers.splice(index, 1);
        }
    }

    set_bridge_contract(address) {
        this.bridge_contract_address = address;
    }

    set_counterpart_contract(address) {
        this.counterpart_contract_address = address;
    }

    initiate_transfer(sender_address, recipient_address, amount, token = "native") {
        if (amount < this.min_transfer_amount || amount > this.max_transfer_amount) {
            throw new Error("Transfer amount out of range");
        }

        if (this.relayers.length < this.relayer_threshold) {
            throw new Error("Not enough relayers available");
        }

        const transfer_id = this._generate_transfer_id(sender_address, recipient_address, amount);
        
        const transfer = {
            transfer_id,
            sender_address,
            recipient_address,
            amount,
            token,
            fee: this.fee_per_transfer,
            status: 'initiated',
            source_chain: this.source_chain,
            destination_chain: this.destination_chain,
            initiation_time: Date.now() / 1000,
            relayer_confirmations: [],
            completion_time: null,
            failure_reason: null
        };

        this.pending_transfers[transfer_id] = transfer;
        this.transfer_history.push(transfer);

        return transfer_id;
    }

    confirm_transfer(relayer_address, transfer_id, signature) {
        if (!this.pending_transfers[transfer_id]) {
            throw new Error("Transfer not found");
        }

        if (!this.relayers.includes(relayer_address)) {
            throw new Error("Not an authorized relayer");
        }

        const transfer = this.pending_transfers[transfer_id];

        if (transfer.relayer_confirmations.some(c => c.relayer_address === relayer_address)) {
            throw new Error("Relayer has already confirmed");
        }

        if (!this._verify_relayer_signature(relayer_address, transfer_id, signature)) {
            throw new Error("Invalid signature");
        }

        transfer.relayer_confirmations.push({
            relayer_address,
            signature,
            timestamp: Date.now() / 1000
        });

        if (transfer.relayer_confirmations.length >= this.relayer_threshold) {
            this._complete_transfer(transfer_id);
        }

        return true;
    }

    _verify_relayer_signature(relayer_address, transfer_id, signature) {
        return Signature.verify(`${transfer_id}:${relayer_address}`, signature, relayer_address);
    }

    _complete_transfer(transfer_id) {
        const transfer = this.pending_transfers[transfer_id];
        transfer.status = 'completed';
        transfer.completion_time = Date.now() / 1000;

        delete this.pending_transfers[transfer_id];
        this.completed_transfers[transfer_id] = transfer;
    }

    fail_transfer(transfer_id, reason) {
        if (this.pending_transfers[transfer_id]) {
            const transfer = this.pending_transfers[transfer_id];
            transfer.status = 'failed';
            transfer.failure_reason = reason;
            transfer.completion_time = Date.now() / 1000;

            this.failed_transfers.push(transfer);
            delete this.pending_transfers[transfer_id];
        } else {
            const transfer = this.transfer_history.find(t => t.transfer_id === transfer_id);
            if (transfer) {
                transfer.status = 'failed';
                transfer.failure_reason = reason;
                transfer.completion_time = Date.now() / 1000;

                this.failed_transfers.push(transfer);
            }
        }
    }

    process_transfer_timeout() {
        const current_time = Date.now() / 1000;
        const transfers_to_timeout = [];

        for (const [transfer_id, transfer] of Object.entries(this.pending_transfers)) {
            if (current_time - transfer.initiation_time > this.transfer_timeout) {
                transfers_to_timeout.push(transfer_id);
            }
        }

        for (const transfer_id of transfers_to_timeout) {
            this.fail_transfer(transfer_id, "Transfer timed out");
        }
    }

    _generate_transfer_id(sender, recipient, amount) {
        return sha256_hash(`${sender}:${recipient}:${amount}:${Date.now()}`).slice(0, 24);
    }

    get_transfer_status(transfer_id) {
        let transfer;
        if (this.pending_transfers[transfer_id]) {
            transfer = this.pending_transfers[transfer_id];
        } else if (this.completed_transfers[transfer_id]) {
            transfer = this.completed_transfers[transfer_id];
        } else {
            transfer = this.failed_transfers.find(t => t.transfer_id === transfer_id);
        }

        if (!transfer) {
            throw new Error("Transfer not found");
        }

        return {
            transfer_id: transfer.transfer_id,
            status: transfer.status,
            sender_address: transfer.sender_address,
            recipient_address: transfer.recipient_address,
            amount: transfer.amount,
            token: transfer.token,
            fee: transfer.fee,
            initiation_time: transfer.initiation_time,
            completion_time: transfer.completion_time,
            relayer_confirmations: transfer.relayer_confirmations.length,
            relayer_threshold: this.relayer_threshold,
            failure_reason: transfer.failure_reason || null
        };
    }

    get_transfer_history(sender_address = null, recipient_address = null, start_time = null, end_time = null, status = null) {
        let transfers = [...this.transfer_history];

        if (sender_address) {
            transfers = transfers.filter(t => t.sender_address === sender_address);
        }

        if (recipient_address) {
            transfers = transfers.filter(t => t.recipient_address === recipient_address);
        }

        if (start_time) {
            transfers = transfers.filter(t => t.initiation_time >= start_time);
        }

        if (end_time) {
            transfers = transfers.filter(t => t.initiation_time <= end_time);
        }

        if (status) {
            transfers = transfers.filter(t => t.status === status);
        }

        return transfers.sort((a, b) => b.initiation_time - a.initiation_time);
    }

    get_bridge_info() {
        return {
            bridge_id: this.bridge_id,
            source_chain: this.source_chain,
            destination_chain: this.destination_chain,
            bridge_contract_address: this.bridge_contract_address,
            counterpart_contract_address: this.counterpart_contract_address,
            relayer_count: this.relayers.length,
            relayer_threshold: this.relayer_threshold,
            fee_per_transfer: this.fee_per_transfer,
            min_transfer_amount: this.min_transfer_amount,
            max_transfer_amount: this.max_transfer_amount,
            transfer_timeout: this.transfer_timeout,
            pending_transfers: Object.keys(this.pending_transfers).length,
            completed_transfers: Object.keys(this.completed_transfers).length,
            failed_transfers: this.failed_transfers.length
        };
    }

    get_bridge_stats() {
        const total_transfers = this.transfer_history.length;
        const completed_transfers = Object.keys(this.completed_transfers).length;
        const pending_transfers = Object.keys(this.pending_transfers).length;
        const failed_transfers = this.failed_transfers.length;

        const total_amount = this.transfer_history.reduce((sum, t) => sum + t.amount, 0);
        const completed_amount = Object.values(this.completed_transfers).reduce((sum, t) => sum + t.amount, 0);
        const total_fees = this.transfer_history.reduce((sum, t) => sum + t.fee, 0);

        const success_rate = total_transfers > 0 ? (completed_transfers / total_transfers) * 100 : 0;

        let avg_transfer_time = 0;
        if (completed_transfers > 0) {
            const transfer_times = Object.values(this.completed_transfers).map(t => t.completion_time - t.initiation_time);
            avg_transfer_time = transfer_times.reduce((sum, t) => sum + t, 0) / completed_transfers;
        }

        return {
            total_transfers,
            completed_transfers,
            pending_transfers,
            failed_transfers,
            success_rate,
            total_amount,
            completed_amount,
            total_fees,
            avg_transfer_amount: total_transfers > 0 ? total_amount / total_transfers : 0,
            avg_transfer_time,
            transfer_throughput: total_transfers / 30
        };
    }

    set_fee_per_transfer(fee) {
        if (fee < 0) {
            throw new Error("Fee must be non-negative");
        }

        this.fee_per_transfer = fee;
    }

    set_transfer_limits(min_amount, max_amount) {
        if (min_amount <= 0 || max_amount < min_amount) {
            throw new Error("Invalid transfer limits");
        }

        this.min_transfer_amount = min_amount;
        this.max_transfer_amount = max_amount;
    }

    set_relayer_threshold(threshold) {
        if (threshold < 1 || threshold > this.relayers.length) {
            throw new Error("Invalid relayer threshold");
        }

        this.relayer_threshold = threshold;
    }

    toString() {
        const info = this.get_bridge_info();
        const stats = this.get_bridge_stats();

        return (
            `Cross-Chain Bridge ${this.bridge_id}\n` +
            `==========================\n` +
            `Chain Pair: ${this.source_chain} → ${this.destination_chain}\n` +
            `Bridge Contract: ${this.bridge_contract_address || 'Not deployed'}\n` +
            `Counterpart Contract: ${this.counterpart_contract_address || 'Not deployed'}\n` +
            `Relayers: ${info.relayer_count} (Threshold: ${info.relayer_threshold})\n` +
            `Fee: ${this.fee_per_transfer}\n` +
            `Transfer Limits: ${this.min_transfer_amount} - ${this.max_transfer_amount}\n` +
            `Timeout: ${this.transfer_timeout} seconds\n` +
            `\nStatistics:\n` +
            `Total Transfers: ${stats.total_transfers}\n` +
            `Completed: ${stats.completed_transfers} (${stats.success_rate.toFixed(1)}%)\n` +
            `Pending: ${stats.pending_transfers}\n` +
            `Failed: ${stats.failed_transfers}\n` +
            `Total Volume: ${stats.total_amount}\n` +
            `Total Fees: ${stats.total_fees}\n` +
            `Avg Transfer Amount: ${stats.avg_transfer_amount.toFixed(2)}\n` +
            `Avg Transfer Time: ${stats.avg_transfer_time.toFixed(0)} sec`
        );
    }
}

export class BridgeNetwork {
    constructor() {
        this.bridges = {};
    }

    create_bridge(source_chain, destination_chain, relayer_threshold = 2, fee_per_transfer = 0, min_transfer_amount = 1, max_transfer_amount = 10000, transfer_timeout = 86400) {
        const bridge = new CrossChainBridge(
            source_chain,
            destination_chain,
            relayer_threshold,
            fee_per_transfer,
            min_transfer_amount,
            max_transfer_amount,
            transfer_timeout
        );

        this.bridges[bridge.bridge_id] = bridge;
        return bridge;
    }

    get_bridge(bridge_id) {
        return this.bridges[bridge_id];
    }

    remove_bridge(bridge_id) {
        delete this.bridges[bridge_id];
    }

    get_bridges_by_chain(chain_id) {
        return Object.values(this.bridges).filter(bridge => 
            bridge.source_chain === chain_id || bridge.destination_chain === chain_id
        );
    }

    get_all_bridges() {
        return Object.values(this.bridges);
    }
}
