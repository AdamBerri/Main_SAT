import { z } from 'zod';

// ============================================
// Question Domain Types
// ============================================

export type SATSection = 'READING' | 'MATH';

export type ReadingDomain =
  | 'Information_and_Ideas'
  | 'Craft_and_Structure'
  | 'Expression_of_Ideas'
  | 'Standard_English_Conventions';

export type MathDomain =
  | 'Algebra'
  | 'Advanced_Math'
  | 'Problem_Solving'
  | 'Geometry_Trig';

export type ReadingSubtopic =
  // Information and Ideas
  | 'central_ideas'
  | 'inferences'
  | 'command_of_evidence'
  | 'command_of_evidence_quantitative'
  | 'textual_evidence'
  // Craft and Structure
  | 'words_in_context'
  | 'text_structure'
  | 'cross_text_connections'
  | 'overall_purpose'
  // Expression of Ideas
  | 'rhetorical_synthesis'
  | 'transitions'
  // Standard English Conventions
  | 'boundaries'
  | 'form_structure_sense';

export type MathSubtopic =
  // Algebra
  | 'linear_equations'
  | 'linear_functions'
  | 'systems_of_equations'
  | 'linear_inequalities'
  // Advanced Math
  | 'equivalent_expressions'
  | 'nonlinear_equations'
  | 'nonlinear_functions'
  // Problem Solving
  | 'ratios_rates'
  | 'percentages'
  | 'units'
  | 'data_distributions'
  | 'probability'
  | 'inference'
  | 'evaluating_claims'
  | 'two_variable_data'
  // Geometry & Trig
  | 'area_volume'
  | 'lines_angles'
  | 'triangles'
  | 'circles'
  | 'right_triangles';

export type Subtopic = ReadingSubtopic | MathSubtopic;

export interface TopicPath {
  section: SATSection;
  domain: ReadingDomain | MathDomain;
  subtopic: Subtopic;
}

// ============================================
// Difficulty and Sampling Types
// ============================================

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface DifficultyParams {
  overall: DifficultyLevel;
  conceptual: number;  // 1-5 continuous
  procedural: number;  // 1-5 continuous
  linguistic: number;  // 1-5 continuous (for reading)
  computational: number; // 1-5 continuous (for math)
}

export interface TemperatureConfig {
  generation: number;  // 0.0 - 1.0
  variation: number;   // Controls difficulty sampling spread
}

// ============================================
// Question Output Types
// ============================================

export const BaseQuestionSchema = z.object({
  id: z.string().uuid(),
  topic: z.object({
    section: z.enum(['READING', 'MATH']),
    domain: z.string(),
    subtopic: z.string(),
  }),
  difficulty: z.object({
    overall: z.number().min(1).max(5),
    conceptual: z.number().min(1).max(5),
    procedural: z.number().min(1).max(5),
    linguistic: z.number().min(1).max(5).optional(),
    computational: z.number().min(1).max(5).optional(),
  }),
  stem: z.string(),
  choices: z.array(z.object({
    label: z.enum(['A', 'B', 'C', 'D']),
    text: z.string(),
    isCorrect: z.boolean(),
  })),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']),
  explanation: z.string(),
  distractorRationale: z.record(z.enum(['A', 'B', 'C', 'D']), z.string()),
  metadata: z.object({
    generatedAt: z.string().datetime(),
    promptVersion: z.string(),
    modelUsed: z.string(),
    generationId: z.string().uuid(),
    blueprintId: z.string().optional(),
  }),
});

export type BaseQuestion = z.infer<typeof BaseQuestionSchema>;

// Blueprint used to diversify question surface forms
export interface Blueprint {
  id: string;
  description: string;
  surface:
    | 'single prose passage'
    | 'informational passage'
    | 'passage + data_display'
    | 'paired_passages'
    | 'sentence_focus'
    | 'notes_to_sentence'
    | 'word_problem'
    | 'graph_description'
    | 'data_display'
    | 'diagram';
  reasoning: string;
  representation: 'text_only' | 'chart_or_table' | 'graph_or_sketch' | 'diagram' | 'table_or_chart';
}

export const ReadingQuestionSchema = BaseQuestionSchema.extend({
  passage: z.string(),
  passageMetadata: z.object({
    genre: z.enum(['literary', 'informational', 'argumentative', 'scientific']),
    wordCount: z.number(),
    source: z.string().optional(),
  }),
  // Image support for reading questions with charts/graphs/tables
  hasImage: z.boolean().optional(),
  imageDescription: z.string().optional(),
  imagePath: z.string().optional(),
});

export type ReadingQuestion = z.infer<typeof ReadingQuestionSchema>;

export const MathQuestionSchema = BaseQuestionSchema.extend({
  hasImage: z.boolean(),
  imageDescription: z.string().optional(),
  imagePath: z.string().optional(),
  requiresCalculator: z.boolean(),
  answerType: z.enum(['multiple_choice', 'grid_in']),
  gridInAnswer: z.string().optional(),
});

export type MathQuestion = z.infer<typeof MathQuestionSchema>;

export type GeneratedQuestion = ReadingQuestion | MathQuestion;

// ============================================
// Prompt and Version Types
// ============================================

export interface PromptVersion {
  version: string;  // semver format: "1.0.0"
  content: string;
  createdAt: string;
  parentVersion: string | null;
  preamIteration: number;
  performanceMetrics: {
    avgFaithfulness: number;
    avgAnswerValidity: number;
    avgDistractorQuality: number;
    avgDifficultyAccuracy: number;
    avgFrontendConvertibility: number;
    sampleSize: number;
  } | null;
}

export interface PromptConfig {
  topic: TopicPath;
  currentVersion: string;
  versions: PromptVersion[];
  temperatureConfig: TemperatureConfig;
  schemaPath: string;
}

// ============================================
// Evaluation Types (SSR-based)
// ============================================

export type EvaluationDimension =
  | 'faithfulness'
  | 'answer_validity'
  | 'distractor_quality'
  | 'difficulty_accuracy'
  | 'frontend_convertibility'
  | 'image_quality'
  | 'grammar_authenticity';

export interface AnchorSet {
  id: string;
  dimension: EvaluationDimension;
  anchors: Record<1 | 2 | 3 | 4 | 5, string>;
}

export interface SSRResult {
  dimension: EvaluationDimension;
  textualEvaluation: string;
  pmf: Record<1 | 2 | 3 | 4 | 5, number>;  // probability mass function
  expectedValue: number;  // The 0.5-precision Likert score
  anchorSetUsed: string;
}

export interface MicroJudgeResult {
  dimension: EvaluationDimension;
  verdict: 'acceptable' | 'unacceptable';
  ssrScore: SSRResult;
  explanation: string;
  suggestedImprovement: string | null;
}

export interface QuestionEvaluation {
  questionId: string;
  generationId: string;
  evaluatedAt: string;
  judgeResults: MicroJudgeResult[];
  aggregateScore: number;
  passesThreshold: boolean;
  errorCategories: string[];
}

// ============================================
// PREAM Loop Types
// ============================================

export interface PREAMConfig {
  maxIterations: number;
  trainTestSplit: number;  // e.g., 0.8 for 80/20
  convergenceThreshold: number;  // Stop if improvement < this
  minSamplesPerIteration: number;
  errorCategoryCount: number;  // Number of error categories to extract
  repairEnabled: boolean;       // Enable self-healing repair step before evaluation
  maxRepairAttempts: number;    // Max repair passes per question (default 1)
}

// ============================================
// Repair / Self-Healing Types
// ============================================

export type RepairCategory =
  | 'math_error'             // stem numbers don't produce stated answer
  | 'distractor_rationale'   // vague or unverifiable distractor reasoning
  | 'distractor_value'       // distractor value doesn't match its derivation
  | 'non_integer_mismatch'   // non-integer choice when correct answer is integer
  | 'self_debug_language'    // "Wait," "Let me recalculate," etc. in explanation
  | 'schema_fix';            // structural/schema issues

export interface RepairResult {
  questionId: string;
  repaired: boolean;
  issuesFound: RepairCategory[];
  issueDetails: string[];       // human-readable description of each issue
  originalScore?: number;       // optional pre-repair eval score
}

export interface PREAMIteration {
  iteration: number;
  promptVersionUsed: string;
  trainSetSize: number;
  testSetSize: number;
  trainMetrics: {
    avgScore: number;
    passRate: number;
    errorCategories: Array<{
      category: string;
      frequency: number;
      exampleErrors: string[];
    }>;
  };
  testMetrics: {
    avgScore: number;
    passRate: number;
  };
  improvementMade: string;
  newPromptVersion: string;
  repairStats?: {
    totalAttempted: number;
    totalRepaired: number;
    issueBreakdown: Record<RepairCategory, number>;
  };
}

export interface PREAMState {
  topic: TopicPath;
  config: PREAMConfig;
  iterations: PREAMIteration[];
  currentBestVersion: string;
  bestTestScore: number;  // Track best score separately per PrEAM paper
  converged: boolean;
  startedAt: string;
  completedAt: string | null;
}

// ============================================
// Batch Execution Types
// ============================================

export interface APIKeyConfig {
  provider: 'zhipu' | 'anthropic' | 'openai' | 'google';
  key: string;
  rateLimit: number;  // requests per minute
  currentUsage: number;
  resetAt: number;  // timestamp
}

export interface BatchConfig {
  batchId: string;
  topics: TopicPath[];
  questionsPerTopic: number;
  concurrency: number;
  apiKeys: APIKeyConfig[];
}

export interface BatchResult {
  batchId: string;
  startedAt: string;
  completedAt: string;
  totalGenerated: number;
  totalPassed: number;
  byTopic: Record<string, {
    generated: number;
    passed: number;
    avgScore: number;
  }>;
  errors: Array<{
    topic: string;
    error: string;
    timestamp: string;
  }>;
}

// ============================================
// Image Generation Types
// ============================================

export interface ImageGenerationRequest {
  questionId: string;
  description: string;
  type: 'graph' | 'geometry' | 'chart' | 'diagram' | 'table';
  specifications: {
    width?: number;
    height?: number;
    style?: string;
    elements?: string[];
  };
}

export interface GeneratedImage {
  id: string;
  questionId: string;
  path: string;
  description: string;
  generatedAt: string;
  evaluationScore: number | null;
}
