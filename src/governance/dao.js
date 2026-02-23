/**
 * ChainForgeLedger DAO Module
 * 
 * Implements Decentralized Autonomous Organization functionality.
 */

export class DAO {
    /**
     * Create a new DAO instance.
     * @param {object} options - DAO configuration options
     */
    constructor(options = {}) {
        this.name = options.name || 'ChainForgeLedger DAO';
        this.description = options.description || 'Decentralized Autonomous Organization';
        this.token_name = options.token_name || 'CFD';
        this.token_symbol = options.token_symbol || 'CFD';
        this.governance_contract = options.governance_contract || null;
        this.proposal_threshold = options.proposal_threshold || 10000;
        this.quorum_percentage = options.quorum_percentage || 20;
        this.min_proposal_period = options.min_proposal_period || 24 * 60 * 60;
        this.max_proposal_period = options.max_proposal_period || 7 * 24 * 60 * 60;
        this.min_voting_period = options.min_voting_period || 7 * 24 * 60 * 60;
        this.max_voting_period = options.max_voting_period || 30 * 24 * 60 * 60;
        this.creation_date = new Date();
        this.creator = options.creator || null;
        
        this.proposals = new Map();
        this.members = new Map();
        this.token_balances = new Map();
        this.total_voting_power = 0;
        this.proposal_counter = 0;
        this.delegate_proposals = new Map();
        this.voting_history = [];
    }

    /**
     * Create and initialize the DAO.
     * @param {string} creator - DAO creator address
     * @param {number} initial_supply - Initial token supply
     */
    static create_and_initialize(creator, initial_supply) {
        const dao = new DAO({ creator });
        
        if (initial_supply > 0) {
            dao._mint_tokens(creator, initial_supply);
        }
        
        return dao;
    }

    /**
     * Add a member to the DAO.
     * @param {string} address - Member address
     * @param {number} initial_tokens - Initial token allocation
     */
    add_member(address, initial_tokens) {
        if (!this.members.has(address)) {
            this.members.set(address, {
                address,
                join_date: new Date(),
                tokens: 0,
                voting_power: 0,
                proposal_count: 0,
                vote_count: 0,
                participation_score: 0
            });
        }

        if (initial_tokens > 0) {
            this._mint_tokens(address, initial_tokens);
        }
    }

    /**
     * Remove a member from the DAO.
     * @param {string} address - Member address
     */
    remove_member(address) {
        const member = this.members.get(address);
        
        if (member) {
            const tokens = member.tokens;
            this._burn_tokens(address, tokens);
            this.members.delete(address);
        }
    }

    /**
     * Mint tokens to a member.
     * @private
     */
    _mint_tokens(address, amount) {
        const member = this.members.get(address);
        
        if (!member) {
            throw new Error(`Member ${address} not found`);
        }

        member.tokens += amount;
        member.voting_power += amount;
        this.total_voting_power += amount;
    }

    /**
     * Burn tokens from a member.
     * @private
     */
    _burn_tokens(address, amount) {
        const member = this.members.get(address);
        
        if (!member) {
            throw new Error(`Member ${address} not found`);
        }

        if (member.tokens < amount) {
            throw new Error(`Insufficient tokens: ${member.tokens}`);
        }

        member.tokens -= amount;
        member.voting_power -= amount;
        this.total_voting_power -= amount;
    }

    /**
     * Transfer tokens between members.
     * @param {string} from_address - Sender address
     * @param {string} to_address - Recipient address
     * @param {number} amount - Amount to transfer
     */
    transfer_tokens(from_address, to_address, amount) {
        if (!this.members.has(from_address) || !this.members.has(to_address)) {
            throw new Error('Both addresses must be DAO members');
        }

        const sender = this.members.get(from_address);
        const recipient = this.members.get(to_address);

        if (sender.tokens < amount) {
            throw new Error(`Insufficient tokens: ${sender.tokens}`);
        }

        sender.tokens -= amount;
        sender.voting_power -= amount;
        recipient.tokens += amount;
        recipient.voting_power += amount;
    }

    /**
     * Create a new proposal.
     * @param {string} creator_address - Creator address
     * @param {object} proposal_data - Proposal content
     */
    submitProposal(proposal) {
        return this.create_proposal(proposal.creator || proposal.author, proposal);
    }

    create_proposal(creator_address, proposal_data) {
        if (!this.members.has(creator_address)) {
            throw new Error(`Member ${creator_address} not found`);
        }

        const creator = this.members.get(creator_address);
        
        if (creator.tokens < this.proposal_threshold) {
            throw new Error(`Minimum tokens required for proposal: ${this.proposal_threshold}`);
        }

        const proposal_id = `prop_${++this.proposal_counter}`;
        
        this.proposals.set(proposal_id, {
            id: proposal_id,
            creator_address,
            content: proposal_data,
            status: 'active',
            created_at: new Date(),
            vote_start_time: null,
            vote_end_time: null,
            votes: new Map(),
            comments: [],
            stake_amount: 0,
            reward_amount: 0,
            delegate_proposal_ids: [],
            results: null
        });

        creator.proposal_count++;
    }

    /**
     * Delegate voting rights to another member.
     * @param {string} delegator_address - Delegator address
     * @param {string} delegate_address - Delegate address
     * @param {number} amount - Amount of voting power to delegate
     */
    delegate_voting(delegator_address, delegate_address, amount) {
        if (!this.members.has(delegator_address) || !this.members.has(delegate_address)) {
            throw new Error('Both addresses must be DAO members');
        }

        if (delegator_address === delegate_address) {
            throw new Error('Cannot delegate to yourself');
        }

        const delegator = this.members.get(delegator_address);
        
        if (delegator.voting_power < amount) {
            throw new Error(`Insufficient voting power: ${delegator.voting_power}`);
        }

        const delegate = this.members.get(delegate_address);
        
        if (!this.delegate_proposals.has(delegate_address)) {
            this.delegate_proposals.set(delegate_address, []);
        }

        const proposal = {
            id: `dprop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            delegator_address,
            delegate_address,
            amount,
            created_at: new Date(),
            status: 'active'
        };

        this.delegate_proposals.get(delegate_address).push(proposal);

        delegator.voting_power -= amount;
        delegate.voting_power += amount;
    }

    /**
     * Vote on a proposal.
     * @param {string} proposal_id - Proposal ID
     * @param {string} voter_address - Voter address
     * @param {string} vote_type - Vote type (for, against, abstain)
     */
    vote_on_proposal(proposal_id, voter_address, vote_type) {
        const proposal = this.proposals.get(proposal_id);
        
        if (!proposal) {
            throw new Error(`Proposal ${proposal_id} not found`);
        }

        if (!this.members.has(voter_address)) {
            throw new Error(`Member ${voter_address} not found`);
        }

        const member = this.members.get(voter_address);
        const voting_power = member.voting_power;

        proposal.votes.set(voter_address, {
            address: voter_address,
            type: vote_type,
            amount: voting_power,
            timestamp: new Date()
        });

        member.vote_count++;
        member.participation_score = this._calculate_participation_score(member);

        this.voting_history.push({
            proposal_id,
            voter_address,
            vote_type,
            voting_power,
            timestamp: new Date()
        });
    }

    /**
     * Calculate member participation score.
     * @private
     */
    _calculate_participation_score(member) {
        const proposal_count = this.proposals.size;
        const vote_ratio = proposal_count > 0 ? member.vote_count / proposal_count : 0;
        const proposal_ratio = proposal_count > 0 ? member.proposal_count / proposal_count : 0;
        
        return Math.round((vote_ratio * 0.6 + proposal_ratio * 0.4) * 100);
    }

    /**
     * Calculate proposal results.
     * @param {string} proposal_id - Proposal ID
     */
    calculate_proposal_result(proposal_id) {
        const proposal = this.proposals.get(proposal_id);
        
        if (!proposal) {
            throw new Error(`Proposal ${proposal_id} not found`);
        }

        const votes = Array.from(proposal.votes.values());
        
        const results = votes.reduce((acc, vote) => {
            acc[vote.type] = (acc[vote.type] || 0) + vote.amount;
            return acc;
        }, {});

        proposal.results = {
            total_votes: votes.length,
            vote_power: votes.reduce((sum, vote) => sum + vote.amount, 0),
            for_votes: results['for'] || 0,
            against_votes: results['against'] || 0,
            abstain_votes: results['abstain'] || 0,
            for_percentage: results['for'] / this.total_voting_power * 100,
            against_percentage: results['against'] / this.total_voting_power * 100,
            abstain_percentage: results['abstain'] / this.total_voting_power * 100
        };
    }

    /**
     * Update proposal status.
     * @param {string} proposal_id - Proposal ID
     * @param {string} new_status - New status
     */
    update_proposal_status(proposal_id, new_status) {
        const proposal = this.proposals.get(proposal_id);
        
        if (!proposal) {
            throw new Error(`Proposal ${proposal_id} not found`);
        }

        proposal.status = new_status;
    }

    /**
     * Set proposal stake amount.
     * @param {string} proposal_id - Proposal ID
     * @param {number} amount - Stake amount
     */
    set_proposal_stake(proposal_id, amount) {
        const proposal = this.proposals.get(proposal_id);
        
        if (!proposal) {
            throw new Error(`Proposal ${proposal_id} not found`);
        }

        proposal.stake_amount = amount;
    }

    /**
     * Set proposal reward amount.
     * @param {string} proposal_id - Proposal ID
     * @param {number} amount - Reward amount
     */
    set_proposal_reward(proposal_id, amount) {
        const proposal = this.proposals.get(proposal_id);
        
        if (!proposal) {
            throw new Error(`Proposal ${proposal_id} not found`);
        }

        proposal.reward_amount = amount;
    }

    /**
     * Get DAO statistics.
     * @returns {object} DAO statistics
     */
    get_statistics() {
        const active_proposals = Array.from(this.proposals.values())
            .filter(p => p.status === 'active');
        
        const total_vote_power = this.total_voting_power;
        
        return {
            member_count: this.members.size,
            total_token_supply: Array.from(this.members.values())
                .reduce((sum, m) => sum + m.tokens, 0),
            active_proposals: active_proposals.length,
            total_proposals: this.proposals.size,
            total_voting_power: total_vote_power,
            average_participation_score: Array.from(this.members.values())
                .reduce((sum, m) => sum + m.participation_score, 0) / (this.members.size || 1),
            average_tokens_per_member: Array.from(this.members.values())
                .reduce((sum, m) => sum + m.tokens, 0) / (this.members.size || 1)
        };
    }

    /**
     * Get all proposals with their status.
     * @returns {Array} List of proposals
     */
    get_all_proposals() {
        return Array.from(this.proposals.values());
    }

    /**
     * Get a specific proposal.
     * @param {string} proposal_id - Proposal ID
     * @returns {object} Proposal details
     */
    get_proposal(proposal_id) {
        return this.proposals.get(proposal_id);
    }

    /**
     * Get all active proposals.
     * @returns {Array} List of active proposals
     */
    get_active_proposals() {
        return this.get_all_proposals().filter(p => p.status === 'active');
    }

    /**
     * Check if a proposal has passed.
     * @param {string} proposal_id - Proposal ID
     * @returns {object} Result details
     */
    has_proposal_passed(proposal_id) {
        const proposal = this.proposals.get(proposal_id);
        
        if (!proposal) {
            throw new Error(`Proposal ${proposal_id} not found`);
        }

        if (!proposal.results) {
            this.calculate_proposal_result(proposal_id);
        }

        const quorum = (proposal.results.vote_power / this.total_voting_power) * 100;
        
        return {
            passed: proposal.results.for_votes > proposal.results.against_votes && quorum >= this.quorum_percentage,
            quorum_reached: quorum >= this.quorum_percentage,
            for_votes: proposal.results.for_votes,
            against_votes: proposal.results.against_votes,
            for_percentage: proposal.results.for_percentage,
            against_percentage: proposal.results.against_percentage,
            total_vote_power: proposal.results.vote_power,
            quorum_percentage: quorum
        };
    }
}

export class DAOManager {
    /**
     * Create a new DAO manager instance.
     */
    constructor() {
        this.daos = new Map();
        this._init();
    }

    /**
     * Initialize DAO manager with test DAO.
     * @private
     */
    _init() {
        const test_dao = DAO.create_and_initialize('0x1234567890', 1000000);
        this.daos.set(test_dao.name, test_dao);
    }

    /**
     * Get all DAOs.
     * @returns {Array} List of all DAOs
     */
    get_daos() {
        return Array.from(this.daos.values());
    }

    /**
     * Create a new DAO.
     * @param {string} name - DAO name
     * @param {string} creator - Creator address
     * @param {number} initial_supply - Initial token supply
     */
    create_dao(name, creator, initial_supply) {
        if (this.daos.has(name)) {
            throw new Error(`DAO ${name} already exists`);
        }

        const dao = DAO.create_and_initialize(creator, initial_supply);
        dao.name = name;
        
        this.daos.set(name, dao);
    }

    /**
     * Get a specific DAO.
     * @param {string} name - DAO name
     * @returns {DAO} DAO instance
     */
    get_dao(name) {
        return this.daos.get(name);
    }

    /**
     * Destroy a DAO.
     * @param {string} name - DAO name
     */
    destroy_dao(name) {
        this.daos.delete(name);
    }

    /**
     * Add a member to a specific DAO.
     * @param {string} dao_name - DAO name
     * @param {string} address - Member address
     * @param {number} initial_tokens - Initial token allocation
     */
    add_member_to_dao(dao_name, address, initial_tokens) {
        const dao = this.get_dao(dao_name);
        
        if (!dao) {
            throw new Error(`DAO ${dao_name} not found`);
        }

        dao.add_member(address, initial_tokens);
    }

    /**
     * Create a proposal in a specific DAO.
     * @param {string} dao_name - DAO name
     * @param {string} creator_address - Creator address
     * @param {object} proposal_data - Proposal content
     */
    create_proposal_in_dao(dao_name, creator_address, proposal_data) {
        const dao = this.get_dao(dao_name);
        
        if (!dao) {
            throw new Error(`DAO ${dao_name} not found`);
        }

        dao.create_proposal(creator_address, proposal_data);
    }

    /**
     * Vote on a proposal in a specific DAO.
     * @param {string} dao_name - DAO name
     * @param {string} proposal_id - Proposal ID
     * @param {string} voter_address - Voter address
     * @param {string} vote_type - Vote type
     */
    vote_on_proposal_in_dao(dao_name, proposal_id, voter_address, vote_type) {
        const dao = this.get_dao(dao_name);
        
        if (!dao) {
            throw new Error(`DAO ${dao_name} not found`);
        }

        dao.vote_on_proposal(proposal_id, voter_address, vote_type);
    }
}
