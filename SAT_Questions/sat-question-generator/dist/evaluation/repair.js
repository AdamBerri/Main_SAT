"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionRepairer = void 0;
exports.createRepairer = createRepairer;
const config_1 = require("../core/config");
const glm_client_1 = require("../core/glm-client");
const schema_validator_1 = require("../schemas/schema-validator");
const SELF_DEBUG_PATTERNS = [
    /\bwait\b/i,
    /\blet me recalculate\b/i,
    /\bactually\b/i,
    /\bhmm\b/i,
    /\bhold on\b/i,
    /\bcorrection\b/i,
    /\bi need to revise\b/i,
    /\bstart over\b/i,
    /\bthat doesn'?t (?:give|work|produce)\b/i,
    /\blet me (?:re)?check\b/i,
];
const VAGUE_RATIONALE_PATTERNS = [
    /^results? from (?:a )?(?:solving|calculation|computational?|algebraic|arithmetic|proportion|rounding) (?:error|mistake|slip|incorrectly)\.?$/i,
    /^(?:from|results? from) (?:an? )?(?:incorrect|wrong) (?:setup|calculation|computation)\.?$/i,
    /^(?:from|results? from) (?:reversing|swapping) .{0,20}$/i,
    /^correct(?:\.| answer)?$/i,
];
/**
 * QuestionRepairer - Self-healing step that fixes common generation issues
 * before questions go to the judge panel.
 *
 * Catches:
 * 1. Math errors (stem numbers don't produce stated answer)
 * 2. Vague distractor rationales ("calculation error")
 * 3. Distractor values that don't match their derivations
 * 4. Non-integer distractors when correct answer is integer
 * 5. Self-debugging language left in explanations
 */
class QuestionRepairer {
    client;
    constructor(apiKey) {
        this.client = (0, glm_client_1.createGLMClient)(apiKey);
    }
    /**
     * Run the repair pass on a single question.
     * Returns the repaired question and a report of what was fixed.
     */
    async repair(question, topic) {
        // 1. Detect issues locally (cheap checks first)
        const localIssues = this.detectLocalIssues(question);
        // 2. If no local issues, still run the math-verification pass
        //    since we can't verify math locally
        const allIssues = [...localIssues];
        // 3. Send to LLM for repair (math verification + rationale expansion + fixes)
        const repaired = await this.llmRepair(question, topic, allIssues);
        // 4. Validate the repaired question against schema
        const validation = (0, schema_validator_1.fullValidation)(repaired, topic);
        const finalQuestion = validation.valid ? validation.question : question;
        // 5. Detect what changed
        const issuesFound = this.diffIssues(question, finalQuestion, allIssues);
        const result = {
            questionId: question.id,
            repaired: issuesFound.length > 0,
            issuesFound: issuesFound.map(i => i.category),
            issueDetails: issuesFound.map(i => i.detail),
        };
        return { question: finalQuestion, result };
    }
    /**
     * Repair a batch of questions. Returns repaired questions + aggregate stats.
     */
    async repairBatch(questions, topic) {
        const repairedQuestions = [];
        const results = [];
        const issueBreakdown = {};
        for (const q of questions) {
            try {
                const { question: fixed, result } = await this.repair(q, topic);
                repairedQuestions.push(fixed);
                results.push(result);
                for (const cat of result.issuesFound) {
                    issueBreakdown[cat] = (issueBreakdown[cat] || 0) + 1;
                }
            }
            catch (e) {
                // If repair fails, keep original
                console.error(`Repair failed for ${q.id}, keeping original: ${e}`);
                repairedQuestions.push(q);
                results.push({
                    questionId: q.id,
                    repaired: false,
                    issuesFound: [],
                    issueDetails: [`Repair error: ${e}`],
                });
            }
        }
        return {
            questions: repairedQuestions,
            results,
            stats: {
                totalAttempted: questions.length,
                totalRepaired: results.filter(r => r.repaired).length,
                issueBreakdown: issueBreakdown,
            },
        };
    }
    /**
     * Cheap local checks that don't need an LLM call.
     */
    detectLocalIssues(question) {
        const issues = [];
        // Check for self-debugging language in explanation
        for (const pattern of SELF_DEBUG_PATTERNS) {
            if (pattern.test(question.explanation)) {
                const match = question.explanation.match(pattern);
                issues.push({
                    category: 'self_debug_language',
                    detail: `Explanation contains revision language: "${match?.[0]}"`,
                });
                break; // one is enough to flag it
            }
        }
        // Check for vague distractor rationales
        const wrongChoices = question.choices.filter(c => !c.isCorrect);
        for (const choice of wrongChoices) {
            const rationale = question.distractorRationale[choice.label];
            if (rationale) {
                // Check if it's just a label like "Correct answer." for the correct choice key
                if (VAGUE_RATIONALE_PATTERNS.some(p => p.test(rationale.trim()))) {
                    issues.push({
                        category: 'distractor_rationale',
                        detail: `Choice ${choice.label} has vague rationale: "${rationale.slice(0, 80)}"`,
                    });
                }
                // Also flag rationales that are too short to contain a real derivation
                if (rationale.length < 40) {
                    issues.push({
                        category: 'distractor_rationale',
                        detail: `Choice ${choice.label} rationale is too short (${rationale.length} chars): "${rationale}"`,
                    });
                }
            }
        }
        // Check for non-integer distractors when correct answer is integer
        const correctChoice = question.choices.find(c => c.isCorrect);
        if (correctChoice) {
            const correctNum = parseFloat(correctChoice.text.replace(/[,$%]/g, ''));
            if (!isNaN(correctNum) && Number.isInteger(correctNum)) {
                for (const choice of wrongChoices) {
                    const text = choice.text.trim();
                    // Check for fractions like 66⅔ or decimals like 127.5
                    if (/[⅓⅔½¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/.test(text) || (/\./.test(text) && !Number.isInteger(parseFloat(text.replace(/[,$%]/g, ''))))) {
                        issues.push({
                            category: 'non_integer_mismatch',
                            detail: `Choice ${choice.label} is non-integer ("${text}") but correct answer is integer`,
                        });
                    }
                }
            }
        }
        return issues;
    }
    /**
     * LLM-powered repair: verifies math, fixes rationales, cleans explanation.
     */
    async llmRepair(question, topic, knownIssues) {
        const issueList = knownIssues.length > 0
            ? `\n\nKNOWN ISSUES DETECTED (fix these):\n${knownIssues.map((i, idx) => `${idx + 1}. [${i.category}] ${i.detail}`).join('\n')}`
            : '';
        const response = await this.client.chat.completions.create({
            model: config_1.MODEL_CONFIG.generation.model,
            max_tokens: config_1.MODEL_CONFIG.generation.maxTokens,
            temperature: 0, // deterministic for repair
            messages: [
                {
                    role: 'system',
                    content: REPAIR_SYSTEM_PROMPT,
                },
                {
                    role: 'user',
                    content: `Repair this ${topic.section} / ${topic.domain} / ${topic.subtopic} question:\n\n\`\`\`json\n${JSON.stringify(question, null, 2)}\n\`\`\`${issueList}\n\nReturn the repaired question as a single JSON object. If no repairs are needed, return the original unchanged.`,
                },
            ],
        });
        const text = (0, glm_client_1.extractText)(response);
        if (!text)
            return question;
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch)
                return question;
            const parsed = JSON.parse(this.sanitizeJSON(jsonMatch[0]));
            // Preserve original metadata and id - don't let the repair model change these
            parsed.id = question.id;
            parsed.metadata = question.metadata;
            parsed.topic = question.topic;
            return parsed;
        }
        catch (e) {
            console.error(`Failed to parse repaired question JSON: ${e}`);
            return question;
        }
    }
    /**
     * Compare original and repaired to determine what actually changed.
     */
    diffIssues(original, repaired, localIssues) {
        const issues = [];
        // Carry forward local issues if the repair actually changed something relevant
        for (const issue of localIssues) {
            if (issue.category === 'self_debug_language' && original.explanation !== repaired.explanation) {
                issues.push(issue);
            }
            if (issue.category === 'distractor_rationale') {
                const origRationales = JSON.stringify(original.distractorRationale);
                const repairedRationales = JSON.stringify(repaired.distractorRationale);
                if (origRationales !== repairedRationales) {
                    issues.push(issue);
                }
            }
            if (issue.category === 'non_integer_mismatch') {
                const origChoices = JSON.stringify(original.choices);
                const repairedChoices = JSON.stringify(repaired.choices);
                if (origChoices !== repairedChoices) {
                    issues.push(issue);
                }
            }
        }
        // Detect math fixes (stem or correct answer changed)
        if (original.stem !== repaired.stem || original.correctAnswer !== repaired.correctAnswer) {
            issues.push({ category: 'math_error', detail: 'Stem or correct answer was modified to fix math consistency' });
        }
        // Detect distractor value changes
        for (const choice of original.choices) {
            const repairedChoice = repaired.choices.find(c => c.label === choice.label);
            if (repairedChoice && choice.text !== repairedChoice.text && !choice.isCorrect) {
                issues.push({ category: 'distractor_value', detail: `Choice ${choice.label} value changed: "${choice.text}" -> "${repairedChoice.text}"` });
            }
        }
        return issues;
    }
    /**
     * Basic JSON sanitization for control characters.
     */
    sanitizeJSON(jsonStr) {
        let result = '';
        let i = 0;
        while (i < jsonStr.length) {
            const char = jsonStr[i];
            if (char === '"') {
                result += char;
                i++;
                while (i < jsonStr.length) {
                    const c = jsonStr[i];
                    const code = c.charCodeAt(0);
                    if (c === '\\') {
                        result += c;
                        i++;
                        if (i < jsonStr.length) {
                            result += jsonStr[i];
                            i++;
                        }
                    }
                    else if (c === '"') {
                        result += c;
                        i++;
                        break;
                    }
                    else if (code < 32) {
                        switch (code) {
                            case 9:
                                result += '\\t';
                                break;
                            case 10:
                                result += '\\n';
                                break;
                            case 13:
                                result += '\\r';
                                break;
                            default: result += `\\u${code.toString(16).padStart(4, '0')}`;
                        }
                        i++;
                    }
                    else {
                        result += c;
                        i++;
                    }
                }
            }
            else {
                result += char;
                i++;
            }
        }
        return result;
    }
}
exports.QuestionRepairer = QuestionRepairer;
// ============================================
// Repair System Prompt
// ============================================
const REPAIR_SYSTEM_PROMPT = `You are a math question repair specialist. You receive SAT questions that may have issues and must fix them while preserving the question's intent and difficulty.

YOUR REPAIR CHECKLIST:

1. MATH VERIFICATION (most critical):
   - Solve the problem from the stem yourself, step by step
   - Verify your answer matches the choice marked as correct
   - If it does NOT match: fix the stem numbers so they produce the stated correct answer
     (prefer adjusting stem values over changing the correct answer)
   - Verify all arithmetic in the explanation is correct

2. DISTRACTOR RATIONALE QUALITY:
   - Each wrong-answer rationale MUST show a specific, single algebraic error
   - MUST include the actual derivation that produces the distractor value
   - Format: "This results from [specific error like 'adding instead of subtracting the flat fee']. [Step-by-step derivation]: ... = [distractor value]."
   - Replace any vague rationales ("calculation error", "incorrect setup", "proportion error")
   - The correct answer's rationale should explain WHY it's correct with key steps

3. DISTRACTOR VALUE CONSISTENCY:
   - For each wrong answer, verify that the described error actually produces that value
   - If a rationale says "dividing by 3 instead of 5 gives 120" — check that the division actually gives 120
   - If it doesn't, either fix the rationale derivation or change the distractor value

4. NON-INTEGER FIXES:
   - If the correct answer is a clean integer, ALL choices must be clean integers
   - Replace fractional distractors (66⅔, 127.5) with integer values from plausible errors
   - Design backwards: pick integer distractor values, then find the single error that produces each

5. EXPLANATION CLEANUP:
   - Remove ALL revision language: "Wait," "Actually," "Let me recalculate," "Hmm," "Hold on," "Correction"
   - If the explanation contains self-corrections, rewrite it as a clean forward solution
   - Show every arithmetic step explicitly
   - Never include the internal thought process — only the final clean solution

RULES:
- Preserve the question's difficulty level, context, and overall structure
- Keep the same correct answer letter (A/B/C/D) unless math verification proves it wrong
- Keep the same id, metadata, and topic fields exactly as-is
- Output ONLY the repaired JSON object, no commentary
- If the question has no issues, return it unchanged`;
/**
 * Create repairer from environment
 */
function createRepairer() {
    const apiKey = (0, glm_client_1.resolveLLMApiKey)();
    return new QuestionRepairer(apiKey);
}
//# sourceMappingURL=repair.js.map