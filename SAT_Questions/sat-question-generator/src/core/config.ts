import * as fs from 'fs';
import * as path from 'path';
import type {
  TopicPath,
  SATSection,
  ReadingDomain,
  MathDomain,
  ReadingSubtopic,
  MathSubtopic,
  PREAMConfig,
  TemperatureConfig,
} from './types';

// ============================================
// Directory Paths
// ============================================

export const PACKAGE_ROOT = path.resolve(__dirname, '../..');
export const DATA_ROOT = process.env.PREAM_DATA_ROOT
  ? path.resolve(process.env.PREAM_DATA_ROOT)
  : PACKAGE_ROOT;

export const PROMPTS_DIR = path.join(DATA_ROOT, 'prompts');
export const SCHEMAS_DIR = path.join(PACKAGE_ROOT, 'schemas');
export const GENERATED_DIR = path.join(DATA_ROOT, 'generated');
export const EVALUATION_DIR = path.join(DATA_ROOT, 'evaluation');
export const GOLD_STANDARDS_DIR = path.join(DATA_ROOT, 'gold_standards');

// ============================================
// Topic Hierarchy
// ============================================

export const READING_HIERARCHY: Record<ReadingDomain, ReadingSubtopic[]> = {
  Information_and_Ideas: [
    'central_ideas',
    'inferences',
    'command_of_evidence',
    'textual_evidence',
  ],
  Craft_and_Structure: [
    'words_in_context',
    'text_structure',
    'cross_text_connections',
    'overall_purpose',
  ],
  Expression_of_Ideas: ['rhetorical_synthesis', 'transitions'],
  Standard_English_Conventions: ['boundaries', 'form_structure_sense'],
};

export const MATH_HIERARCHY: Record<MathDomain, MathSubtopic[]> = {
  Algebra: [
    'linear_equations',
    'linear_functions',
    'systems_of_equations',
    'linear_inequalities',
  ],
  Advanced_Math: [
    'equivalent_expressions',
    'nonlinear_equations',
    'nonlinear_functions',
  ],
  Problem_Solving: [
    'ratios_rates',
    'percentages',
    'units',
    'data_distributions',
    'probability',
    'inference',
    'evaluating_claims',
    'two_variable_data',
  ],
  Geometry_Trig: [
    'area_volume',
    'lines_angles',
    'triangles',
    'circles',
    'right_triangles',
  ],
};

// ============================================
// Default Configurations
// ============================================

export const DEFAULT_PREAM_CONFIG: PREAMConfig = {
  maxIterations: 5,
  trainTestSplit: 0.8,
  convergenceThreshold: 0.02, // 2% improvement threshold
  minSamplesPerIteration: 25,
  errorCategoryCount: 5,
  repairEnabled: true,
  maxRepairAttempts: 1,
};

export const DEFAULT_TEMPERATURE_CONFIG: TemperatureConfig = {
  generation: 0.7,
  variation: 0.3,
};

// ============================================
// Model Configuration
// ============================================

export const MODEL_CONFIG = {
  generation: {
    provider: 'openai' as const,
    model:
      process.env.GENERATION_MODEL ||
      process.env.LLM_MODEL ||
      process.env.MINIMAX_MODEL ||
      'glm-5',
    maxTokens: 4096,
  },
  evaluation: {
    provider: 'openai' as const,
    model:
      process.env.EVALUATION_MODEL ||
      process.env.LLM_MODEL ||
      process.env.MINIMAX_MODEL ||
      process.env.GENERATION_MODEL ||
      'glm-5',
    maxTokens: 2048,
  },
  imageGeneration: {
    provider: 'google' as const,
    model: 'gemini-2.0-flash-exp', // Nano Banana
  },
};

// ============================================
// SSR Configuration
// ============================================

export const SSR_CONFIG = {
  temperature: 2.0, // Temperature parameter for PMF softmax calculation
  acceptableThreshold: 3.5, // Score >= this is acceptable (pass/fail threshold)
};

// ============================================
// Utility Functions
// ============================================

export function getTopicPath(
  section: SATSection,
  domain: ReadingDomain | MathDomain,
  subtopic: ReadingSubtopic | MathSubtopic
): TopicPath {
  return { section, domain, subtopic };
}

export function getPromptDir(topic: TopicPath): string {
  return path.join(PROMPTS_DIR, topic.section, topic.domain, topic.subtopic);
}

export function getSchemaPath(topic: TopicPath): string {
  return path.join(getPromptDir(topic), 'schema.json');
}

export function getPromptPath(topic: TopicPath, version: string): string {
  return path.join(getPromptDir(topic), `prompt_v${version}.md`);
}

export function getGeneratedDir(topic: TopicPath): string {
  return path.join(
    GENERATED_DIR,
    topic.section,
    topic.domain,
    topic.subtopic
  );
}

export function getEvaluationDir(topic: TopicPath): string {
  return path.join(
    EVALUATION_DIR,
    topic.section,
    topic.domain,
    topic.subtopic
  );
}

export function getAllTopics(): TopicPath[] {
  const topics: TopicPath[] = [];

  // Reading topics
  for (const [domain, subtopics] of Object.entries(READING_HIERARCHY)) {
    for (const subtopic of subtopics) {
      topics.push({
        section: 'READING',
        domain: domain as ReadingDomain,
        subtopic: subtopic as ReadingSubtopic,
      });
    }
  }

  // Math topics
  for (const [domain, subtopics] of Object.entries(MATH_HIERARCHY)) {
    for (const subtopic of subtopics) {
      topics.push({
        section: 'MATH',
        domain: domain as MathDomain,
        subtopic: subtopic as MathSubtopic,
      });
    }
  }

  return topics;
}

export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function topicToString(topic: TopicPath): string {
  return `${topic.section}/${topic.domain}/${topic.subtopic}`;
}

export function parseTopicString(topicStr: string): TopicPath {
  const [section, domain, subtopic] = topicStr.split('/');
  return {
    section: section as SATSection,
    domain: domain as ReadingDomain | MathDomain,
    subtopic: subtopic as ReadingSubtopic | MathSubtopic,
  };
}
