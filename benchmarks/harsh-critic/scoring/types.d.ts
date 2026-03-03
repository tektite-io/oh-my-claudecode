/**
 * Benchmark Scoring Types for Harsh-Critic Agent Evaluation
 *
 * Defines the schema for fixtures, ground truth, parsed agent output,
 * and scoring metrics used to compare review agents.
 */
export type Severity = 'CRITICAL' | 'MAJOR' | 'MINOR';
export type FindingCategory = 'finding' | 'missing' | 'perspective';
export type Perspective = 'security' | 'new-hire' | 'ops';
export type Domain = 'plan' | 'code' | 'analysis';
export type HarshCriticVerdict = 'REJECT' | 'REVISE' | 'ACCEPT-WITH-RESERVATIONS' | 'ACCEPT';
export type CriticVerdict = 'OKAY' | 'REJECT';
export type AgentType = 'harsh-critic' | 'critic';
/**
 * A single expected finding in a fixture's ground truth.
 * Each finding has keywords that must appear in a matching agent output.
 */
export interface GroundTruthFinding {
    /** Unique identifier, e.g. "AUTH-CRIT-1" */
    id: string;
    /** Expected severity level */
    severity: Severity;
    /** Whether this is a direct finding, a missing item, or a perspective-specific finding */
    category: FindingCategory;
    /** Which perspective this finding relates to (if category is 'perspective') */
    perspective?: Perspective;
    /** Short description of the embedded flaw */
    summary: string;
    /** Keywords that must appear in a matching agent finding (>= 2 must match) */
    keywords: string[];
    /** File:line or section reference if applicable */
    location?: string;
    /** Why this is a real issue (for documentation) */
    explanation: string;
}
/**
 * Ground truth for a single fixture.
 */
export interface GroundTruth {
    /** Fixture identifier matching the filename (without extension) */
    fixtureId: string;
    /** Path to the fixture file relative to benchmarks/harsh-critic/ */
    fixturePath: string;
    /** Domain of the fixture */
    domain: Domain;
    /** Expected verdict from a thorough reviewer */
    expectedVerdict: HarshCriticVerdict;
    /** All expected findings embedded in the fixture */
    findings: GroundTruthFinding[];
    /** Whether this is a clean baseline (for false-positive testing) */
    isCleanBaseline: boolean;
}
/**
 * A single finding extracted from agent output.
 */
export interface ParsedFinding {
    /** Raw text of the finding */
    text: string;
    /** Severity as stated by the agent */
    severity: Severity;
    /** Whether the finding includes file:line or specific code references */
    hasEvidence: boolean;
    /** ID of the matched ground-truth finding (set during scoring) */
    matchedGroundTruth?: string;
}
/**
 * Structured representation of an agent's review output.
 */
export interface ParsedAgentOutput {
    /** The agent's verdict string */
    verdict: string;
    /** Findings categorized by severity */
    criticalFindings: ParsedFinding[];
    majorFindings: ParsedFinding[];
    minorFindings: ParsedFinding[];
    /** Items from the "What's Missing" section */
    missingItems: string[];
    /** Multi-perspective notes */
    perspectiveNotes: {
        security: string[];
        newHire: string[];
        ops: string[];
    };
    /** Whether the agent made pre-commitment predictions before investigation */
    hasPreCommitment: boolean;
    /** Whether the agent's output includes a gap analysis section */
    hasGapAnalysis: boolean;
    /** Whether the agent addressed multiple perspectives */
    hasMultiPerspective: boolean;
    /** Raw output text (for debugging) */
    rawOutput: string;
}
/**
 * Scores for a single agent run against a single fixture.
 */
export interface BenchmarkScores {
    /** Findings that match ground truth / total ground truth */
    truePositiveRate: number;
    /** Findings that don't match any ground truth / total agent findings */
    falsePositiveRate: number;
    /** Ground truth items not found / total ground truth */
    falseNegativeRate: number;
    /** Correct severity rating / total matched findings */
    severityAccuracy: number;
    /** "What's Missing" items matching ground truth / total missing-category ground truth */
    missingCoverage: number;
    /** Perspective findings matching ground truth / total perspective-category ground truth */
    perspectiveCoverage: number;
    /** CRITICAL+MAJOR findings with file:line evidence / total CRITICAL+MAJOR findings */
    evidenceRate: number;
    /** Pre-commitment predictions present */
    hasPreCommitment: boolean;
    /** All 3 perspectives addressed */
    hasMultiPerspective: boolean;
    /** "What's Missing" section present and non-empty */
    hasGapAnalysis: boolean;
    /** Weighted combination of all metrics */
    compositeScore: number;
}
/**
 * Result of running one agent against one fixture.
 */
export interface FixtureResult {
    fixtureId: string;
    domain: Domain;
    agentType: AgentType;
    parsedOutput: ParsedAgentOutput;
    scores: BenchmarkScores;
    /** Ground truth findings that were matched */
    matchedFindings: string[];
    /** Ground truth findings that were missed */
    missedFindings: string[];
    /** Agent findings that didn't match any ground truth */
    spuriousFindings: string[];
}
/**
 * Aggregated result comparing two agents across all fixtures.
 */
export interface BenchmarkReport {
    /** Timestamp of the benchmark run */
    timestamp: string;
    /** Model used for the benchmark */
    model: string;
    /** Per-fixture results for each agent */
    results: FixtureResult[];
    /** Aggregate scores per agent */
    aggregateScores: Record<AgentType, BenchmarkScores>;
    /** Per-metric deltas (harsh-critic minus critic) */
    deltas: Partial<Record<keyof BenchmarkScores, number>>;
    /** Per-fixture win/loss/tie */
    headToHead: Array<{
        fixtureId: string;
        winner: AgentType | 'tie';
        delta: number;
    }>;
}
/**
 * Weights for composite score calculation.
 * Sum to 1.0.
 */
export declare const SCORING_WEIGHTS: {
    readonly truePositiveRate: 0.25;
    readonly falseNegativeRate: 0.15;
    readonly falsePositiveRate: 0.1;
    readonly missingCoverage: 0.2;
    readonly perspectiveCoverage: 0.1;
    readonly evidenceRate: 0.1;
    readonly processCompliance: 0.1;
};
/**
 * Minimum keyword matches required to consider a ground truth finding "matched".
 */
export declare const MIN_KEYWORD_MATCHES = 2;
/**
 * Whether severity must match exactly or can be within 1 level.
 * Adjacent severities: CRITICAL↔MAJOR, MAJOR↔MINOR
 */
export declare const ALLOW_ADJACENT_SEVERITY = true;
//# sourceMappingURL=types.d.ts.map