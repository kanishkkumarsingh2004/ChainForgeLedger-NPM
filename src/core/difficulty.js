/**
 * ChainForgeLedger Difficulty Adjustment Algorithm
 * 
 * Implements difficulty adjustment based on block time targets.
 */

export class DifficultyAdjuster {
    /**
     * Implements difficulty adjustment based on block time targets.
     * 
     * @param {number} target_block_time - Target time per block in seconds
     * @param {number} adjustment_interval - Number of blocks between adjustments
     * @param {number} min_difficulty - Minimum allowed difficulty
     * @param {number} max_difficulty - Maximum allowed difficulty
     * @param {number} difficulty_change_limit - Maximum percentage change per adjustment (0.2 = 20%)
     */
    constructor(target_block_time = 60, adjustment_interval = 10, min_difficulty = 1, max_difficulty = 20, difficulty_change_limit = 0.2) {
        this.target_block_time = target_block_time;
        this.adjustment_interval = adjustment_interval;
        this.min_difficulty = min_difficulty;
        this.max_difficulty = max_difficulty;
        this.difficulty_change_limit = difficulty_change_limit;
    }

    calculate_new_difficulty(blocks, current_difficulty) {
        if (blocks.length < this.adjustment_interval) {
            return current_difficulty;
        }

        const adjustment_blocks = blocks.slice(-this.adjustment_interval);
        
        const actual_time = adjustment_blocks[adjustment_blocks.length - 1].timestamp - adjustment_blocks[0].timestamp;
        const expected_time = this.target_block_time * this.adjustment_interval;
        
        const time_ratio = actual_time / expected_time;
        let new_difficulty = current_difficulty / time_ratio;
        
        const max_increase = current_difficulty * (1 + this.difficulty_change_limit);
        const max_decrease = current_difficulty * (1 - this.difficulty_change_limit);
        new_difficulty = Math.max(Math.min(new_difficulty, max_increase), max_decrease);
        
        new_difficulty = Math.max(Math.min(new_difficulty, this.max_difficulty), this.min_difficulty);
        
        return Math.round(new_difficulty);
    }

    should_adjust_difficulty(block_index) {
        return (block_index + 1) % this.adjustment_interval === 0;
    }

    get_adjustment_info(blocks, current_difficulty) {
        if (blocks.length < this.adjustment_interval) {
            return {
                needs_adjustment: false,
                blocks_remaining: this.adjustment_interval - blocks.length
            };
        }

        const adjustment_blocks = blocks.slice(-this.adjustment_interval);
        const actual_time = adjustment_blocks[adjustment_blocks.length - 1].timestamp - adjustment_blocks[0].timestamp;
        const expected_time = this.target_block_time * this.adjustment_interval;
        const time_ratio = actual_time / expected_time;
        
        const new_difficulty = this.calculate_new_difficulty(blocks, current_difficulty);
        
        return {
            needs_adjustment: true,
            actual_time,
            expected_time,
            time_ratio,
            current_difficulty,
            new_difficulty,
            difficulty_change: ((new_difficulty - current_difficulty) / current_difficulty) * 100
        };
    }

    validate_difficulty(block, previous_block) {
        if (this.should_adjust_difficulty(previous_block.index)) {
            const expected_difficulty = this.calculate_new_difficulty(
                previous_block.index + 1, previous_block.difficulty
            );
            return Math.abs(block.difficulty - expected_difficulty) <= 1;
        } else {
            return block.difficulty === previous_block.difficulty;
        }
    }

    set_target_block_time(target) {
        if (target <= 0) {
            throw new Error("Target block time must be positive");
        }

        this.target_block_time = target;
    }

    set_adjustment_interval(interval) {
        if (interval <= 0) {
            throw new Error("Adjustment interval must be positive");
        }

        this.adjustment_interval = interval;
    }

    set_difficulty_limits(min_diff, max_diff) {
        if (min_diff < 1 || max_diff < min_diff) {
            throw new Error("Invalid difficulty limits");
        }

        this.min_difficulty = min_diff;
        this.max_difficulty = max_diff;
    }

    set_difficulty_change_limit(limit) {
        if (limit < 0 || limit > 1) {
            throw new Error("Difficulty change limit must be between 0 and 1");
        }

        this.difficulty_change_limit = limit;
    }

    get_statistics(blocks) {
        if (blocks.length < 2) {
            return {};
        }

        const difficulties = blocks.map(block => block.difficulty);
        const block_times = [];
        
        for (let i = 1; i < blocks.length; i++) {
            block_times.push(blocks[i].timestamp - blocks[i - 1].timestamp);
        }

        return {
            average_difficulty: difficulties.reduce((sum, d) => sum + d, 0) / difficulties.length,
            min_difficulty: Math.min(...difficulties),
            max_difficulty: Math.max(...difficulties),
            average_block_time: block_times.reduce((sum, t) => sum + t, 0) / block_times.length,
            min_block_time: Math.min(...block_times),
            max_block_time: Math.max(...block_times),
            difficulty_changes: blocks.slice(1).filter((block, i) => 
                block.difficulty !== blocks[i].difficulty
            ).length
        };
    }

    toString() {
        return (
            `Difficulty Adjuster\n` +
            `===================\n` +
            `Target Block Time: ${this.target_block_time} seconds\n` +
            `Adjustment Interval: ${this.adjustment_interval} blocks\n` +
            `Difficulty Range: ${this.min_difficulty} - ${this.max_difficulty}\n` +
            `Max Change Per Adjustment: ${this.difficulty_change_limit * 100}%`
        );
    }
}
