/**
 * Report generator for benchmark results.
 *
 * Produces both machine-readable JSON (BenchmarkReport) and human-readable
 * markdown summaries comparing harsh-critic vs critic agents.
 */
import type { BenchmarkReport, FixtureResult } from './types.js';
/**
 * Build a structured BenchmarkReport from raw fixture results.
 *
 * @param results - All FixtureResult entries (both agent types, all fixtures).
 * @param model   - Model identifier used during the benchmark run.
 */
export declare function generateJsonReport(results: FixtureResult[], model: string): BenchmarkReport;
/**
 * Render a human-readable markdown report from a BenchmarkReport.
 */
export declare function generateMarkdownReport(report: BenchmarkReport): string;
//# sourceMappingURL=reporter.d.ts.map