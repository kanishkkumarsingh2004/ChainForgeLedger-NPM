/**
 * ChainForgeLedger Voting Module
 * 
 * Implements voting system functionality for DAO governance.
 */

export class VotingSystem {
    /**
     * Create a new voting system instance.
     * @param {object} options - Voting system configuration
     */
    constructor(options = {}) {
        this.min_voting_period = options.min_voting_period || 7 * 24 * 60 * 60;
        this.max_voting_period = options.max_voting_period || 30 * 24 * 60 * 60;
        this.min_proposal_period = options.min_proposal_period || 24 * 60 * 60;
        this.max_proposal_period = options.max_proposal_period || 7 * 24 * 60 * 60;
        this.quorum_percentage = options.quorum_percentage || 20;
        this.proposal_threshold = options.proposal_threshold || 10000;
        this.voting_methods = options.voting_methods || ['for', 'against', 'abstain'];
        this.vote_strategies = options.vote_strategies || ['simple', 'weighted'];
        this.systems = new Map();
        this.systems.set('chainforgeledger', {
            min_voting_period: 7 * 24 * 60 * 60,
            quorum_percentage: 20,
            proposal_threshold: 10000,
            voting_methods: ['for', 'against', 'abstain'],
            vote_strategies: ['simple', 'weighted'],
            proposal_count: 0,
            proposals: new Map()
        });
    }

    /**
     * Create a proposal with specified parameters.
     * @param {string} system - System name (chainforgeledger, etc.)
     * @param {string} content - Proposal content
     * @param {string} creator - Creator address
     * @param {string} voting_strategy - Voting strategy (simple, weighted)
     * @returns {string} Proposal ID
     */
    create_proposal(system, content, creator, voting_strategy) {
        const system_config = this._get_system_config(system);
        
        const proposal_id = `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        system_config.proposals.set(proposal_id, {
            id: proposal_id,
            content,
            creator,
            voting_strategy,
            status: 'active',
            created_at: new Date(),
            vote_start_time: new Date(Date.now() + system_config.min_proposal_period * 1000),
            vote_end_time: new Date(Date.now() + system_config.min_proposal_period * 1000 + system_config.min_voting_period * 1000),
            votes: new Map(),
            vote_count: new Map(),
            total_voting_power: 0,
            results: null
        });

        system_config.proposal_count++;
        return proposal_id;
    }

    /**
     * Get system configuration.
     * @private
     */
    _get_system_config(system) {
        let config = this.systems.get(system);
        
        if (!config) {
            config = {
                min_voting_period: this.min_voting_period,
                max_voting_period: this.max_voting_period,
                min_proposal_period: this.min_proposal_period,
                max_proposal_period: this.max_proposal_period,
                quorum_percentage: this.quorum_percentage,
                proposal_threshold: this.proposal_threshold,
                voting_methods: this.voting_methods,
                vote_strategies: this.vote_strategies,
                proposal_count: 0,
                proposals: new Map()
            };
            this.systems.set(system, config);
        }
        
        return config;
    }

    /**
     * Check if proposal is active.
     * @param {string} system - System name
     * @param {string} proposal_id - Proposal ID
     * @returns {boolean} Whether proposal is active
     */
    is_proposal_active(system, proposal_id) {
        const config = this._get_system_config(system);
        const proposal = config.proposals.get(proposal_id);
        
        if (!proposal) {
            return false;
        }

        return proposal.status === 'active';
    }

    /**
     * Check if proposal is in voting period.
     * @param {string} system - System name
     * @param {string} proposal_id - Proposal ID
     * @returns {boolean} Whether in voting period
     */
    is_voting_period(system, proposal_id) {
        const config = this._get_system_config(system);
        const proposal = config.proposals.get(proposal_id);
        
        if (!proposal) {
            return false;
        }

        const now = new Date();
        return now >= proposal.vote_start_time && now <= proposal.vote_end_time;
    }

    /**
     * Cast a vote on a proposal.
     * @param {string} system - System name
     * @param {string} proposal_id - Proposal ID
     * @param {string} address - Voter address
     * @param {string} vote_method - Vote method (for, against, abstain)
     * @param {number} voting_power - Voting power
     * @returns {object} Vote result
     */
    vote(system, proposal_id, address, vote_method, voting_power = 1) {
        return this.cast_vote(system, proposal_id, address, vote_method, voting_power);
    }

    cast_vote(system, proposal_id, address, vote_method, voting_power) {
        const config = this._get_system_config(system);
        const proposal = config.proposals.get(proposal_id);
        
        if (!proposal) {
            throw new Error(`Proposal ${proposal_id} not found`);
        }

        if (!proposal.votes.has(address)) {
            proposal.votes.set(address, {
                address,
                vote_method,
                voting_power,
                timestamp: new Date(),
                transaction_hash: null
            });
        } else {
            const existing_vote = proposal.votes.get(address);
            existing_vote.vote_method = vote_method;
            existing_vote.voting_power = voting_power;
            existing_vote.timestamp = new Date();
        }

        proposal.total_voting_power = Array.from(proposal.votes.values())
            .reduce((sum, vote) => sum + vote.voting_power, 0);

        proposal.vote_count.set(vote_method, 
            (proposal.vote_count.get(vote_method) || 0) + 1
        );

        return {
            proposal_id,
            address,
            vote_method,
            success: true,
            voting_power
        };
    }

    /**
     * Get results for a proposal.
     * @param {string} system - System name
     * @param {string} proposal_id - Proposal ID
     * @returns {object} Results
     */
    get_proposal_result(system, proposal_id) {
        const config = this._get_system_config(system);
        const proposal = config.proposals.get(proposal_id);
        
        if (!proposal) {
            throw new Error(`Proposal ${proposal_id} not found`);
        }

        if (!proposal.results) {
            proposal.results = this._calculate_results(system, proposal);
        }

        return proposal.results;
    }

    /**
     * Calculate proposal results.
     * @private
     */
    _calculate_results(system, proposal) {
        const vote_counts = {};
        
        proposal.vote_count.forEach((count, method) => {
            vote_counts[method] = count;
        });

        const total_votes = Array.from(proposal.vote_count.values())
            .reduce((sum, count) => sum + count, 0);

        const percentage_counts = {};
        Object.keys(vote_counts).forEach(method => {
            percentage_counts[method] = total_votes > 0 
                ? parseFloat(((vote_counts[method] / total_votes) * 100).toFixed(1)) 
                : 0;
        });

        const quorum_reached = proposal.total_voting_power > 0;

        return {
            votes: vote_counts,
            total_votes,
            percentage: percentage_counts,
            voting_power: proposal.total_voting_power,
            status: proposal.status,
            quorum_reached,
            winner: this._determine_winner(vote_counts)
        };
    }

    /**
     * Determine winning vote method.
     * @private
     */
    _determine_winner(vote_counts) {
        let max_count = 0;
        let winner = null;

        Object.keys(vote_counts).forEach(method => {
            if (method === 'abstain') {
                return;
            }

            if (vote_counts[method] > max_count) {
                max_count = vote_counts[method];
                winner = method;
            }
        });

        return winner;
    }

    /**
     * Get voting statistics.
     * @param {string} system - System name
     * @param {string} proposal_id - Proposal ID
     * @returns {object} Statistics
     */
    get_voting_statistics(system, proposal_id) {
        const config = this._get_system_config(system);
        const proposal = config.proposals.get(proposal_id);
        
        if (!proposal) {
            throw new Error(`Proposal ${proposal_id} not found`);
        }

        const results = this.get_proposal_result(system, proposal_id);
        
        return {
            proposal_id,
            creator: proposal.creator,
            voting_strategy: proposal.voting_strategy,
            status: proposal.status,
            created_at: proposal.created_at,
            vote_start_time: proposal.vote_start_time,
            vote_end_time: proposal.vote_end_time,
            votes: results.votes,
            total_votes: results.total_votes,
            percentage: results.percentage,
            voting_power: results.voting_power,
            quorum_reached: results.quorum_reached,
            winner: results.winner,
            comment_count: proposal.comments ? proposal.comments.length : 0
        };
    }

    /**
     * Get all proposals in a system.
     * @param {string} system - System name
     * @param {object} options - Filter options
     * @returns {Array} List of proposals
     */
    get_all_proposals(system, options = {}) {
        const config = this._get_system_config(system);
        let proposals = Array.from(config.proposals.values());

        if (options.status) {
            proposals = proposals.filter(p => p.status === options.status);
        }

        if (options.sort_by) {
            proposals.sort((a, b) => {
                if (options.sort_by === 'created_at') {
                    return new Date(b.created_at) - new Date(a.created_at);
                } else if (options.sort_by === 'votes') {
                    const b_votes = Array.from(b.vote_count.values()).reduce((sum, count) => sum + count, 0);
                    const a_votes = Array.from(a.vote_count.values()).reduce((sum, count) => sum + count, 0);
                    return b_votes - a_votes;
                }
                return 0;
            });
        }

        if (options.limit) {
            proposals = proposals.slice(0, options.limit);
        }

        return proposals.map(proposal => ({
            id: proposal.id,
            content: proposal.content,
            creator: proposal.creator,
            status: proposal.status,
            created_at: proposal.created_at,
            vote_start_time: proposal.vote_start_time,
            vote_end_time: proposal.vote_end_time,
            vote_count: Array.from(proposal.vote_count.values()).reduce((sum, count) => sum + count, 0),
            total_voting_power: proposal.total_voting_power
        }));
    }

    /**
     * Get statistics for all proposals in a system.
     * @param {string} system - System name
     * @returns {object} System statistics
     */
    get_statistics(system) {
        const config = this._get_system_config(system);
        const proposals = Array.from(config.proposals.values());
        
        const proposal_stats = proposals.reduce((acc, proposal) => {
            const status = proposal.status;
            if (!acc.has(status)) {
                acc.set(status, { count: 0, total_votes: 0, total_power: 0 });
            }
            
            const stats = acc.get(status);
            stats.count++;
            stats.total_votes += Array.from(proposal.vote_count.values()).reduce((sum, count) => sum + count, 0);
            stats.total_power += proposal.total_voting_power;
            
            return acc;
        }, new Map());

        const active_voting_count = proposals.filter(proposal => 
            this.is_proposal_active(system, proposal.id) && 
            this.is_voting_period(system, proposal.id)
        ).length;

        return {
            proposal_count: config.proposal_count,
            active_proposals: active_voting_count,
            proposal_stats: Array.from(proposal_stats.entries()).map(([status, data]) => ({
                status,
                count: data.count,
                average_votes: data.count > 0 ? Math.round(data.total_votes / data.count) : 0,
                average_power: data.count > 0 ? parseFloat((data.total_power / data.count).toFixed(1)) : 0
            }))
        };
    }

    /**
     * Get proposal details by ID.
     * @param {string} system - System name
     * @param {string} proposal_id - Proposal ID
     * @returns {object} Proposal details
     */
    get_proposal(system, proposal_id) {
        const config = this._get_system_config(system);
        return config.proposals.get(proposal_id);
    }

    /**
     * Update proposal status.
     * @param {string} system - System name
     * @param {string} proposal_id - Proposal ID
     * @param {string} status - New status
     */
    update_proposal_status(system, proposal_id, status) {
        const config = this._get_system_config(system);
        const proposal = config.proposals.get(proposal_id);
        
        if (!proposal) {
            throw new Error(`Proposal ${proposal_id} not found`);
        }

        proposal.status = status;
    }

    /**
     * Extend voting period.
     * @param {string} system - System name
     * @param {string} proposal_id - Proposal ID
     * @param {number} extension_time - Extension time in seconds
     */
    extend_voting_period(system, proposal_id, extension_time) {
        const config = this._get_system_config(system);
        const proposal = config.proposals.get(proposal_id);
        
        if (!proposal) {
            throw new Error(`Proposal ${proposal_id} not found`);
        }

        proposal.vote_end_time = new Date(proposal.vote_end_time.getTime() + extension_time * 1000);
    }
}

export class Vote {
    /**
     * Create a new vote instance.
     * @param {object} data - Vote data
     */
    constructor(data) {
        this.voter_address = data.voter_address;
        this.proposal_id = data.proposal_id;
        this.vote_value = data.vote_value;
        this.vote_power = data.vote_power;
        this.timestamp = data.timestamp || new Date();
        this.is_abstain = data.is_abstain || false;
    }

    /**
     * Create a new vote instance.
     * @param {string} voter_address - Voter address
     * @param {string} proposal_id - Proposal ID
     * @param {string} vote_value - Vote value (for, against, abstain)
     * @param {number} vote_power - Voting power
     * @param {boolean} is_abstain - Whether vote is abstain
     * @returns {Vote} New vote instance
     */
    static create(voter_address, proposal_id, vote_value, vote_power, is_abstain = false) {
        return new Vote({
            voter_address,
            proposal_id,
            vote_value,
            vote_power,
            is_abstain,
            timestamp: new Date()
        });
    }

    /**
     * Get voter address.
     * @returns {string} Voter address
     */
    get_voter_address() {
        return this.voter_address;
    }

    /**
     * Get proposal ID.
     * @returns {string} Proposal ID
     */
    get_proposal_id() {
        return this.proposal_id;
    }

    /**
     * Get vote value.
     * @returns {string} Vote value
     */
    get_vote_value() {
        return this.vote_value;
    }

    /**
     * Get voting power.
     * @returns {number} Voting power
     */
    get_vote_power() {
        return this.vote_power;
    }

    /**
     * Get timestamp.
     * @returns {Date} Timestamp
     */
    get_timestamp() {
        return this.timestamp;
    }

    /**
     * Check if vote is abstain.
     * @returns {boolean} Whether vote is abstain
     */
    is_abstain_vote() {
        return this.is_abstain;
    }

    /**
     * Convert to JSON serializable format.
     * @returns {object} JSON representation
     */
    to_json() {
        return {
            voter_address: this.voter_address,
            proposal_id: this.proposal_id,
            vote_value: this.vote_value,
            vote_power: this.vote_power,
            timestamp: this.timestamp,
            is_abstain: this.is_abstain
        };
    }
}
