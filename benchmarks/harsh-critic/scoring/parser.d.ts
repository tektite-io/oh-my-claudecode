/**
 * Parser for extracting structured data from agent review output.
 *
 * Supports two agent formats:
 * - harsh-critic: Structured sections with verdicts, severity-bucketed findings,
 *   "What's Missing", and multi-perspective notes.
 * - critic: Simpler OKAY/REJECT verdict with findings from summary/justification.
 */
import type { AgentType, ParsedAgentOutput } from './types.js';
/**
 * Parse raw markdown output from a review agent into a structured representation.
 *
 * @param rawOutput - The full markdown text produced by the agent.
 * @param agentType - Which agent produced the output ('harsh-critic' | 'critic').
 * @returns Structured ParsedAgentOutput.
 */
export declare function parseAgentOutput(rawOutput: string, agentType: AgentType): ParsedAgentOutput;
//# sourceMappingURL=parser.d.ts.map