/**
 * Benchmark Scoring Types for Harsh-Critic Agent Evaluation
 *
 * Defines the schema for fixtures, ground truth, parsed agent output,
 * and scoring metrics used to compare review agents.
 */
// ============================================================
// SCORING WEIGHTS
// ============================================================
/**
 * Weights for composite score calculation.
 * Sum to 1.0.
 */
export const SCORING_WEIGHTS = {
    truePositiveRate: 0.25,
    falseNegativeRate: 0.15, // inverted: lower is better
    falsePositiveRate: 0.10, // inverted: lower is better
    missingCoverage: 0.20, // key differentiator
    perspectiveCoverage: 0.10,
    evidenceRate: 0.10,
    processCompliance: 0.10,
};
/**
 * Minimum keyword matches required to consider a ground truth finding "matched".
 */
export const MIN_KEYWORD_MATCHES = 2;
/**
 * Whether severity must match exactly or can be within 1 level.
 * Adjacent severities: CRITICAL↔MAJOR, MAJOR↔MINOR
 */
export const ALLOW_ADJACENT_SEVERITY = true;
//# sourceMappingURL=types.js.map