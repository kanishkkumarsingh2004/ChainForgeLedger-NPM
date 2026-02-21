/**
 * ChainForgeLedger - A complete blockchain platform library
 * 
 * A comprehensive blockchain platform built from scratch with pure JavaScript.
 * Features include:
 * - Proof of Work (PoW) and Proof of Stake (PoS) consensus mechanisms
 * - Smart contract virtual machine with stack-based execution
 * - Decentralized exchange (DEX) with automated market making (AMM)
 * - Lending protocol with borrowing and lending functionality
 * - NFT marketplace for digital asset creation and trading
 * - Blockchain explorer for analytics and visualization
 * - Wallet system with various types (CLI, web, mobile, multisig, hardware)
 * - Governance system with DAO framework
 * - Security architecture with multiple protection mechanisms
 * - Tokenomics system with vesting, staking, and reward mechanisms
 * - Cross-chain bridge functionality
 * - Sharding support for scalability
 * - State pruning for storage optimization
 * - Caching layer for performance improvements
 * 
 * Author: Kanishk Kumar Singh
 * Email: kanishkkumar2004@gmail.com
 * Version: 1.0.0
 */

// Core modules
import { Block } from "./core/block.js";
import { Blockchain } from "./core/blockchain.js";
import { Transaction } from "./core/transaction.js";
import { MerkleTree } from "./core/merkle.js";
import { State } from "./core/state.js";
import { CrossChainBridge, BridgeNetwork } from "./core/bridge.js";
import { BlockchainCache } from "./core/caching.js";
import { DifficultyAdjuster } from "./core/difficulty.js";
import { FeeDistributionSystem } from "./core/fee_distribution.js";
import { ForkHandler } from "./core/fork.js";
import { LendingProtocol } from "./core/lending.js";
import { LiquidityPool, DEX } from "./core/liquidity.js";
import { Serialization } from "./core/serialization.js";
import { Sharding } from "./core/sharding.js";
import { Staking } from "./core/staking.js";
import { StatePruning } from "./core/state_pruning.js";

// Consensus mechanisms
import { ProofOfWork } from "./consensus/pow.js";
import { ProofOfStake, Validator, ValidatorManager } from "./consensus/pos.js";
import { ConsensusInterface } from "./consensus/interface.js";
import { Slashing } from "./consensus/slashing.js";

// Cryptographic utilities
import { sha256_hash, keccak256_hash } from "./crypto/hashing.js";
import { generate_keys, KeyPair } from "./crypto/keys.js";
import { Signature } from "./crypto/signature.js";
import { Wallet } from "./crypto/wallet.js";
import { Mnemonic } from "./crypto/mnemonic.js";
import { Multisig } from "./crypto/multisig.js";

// Tokenomics
import { Tokenomics } from "./tokenomics/index.js";
import { Stablecoin, StablecoinRewardDistributor } from "./tokenomics/stablecoin.js";
import { TokenStandards } from "./tokenomics/standards.js";
import { SupplyManager, TokenSupplyTracker } from "./tokenomics/supply.js";
import { TreasuryManager, TreasuryPolicy } from "./tokenomics/treasury.js";

// Governance
import { DAO } from "./governance/dao.js";
import { Proposal } from "./governance/proposal.js";
import { Voting } from "./governance/voting.js";

// Networking
import { TransactionPool, TransactionPoolManager } from "./networking/mempool.js";
import { Node } from "./networking/node.js";
import { Peer } from "./networking/peer.js";
import { Protocol } from "./networking/protocol.js";
import { RateLimiter } from "./networking/rate_limiter.js";

// Smart contracts
import { SmartContractCompiler, ContractDeployer } from "./smartcontracts/compiler.js";
import { SmartContractExecutor } from "./smartcontracts/executor.js";
import { Sandbox } from "./smartcontracts/sandbox.js";
import { VM } from "./smartcontracts/vm.js";

// Storage
import { DatabaseManager } from "./storage/database.js";
import { LevelDBStorage } from "./storage/leveldb.js";
import { BlockStorage, TransactionStorage, ContractStorage, AccountStorage, MetadataStorage, StorageManager } from "./storage/models.js";

// Utils
import { ConfigManager, createConfigManager, DEFAULT_CONFIG, CONFIG_SCHEMA, loadDefaultConfig } from "./utils/config.js";
import {
    randomBytes,
    randomNumber,
    randomHex,
    sha256,
    sha512,
    ripemd160,
    keccak256,
    sha1,
    hash,
    hmac,
    pbkdf2,
    scrypt,
    uuidv4,
    generateSalt,
    aes256gcmEncrypt,
    aes256gcmDecrypt,
    generateKeyPair,
    generateRSAKeyPair,
    generateECDSAKeyPair,
    sign,
    verify,
    rsaSha256Sign,
    rsaSha256Verify,
    ecdsaSha256Sign,
    ecdsaSha256Verify,
    bufferToHex,
    hexToBuffer,
    bufferToBase64,
    base64ToBuffer,
    hexToBase64,
    base64ToHex,
    isValidHex,
    isValidBase64,
    isValidUUID
} from "./utils/crypto.js";
import {
    Logger,
    createLogger,
    createSystemLogger,
    createNetworkLogger,
    createTransactionLogger,
    createBlockLogger,
    createValidatorLogger,
    createContractLogger,
    createGovernanceLogger,
    createSecurityLogger,
    getLogger,
    setLogger,
    logger
} from "./utils/logger.js";

const version = "1.0.0";
const author = "Kanishk Kumar Singh";
const email = "kanishkkumar2004@gmail.com";
const description = "A complete blockchain platform library with PoW/PoS consensus, smart contracts, and DeFi applications";

// Core modules
export { Block };
export { Blockchain };
export { Transaction };
export { MerkleTree };
export { State };
export { CrossChainBridge, BridgeNetwork };
export { BlockchainCache };
export { DifficultyAdjuster };
export { FeeDistributionSystem };
export { ForkHandler };
export { LendingProtocol };
export { LiquidityPool, DEX };
export { Serialization };
export { Sharding };
export { Staking };
export { StatePruning };

// Consensus mechanisms
export { ProofOfWork };
export { ProofOfStake };
export { Validator, ValidatorManager };
export { ConsensusInterface };
export { Slashing };

// Cryptographic utilities
export { sha256_hash, keccak256_hash };
export { generate_keys, KeyPair };
export { Signature };
export { Wallet };
export { Mnemonic };
export { Multisig };

// Tokenomics
export { Tokenomics };
export { Stablecoin, StablecoinRewardDistributor };
export { TokenStandards };
export { SupplyManager, TokenSupplyTracker };
export { TreasuryManager, TreasuryPolicy };

// Governance
export { DAO };
export { Proposal };
export { Voting };

// Networking
export { TransactionPool, TransactionPoolManager };
export { Node };
export { Peer };
export { Protocol };
export { RateLimiter };

// Smart contracts
export { SmartContractCompiler, ContractDeployer };
export { SmartContractExecutor };
export { Sandbox };
export { VM };

// Storage
export { DatabaseManager };
export { LevelDBStorage };
export { BlockStorage, TransactionStorage, ContractStorage, AccountStorage, MetadataStorage, StorageManager };

// Utils
export { ConfigManager, createConfigManager, DEFAULT_CONFIG, CONFIG_SCHEMA, loadDefaultConfig };
export {
    randomBytes,
    randomNumber,
    randomHex,
    sha256,
    sha512,
    ripemd160,
    keccak256,
    sha1,
    hash,
    hmac,
    pbkdf2,
    scrypt,
    uuidv4,
    generateSalt,
    aes256gcmEncrypt,
    aes256gcmDecrypt,
    generateKeyPair,
    generateRSAKeyPair,
    generateECDSAKeyPair,
    sign,
    verify,
    rsaSha256Sign,
    rsaSha256Verify,
    ecdsaSha256Sign,
    ecdsaSha256Verify,
    bufferToHex,
    hexToBuffer,
    bufferToBase64,
    base64ToBuffer,
    hexToBase64,
    base64ToHex,
    isValidHex,
    isValidBase64,
    isValidUUID
};
export {
    Logger,
    createLogger,
    createSystemLogger,
    createNetworkLogger,
    createTransactionLogger,
    createBlockLogger,
    createValidatorLogger,
    createContractLogger,
    createGovernanceLogger,
    createSecurityLogger,
    getLogger,
    setLogger,
    logger
};

export { version, author, email, description };

export default {
    version,
    author,
    email,
    description,
    // Core
    Block: Block,
    Blockchain: Blockchain,
    Transaction: Transaction,
    MerkleTree: MerkleTree,
    State: State,
    CrossChainBridge: CrossChainBridge,
    BridgeNetwork: BridgeNetwork,
    BlockchainCache: BlockchainCache,
    DifficultyAdjuster: DifficultyAdjuster,
    FeeDistributionSystem: FeeDistributionSystem,
    ForkHandler: ForkHandler,
    LendingProtocol: LendingProtocol,
    LiquidityPool: LiquidityPool,
    DEX: DEX,
    Serialization: Serialization,
    Sharding: Sharding,
    Staking: Staking,
    StatePruning: StatePruning,
    // Consensus
    ProofOfWork: ProofOfWork,
    ProofOfStake: ProofOfStake,
    Validator: Validator,
    ValidatorManager: ValidatorManager,
    ConsensusInterface: ConsensusInterface,
    Slashing: Slashing,
    // Crypto & Wallet
    sha256_hash: sha256_hash,
    keccak256_hash: keccak256_hash,
    generate_keys: generate_keys,
    KeyPair: KeyPair,
    Signature: Signature,
    Wallet: Wallet,
    Mnemonic: Mnemonic,
    Multisig: Multisig,
    // Tokenomics
    Tokenomics: Tokenomics,
    Stablecoin: Stablecoin,
    StablecoinRewardDistributor: StablecoinRewardDistributor,
    TokenStandards: TokenStandards,
    SupplyManager: SupplyManager,
    TokenSupplyTracker: TokenSupplyTracker,
    TreasuryManager: TreasuryManager,
    TreasuryPolicy: TreasuryPolicy,
    // Governance
    DAO: DAO,
    Proposal: Proposal,
    Voting: Voting,
    // Networking
    TransactionPool: TransactionPool,
    TransactionPoolManager: TransactionPoolManager,
    Node: Node,
    Peer: Peer,
    Protocol: Protocol,
    RateLimiter: RateLimiter,
    // Smart Contracts
    SmartContractCompiler: SmartContractCompiler,
    ContractDeployer: ContractDeployer,
    SmartContractExecutor: SmartContractExecutor,
    Sandbox: Sandbox,
    VM: VM,
    // Storage
    DatabaseManager: DatabaseManager,
    LevelDBStorage: LevelDBStorage,
    Models: Models,
    // Utils
    ConfigManager: ConfigManager,
    createConfigManager: createConfigManager,
    DEFAULT_CONFIG: DEFAULT_CONFIG,
    CONFIG_SCHEMA: CONFIG_SCHEMA,
    loadDefaultConfig: loadDefaultConfig,
    Logger: Logger,
    createLogger: createLogger,
    createSystemLogger: createSystemLogger,
    createNetworkLogger: createNetworkLogger,
    createTransactionLogger: createTransactionLogger,
    createBlockLogger: createBlockLogger,
    createValidatorLogger: createValidatorLogger,
    createContractLogger: createContractLogger,
    createGovernanceLogger: createGovernanceLogger,
    createSecurityLogger: createSecurityLogger,
    getLogger: getLogger,
    setLogger: setLogger,
    logger: logger
};
