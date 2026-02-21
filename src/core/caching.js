/**
 * ChainForgeLedger Caching Layer
 * 
 * Implements caching mechanisms for blockchain performance optimization.
 */

export class BlockchainCache {
    static CACHE_TYPES = ['blocks', 'transactions', 'accounts', 'contracts', 'metadata'];

    static DEFAULT_CACHE_CONFIG = {
        'blocks': { 'max_size': 1000, 'ttl': 3600 },
        'transactions': { 'max_size': 5000, 'ttl': 1800 },
        'accounts': { 'max_size': 10000, 'ttl': 900 },
        'contracts': { 'max_size': 500, 'ttl': 7200 },
        'metadata': { 'max_size': 500, 'ttl': 86400 }
    };

    constructor(cache_configs = null) {
        this.caches = {};
        this.cache_configs = cache_configs || { ...BlockchainCache.DEFAULT_CACHE_CONFIG };
        this.hit_counts = {};
        this.miss_counts = {};
        this.eviction_counts = {};
        
        for (const cache_type of BlockchainCache.CACHE_TYPES) {
            this.hit_counts[cache_type] = 0;
            this.miss_counts[cache_type] = 0;
            this.eviction_counts[cache_type] = 0;
        }
        
        this._initialize_caches();
    }

    _initialize_caches() {
        for (const cache_type of BlockchainCache.CACHE_TYPES) {
            this.caches[cache_type] = new Map();
        }
    }

    get(cache_type, key) {
        if (!BlockchainCache.CACHE_TYPES.includes(cache_type)) {
            throw new Error(`Invalid cache type: ${cache_type}`);
        }

        const cache = this.caches[cache_type];
        
        if (cache.has(key)) {
            const [item, timestamp] = cache.get(key);
            
            const config = this.cache_configs[cache_type];
            const ttl = config.ttl || 3600;
            
            if ((Date.now() / 1000) - timestamp <= ttl) {
                cache.delete(key);
                cache.set(key, [item, timestamp]);
                this.hit_counts[cache_type]++;
                return item;
            } else {
                cache.delete(key);
            }
        }
        
        this.miss_counts[cache_type]++;
        return null;
    }

    set(cache_type, key, value) {
        if (!BlockchainCache.CACHE_TYPES.includes(cache_type)) {
            throw new Error(`Invalid cache type: ${cache_type}`);
        }

        const cache = this.caches[cache_type];
        const config = this.cache_configs[cache_type];
        const max_size = config.max_size || 1000;
        
        if (cache.has(key)) {
            cache.delete(key);
        }
        
        if (cache.size >= max_size) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
            this.eviction_counts[cache_type]++;
        }
        
        cache.set(key, [value, Date.now() / 1000]);
    }

    delete(cache_type, key) {
        if (!BlockchainCache.CACHE_TYPES.includes(cache_type)) {
            throw new Error(`Invalid cache type: ${cache_type}`);
        }

        const cache = this.caches[cache_type];
        
        if (cache.has(key)) {
            cache.delete(key);
            return true;
        }
        
        return false;
    }

    clear_cache(cache_type = null) {
        if (cache_type) {
            if (!BlockchainCache.CACHE_TYPES.includes(cache_type)) {
                throw new Error(`Invalid cache type: ${cache_type}`);
            }
            
            this.caches[cache_type].clear();
            this.hit_counts[cache_type] = 0;
            this.miss_counts[cache_type] = 0;
            this.eviction_counts[cache_type] = 0;
        } else {
            for (const cache_type of BlockchainCache.CACHE_TYPES) {
                this.caches[cache_type].clear();
                this.hit_counts[cache_type] = 0;
                this.miss_counts[cache_type] = 0;
                this.eviction_counts[cache_type] = 0;
            }
        }
    }

    get_cache_stats(cache_type = null) {
        if (cache_type) {
            if (!BlockchainCache.CACHE_TYPES.includes(cache_type)) {
                throw new Error(`Invalid cache type: ${cache_type}`);
            }
            
            const total_requests = this.hit_counts[cache_type] + this.miss_counts[cache_type];
            const hit_rate = total_requests > 0 ? (this.hit_counts[cache_type] / total_requests * 100) : 0;
            
            return {
                cache_type,
                size: this.caches[cache_type].size,
                max_size: this.cache_configs[cache_type].max_size,
                hits: this.hit_counts[cache_type],
                misses: this.miss_counts[cache_type],
                evictions: this.eviction_counts[cache_type],
                total_requests,
                hit_rate
            };
        } else {
            const all_stats = [];
            for (const cache_type of BlockchainCache.CACHE_TYPES) {
                all_stats.push(this.get_cache_stats(cache_type));
            }
            
            const total_hits = all_stats.reduce((sum, stats) => sum + stats.hits, 0);
            const total_misses = all_stats.reduce((sum, stats) => sum + stats.misses, 0);
            const total_requests = total_hits + total_misses;
            const overall_hit_rate = total_requests > 0 ? (total_hits / total_requests * 100) : 0;
            const total_evictions = all_stats.reduce((sum, stats) => sum + stats.evictions, 0);
            const total_size = all_stats.reduce((sum, stats) => sum + stats.size, 0);
            const total_max_size = all_stats.reduce((sum, stats) => sum + stats.max_size, 0);
            
            return {
                overall: {
                    hits: total_hits,
                    misses: total_misses,
                    evictions: total_evictions,
                    total_requests,
                    hit_rate: overall_hit_rate,
                    size: total_size,
                    max_size: total_max_size
                },
                per_cache: all_stats
            };
        }
    }

    set_cache_config(cache_type, config) {
        if (!BlockchainCache.CACHE_TYPES.includes(cache_type)) {
            throw new Error(`Invalid cache type: ${cache_type}`);
        }

        if ('max_size' in config) {
            if (!Number.isInteger(config.max_size) || config.max_size <= 0) {
                throw new Error("max_size must be a positive integer");
            }
        }

        if ('ttl' in config) {
            if (!Number.isInteger(config.ttl) || config.ttl <= 0) {
                throw new Error("ttl must be a positive integer");
            }
        }

        this.cache_configs[cache_type] = { ...this.cache_configs[cache_type], ...config };
        
        if ('max_size' in config) {
            const max_size = config.max_size;
            const cache = this.caches[cache_type];
            
            while (cache.size > max_size) {
                const firstKey = cache.keys().next().value;
                cache.delete(firstKey);
                this.eviction_counts[cache_type]++;
            }
        }
    }

    get_cache_config(cache_type) {
        if (!BlockchainCache.CACHE_TYPES.includes(cache_type)) {
            throw new Error(`Invalid cache type: ${cache_type}`);
        }

        return this.cache_configs[cache_type];
    }

    purge_expired_items(cache_type = null) {
        let removed = 0;
        
        if (cache_type) {
            if (!BlockchainCache.CACHE_TYPES.includes(cache_type)) {
                throw new Error(`Invalid cache type: ${cache_type}`);
            }
            
            removed = this._purge_cache(cache_type);
        } else {
            for (const cache_type of BlockchainCache.CACHE_TYPES) {
                removed += this._purge_cache(cache_type);
            }
        }
        
        return removed;
    }

    _purge_cache(cache_type) {
        const cache = this.caches[cache_type];
        const config = this.cache_configs[cache_type];
        const ttl = config.ttl || 3600;
        let removed = 0;
        
        const keys_to_remove = [];
        
        for (const [key, [item, timestamp]] of cache.entries()) {
            if ((Date.now() / 1000) - timestamp > ttl) {
                keys_to_remove.push(key);
            }
        }
        
        for (const key of keys_to_remove) {
            cache.delete(key);
            removed++;
        }
        
        return removed;
    }

    get_active_items(cache_type) {
        if (!BlockchainCache.CACHE_TYPES.includes(cache_type)) {
            throw new Error(`Invalid cache type: ${cache_type}`);
        }

        const cache = this.caches[cache_type];
        const config = this.cache_configs[cache_type];
        const ttl = config.ttl || 3600;
        
        const items = [];
        
        for (const [key, [item, timestamp]] of cache.entries()) {
            const time_remaining = Math.max(0, ttl - ((Date.now() / 1000) - timestamp));
            
            items.push({
                key,
                value: item,
                timestamp,
                time_remaining,
                time_remaining_percent: ttl > 0 ? (time_remaining / ttl) * 100 : 0
            });
        }
        
        return items.sort((a, b) => a.time_remaining - b.time_remaining);
    }

    warmup_cache(cache_type, keys, loader_func) {
        if (!BlockchainCache.CACHE_TYPES.includes(cache_type)) {
            throw new Error(`Invalid cache type: ${cache_type}`);
        }

        let loaded = 0;
        
        for (const key of keys) {
            if (!this.caches[cache_type].has(key)) {
                try {
                    const value = loader_func(key);
                    this.set(cache_type, key, value);
                    loaded++;
                } catch (error) {
                    console.error(`Failed to load cache item ${key}: ${error}`);
                }
            }
        }
        
        return loaded;
    }

    toString() {
        const stats = this.get_cache_stats();
        const overall = stats.overall;
        
        const per_cache_str = [];
        for (const cache_type of BlockchainCache.CACHE_TYPES) {
            const cache_stats = stats.per_cache.find(stats => stats.cache_type === cache_type);
            per_cache_str.push(
                `${cache_type}: ${cache_stats.size}/${cache_stats.max_size} ` +
                `(${cache_stats.hit_rate.toFixed(1)}% hit rate)`
            );
        }
        
        return (
            `Blockchain Cache\n` +
            `================\n` +
            `Overall Stats:\n` +
            `  Hits: ${overall.hits.toLocaleString()}\n` +
            `  Misses: ${overall.misses.toLocaleString()}\n` +
            `  Evictions: ${overall.evictions.toLocaleString()}\n` +
            `  Hit Rate: ${overall.hit_rate.toFixed(1)}%\n` +
            `  Total Size: ${overall.size}/${overall.max_size}\n` +
            `\nPer-Cache Stats:\n` +
            per_cache_str.map(s => `  ${s}`).join('\n')
        );
    }
}
