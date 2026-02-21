#!/usr/bin/env node
/**
 * pream-cc-helper.mjs — Context-optimized PREAM helper for Claude Code
 *
 * Subcommands: init, prep-gen, prep-eval, compute-metrics, update-state, summary
 * Pure file I/O and math. No LLM calls. Uses only Node.js builtins.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BASE_DIR = resolve(__dirname, '..');
const TMP_BASE = '/tmp/pream';

// ═══════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════

const WEIGHTS = {
  answer_validity: 2.0,
  faithfulness: 1.5,
  distractor_quality: 1.0,
  difficulty_accuracy: 1.0,
  image_quality: 1.0,
  grammar_authenticity: 1.0,
  frontend_convertibility: 0.5,
};

const CRITICAL_DIMS = ['answer_validity', 'faithfulness'];
const PASS_THRESHOLD = 3.5;
const MAX_ITERATIONS = 10;
const CONVERGENCE_THRESHOLD = 0.02;

const DIFFICULTY_DESC = {
  1: 'Easy - Most students will answer correctly. Straightforward application of basic concepts.',
  2: 'Below Average - Slightly more challenging but still accessible to prepared students.',
  3: 'Medium - About half of students will answer correctly. Requires solid understanding.',
  4: 'Above Average - Challenging for most students. Requires strong conceptual grasp.',
  5: 'Hard - Only top students will answer correctly. Complex reasoning or multiple steps required.',
};

// Sub-dimension offsets for variety within each difficulty level
const SUB_OFFSETS = [
  [0.2, 0.0, 0.3],
  [0.0, 0.3, 0.1],
  [-0.2, 0.2, -0.1],
  [0.3, -0.2, 0.2],
  [-0.1, 0.1, -0.2],
];

const SYSTEM_PROMPTS = {
  MATH: `You are an expert SAT question writer with extensive experience creating official College Board SAT Math section questions. Your questions are indistinguishable from authentic SAT questions.

Key principles:
1. Follow SAT format precisely with clear mathematical notation
2. Use realistic contexts that are appropriate for SAT
3. Create problems that test genuine mathematical understanding
4. Design distractors that target specific misconceptions
5. Calibrate difficulty accurately to the specified level

You always output valid JSON matching the provided schema.`,

  READING: `You are an expert SAT question writer with extensive experience creating official College Board SAT Reading & Writing section questions. Your questions are indistinguishable from authentic SAT questions.

Key principles:
1. Follow SAT format precisely - single passage followed by a single question
2. Use appropriate vocabulary and sentence complexity for SAT
3. Create unambiguously correct answers with well-crafted distractors
4. Calibrate difficulty accurately to the specified level
5. Ensure passages are engaging and academically appropriate

You always output valid JSON matching the provided schema.`,
};

// SSR Anchor descriptions per dimension (1-5 scale)
const ANCHOR_TEXT = {
  faithfulness: {
    1: 'This question bears no resemblance to authentic SAT questions. The format is completely wrong, the style is inappropriate, and it would never appear on an actual College Board SAT exam.',
    2: "This question has significant deviations from SAT format and style. While it attempts to follow SAT conventions, there are major structural issues, inappropriate language complexity, or content that doesn't match what College Board would publish.",
    3: 'This question partially matches SAT style but has noticeable inconsistencies. The format is roughly correct but some elements feel off - perhaps the answer choices are formatted unusually, the stem is too long or short, or the difficulty calibration seems wrong.',
    4: 'This question closely follows SAT conventions with only minor deviations. The format, style, and difficulty are appropriate. A student would recognize this as SAT-like.',
    5: 'This question is indistinguishable from an official College Board SAT question. The format is perfect, the language style matches exactly, the difficulty is precisely calibrated, and all conventions are followed flawlessly.',
  },
  answer_validity: {
    1: 'The designated correct answer is clearly wrong, or multiple answer choices could be considered correct. The question has fundamental logical or factual errors that make it unsolvable or misleading.',
    2: 'The correct answer is technically defensible but problematic. There may be ambiguity that makes another choice seem equally valid, or the reasoning required to reach the answer is flawed.',
    3: "The correct answer is generally acceptable but has minor issues. The logic is sound but perhaps the justification could be clearer, or there's slight ambiguity that doesn't significantly impact solvability.",
    4: "The correct answer is clearly correct and well-justified. The logic is sound, there's no ambiguity, and a student who understands the material would reliably choose this answer.",
    5: 'The correct answer is unambiguously and definitively correct. The reasoning is airtight, the answer is the only defensible choice, and the explanation perfectly justifies why it\'s correct and why all distractors are wrong.',
  },
  distractor_quality: {
    1: 'The distractors are obviously wrong and would fool no one. They may be absurd, completely unrelated to the question, or so different from the correct answer that students can eliminate them instantly.',
    2: 'The distractors are weak and easily eliminated. While not absurd, they represent common misconceptions poorly or contain obvious tells that mark them as wrong.',
    3: 'The distractors are moderately effective. They represent some common errors but may not be as carefully crafted as they could be. Some are more plausible than others.',
    4: 'The distractors are well-crafted and represent genuine misconceptions. Each wrong answer targets a specific error that students commonly make. Elimination requires actual understanding.',
    5: 'The distractors are expertly crafted, each representing a distinct, psychometrically valid misconception. They are carefully calibrated to attract students who make specific errors.',
  },
  difficulty_accuracy: {
    1: "The stated difficulty is completely misaligned with the actual question. A question marked as 'easy' is actually extremely hard, or vice versa.",
    2: "The difficulty calibration is significantly off. There's a 2-3 level discrepancy between stated and actual difficulty.",
    3: 'The difficulty is roughly in the right range but imprecise. The question might be on the border between two difficulty levels.',
    4: 'The difficulty matches the stated level well. The cognitive demands, prerequisite knowledge, and solution complexity align with expectations for this difficulty tier.',
    5: 'The difficulty is perfectly calibrated to the stated level. Every aspect - complexity, required knowledge, solution steps, time pressure - precisely matches expectations.',
  },
  frontend_convertibility: {
    1: "The JSON structure is fundamentally broken or incompatible with frontend rendering. Required fields are missing, data types are wrong, or the structure doesn't match the expected schema.",
    2: 'The JSON has significant structural issues that would require manual intervention. Some fields are incorrectly formatted or content includes unparseable elements.',
    3: 'The JSON is structurally valid but has formatting issues. Special characters may not be properly escaped, LaTeX/math notation might not follow conventions.',
    4: 'The JSON is well-formed and renders correctly. All fields are present and properly typed, content is correctly escaped, and the structure follows the expected schema.',
    5: 'The JSON is perfectly structured for frontend consumption. All content is optimally formatted, special characters are correctly handled, math notation renders beautifully.',
  },
  image_quality: {
    1: "The generated image is completely unusable. It doesn't match the description, contains errors that would confuse students, or is visually incomprehensible.",
    2: 'The image has significant issues that affect usability. It roughly matches the description but contains noticeable errors, unclear labels, or visual problems.',
    3: "The image is functional but not polished. It conveys the necessary information but could be clearer, better labeled, or more professionally presented.",
    4: 'The image is well-designed and clearly communicates the intended information. Labels are clear, proportions are accurate, and the visual style is appropriate.',
    5: "The image is publication-quality and perfectly matches what would appear on an official SAT. It's clear, accurate, appropriately styled, and enhances understanding.",
  },
  grammar_authenticity: {
    1: "The grammar question doesn't test actual SAT grammar concepts. It may test obscure rules, use inappropriate sentence structures, or create artificial scenarios.",
    2: 'The question tests a legitimate grammar concept but does so poorly. The sentence structure is unnatural, the error is either too obvious or too subtle.',
    3: "The question tests an appropriate grammar concept in a reasonable way. The sentence structure is acceptable and the error is appropriately challenging.",
    4: 'The question effectively tests SAT grammar concepts with appropriate sentence structures and error types. The style closely matches official questions.',
    5: 'The question is a perfect example of SAT grammar testing. The sentence structure, error type, answer choices, and overall presentation are indistinguishable from official College Board grammar questions.',
  },
};

// ═══════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════

function parseTopic(str) {
  if (!str) { console.error('Missing topic argument'); process.exit(1); }
  const parts = str.split('/');
  if (parts.length !== 3) {
    console.error(`Invalid topic: "${str}". Expected SECTION/Domain/subtopic`);
    process.exit(1);
  }
  return { section: parts[0], domain: parts[1], subtopic: parts[2] };
}

function topicKey(t) { return `${t.section}_${t.domain}_${t.subtopic}`; }
function pDir(t) { return join(BASE_DIR, 'prompts', t.section, t.domain, t.subtopic); }
function genDir(t, iter) { return join(BASE_DIR, 'generated', t.section, t.domain, t.subtopic, `pream_iter${iter}`); }
function tmpD(t) { return join(TMP_BASE, topicKey(t)); }
function schemaFile(section) { return join(BASE_DIR, 'src', 'schemas', `${section.toLowerCase()}-schema.json`); }

function readJSON(p) { return JSON.parse(readFileSync(p, 'utf-8')); }
function writeJSON(p, d) { writeFileSync(p, JSON.stringify(d, null, 2) + '\n'); }
function ensureDir(p) { mkdirSync(p, { recursive: true }); }
function clamp(v) { return Math.max(1, Math.min(5, +v.toFixed(1))); }

function qStart(diffLevel) { return (diffLevel - 1) * 5 + 1; }
function qStartBatch(diffLevel, n) { return (diffLevel - 1) * n + 1; }

function makeDiffParams(level, idx, section) {
  const [c, p, x] = SUB_OFFSETS[idx % 5];
  const params = { overall: level, conceptual: clamp(level + c), procedural: clamp(level + p) };
  if (section === 'READING') params.linguistic = clamp(level + x);
  else params.computational = clamp(level + x);
  return params;
}

function fmtDiffBlock(params, section) {
  const desc = DIFFICULTY_DESC[params.overall];
  const third = section === 'READING'
    ? `- Linguistic complexity: ${params.linguistic}/5`
    : `- Computational complexity: ${params.computational}/5`;
  return `DIFFICULTY CALIBRATION:
- Overall: Level ${params.overall}/5 - ${desc}
- Conceptual complexity: ${params.conceptual}/5
- Procedural complexity: ${params.procedural}/5
${third}

The question difficulty should precisely match these specifications.`;
}

function parseFlags(args) {
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      flags[key] = (i + 1 < args.length && !args[i + 1].startsWith('--')) ? args[++i] : true;
    }
  }
  return flags;
}

// ═══════════════════════════════════════════════════════════════
// init <topic>
// ═══════════════════════════════════════════════════════════════

function handleInit(args) {
  const topic = parseTopic(args[0]);
  const dir = pDir(topic);
  const statePath = join(dir, 'pream_state.json');
  const configPath = join(dir, 'config.json');

  if (existsSync(statePath)) {
    const state = readJSON(statePath);
    if (state.converged) {
      return out({ status: 'converged', iter: state.iterations.length, version: state.currentBestVersion, bestScore: state.bestTestScore });
    }
    const iters = state.iterations;
    let version = state.currentBestVersion;
    if (iters.length > 0) {
      const last = iters[iters.length - 1];
      version = last.newPromptVersion || last.promptVersionUsed;
    }
    return out({ status: 'ready', iter: iters.length + 1, version, bestScore: state.bestTestScore });
  }

  ensureDir(dir);
  let version = '1.0.0';
  if (existsSync(configPath)) {
    version = readJSON(configPath).currentVersion || '1.0.0';
  }

  const promptPath = join(dir, `prompt_v${version}.md`);
  if (!existsSync(promptPath)) {
    writeFileSync(promptPath, `Generate an SAT ${topic.section} question for the topic: ${topic.subtopic}.

The question should:
1. Follow official SAT format and style
2. Have exactly 4 answer choices (A, B, C, D)
3. Have one unambiguously correct answer
4. Include well-crafted distractors that represent common misconceptions
5. Match the specified difficulty level

Output as valid JSON matching the provided schema.

{DIFFICULTY_DESCRIPTION}`);
  }

  writeJSON(statePath, {
    topic: { section: topic.section, domain: topic.domain, subtopic: topic.subtopic },
    config: { maxIterations: MAX_ITERATIONS, trainTestSplit: 0.8, convergenceThreshold: CONVERGENCE_THRESHOLD, minSamplesPerIteration: 25, errorCategoryCount: 5 },
    iterations: [],
    currentBestVersion: version,
    bestTestScore: 0,
    converged: false,
    startedAt: new Date().toISOString(),
    completedAt: null,
  });

  out({ status: 'ready', iter: 1, version, bestScore: 0 });
}

// ═══════════════════════════════════════════════════════════════
// prep-gen <topic> <iter> [version]
// ═══════════════════════════════════════════════════════════════

function handlePrepGen(args) {
  const topic = parseTopic(args[0]);
  const iter = parseInt(args[1], 10);
  const version = args[2] || resolveVersion(topic);
  const dir = pDir(topic);
  const outDir = genDir(topic, iter);
  const tmp = tmpD(topic);

  ensureDir(outDir);
  ensureDir(tmp);

  // Read prompt
  const promptPath = join(dir, `prompt_v${version}.md`);
  if (!existsSync(promptPath)) {
    console.error(`Prompt not found: ${promptPath}`);
    process.exit(1);
  }
  const promptText = readFileSync(promptPath, 'utf-8');

  // Read schema
  const sPath = schemaFile(topic.section);
  if (!existsSync(sPath)) {
    console.error(`Schema not found: ${sPath}`);
    process.exit(1);
  }
  const schema = readFileSync(sPath, 'utf-8');

  const contextFiles = [];

  for (let d = 1; d <= 5; d++) {
    const start = qStart(d);
    const questions = [];
    for (let i = 0; i < 5; i++) {
      const qNum = start + i;
      const params = makeDiffParams(d, i, topic.section);
      const diffBlock = fmtDiffBlock(params, topic.section);
      const diffJSON = JSON.stringify(params);
      questions.push(`### Q${qNum} -> Write to: ${outDir}/question_Q${qNum}.json
Difficulty parameters (use in the JSON difficulty field): ${diffJSON}

${diffBlock}`);
    }

    // Build prompt with difficulty placeholder replaced
    const promptForLevel = promptText.replace(
      '{DIFFICULTY_DESCRIPTION}',
      `[Use the specific DIFFICULTY CALIBRATION from each question slot below]`
    );

    const content = `# Generation Context - Difficulty Level ${d} (Questions Q${start}-Q${start + 4})

## Your Role
${SYSTEM_PROMPTS[topic.section]}

## Generation Prompt
${promptForLevel}

## Topic
- Section: ${topic.section}
- Domain: ${topic.domain}
- Subtopic: ${topic.subtopic}

## Output Schema
\`\`\`json
${schema}
\`\`\`

## Required Field Values for Every Question
- topic.section: "${topic.section}"
- topic.domain: "${topic.domain}"
- topic.subtopic: "${topic.subtopic}"
- metadata.promptVersion: "${version}"
- metadata.modelUsed: "claude-sonnet-4-6"
- metadata.generatedAt: current ISO datetime
- id: unique UUID v4
- metadata.generationId: unique UUID v4
- Exactly one choice must have isCorrect: true
- correctAnswer must match the label of the correct choice
${topic.section === 'MATH' ? '- hasImage: false (unless the question genuinely requires a figure)\n- requiresCalculator: set appropriately\n- answerType: "multiple_choice"' : ''}

## Questions to Generate (5 total)

Generate 5 unique, distinct SAT questions. Write each as a SEPARATE valid JSON file to the path shown.

${questions.join('\n\n')}

## Important
- Output ONLY valid JSON in each file, no markdown, no explanation
- Each question must be completely different in scenario/context
- All JSON string values must be properly escaped
`;

    const filePath = join(tmp, `gen_d${d}.md`);
    writeFileSync(filePath, content);
    contextFiles.push(filePath);
  }

  out({ prepared: 5, outputDir: outDir, contextFiles });
}

// ═══════════════════════════════════════════════════════════════
// prep-eval <topic> <iter> [version]
// ═══════════════════════════════════════════════════════════════

function handlePrepEval(args) {
  const topic = parseTopic(args[0]);
  const iter = parseInt(args[1], 10);
  const version = args[2] || resolveVersion(topic);
  const dir = pDir(topic);
  const outDir = genDir(topic, iter);
  const tmp = tmpD(topic);

  ensureDir(tmp);

  // Read the prompt for faithfulness reference
  const promptPath = join(dir, `prompt_v${version}.md`);
  const promptText = existsSync(promptPath) ? readFileSync(promptPath, 'utf-8') : '(prompt not available)';

  // Determine extra dimensions
  const isGrammar = topic.section === 'READING' && topic.domain === 'Standard_English_Conventions';

  // Build dimension anchor text
  const stdDims = ['answer_validity', 'faithfulness', 'distractor_quality', 'difficulty_accuracy', 'frontend_convertibility'];
  const allDims = [...stdDims];
  if (isGrammar) allDims.push('grammar_authenticity');
  // image_quality added per-question if hasImage

  let dimText = '';
  for (const dim of allDims) {
    const w = WEIGHTS[dim];
    const critical = CRITICAL_DIMS.includes(dim) ? ' (CRITICAL - must score >= 3.5)' : '';
    dimText += `### ${dim} (weight: ${w}${critical})\n`;
    for (let s = 1; s <= 5; s++) {
      dimText += `- ${s}: ${ANCHOR_TEXT[dim][s]}\n`;
    }
    dimText += '\n';
  }

  // Add image_quality anchors for reference
  dimText += `### image_quality (weight: 1.0) — ONLY evaluate if the question has hasImage: true\n`;
  for (let s = 1; s <= 5; s++) {
    dimText += `- ${s}: ${ANCHOR_TEXT.image_quality[s]}\n`;
  }
  dimText += '\n';

  let totalQuestions = 0;
  const contextFiles = [];

  for (let d = 1; d <= 5; d++) {
    const start = qStart(d);
    let questionsBlock = '';
    let qCount = 0;

    for (let i = 0; i < 5; i++) {
      const qNum = start + i;
      const qPath = join(outDir, `question_Q${qNum}.json`);
      if (!existsSync(qPath)) {
        questionsBlock += `### Q${qNum}\n(MISSING - file not found at ${qPath})\n\n`;
        continue;
      }
      const qJSON = readFileSync(qPath, 'utf-8');
      questionsBlock += `### Q${qNum}\n\`\`\`json\n${qJSON}\n\`\`\`\n\n`;
      qCount++;
    }
    totalQuestions += qCount;

    const content = `# Evaluation Context - Difficulty Level ${d} (Questions Q${start}-Q${start + 4})

You are evaluating SAT question quality. Score each question on every applicable dimension.

## Scoring Scale
Score each dimension from 1 to 7:
- 1-5: Use the anchor descriptions below as calibration points
- 6: Exceptional quality, exceeds all anchor-5 criteria
- 7: Perfect, publication-ready, indistinguishable from official SAT

## Scoring Dimensions and Anchors

${dimText}

## Pass Criteria
- Weighted average score >= ${PASS_THRESHOLD}
- Both critical dimensions (answer_validity, faithfulness) must individually score >= ${PASS_THRESHOLD}

## Generation Prompt Used (for faithfulness reference)
\`\`\`
${promptText}
\`\`\`

## Questions to Evaluate

${questionsBlock}

## Output Instructions
Write your scores as JSON to: ${join(tmp, `scores_d${d}.json`)}

Format:
\`\`\`json
{
  "Q${start}": {
    "answer_validity": <score>,
    "faithfulness": <score>,
    "distractor_quality": <score>,
    "difficulty_accuracy": <score>,
    "frontend_convertibility": <score>
  },
  "Q${start + 1}": { ... },
  ...
}
\`\`\`

If a question has hasImage: true, also include "image_quality": <score>.
${isGrammar ? 'Include "grammar_authenticity": <score> for all questions (Standard English Conventions topic).' : ''}

Output ONLY the JSON file. No other text or explanation.
`;

    const filePath = join(tmp, `eval_d${d}.md`);
    writeFileSync(filePath, content);
    contextFiles.push(filePath);
  }

  out({ prepared: 5, questions: totalQuestions, contextFiles });
}

// ═══════════════════════════════════════════════════════════════
// compute-metrics <topic> <iter>
// ═══════════════════════════════════════════════════════════════

function handleComputeMetrics(args) {
  const topic = parseTopic(args[0]);
  const iter = parseInt(args[1], 10);
  const tmp = tmpD(topic);
  const statePath = join(pDir(topic), 'pream_state.json');

  // Read all score files
  const allScores = {};
  for (let d = 1; d <= 5; d++) {
    const scorePath = join(tmp, `scores_d${d}.json`);
    if (!existsSync(scorePath)) {
      console.error(`Score file missing: ${scorePath}`);
      process.exit(1);
    }
    const scores = readJSON(scorePath);
    Object.assign(allScores, scores);
  }

  // Compute weighted average for each question
  const questionMetrics = {};
  for (const [qKey, dims] of Object.entries(allScores)) {
    let weightedSum = 0;
    let totalWeight = 0;
    let criticalPass = true;

    for (const [dim, score] of Object.entries(dims)) {
      const w = WEIGHTS[dim];
      if (w === undefined) continue;
      weightedSum += score * w;
      totalWeight += w;
      if (CRITICAL_DIMS.includes(dim) && score < PASS_THRESHOLD) {
        criticalPass = false;
      }
    }

    const weightedAvg = totalWeight > 0 ? +(weightedSum / totalWeight).toFixed(3) : 0;
    const pass = criticalPass && weightedAvg >= PASS_THRESHOLD;

    questionMetrics[qKey] = { weightedAvg, pass, dims };
  }

  // Split train (Q1-Q20) vs test (Q21-Q25)
  const trainScores = {};
  const testScores = {};
  const failedQuestions = [];

  for (const [qKey, m] of Object.entries(questionMetrics)) {
    const qNum = parseInt(qKey.replace('Q', ''), 10);
    if (qNum <= 20) {
      trainScores[qKey] = m.weightedAvg;
      if (!m.pass) failedQuestions.push(qKey);
    } else {
      testScores[qKey] = m.weightedAvg;
      if (!m.pass) failedQuestions.push(qKey);
    }
  }

  const trainVals = Object.values(trainScores);
  const testVals = Object.values(testScores);
  const trainAvg = trainVals.length > 0 ? +(trainVals.reduce((a, b) => a + b, 0) / trainVals.length).toFixed(3) : 0;
  const testAvg = testVals.length > 0 ? +(testVals.reduce((a, b) => a + b, 0) / testVals.length).toFixed(3) : 0;
  const trainPassRate = trainVals.length > 0 ? +(trainVals.filter((_, i) => Object.values(questionMetrics)[i]?.pass !== false).length / trainVals.length).toFixed(2) : 0;

  // Recompute pass rates properly
  const trainEntries = Object.entries(questionMetrics).filter(([k]) => parseInt(k.replace('Q', ''), 10) <= 20);
  const testEntries = Object.entries(questionMetrics).filter(([k]) => parseInt(k.replace('Q', ''), 10) > 20);
  const tpr = trainEntries.length > 0 ? +(trainEntries.filter(([, m]) => m.pass).length / trainEntries.length).toFixed(2) : 0;
  const tepr = testEntries.length > 0 ? +(testEntries.filter(([, m]) => m.pass).length / testEntries.length).toFixed(2) : 0;

  // Bottom 5 questions by score
  const allSorted = Object.entries(questionMetrics)
    .sort((a, b) => a[1].weightedAvg - b[1].weightedAvg)
    .slice(0, 5);

  const bottomQuestions = allSorted.map(([qKey, m]) => {
    // Find weakest dimension
    let weakest = '';
    let weakestScore = Infinity;
    for (const [dim, score] of Object.entries(m.dims)) {
      if (score < weakestScore) {
        weakestScore = score;
        weakest = `${dim}:${score}`;
      }
    }
    return { q: qKey, score: m.weightedAvg, weakest };
  });

  // Convergence check
  let prevTestAvg = 0;
  let bestScore = 0;
  let bestVersion = '1.0.0';
  if (existsSync(statePath)) {
    const state = readJSON(statePath);
    bestScore = state.bestTestScore || 0;
    bestVersion = state.currentBestVersion || '1.0.0';
    const iters = state.iterations;
    if (iters.length > 0) {
      prevTestAvg = iters[iters.length - 1].testMetrics?.avgScore || 0;
    }
  }

  let improvement = prevTestAvg > 0 ? ((testAvg - prevTestAvg) / prevTestAvg * 100) : 0;
  const improvementStr = prevTestAvg > 0 ? `${improvement >= 0 ? '+' : ''}${improvement.toFixed(1)}%` : 'N/A';

  // Update best if improved
  if (testAvg > bestScore) {
    bestScore = testAvg;
    // bestVersion will be set by update-state since it knows the new version
  }

  const converged = (iter >= 2 && prevTestAvg > 0 && Math.abs(improvement) < 2.0) || iter >= MAX_ITERATIONS;

  const metrics = {
    trainAvg, testAvg,
    trainPassRate: tpr, testPassRate: tepr,
    converged, bestScore, bestVersion,
    improvement: improvementStr,
    trainScores, testScores,
    failedQuestions,
    bottomQuestions,
  };

  // Write metrics file
  writeJSON(join(tmp, 'metrics.json'), metrics);
  out(metrics);
}

// ═══════════════════════════════════════════════════════════════
// update-state <topic> <iter> [flags]
// ═══════════════════════════════════════════════════════════════

function handleUpdateState(args) {
  const topic = parseTopic(args[0]);
  const iter = parseInt(args[1], 10);
  const flags = parseFlags(args.slice(2));
  const tmp = tmpD(topic);
  const dir = pDir(topic);
  const statePath = join(dir, 'pream_state.json');
  const configPath = join(dir, 'config.json');

  // Read metrics
  const metricsPath = join(tmp, 'metrics.json');
  if (!existsSync(metricsPath)) {
    console.error(`Metrics file not found: ${metricsPath}`);
    process.exit(1);
  }
  const metrics = readJSON(metricsPath);

  // Read current state
  if (!existsSync(statePath)) {
    console.error(`State file not found: ${statePath}`);
    process.exit(1);
  }
  const state = readJSON(statePath);

  // Parse optional flags
  const versionUsed = flags['version-used'] || state.currentBestVersion;
  const newVersion = flags['new-version'] || null;
  const improvementDesc = flags['improvement'] || 'No improvement description provided';
  let errorCategories = [];
  if (flags['errors']) {
    try { errorCategories = JSON.parse(flags['errors']); } catch { errorCategories = []; }
  }

  // Build iteration record
  const iterRecord = {
    iteration: iter,
    promptVersionUsed: versionUsed,
    trainSetSize: Object.keys(metrics.trainScores || {}).length,
    testSetSize: Object.keys(metrics.testScores || {}).length,
    trainMetrics: {
      avgScore: metrics.trainAvg,
      passRate: metrics.trainPassRate,
      errorCategories,
    },
    testMetrics: {
      avgScore: metrics.testAvg,
      passRate: metrics.testPassRate,
    },
    improvementMade: improvementDesc,
    newPromptVersion: newVersion,
  };

  state.iterations.push(iterRecord);

  // Update best score tracking
  if (metrics.testAvg > state.bestTestScore) {
    state.bestTestScore = metrics.testAvg;
    state.currentBestVersion = newVersion || versionUsed;
  }

  // Convergence
  if (metrics.converged) {
    state.converged = true;
    state.completedAt = new Date().toISOString();
  }

  writeJSON(statePath, state);

  // Update config.json if new version was created
  if (newVersion && existsSync(configPath)) {
    const config = readJSON(configPath);
    config.currentVersion = newVersion;
    if (!config.versions) config.versions = [];
    config.versions.push({
      version: newVersion,
      createdAt: new Date().toISOString(),
      parentVersion: versionUsed,
      preamIteration: iter,
      performanceMetrics: {
        trainAvgScore: metrics.trainAvg,
        trainPassRate: metrics.trainPassRate,
        testAvgScore: metrics.testAvg,
        testPassRate: metrics.testPassRate,
      },
    });
    writeJSON(configPath, config);
  }

  out({ saved: true, converged: state.converged });
}

// ═══════════════════════════════════════════════════════════════
// summary <topic>
// ═══════════════════════════════════════════════════════════════

function handleSummary(args) {
  const topic = parseTopic(args[0]);
  const statePath = join(pDir(topic), 'pream_state.json');

  if (!existsSync(statePath)) {
    console.log(`No PREAM state found for ${args[0]}`);
    return;
  }

  const state = readJSON(statePath);
  const t = state.topic;
  console.log(`\n=== PREAM Summary: ${t.section}/${t.domain}/${t.subtopic} ===`);
  console.log(`Status: ${state.converged ? 'CONVERGED' : 'IN PROGRESS'}`);
  console.log(`Best version: ${state.currentBestVersion} (score: ${state.bestTestScore})`);
  console.log(`Iterations: ${state.iterations.length}/${state.config.maxIterations}\n`);

  if (state.iterations.length > 0) {
    console.log('| Iter | Version  | Train Avg | Train Pass | Test Avg | Test Pass | Improvement |');
    console.log('|------|----------|-----------|------------|----------|-----------|-------------|');

    let prevTest = 0;
    for (const it of state.iterations) {
      const trainAvg = it.trainMetrics.avgScore.toFixed(3);
      const trainPass = (it.trainMetrics.passRate * 100).toFixed(0) + '%';
      const testAvg = it.testMetrics.avgScore.toFixed(3);
      const testPass = (it.testMetrics.passRate * 100).toFixed(0) + '%';
      const imp = prevTest > 0 ? `${it.testMetrics.avgScore >= prevTest ? '+' : ''}${((it.testMetrics.avgScore - prevTest) / prevTest * 100).toFixed(1)}%` : '-';
      console.log(`| ${String(it.iteration).padEnd(4)} | ${(it.promptVersionUsed || '').padEnd(8)} | ${trainAvg.padEnd(9)} | ${trainPass.padEnd(10)} | ${testAvg.padEnd(8)} | ${testPass.padEnd(9)} | ${imp.padEnd(11)} |`);
      prevTest = it.testMetrics.avgScore;
    }
  }
  console.log('');
}

// ═══════════════════════════════════════════════════════════════
// prep-batch <topic> [count-per-difficulty] [version]
// ═══════════════════════════════════════════════════════════════

function handlePrepBatch(args) {
  const topic = parseTopic(args[0]);
  const countPerDiff = parseInt(args[1] || '5', 10);
  const version = args[2] || resolveVersion(topic);
  const batchId = Date.now().toString(36);
  const dir = pDir(topic);
  const outDir = join(BASE_DIR, 'generated', topic.section, topic.domain, topic.subtopic, `batch_${batchId}`);
  const tmp = tmpD(topic);

  ensureDir(outDir);
  ensureDir(tmp);

  const promptPath = join(dir, `prompt_v${version}.md`);
  if (!existsSync(promptPath)) {
    console.error(`Prompt not found: ${promptPath}`);
    process.exit(1);
  }
  const promptText = readFileSync(promptPath, 'utf-8');

  const sPath = schemaFile(topic.section);
  if (!existsSync(sPath)) {
    console.error(`Schema not found: ${sPath}`);
    process.exit(1);
  }
  const schema = readFileSync(sPath, 'utf-8');

  const contextFiles = [];

  for (let d = 1; d <= 5; d++) {
    const start = qStartBatch(d, countPerDiff);
    const questions = [];
    for (let i = 0; i < countPerDiff; i++) {
      const qNum = start + i;
      const params = makeDiffParams(d, i, topic.section);
      const diffBlock = fmtDiffBlock(params, topic.section);
      const diffJSON = JSON.stringify(params);
      questions.push(`### Q${qNum} -> Write to: ${outDir}/question_Q${qNum}.json
Difficulty parameters (use in the JSON difficulty field): ${diffJSON}

${diffBlock}`);
    }

    const promptForLevel = promptText.replace(
      '{DIFFICULTY_DESCRIPTION}',
      `[Use the specific DIFFICULTY CALIBRATION from each question slot below]`
    );

    const content = `# Batch Generation - Difficulty Level ${d} (Questions Q${start}-Q${start + countPerDiff - 1})

## Your Role
${SYSTEM_PROMPTS[topic.section]}

## Generation Prompt
${promptForLevel}

## Topic
- Section: ${topic.section}
- Domain: ${topic.domain}
- Subtopic: ${topic.subtopic}

## Output Schema
\`\`\`json
${schema}
\`\`\`

## Required Field Values for Every Question
- topic.section: "${topic.section}"
- topic.domain: "${topic.domain}"
- topic.subtopic: "${topic.subtopic}"
- metadata.promptVersion: "${version}"
- metadata.modelUsed: "claude-sonnet-4-6"
- metadata.generatedAt: current ISO datetime
- id: unique UUID v4
- metadata.generationId: unique UUID v4
- Exactly one choice must have isCorrect: true
- correctAnswer must match the label of the correct choice
${topic.section === 'MATH' ? '- hasImage: false (unless the question genuinely requires a figure)\n- requiresCalculator: set appropriately\n- answerType: "multiple_choice"' : ''}

## Questions to Generate (${countPerDiff} total)

Generate ${countPerDiff} unique, distinct SAT questions. Write each as a SEPARATE valid JSON file to the path shown.

${questions.join('\n\n')}

## Important
- Output ONLY valid JSON in each file, no markdown, no explanation
- Each question must be completely different in scenario/context
- All JSON string values must be properly escaped
`;

    const filePath = join(tmp, `gen_d${d}.md`);
    writeFileSync(filePath, content);
    contextFiles.push(filePath);
  }

  out({ batchId, prepared: 5, totalQuestions: countPerDiff * 5, countPerDiff, outputDir: outDir, contextFiles, version });
}

// ═══════════════════════════════════════════════════════════════
// prep-batch-eval <topic> <batchId> [count-per-difficulty] [version]
// ═══════════════════════════════════════════════════════════════

function handlePrepBatchEval(args) {
  const topic = parseTopic(args[0]);
  const batchId = args[1];
  const countPerDiff = parseInt(args[2] || '5', 10);
  const version = args[3] || resolveVersion(topic);
  const dir = pDir(topic);
  const outDir = join(BASE_DIR, 'generated', topic.section, topic.domain, topic.subtopic, `batch_${batchId}`);
  const tmp = tmpD(topic);

  ensureDir(tmp);

  const promptPath = join(dir, `prompt_v${version}.md`);
  const promptText = existsSync(promptPath) ? readFileSync(promptPath, 'utf-8') : '(prompt not available)';

  const isGrammar = topic.section === 'READING' && topic.domain === 'Standard_English_Conventions';

  const stdDims = ['answer_validity', 'faithfulness', 'distractor_quality', 'difficulty_accuracy', 'frontend_convertibility'];
  const allDims = [...stdDims];
  if (isGrammar) allDims.push('grammar_authenticity');

  let dimText = '';
  for (const dim of allDims) {
    const w = WEIGHTS[dim];
    const critical = CRITICAL_DIMS.includes(dim) ? ' (CRITICAL - must score >= 3.5)' : '';
    dimText += `### ${dim} (weight: ${w}${critical})\n`;
    for (let s = 1; s <= 5; s++) {
      dimText += `- ${s}: ${ANCHOR_TEXT[dim][s]}\n`;
    }
    dimText += '\n';
  }

  dimText += `### image_quality (weight: 1.0) — ONLY evaluate if the question has hasImage: true\n`;
  for (let s = 1; s <= 5; s++) {
    dimText += `- ${s}: ${ANCHOR_TEXT.image_quality[s]}\n`;
  }
  dimText += '\n';

  let totalQuestions = 0;
  const contextFiles = [];

  for (let d = 1; d <= 5; d++) {
    const start = qStartBatch(d, countPerDiff);
    let questionsBlock = '';
    let qCount = 0;

    for (let i = 0; i < countPerDiff; i++) {
      const qNum = start + i;
      const qPath = join(outDir, `question_Q${qNum}.json`);
      if (!existsSync(qPath)) {
        questionsBlock += `### Q${qNum}\n(MISSING - file not found at ${qPath})\n\n`;
        continue;
      }
      const qJSON = readFileSync(qPath, 'utf-8');
      questionsBlock += `### Q${qNum}\n\`\`\`json\n${qJSON}\n\`\`\`\n\n`;
      qCount++;
    }
    totalQuestions += qCount;

    const content = `# Evaluation Context - Difficulty Level ${d} (Questions Q${start}-Q${start + countPerDiff - 1})

You are evaluating SAT question quality. Score each question on every applicable dimension.

## Scoring Scale
Score each dimension from 1 to 7:
- 1-5: Use the anchor descriptions below as calibration points
- 6: Exceptional quality, exceeds all anchor-5 criteria
- 7: Perfect, publication-ready, indistinguishable from official SAT

## Scoring Dimensions and Anchors

${dimText}

## Pass Criteria
- Weighted average score >= ${PASS_THRESHOLD}
- Both critical dimensions (answer_validity, faithfulness) must individually score >= ${PASS_THRESHOLD}

## Generation Prompt Used (for faithfulness reference)
\`\`\`
${promptText}
\`\`\`

## Questions to Evaluate

${questionsBlock}

## Output Instructions
Write your scores as JSON to: ${join(tmp, `scores_d${d}.json`)}

Format:
\`\`\`json
{
  "Q${start}": {
    "answer_validity": <score>,
    "faithfulness": <score>,
    "distractor_quality": <score>,
    "difficulty_accuracy": <score>,
    "frontend_convertibility": <score>
  },
  "Q${start + 1}": { ... },
  ...
}
\`\`\`

If a question has hasImage: true, also include "image_quality": <score>.
${isGrammar ? 'Include "grammar_authenticity": <score> for all questions (Standard English Conventions topic).' : ''}

Output ONLY the JSON file. No other text or explanation.
`;

    const filePath = join(tmp, `eval_d${d}.md`);
    writeFileSync(filePath, content);
    contextFiles.push(filePath);
  }

  out({ prepared: 5, questions: totalQuestions, contextFiles });
}

// ═══════════════════════════════════════════════════════════════
// finalize-batch <topic> <batchId> [count-per-difficulty]
// ═══════════════════════════════════════════════════════════════

function handleFinalizeBatch(args) {
  const topic = parseTopic(args[0]);
  const batchId = args[1];
  const countPerDiff = parseInt(args[2] || '5', 10);
  const outDir = join(BASE_DIR, 'generated', topic.section, topic.domain, topic.subtopic, `batch_${batchId}`);
  const parentDir = join(BASE_DIR, 'generated', topic.section, topic.domain, topic.subtopic);
  const tmp = tmpD(topic);

  if (!existsSync(outDir)) {
    console.error(`Batch directory not found: ${outDir}`);
    process.exit(1);
  }

  // Read all score files
  const allScores = {};
  for (let d = 1; d <= 5; d++) {
    const scorePath = join(tmp, `scores_d${d}.json`);
    if (!existsSync(scorePath)) {
      console.error(`Score file missing: ${scorePath}`);
      process.exit(1);
    }
    Object.assign(allScores, readJSON(scorePath));
  }

  const results = { passed: 0, failed: 0, total: 0, errors: 0 };
  const totalQ = countPerDiff * 5;

  for (let qNum = 1; qNum <= totalQ; qNum++) {
    const qKey = `Q${qNum}`;
    const filePath = join(outDir, `question_${qKey}.json`);

    if (!existsSync(filePath)) {
      results.errors++;
      continue;
    }

    try {
      const question = readJSON(filePath);
      const scores = allScores[qKey];

      if (!scores) {
        results.errors++;
        continue;
      }

      let weightedSum = 0;
      let totalWeight = 0;
      let criticalPass = true;

      for (const [dim, score] of Object.entries(scores)) {
        const w = WEIGHTS[dim];
        if (w === undefined) continue;
        weightedSum += score * w;
        totalWeight += w;
        if (CRITICAL_DIMS.includes(dim) && score < PASS_THRESHOLD) {
          criticalPass = false;
        }
      }

      const weightedAvg = totalWeight > 0 ? +(weightedSum / totalWeight).toFixed(2) : 0;
      const pass = criticalPass && weightedAvg >= PASS_THRESHOLD;
      const status = pass ? 'pass' : 'fail';

      question._evaluation = {
        status,
        score: weightedAvg,
        evaluatedAt: new Date().toISOString(),
      };

      const uuid = question.id || `unknown_${qNum}`;
      const newFilename = `${uuid}_${status}_${weightedAvg.toFixed(2)}.json`;
      writeJSON(join(parentDir, newFilename), question);

      results.total++;
      if (pass) results.passed++;
      else results.failed++;
    } catch (e) {
      results.errors++;
    }
  }

  results.passRate = results.total > 0 ? +(results.passed / results.total).toFixed(2) : 0;
  out(results);
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

function resolveVersion(topic) {
  const statePath = join(pDir(topic), 'pream_state.json');
  if (existsSync(statePath)) {
    const state = readJSON(statePath);
    const iters = state.iterations;
    if (iters.length > 0) {
      const last = iters[iters.length - 1];
      return last.newPromptVersion || last.promptVersionUsed;
    }
    return state.currentBestVersion;
  }
  const configPath = join(pDir(topic), 'config.json');
  if (existsSync(configPath)) {
    return readJSON(configPath).currentVersion || '1.0.0';
  }
  return '1.0.0';
}

function out(obj) { console.log(JSON.stringify(obj)); }

// ═══════════════════════════════════════════════════════════════
// Main Dispatcher
// ═══════════════════════════════════════════════════════════════

const [cmd, ...rest] = process.argv.slice(2);

switch (cmd) {
  case 'init': handleInit(rest); break;
  case 'prep-gen': handlePrepGen(rest); break;
  case 'prep-eval': handlePrepEval(rest); break;
  case 'compute-metrics': handleComputeMetrics(rest); break;
  case 'update-state': handleUpdateState(rest); break;
  case 'summary': handleSummary(rest); break;
  case 'prep-batch': handlePrepBatch(rest); break;
  case 'prep-batch-eval': handlePrepBatchEval(rest); break;
  case 'finalize-batch': handleFinalizeBatch(rest); break;
  default:
    console.error('Usage: pream-cc-helper.mjs <command> <topic> [args]');
    console.error('Commands: init, prep-gen, prep-eval, compute-metrics, update-state, summary, prep-batch, prep-batch-eval, finalize-batch');
    console.error('Topic format: SECTION/Domain/subtopic (e.g., MATH/Geometry_Trig/right_triangles)');
    process.exit(1);
}
