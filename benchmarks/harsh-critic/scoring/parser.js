/**
 * Parser for extracting structured data from agent review output.
 *
 * Supports two agent formats:
 * - harsh-critic: Structured sections with verdicts, severity-bucketed findings,
 *   "What's Missing", and multi-perspective notes.
 * - critic: Simpler OKAY/REJECT verdict with findings from summary/justification.
 */
// ============================================================
// Evidence detection
// ============================================================
/** Matches patterns like `filename.ext:123` or backtick-quoted code references */
const EVIDENCE_PATTERN = /`[^`]+`|\b\w+\.\w+:\d+/;
function hasEvidence(text) {
    return EVIDENCE_PATTERN.test(text);
}
// ============================================================
// Shared utilities
// ============================================================
/**
 * Extract bullet / numbered list items under a markdown section heading.
 * Stops at the next `**` heading or end of string.
 */
function extractListItems(text, sectionPattern) {
    const match = sectionPattern.exec(text);
    if (!match)
        return [];
    const start = match.index + match[0].length;
    // Find next bold heading or end of string
    const nextHeading = /\n\s*\*\*[^\n]+\*\*/g;
    nextHeading.lastIndex = start;
    const next = nextHeading.exec(text);
    const end = next ? next.index : text.length;
    const section = text.slice(start, end);
    const items = [];
    // Match top-level numbered or bulleted list items (not indented sub-items).
    // Top-level items start at column 0 (no leading whitespace) or have at most
    // 1 space of indentation. Sub-items (indented with 2+ spaces or tabs) are
    // skipped and their text is appended to the previous top-level item.
    const listItemPattern = /^([ \t]*)(?:\d+\.|[-*•])\s+(.+)/gm;
    let m;
    while ((m = listItemPattern.exec(section)) !== null) {
        const indent = m[1].replace(/\t/g, '  ').length;
        const itemText = m[2].trim();
        if (!itemText)
            continue;
        if (indent >= 2 && items.length > 0) {
            // Sub-item: append to the last top-level item for context
            items[items.length - 1] += ' ' + itemText;
        }
        else {
            items.push(itemText);
        }
    }
    return items;
}
/**
 * Build a ParsedFinding from raw item text and severity.
 */
function toFinding(text, severity) {
    return { text, severity, hasEvidence: hasEvidence(text) };
}
// ============================================================
// Harsh-critic parser
// ============================================================
function parseVerdict(text) {
    // Match: **VERDICT: REJECT** or **VERDICT: ACCEPT-WITH-RESERVATIONS**
    const m = /\*{1,2}VERDICT\s*:\s*([A-Z][A-Z\s-]*?)\*{1,2}/i.exec(text);
    if (m)
        return m[1].trim();
    // Fallback: look for bare verdict-like keyword
    const bare = /\bVERDICT\s*:\s*([A-Z][A-Z\s-]+)/i.exec(text);
    if (bare)
        return bare[1].trim();
    return '';
}
function parseFindingsSection(text, headingPattern, severity) {
    return extractListItems(text, headingPattern).map((item) => toFinding(item, severity));
}
function parsePerspectiveSection(text, perspPattern) {
    return extractListItems(text, perspPattern);
}
function parseHarshCritic(rawOutput) {
    // Verdict
    const verdict = parseVerdict(rawOutput);
    // Pre-commitment predictions
    const hasPreCommitment = /\*{1,2}Pre-?commitment\s+Predictions?\*{1,2}/i.test(rawOutput);
    // Findings sections
    const criticalPattern = /\*{1,2}Critical\s+Findings?\*{1,2}[:\s]*/i;
    const majorPattern = /\*{1,2}Major\s+Findings?\*{1,2}[:\s]*/i;
    const minorPattern = /\*{1,2}Minor\s+Findings?\*{1,2}[:\s]*/i;
    const criticalFindings = parseFindingsSection(rawOutput, criticalPattern, 'CRITICAL');
    const majorFindings = parseFindingsSection(rawOutput, majorPattern, 'MAJOR');
    const minorFindings = parseFindingsSection(rawOutput, minorPattern, 'MINOR');
    // What's Missing
    const missingPattern = /\*{1,2}What'?s?\s+Missing\*{1,2}[:\s]*/i;
    const missingItems = extractListItems(rawOutput, missingPattern);
    const hasGapAnalysis = missingItems.length > 0;
    // Multi-Perspective Notes
    const multiPerspPattern = /\*{1,2}Multi-?Perspective\s+Notes?\*{1,2}/i;
    const hasMultiPerspective = multiPerspPattern.test(rawOutput);
    // Try structured sub-headings first (e.g., **Security**: ...)
    const securityPattern = /\*{1,2}Security\*{1,2}[:\s]*/i;
    const newHirePattern = /\*{1,2}New-?hire\*{1,2}[:\s]*/i;
    const opsPattern = /\*{1,2}Ops\*{1,2}[:\s]*/i;
    let security = parsePerspectiveSection(rawOutput, securityPattern);
    let newHire = parsePerspectiveSection(rawOutput, newHirePattern);
    let ops = parsePerspectiveSection(rawOutput, opsPattern);
    // Fallback: extract inline perspective items from Multi-Perspective Notes section
    // Handles format: "- Security: JWT secret rotation not addressed"
    if (hasMultiPerspective && security.length === 0 && newHire.length === 0 && ops.length === 0) {
        const perspItems = extractListItems(rawOutput, multiPerspPattern);
        for (const item of perspItems) {
            const perspMatch = /^(Security|New-?hire|Ops)\s*:\s*(.+)/i.exec(item);
            if (perspMatch) {
                const label = perspMatch[1].toLowerCase();
                const content = perspMatch[2].trim();
                if (label === 'security')
                    security.push(content);
                else if (label.startsWith('new'))
                    newHire.push(content);
                else if (label === 'ops')
                    ops.push(content);
            }
        }
    }
    return {
        verdict,
        criticalFindings,
        majorFindings,
        minorFindings,
        missingItems,
        perspectiveNotes: { security, newHire, ops },
        hasPreCommitment,
        hasGapAnalysis,
        hasMultiPerspective,
        rawOutput,
    };
}
// ============================================================
// Critic parser
// ============================================================
function parseCriticVerdict(text) {
    // Match: **OKAY** / **REJECT** / **[OKAY]** / **[REJECT]**
    const m = /\*{1,2}\[?\s*(OKAY|REJECT)\s*\]?\*{1,2}/i.exec(text);
    if (m)
        return m[1].toUpperCase();
    // Fallback: bare keyword at line start
    const bare = /^\s*\[?\s*(OKAY|REJECT)\s*\]?\s*$/im.exec(text);
    if (bare)
        return bare[1].toUpperCase();
    return '';
}
/**
 * Extract findings from critic's Summary / Justification paragraphs.
 * Each numbered list item or dash-bullet becomes a MAJOR finding (default severity).
 */
function parseCriticFindings(text) {
    const summaryPattern = /\*{1,2}(?:Summary|Justification)\s*:?\*{1,2}[:\s]*/i;
    const items = extractListItems(text, summaryPattern);
    return items.map((item) => toFinding(item, 'MAJOR'));
}
function parseCritic(rawOutput) {
    const verdict = parseCriticVerdict(rawOutput);
    // Critic has no severity-bucketed sections; put extracted findings in majorFindings
    const majorFindings = parseCriticFindings(rawOutput);
    return {
        verdict,
        criticalFindings: [],
        majorFindings,
        minorFindings: [],
        missingItems: [],
        perspectiveNotes: { security: [], newHire: [], ops: [] },
        hasPreCommitment: false,
        hasGapAnalysis: false,
        hasMultiPerspective: false,
        rawOutput,
    };
}
// ============================================================
// Public API
// ============================================================
/**
 * Parse raw markdown output from a review agent into a structured representation.
 *
 * @param rawOutput - The full markdown text produced by the agent.
 * @param agentType - Which agent produced the output ('harsh-critic' | 'critic').
 * @returns Structured ParsedAgentOutput.
 */
export function parseAgentOutput(rawOutput, agentType) {
    if (agentType === 'harsh-critic') {
        return parseHarshCritic(rawOutput);
    }
    return parseCritic(rawOutput);
}
//# sourceMappingURL=parser.js.map