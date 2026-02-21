/**
 * ChainForgeLedger Proposal Module
 * 
 * Implements proposal management functionality.
 */

export class Proposal {
    /**
     * Create a new proposal instance.
     * @param {object} data - Proposal data
     * @param {object} options - Creation options
     */
    constructor(data, options = {}) {
        this.id = data.id || `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.title = data.title || 'Untitled Proposal';
        this.description = data.description || '';
        this.creator = data.creator || null;
        this.status = data.status || 'active';
        this.created_at = data.created_at || new Date();
        this.vote_start_time = data.vote_start_time || null;
        this.vote_end_time = data.vote_end_time || null;
        this.status = data.status || 'draft';
        this.execution_status = data.execution_status || 'pending';
        this.votes = new Map();
        this.vote_data = new Map();
        this.stake_amount = data.stake_amount || 0;
        this.reward_amount = data.reward_amount || 0;
        this.reward_distribution = data.reward_distribution || 'proportional';
        this.voting_power_distribution = data.voting_power_distribution || null;
        this.proposal_type = data.proposal_type || 'regular';
        this.comments = [];
        this.reward_claimed = false;
        this.reward_claimed_time = null;
        this.delegate_proposal_ids = [];
        this.results = null;
    }

    /**
     * Create a new proposal with default settings.
     * @param {object} data - Proposal data
     * @returns {Proposal} New proposal instance
     */
    static create_default(data) {
        const proposal = new Proposal(data);
        proposal.set_vote_period();
        return proposal;
    }

    /**
     * Set the voting period.
     */
    set_vote_period() {
        if (!this.vote_start_time) {
            this.vote_start_time = new Date(Date.now() + 24 * 60 * 60 * 1000); // Start in 1 day
        }
        
        if (!this.vote_end_time) {
            this.vote_end_time = new Date(this.vote_start_time.getTime() + 7 * 24 * 60 * 60 * 1000); // Vote for 7 days
        }
    }

    /**
     * Update proposal status.
     * @param {string} new_status - New status
     * @param {string} reason - Status change reason
     */
    update_status(new_status, reason = null) {
        this.status = new_status;
        
        if (reason) {
            this.comments.push({
                id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                author: 'system',
                content: reason,
                timestamp: new Date()
            });
        }
    }

    /**
     * Set the stake amount required for voting.
     * @param {number} amount - Stake amount
     */
    set_stake_amount(amount) {
        if (amount < 0) {
            throw new Error('Stake amount must be non-negative');
        }
        this.stake_amount = amount;
    }

    /**
     * Set the reward amount for proposal creators and voters.
     * @param {number} amount - Reward amount
     */
    set_reward_amount(amount) {
        if (amount < 0) {
            throw new Error('Reward amount must be non-negative');
        }
        this.reward_amount = amount;
    }

    /**
     * Set reward distribution method.
     * @param {string} distribution - Distribution method (fixed, proportional, etc.)
     */
    set_reward_distribution(distribution) {
        this.reward_distribution = distribution;
    }

    /**
     * Get proposal type.
     * @returns {string} Proposal type
     */
    get_proposal_type() {
        return this.proposal_type;
    }

    /**
     * Add a comment to the proposal.
     * @param {string} author - Comment author
     * @param {string} content - Comment content
     */
    add_comment(author, content) {
        this.comments.push({
            id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            author,
            content,
            timestamp: new Date()
        });
    }

    /**
     * Get all comments on the proposal.
     * @returns {Array} List of comments
     */
    get_comments() {
        return [...this.comments];
    }

    /**
     * Cast a vote on the proposal.
     * @param {string} address - Voter address
     * @param {string} vote_type - Vote type (for, against, abstain)
     * @param {number} voting_power - Voting power amount
     */
    cast_vote(address, vote_type, voting_power) {
        this.votes.set(address, {
            type: vote_type,
            voting_power,
            timestamp: new Date()
        });
    }

    /**
     * Get votes for the proposal.
     * @returns {Array} List of votes
     */
    get_votes() {
        return Array.from(this.votes.entries()).map(([address, data]) => ({
            address,
            type: data.type,
            voting_power: data.voting_power,
            timestamp: data.timestamp
        }));
    }

    /**
     * Get number of votes by type.
     * @returns {object} Vote counts
     */
    get_vote_counts() {
        return this.get_votes().reduce((acc, vote) => {
            acc[vote.type] = (acc[vote.type] || 0) + 1;
            return acc;
        }, {});
    }

    /**
     * Get total voting power by type.
     * @returns {object} Voting power distribution
     */
    get_total_voting_power() {
        return this.get_votes().reduce((acc, vote) => {
            acc[vote.type] = (acc[vote.type] || 0) + vote.voting_power;
            return acc;
        }, {});
    }

    /**
     * Calculate proposal results.
     * @returns {object} Results object
     */
    calculate_results() {
        const votes = this.get_votes();
        const vote_counts = this.get_vote_counts();
        const total_voting_power = this.get_total_voting_power();

        this.results = {
            total_votes: votes.length,
            vote_power: Object.values(total_voting_power).reduce((sum, val) => sum + val, 0),
            for_votes: vote_counts['for'] || 0,
            against_votes: vote_counts['against'] || 0,
            abstain_votes: vote_counts['abstain'] || 0,
            for_power: total_voting_power['for'] || 0,
            against_power: total_voting_power['against'] || 0,
            abstain_power: total_voting_power['abstain'] || 0,
            vote_counts,
            total_voting_power
        };

        return this.results;
    }

    /**
     * Get proposal results.
     * @returns {object} Results
     */
    get_results() {
        return this.results;
    }

    /**
     * Get proposal statistics.
     * @returns {object} Statistics
     */
    get_statistics() {
        const total_voting_power = this.get_total_voting_power();
        
        return {
            proposal_id: this.id,
            title: this.title,
            creator: this.creator,
            status: this.status,
            created_at: this.created_at,
            total_votes: this.get_votes().length,
            for_votes: this.get_vote_counts()['for'] || 0,
            against_votes: this.get_vote_counts()['against'] || 0,
            abstain_votes: this.get_vote_counts()['abstain'] || 0,
            for_voting_power: total_voting_power['for'] || 0,
            against_voting_power: total_voting_power['against'] || 0,
            abstain_voting_power: total_voting_power['abstain'] || 0,
            stake_amount: this.stake_amount,
            reward_amount: this.reward_amount,
            comments: this.comments.length
        };
    }

    /**
     * Get proposal details in JSON format.
     * @returns {object} Proposal details
     */
    to_json() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            creator: this.creator,
            status: this.status,
            created_at: this.created_at,
            vote_start_time: this.vote_start_time,
            vote_end_time: this.vote_end_time,
            execution_status: this.execution_status,
            votes: this.get_votes(),
            stake_amount: this.stake_amount,
            reward_amount: this.reward_amount,
            reward_distribution: this.reward_distribution,
            voting_power_distribution: this.voting_power_distribution,
            proposal_type: this.proposal_type,
            comments: this.comments,
            reward_claimed: this.reward_claimed,
            reward_claimed_time: this.reward_claimed_time,
            delegate_proposal_ids: this.delegate_proposal_ids,
            results: this.results
        };
    }

    /**
     * Check if proposal is active.
     * @returns {boolean} Whether proposal is active
     */
    is_active() {
        return this.status === 'active';
    }

    /**
     * Check if voting period has started.
     * @returns {boolean} Whether voting has started
     */
    has_voting_started() {
        const now = new Date();
        return now >= this.vote_start_time && now <= this.vote_end_time;
    }

    /**
     * Check if proposal is in voting phase.
     * @returns {boolean} Whether proposal is in voting phase
     */
    is_voting_phase() {
        return this.has_voting_started() && this.status === 'active';
    }

    /**
     * Check if proposal voting period has ended.
     * @returns {boolean} Whether voting has ended
     */
    has_voting_ended() {
        return new Date() > this.vote_end_time;
    }

    /**
     * Check if proposal is executable.
     * @returns {boolean} Whether proposal is executable
     */
    is_executable() {
        return this.has_voting_ended() && this.execution_status === 'pending';
    }

    /**
     * Get remaining time to start voting.
     * @returns {number} Remaining time in milliseconds
     */
    get_remaining_time_to_start() {
        const now = new Date();
        
        if (now >= this.vote_start_time) {
            return 0;
        }
        
        return this.vote_start_time - now;
    }

    /**
     * Get remaining voting time.
     * @returns {number} Remaining voting time in milliseconds
     */
    get_remaining_voting_time() {
        const now = new Date();
        
        if (!this.has_voting_started()) {
            return this.get_remaining_time_to_start();
        }
        
        if (this.has_voting_ended()) {
            return 0;
        }
        
        return this.vote_end_time - now;
    }

    /**
     * Set proposal data.
     * @param {object} data - Data to set
     */
    set_data(data) {
        Object.assign(this, data);
    }

    /**
     * Set voting power distribution.
     * @param {object} distribution - Voting power distribution
     */
    set_voting_power_distribution(distribution) {
        this.voting_power_distribution = distribution;
    }
}

export class ProposalManager {
    /**
     * Create a new proposal manager instance.
     * @param {object} options - Manager options
     */
    constructor(options = {}) {
        this.proposals = new Map();
        this.voting_strategy = options.voting_strategy || 'simple_majority';
        this.reward_distribution = options.reward_distribution || 'fixed';
        this.quorum_requirement = options.quorum_requirement || 20;
        this.initialization_time = Date.now();
        this.proposal_count = 0;
    }

    /**
     * Create a new proposal.
     * @param {object} proposal_data - Proposal data
     * @param {object} options - Creation options
     * @returns {string} Proposal ID
     */
    create_proposal(proposal_data, options = {}) {
        const proposal = Proposal.create_default(proposal_data, options);
        this.proposals.set(proposal.id, proposal);
        this.proposal_count++;
        return proposal.id;
    }

    /**
     * Get a proposal by ID.
     * @param {string} proposal_id - Proposal ID
     * @returns {Proposal} Proposal instance
     */
    get_proposal(proposal_id) {
        return this.proposals.get(proposal_id);
    }

    /**
     * Get all proposals.
     * @returns {Array} List of all proposals
     */
    get_all_proposals() {
        return Array.from(this.proposals.values());
    }

    /**
     * Get active proposals.
     * @returns {Array} List of active proposals
     */
    get_active_proposals() {
        return this.get_all_proposals().filter(proposal => proposal.is_active());
    }

    /**
     * Remove a proposal.
     * @param {string} proposal_id - Proposal ID
     */
    remove_proposal(proposal_id) {
        this.proposals.delete(proposal_id);
        this.proposal_count--;
    }

    /**
     * Cast a vote on a proposal.
     * @param {string} proposal_id - Proposal ID
     * @param {string} address - Voter address
     * @param {string} vote_type - Vote type
     * @param {number} voting_power - Voting power
     */
    cast_vote(proposal_id, address, vote_type, voting_power) {
        const proposal = this.get_proposal(proposal_id);
        
        if (!proposal) {
            throw new Error(`Proposal ${proposal_id} not found`);
        }

        if (!proposal.is_voting_phase()) {
            throw new Error(`Voting is not active for proposal ${proposal_id}`);
        }

        proposal.cast_vote(address, vote_type, voting_power);
    }

    /**
     * Get proposal results.
     * @param {string} proposal_id - Proposal ID
     * @returns {object} Results
     */
    get_proposal_results(proposal_id) {
        const proposal = this.get_proposal(proposal_id);
        
        if (!proposal) {
            throw new Error(`Proposal ${proposal_id} not found`);
        }

        if (!proposal.results) {
            proposal.calculate_results();
        }

        return proposal.results;
    }

    /**
     * Calculate final results for a proposal.
     * @param {string} proposal_id - Proposal ID
     * @returns {object} Final results
     */
    calculate_final_results(proposal_id) {
        const proposal = this.get_proposal(proposal_id);
        
        if (!proposal) {
            throw new Error(`Proposal ${proposal_id} not found`);
        }

        return proposal.calculate_results();
    }

    /**
     * Get proposal statistics.
     * @param {string} proposal_id - Proposal ID
     * @returns {object} Statistics
     */
    get_proposal_statistics(proposal_id) {
        const proposal = this.get_proposal(proposal_id);
        
        if (!proposal) {
            throw new Error(`Proposal ${proposal_id} not found`);
        }

        return proposal.get_statistics();
    }

    /**
     * Get statistics for all proposals.
     * @returns {object} Statistics
     */
    get_statistics() {
        const all_proposals = this.get_all_proposals();
        const active_proposals = this.get_active_proposals();
        
        const status_counts = all_proposals.reduce((acc, proposal) => {
            acc[proposal.status] = (acc[proposal.status] || 0) + 1;
            return acc;
        }, {});

        return {
            proposal_count: this.proposal_count,
            active_proposals: active_proposals.length,
            status_counts,
            average_votes_per_proposal: all_proposals.length > 0
                ? all_proposals.reduce((sum, proposal) => sum + proposal.get_votes().length, 0) / all_proposals.length
                : 0
        };
    }

    /**
     * Get voting status of proposals.
     * @returns {object} Voting status
     */
    get_voting_status() {
        const proposals = this.get_all_proposals();
        const voting_status = {
            active: [],
            upcoming: [],
            finished: []
        };

        const now = new Date();

        proposals.forEach(proposal => {
            if (proposal.is_voting_phase()) {
                voting_status.active.push({
                    id: proposal.id,
                    title: proposal.title,
                    remaining_time: proposal.get_remaining_voting_time()
                });
            } else if (proposal.get_remaining_time_to_start() > 0) {
                voting_status.upcoming.push({
                    id: proposal.id,
                    title: proposal.title,
                    start_time: proposal.vote_start_time
                });
            } else {
                voting_status.finished.push({
                    id: proposal.id,
                    title: proposal.title
                });
            }
        });

        return voting_status;
    }

    /**
     * Add a comment to a proposal.
     * @param {string} proposal_id - Proposal ID
     * @param {string} author - Comment author
     * @param {string} content - Comment content
     */
    add_comment(proposal_id, author, content) {
        const proposal = this.get_proposal(proposal_id);
        
        if (!proposal) {
            throw new Error(`Proposal ${proposal_id} not found`);
        }

        proposal.add_comment(author, content);
    }

    /**
     * Get comments on a proposal.
     * @param {string} proposal_id - Proposal ID
     * @returns {Array} List of comments
     */
    get_comments(proposal_id) {
        const proposal = this.get_proposal(proposal_id);
        
        if (!proposal) {
            throw new Error(`Proposal ${proposal_id} not found`);
        }

        return proposal.get_comments();
    }
}
