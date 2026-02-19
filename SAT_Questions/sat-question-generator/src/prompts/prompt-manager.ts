import * as fs from 'fs';
import * as path from 'path';
import type {
  TopicPath,
  PromptConfig,
  PromptVersion,
  DifficultyParams,
  TemperatureConfig,
  Blueprint,
} from '../core/types';
import {
  getPromptDir,
  getPromptPath,
  getSchemaPath,
  ensureDirectoryExists,
  DEFAULT_TEMPERATURE_CONFIG,
  PROMPTS_DIR,
} from '../core/config';
import { buildPrompt, READING_BASE_PROMPTS, MATH_BASE_PROMPTS } from './base-prompts';

/**
 * Manages prompt versions, loading, and configuration for each topic.
 */
export class PromptManager {
  /**
   * Get or create prompt configuration for a topic
   */
  getPromptConfig(topic: TopicPath): PromptConfig {
    const promptDir = getPromptDir(topic);
    const configPath = path.join(promptDir, 'config.json');

    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }

    // Create default config
    const defaultConfig: PromptConfig = {
      topic,
      currentVersion: '1.0.0',
      versions: [],
      temperatureConfig: DEFAULT_TEMPERATURE_CONFIG,
      schemaPath: getSchemaPath(topic),
    };

    return defaultConfig;
  }

  /**
   * Save prompt configuration
   */
  savePromptConfig(config: PromptConfig): void {
    const promptDir = getPromptDir(config.topic);
    ensureDirectoryExists(promptDir);

    const configPath = path.join(promptDir, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }

  /**
   * Get the current prompt for a topic
   */
  getCurrentPrompt(topic: TopicPath): string {
    const config = this.getPromptConfig(topic);
    return this.getPromptByVersion(topic, config.currentVersion);
  }

  /**
   * Get a specific version of a prompt
   */
  getPromptByVersion(topic: TopicPath, version: string): string {
    const promptPath = getPromptPath(topic, version);

    if (fs.existsSync(promptPath)) {
      return fs.readFileSync(promptPath, 'utf-8');
    }

    // Return base prompt if version doesn't exist
    return this.getBasePrompt(topic);
  }

  /**
   * Get the base prompt for a topic (before any PREAM optimization)
   */
  getBasePrompt(topic: TopicPath): string {
    const basePrompts = topic.section === 'READING'
      ? READING_BASE_PROMPTS
      : MATH_BASE_PROMPTS;

    return basePrompts[topic.subtopic] || this.getGenericBasePrompt(topic);
  }

  /**
   * Generic fallback prompt
   */
  private getGenericBasePrompt(topic: TopicPath): string {
    return `Generate an SAT ${topic.section} question for the topic: ${topic.subtopic}.

Follow official SAT format and style precisely.
Create one unambiguously correct answer with well-crafted distractors.

{DIFFICULTY_DESCRIPTION}`;
  }

  /**
   * Initialize prompts for a topic (creates v1.0.0 from base prompt)
   */
  initializeTopic(topic: TopicPath): void {
    const promptDir = getPromptDir(topic);
    ensureDirectoryExists(promptDir);

    const promptPath = getPromptPath(topic, '1.0.0');

    if (!fs.existsSync(promptPath)) {
      const basePrompt = this.getBasePrompt(topic);
      fs.writeFileSync(promptPath, basePrompt);
    }

    // Create config if doesn't exist
    const config = this.getPromptConfig(topic);
    if (config.versions.length === 0) {
      config.versions.push({
        version: '1.0.0',
        content: this.getBasePrompt(topic),
        createdAt: new Date().toISOString(),
        parentVersion: null,
        preamIteration: 0,
        performanceMetrics: null,
      });
      this.savePromptConfig(config);
    }
  }

  /**
   * Add a new version of a prompt
   */
  addVersion(
    topic: TopicPath,
    content: string,
    parentVersion: string,
    preamIteration: number
  ): string {
    const config = this.getPromptConfig(topic);

    // Calculate new version number
    const newVersion = this.incrementVersion(parentVersion);

    // Save prompt file
    const promptPath = getPromptPath(topic, newVersion);
    fs.writeFileSync(promptPath, content);

    // Update config
    config.versions.push({
      version: newVersion,
      content,
      createdAt: new Date().toISOString(),
      parentVersion,
      preamIteration,
      performanceMetrics: null,
    });
    config.currentVersion = newVersion;

    this.savePromptConfig(config);

    return newVersion;
  }

  /**
   * Update performance metrics for a version
   */
  updateVersionMetrics(
    topic: TopicPath,
    version: string,
    metrics: PromptVersion['performanceMetrics']
  ): void {
    const config = this.getPromptConfig(topic);

    const versionEntry = config.versions.find((v) => v.version === version);
    if (versionEntry) {
      versionEntry.performanceMetrics = metrics;
      this.savePromptConfig(config);
    }
  }

  /**
   * Get version history for a topic
   */
  getVersionHistory(topic: TopicPath): PromptVersion[] {
    const config = this.getPromptConfig(topic);
    return config.versions;
  }

  /**
   * Set the current (active) version for a topic
   */
  setCurrentVersion(topic: TopicPath, version: string): void {
    const config = this.getPromptConfig(topic);

    // Verify version exists
    const versionExists = config.versions.some((v) => v.version === version);
    if (!versionExists) {
      throw new Error(`Version ${version} does not exist for topic ${topic.subtopic}`);
    }

    config.currentVersion = version;
    this.savePromptConfig(config);
  }

  /**
   * Get temperature configuration for a topic
   */
  getTemperatureConfig(topic: TopicPath): TemperatureConfig {
    const config = this.getPromptConfig(topic);
    return config.temperatureConfig;
  }

  /**
   * Update temperature configuration
   */
  setTemperatureConfig(topic: TopicPath, tempConfig: TemperatureConfig): void {
    const config = this.getPromptConfig(topic);
    config.temperatureConfig = tempConfig;
    this.savePromptConfig(config);
  }

  /**
   * Build full prompt with difficulty for generation
   */
  buildGenerationPrompt(
    topic: TopicPath,
    difficulty: DifficultyParams,
    version?: string,
    blueprint?: Blueprint
  ): { system: string; user: string } {
    const promptTemplate = version
      ? this.getPromptByVersion(topic, version)
      : this.getCurrentPrompt(topic);

    const { system, user } = buildPrompt(topic, difficulty);

    // Replace the base prompt with the versioned/optimized prompt if available
    const optimizedUser = promptTemplate.includes('{DIFFICULTY_DESCRIPTION}')
      ? promptTemplate.replace(
          '{DIFFICULTY_DESCRIPTION}',
          this.describeDifficulty(difficulty)
        )
      : `${promptTemplate}\n\n${this.describeDifficulty(difficulty)}`;

    const blueprintBlock = blueprint
      ? `\nQUESTION BLUEPRINT (enforce this form to increase variety):\n- ID: ${blueprint.id}\n- Surface form: ${blueprint.surface}\n- Reasoning focus: ${blueprint.reasoning}\n- Representation: ${blueprint.representation}\n- Extra: ${blueprint.description}\nDo not reuse previous blueprints in this batch; follow this one closely.`
      : '';

    return { system, user: `${optimizedUser}\n${blueprintBlock}` };
  }

  /**
   * Format difficulty description
   */
  private describeDifficulty(params: DifficultyParams): string {
    const overallDescriptions: Record<number, string> = {
      1: 'Easy - Most students will answer correctly.',
      2: 'Below Average - Slightly more challenging.',
      3: 'Medium - About half of students will answer correctly.',
      4: 'Above Average - Challenging for most students.',
      5: 'Hard - Only top students will answer correctly.',
    };

    return `
DIFFICULTY CALIBRATION:
- Overall: Level ${params.overall}/5 - ${overallDescriptions[params.overall]}
- Conceptual complexity: ${params.conceptual.toFixed(1)}/5
- Procedural complexity: ${params.procedural.toFixed(1)}/5
${params.linguistic !== undefined ? `- Linguistic complexity: ${params.linguistic.toFixed(1)}/5` : ''}
${params.computational !== undefined ? `- Computational complexity: ${params.computational.toFixed(1)}/5` : ''}`;
  }

  /**
   * Increment version number
   */
  private incrementVersion(version: string): string {
    const [major, minor, patch] = version.split('.').map(Number);
    return `${major}.${minor + 1}.${patch}`;
  }

  /**
   * Get all topics that have been initialized
   */
  getInitializedTopics(): TopicPath[] {
    const topics: TopicPath[] = [];
    const promptsDir = PROMPTS_DIR;

    if (!fs.existsSync(promptsDir)) {
      return topics;
    }

    for (const section of ['READING', 'MATH']) {
      const sectionDir = path.join(promptsDir, section);
      if (!fs.existsSync(sectionDir)) continue;

      for (const domain of fs.readdirSync(sectionDir)) {
        const domainDir = path.join(sectionDir, domain);
        if (!fs.statSync(domainDir).isDirectory()) continue;

        for (const subtopic of fs.readdirSync(domainDir)) {
          const subtopicDir = path.join(domainDir, subtopic);
          if (!fs.statSync(subtopicDir).isDirectory()) continue;

          // Check if config exists
          if (fs.existsSync(path.join(subtopicDir, 'config.json'))) {
            topics.push({
              section: section as 'READING' | 'MATH',
              domain: domain as any,
              subtopic: subtopic as any,
            });
          }
        }
      }
    }

    return topics;
  }
}

/**
 * Create singleton prompt manager
 */
let promptManagerInstance: PromptManager | null = null;

export function getPromptManager(): PromptManager {
  if (!promptManagerInstance) {
    promptManagerInstance = new PromptManager();
  }
  return promptManagerInstance;
}
