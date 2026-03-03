/**
 * Scorer for matching parsed agent output against ground truth and computing
 * benchmark metrics.
 */
import type { BenchmarkScores, FixtureResult, GroundTruth, ParsedAgentOutput } from './types.js';
export interface MatchResult {
    /** Ground truth finding IDs that were matched */
    matchedIds: string[];
    /** Ground truth finding IDs that were missed */
    missedIds: string[];
    /** Agent finding texts that didn't match any ground truth */
    spuriousTexts: string[];
    /** Total agent findings considered */
    totalAgentFindings: number;
}
/**
 * Match agent findings to ground truth findings using keyword overlap.
 * Each ground truth finding can be matched at most once (greedy first-match).
 */
export declare function matchFindings(parsed: ParsedAgentOutput, groundTruth: GroundTruth): MatchResult;
/**
 * Compute all 7 benchmark metrics plus composite score for one agent/fixture pair.
 */
export declare function scoreFixture(parsed: ParsedAgentOutput, groundTruth: GroundTruth): BenchmarkScores;
/**
 * Average scores across multiple fixture results (for the same agent type).
 */
export declare function aggregateScores(results: FixtureResult[]): BenchmarkScores;
//# sourceMappingURL=scorer.d.ts.map