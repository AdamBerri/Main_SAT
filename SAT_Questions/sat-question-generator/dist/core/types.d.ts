import { z } from 'zod';
export type SATSection = 'READING' | 'MATH';
export type ReadingDomain = 'Information_and_Ideas' | 'Craft_and_Structure' | 'Expression_of_Ideas' | 'Standard_English_Conventions';
export type MathDomain = 'Algebra' | 'Advanced_Math' | 'Problem_Solving' | 'Geometry_Trig';
export type ReadingSubtopic = 'central_ideas' | 'inferences' | 'command_of_evidence' | 'textual_evidence' | 'words_in_context' | 'text_structure' | 'cross_text_connections' | 'overall_purpose' | 'rhetorical_synthesis' | 'transitions' | 'boundaries' | 'form_structure_sense';
export type MathSubtopic = 'linear_equations' | 'linear_functions' | 'systems_of_equations' | 'linear_inequalities' | 'equivalent_expressions' | 'nonlinear_equations' | 'nonlinear_functions' | 'ratios_rates' | 'percentages' | 'units' | 'data_distributions' | 'probability' | 'inference' | 'evaluating_claims' | 'two_variable_data' | 'area_volume' | 'lines_angles' | 'triangles' | 'circles' | 'right_triangles';
export type Subtopic = ReadingSubtopic | MathSubtopic;
export interface TopicPath {
    section: SATSection;
    domain: ReadingDomain | MathDomain;
    subtopic: Subtopic;
}
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;
export interface DifficultyParams {
    overall: DifficultyLevel;
    conceptual: number;
    procedural: number;
    linguistic: number;
    computational: number;
}
export interface TemperatureConfig {
    generation: number;
    variation: number;
}
export declare const BaseQuestionSchema: z.ZodObject<{
    id: z.ZodString;
    topic: z.ZodObject<{
        section: z.ZodEnum<["READING", "MATH"]>;
        domain: z.ZodString;
        subtopic: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        section: "READING" | "MATH";
        domain: string;
        subtopic: string;
    }, {
        section: "READING" | "MATH";
        domain: string;
        subtopic: string;
    }>;
    difficulty: z.ZodObject<{
        overall: z.ZodNumber;
        conceptual: z.ZodNumber;
        procedural: z.ZodNumber;
        linguistic: z.ZodOptional<z.ZodNumber>;
        computational: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        overall: number;
        conceptual: number;
        procedural: number;
        linguistic?: number | undefined;
        computational?: number | undefined;
    }, {
        overall: number;
        conceptual: number;
        procedural: number;
        linguistic?: number | undefined;
        computational?: number | undefined;
    }>;
    stem: z.ZodString;
    choices: z.ZodArray<z.ZodObject<{
        label: z.ZodEnum<["A", "B", "C", "D"]>;
        text: z.ZodString;
        isCorrect: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        label: "A" | "B" | "C" | "D";
        text: string;
        isCorrect: boolean;
    }, {
        label: "A" | "B" | "C" | "D";
        text: string;
        isCorrect: boolean;
    }>, "many">;
    correctAnswer: z.ZodEnum<["A", "B", "C", "D"]>;
    explanation: z.ZodString;
    distractorRationale: z.ZodRecord<z.ZodEnum<["A", "B", "C", "D"]>, z.ZodString>;
    metadata: z.ZodObject<{
        generatedAt: z.ZodString;
        promptVersion: z.ZodString;
        modelUsed: z.ZodString;
        generationId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        generatedAt: string;
        promptVersion: string;
        modelUsed: string;
        generationId: string;
    }, {
        generatedAt: string;
        promptVersion: string;
        modelUsed: string;
        generationId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    topic: {
        section: "READING" | "MATH";
        domain: string;
        subtopic: string;
    };
    difficulty: {
        overall: number;
        conceptual: number;
        procedural: number;
        linguistic?: number | undefined;
        computational?: number | undefined;
    };
    stem: string;
    choices: {
        label: "A" | "B" | "C" | "D";
        text: string;
        isCorrect: boolean;
    }[];
    correctAnswer: "A" | "B" | "C" | "D";
    explanation: string;
    distractorRationale: Partial<Record<"A" | "B" | "C" | "D", string>>;
    metadata: {
        generatedAt: string;
        promptVersion: string;
        modelUsed: string;
        generationId: string;
    };
}, {
    id: string;
    topic: {
        section: "READING" | "MATH";
        domain: string;
        subtopic: string;
    };
    difficulty: {
        overall: number;
        conceptual: number;
        procedural: number;
        linguistic?: number | undefined;
        computational?: number | undefined;
    };
    stem: string;
    choices: {
        label: "A" | "B" | "C" | "D";
        text: string;
        isCorrect: boolean;
    }[];
    correctAnswer: "A" | "B" | "C" | "D";
    explanation: string;
    distractorRationale: Partial<Record<"A" | "B" | "C" | "D", string>>;
    metadata: {
        generatedAt: string;
        promptVersion: string;
        modelUsed: string;
        generationId: string;
    };
}>;
export type BaseQuestion = z.infer<typeof BaseQuestionSchema>;
export declare const ReadingQuestionSchema: z.ZodObject<{
    id: z.ZodString;
    topic: z.ZodObject<{
        section: z.ZodEnum<["READING", "MATH"]>;
        domain: z.ZodString;
        subtopic: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        section: "READING" | "MATH";
        domain: string;
        subtopic: string;
    }, {
        section: "READING" | "MATH";
        domain: string;
        subtopic: string;
    }>;
    difficulty: z.ZodObject<{
        overall: z.ZodNumber;
        conceptual: z.ZodNumber;
        procedural: z.ZodNumber;
        linguistic: z.ZodOptional<z.ZodNumber>;
        computational: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        overall: number;
        conceptual: number;
        procedural: number;
        linguistic?: number | undefined;
        computational?: number | undefined;
    }, {
        overall: number;
        conceptual: number;
        procedural: number;
        linguistic?: number | undefined;
        computational?: number | undefined;
    }>;
    stem: z.ZodString;
    choices: z.ZodArray<z.ZodObject<{
        label: z.ZodEnum<["A", "B", "C", "D"]>;
        text: z.ZodString;
        isCorrect: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        label: "A" | "B" | "C" | "D";
        text: string;
        isCorrect: boolean;
    }, {
        label: "A" | "B" | "C" | "D";
        text: string;
        isCorrect: boolean;
    }>, "many">;
    correctAnswer: z.ZodEnum<["A", "B", "C", "D"]>;
    explanation: z.ZodString;
    distractorRationale: z.ZodRecord<z.ZodEnum<["A", "B", "C", "D"]>, z.ZodString>;
    metadata: z.ZodObject<{
        generatedAt: z.ZodString;
        promptVersion: z.ZodString;
        modelUsed: z.ZodString;
        generationId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        generatedAt: string;
        promptVersion: string;
        modelUsed: string;
        generationId: string;
    }, {
        generatedAt: string;
        promptVersion: string;
        modelUsed: string;
        generationId: string;
    }>;
} & {
    passage: z.ZodString;
    passageMetadata: z.ZodObject<{
        genre: z.ZodEnum<["literary", "informational", "argumentative", "scientific"]>;
        wordCount: z.ZodNumber;
        source: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        genre: "literary" | "informational" | "argumentative" | "scientific";
        wordCount: number;
        source?: string | undefined;
    }, {
        genre: "literary" | "informational" | "argumentative" | "scientific";
        wordCount: number;
        source?: string | undefined;
    }>;
    hasImage: z.ZodOptional<z.ZodBoolean>;
    imageDescription: z.ZodOptional<z.ZodString>;
    imagePath: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    topic: {
        section: "READING" | "MATH";
        domain: string;
        subtopic: string;
    };
    difficulty: {
        overall: number;
        conceptual: number;
        procedural: number;
        linguistic?: number | undefined;
        computational?: number | undefined;
    };
    stem: string;
    choices: {
        label: "A" | "B" | "C" | "D";
        text: string;
        isCorrect: boolean;
    }[];
    correctAnswer: "A" | "B" | "C" | "D";
    explanation: string;
    distractorRationale: Partial<Record<"A" | "B" | "C" | "D", string>>;
    metadata: {
        generatedAt: string;
        promptVersion: string;
        modelUsed: string;
        generationId: string;
    };
    passage: string;
    passageMetadata: {
        genre: "literary" | "informational" | "argumentative" | "scientific";
        wordCount: number;
        source?: string | undefined;
    };
    hasImage?: boolean | undefined;
    imageDescription?: string | undefined;
    imagePath?: string | undefined;
}, {
    id: string;
    topic: {
        section: "READING" | "MATH";
        domain: string;
        subtopic: string;
    };
    difficulty: {
        overall: number;
        conceptual: number;
        procedural: number;
        linguistic?: number | undefined;
        computational?: number | undefined;
    };
    stem: string;
    choices: {
        label: "A" | "B" | "C" | "D";
        text: string;
        isCorrect: boolean;
    }[];
    correctAnswer: "A" | "B" | "C" | "D";
    explanation: string;
    distractorRationale: Partial<Record<"A" | "B" | "C" | "D", string>>;
    metadata: {
        generatedAt: string;
        promptVersion: string;
        modelUsed: string;
        generationId: string;
    };
    passage: string;
    passageMetadata: {
        genre: "literary" | "informational" | "argumentative" | "scientific";
        wordCount: number;
        source?: string | undefined;
    };
    hasImage?: boolean | undefined;
    imageDescription?: string | undefined;
    imagePath?: string | undefined;
}>;
export type ReadingQuestion = z.infer<typeof ReadingQuestionSchema>;
export declare const MathQuestionSchema: z.ZodObject<{
    id: z.ZodString;
    topic: z.ZodObject<{
        section: z.ZodEnum<["READING", "MATH"]>;
        domain: z.ZodString;
        subtopic: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        section: "READING" | "MATH";
        domain: string;
        subtopic: string;
    }, {
        section: "READING" | "MATH";
        domain: string;
        subtopic: string;
    }>;
    difficulty: z.ZodObject<{
        overall: z.ZodNumber;
        conceptual: z.ZodNumber;
        procedural: z.ZodNumber;
        linguistic: z.ZodOptional<z.ZodNumber>;
        computational: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        overall: number;
        conceptual: number;
        procedural: number;
        linguistic?: number | undefined;
        computational?: number | undefined;
    }, {
        overall: number;
        conceptual: number;
        procedural: number;
        linguistic?: number | undefined;
        computational?: number | undefined;
    }>;
    stem: z.ZodString;
    choices: z.ZodArray<z.ZodObject<{
        label: z.ZodEnum<["A", "B", "C", "D"]>;
        text: z.ZodString;
        isCorrect: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        label: "A" | "B" | "C" | "D";
        text: string;
        isCorrect: boolean;
    }, {
        label: "A" | "B" | "C" | "D";
        text: string;
        isCorrect: boolean;
    }>, "many">;
    correctAnswer: z.ZodEnum<["A", "B", "C", "D"]>;
    explanation: z.ZodString;
    distractorRationale: z.ZodRecord<z.ZodEnum<["A", "B", "C", "D"]>, z.ZodString>;
    metadata: z.ZodObject<{
        generatedAt: z.ZodString;
        promptVersion: z.ZodString;
        modelUsed: z.ZodString;
        generationId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        generatedAt: string;
        promptVersion: string;
        modelUsed: string;
        generationId: string;
    }, {
        generatedAt: string;
        promptVersion: string;
        modelUsed: string;
        generationId: string;
    }>;
} & {
    hasImage: z.ZodBoolean;
    imageDescription: z.ZodOptional<z.ZodString>;
    imagePath: z.ZodOptional<z.ZodString>;
    requiresCalculator: z.ZodBoolean;
    answerType: z.ZodEnum<["multiple_choice", "grid_in"]>;
    gridInAnswer: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    topic: {
        section: "READING" | "MATH";
        domain: string;
        subtopic: string;
    };
    difficulty: {
        overall: number;
        conceptual: number;
        procedural: number;
        linguistic?: number | undefined;
        computational?: number | undefined;
    };
    stem: string;
    choices: {
        label: "A" | "B" | "C" | "D";
        text: string;
        isCorrect: boolean;
    }[];
    correctAnswer: "A" | "B" | "C" | "D";
    explanation: string;
    distractorRationale: Partial<Record<"A" | "B" | "C" | "D", string>>;
    metadata: {
        generatedAt: string;
        promptVersion: string;
        modelUsed: string;
        generationId: string;
    };
    hasImage: boolean;
    requiresCalculator: boolean;
    answerType: "multiple_choice" | "grid_in";
    imageDescription?: string | undefined;
    imagePath?: string | undefined;
    gridInAnswer?: string | undefined;
}, {
    id: string;
    topic: {
        section: "READING" | "MATH";
        domain: string;
        subtopic: string;
    };
    difficulty: {
        overall: number;
        conceptual: number;
        procedural: number;
        linguistic?: number | undefined;
        computational?: number | undefined;
    };
    stem: string;
    choices: {
        label: "A" | "B" | "C" | "D";
        text: string;
        isCorrect: boolean;
    }[];
    correctAnswer: "A" | "B" | "C" | "D";
    explanation: string;
    distractorRationale: Partial<Record<"A" | "B" | "C" | "D", string>>;
    metadata: {
        generatedAt: string;
        promptVersion: string;
        modelUsed: string;
        generationId: string;
    };
    hasImage: boolean;
    requiresCalculator: boolean;
    answerType: "multiple_choice" | "grid_in";
    imageDescription?: string | undefined;
    imagePath?: string | undefined;
    gridInAnswer?: string | undefined;
}>;
export type MathQuestion = z.infer<typeof MathQuestionSchema>;
export type GeneratedQuestion = ReadingQuestion | MathQuestion;
export interface PromptVersion {
    version: string;
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
export type EvaluationDimension = 'faithfulness' | 'answer_validity' | 'distractor_quality' | 'difficulty_accuracy' | 'frontend_convertibility' | 'image_quality' | 'grammar_authenticity';
export interface AnchorSet {
    id: string;
    dimension: EvaluationDimension;
    anchors: Record<1 | 2 | 3 | 4 | 5, string>;
}
export interface SSRResult {
    dimension: EvaluationDimension;
    textualEvaluation: string;
    pmf: Record<1 | 2 | 3 | 4 | 5, number>;
    expectedValue: number;
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
export interface PREAMConfig {
    maxIterations: number;
    trainTestSplit: number;
    convergenceThreshold: number;
    minSamplesPerIteration: number;
    errorCategoryCount: number;
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
}
export interface PREAMState {
    topic: TopicPath;
    config: PREAMConfig;
    iterations: PREAMIteration[];
    currentBestVersion: string;
    bestTestScore: number;
    converged: boolean;
    startedAt: string;
    completedAt: string | null;
}
export interface APIKeyConfig {
    provider: 'anthropic' | 'openai' | 'google';
    key: string;
    rateLimit: number;
    currentUsage: number;
    resetAt: number;
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
//# sourceMappingURL=types.d.ts.map