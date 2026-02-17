import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type OpenAI from 'openai';
import type {
  TopicPath,
  DifficultyParams,
  DifficultyLevel,
  GeneratedQuestion,
  ReadingQuestion,
  MathQuestion,
  TemperatureConfig,
  Blueprint,
} from '../core/types';
import {
  MODEL_CONFIG,
  getGeneratedDir,
  ensureDirectoryExists,
  topicToString,
} from '../core/config';
import { createGLMClient, extractText } from '../core/glm-client';
import { getPromptManager } from '../prompts/prompt-manager';
import { getSchemaContent, fullValidation } from '../schemas/schema-validator';
import { sampleBlueprint } from './blueprints';

/**
 * SAT Question Generator
 * Generates questions using Claude with versioned prompts and difficulty sampling
 */
export class QuestionGenerator {
  private client: OpenAI;
  private promptManager = getPromptManager();
  private similarityCache = new Map<string, Array<{ id: string; sig: Set<string> }>>();

  constructor(apiKey: string) {
    this.client = createGLMClient(apiKey);
  }

  /**
   * Sample difficulty parameters with variation
   */
  sampleDifficulty(
    targetLevel: DifficultyLevel,
    variation: number = 0.3,
    isReading: boolean = false
  ): DifficultyParams {
    // Add Gaussian noise to create variation
    const sample = (base: number): number => {
      const noise = (Math.random() - 0.5) * 2 * variation;
      return Math.max(1, Math.min(5, base + noise));
    };

    return {
      overall: targetLevel,
      conceptual: sample(targetLevel),
      procedural: sample(targetLevel),
      linguistic: isReading ? sample(targetLevel) : 0,
      computational: isReading ? 0 : sample(targetLevel),
    };
  }

  /**
   * Generate a single question
   */
  async generateQuestion(
    topic: TopicPath,
    targetDifficulty: DifficultyLevel,
    promptVersion?: string
  ): Promise<GeneratedQuestion> {
    const generationId = uuidv4();
    const isReading = topic.section === 'READING';
    const blueprint = sampleBlueprint(topic);

    // Sample difficulty with variation
    const tempConfig = this.promptManager.getTemperatureConfig(topic);
    const difficulty = this.sampleDifficulty(
      targetDifficulty,
      tempConfig.variation,
      isReading
    );

    // Get prompt
    const { system, user } = this.promptManager.buildGenerationPrompt(
      topic,
      difficulty,
      promptVersion,
      blueprint
    );

    // Get schema for output format
    const schema = getSchemaContent(topic.section);
    const schemaInstruction = `\n\nOutput your response as valid JSON matching this schema:\n\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\`\n\nIMPORTANT: Output ONLY the JSON object, no additional text. Ensure all string values are properly escaped - use \\n for newlines, \\t for tabs.`;

    // Generate
    const response = await this.client.chat.completions.create({
      model: MODEL_CONFIG.generation.model,
      max_tokens: MODEL_CONFIG.generation.maxTokens,
      temperature: tempConfig.generation,
      messages: [
        { role: 'system', content: system + schemaInstruction },
        { role: 'user', content: user },
      ],
    });

    const responseText = extractText(response);
    if (!responseText) {
      throw new Error('No text response from model');
    }

    // Parse JSON response with sanitization for control characters
    const jsonStr = this.extractJSON(responseText);
    let rawQuestion;
    try {
      rawQuestion = JSON.parse(jsonStr);
    } catch (e) {
      throw new Error(`Failed to parse JSON response: ${e}`);
    }

    // Add metadata if not present
    rawQuestion.id = rawQuestion.id || uuidv4();
    rawQuestion.metadata = {
      generatedAt: new Date().toISOString(),
      promptVersion: promptVersion || this.promptManager.getPromptConfig(topic).currentVersion,
      modelUsed: MODEL_CONFIG.generation.model,
      generationId,
      blueprintId: blueprint.id,
    };

    // Ensure topic is set correctly
    rawQuestion.topic = {
      section: topic.section,
      domain: topic.domain,
      subtopic: topic.subtopic,
    };

    // Validate
    const validation = fullValidation(rawQuestion, topic);
    if (!validation.valid) {
      const errors = [
        ...(validation.schemaErrors || []),
        ...(validation.deepErrors || []),
      ];
      throw new Error(`Generated question failed validation:\n${errors.join('\n')}`);
    }

    const question = validation.question!;

    // Novelty guard to avoid near-duplicates
    if (!this.isNovel(question, topic)) {
      throw new Error('Rejected generated question due to high similarity with existing items');
    }

    // Cache signature for subsequent comparisons
    this.addToSimilarityCache(question, topic);

    return question;
  }

  /**
   * Generate multiple questions for a topic
   */
  async generateBatch(
    topic: TopicPath,
    count: number,
    promptVersion?: string,
    difficultyDistribution?: DifficultyLevel[]
  ): Promise<GeneratedQuestion[]> {
    const questions: GeneratedQuestion[] = [];

    // Default to uniform distribution across difficulty levels
    const difficulties = difficultyDistribution || this.getDefaultDifficultyDistribution(count);

    const maxAttemptsPerSlot = 3;
    let slot = 0;

    while (slot < count) {
      const difficulty = difficulties[slot % difficulties.length];
      let attempt = 0;
      let success = false;

      while (attempt < maxAttemptsPerSlot && !success) {
        try {
          const question = await this.generateQuestion(topic, difficulty, promptVersion);
          questions.push(question);
          console.log(`Generated question ${questions.length}/${count} for ${topic.subtopic}`);
          success = true;
        } catch (e) {
          attempt++;
          console.error(`Attempt ${attempt}/${maxAttemptsPerSlot} failed for slot ${slot + 1}: ${e}`);
          if (attempt >= maxAttemptsPerSlot) {
            console.error('Giving up on this slot to avoid infinite loops');
          }
        }
      }

      slot++;
    }

    return questions;
  }

  /**
   * Generate and save questions
   */
  async generateAndSave(
    topic: TopicPath,
    count: number,
    promptVersion?: string
  ): Promise<{ saved: number; failed: number; paths: string[] }> {
    const questions = await this.generateBatch(topic, count, promptVersion);

    const outputDir = getGeneratedDir(topic);
    ensureDirectoryExists(outputDir);

    const paths: string[] = [];

    for (const question of questions) {
      const filename = `${question.id}.json`;
      const filepath = path.join(outputDir, filename);
      fs.writeFileSync(filepath, JSON.stringify(question, null, 2));
      paths.push(filepath);
    }

    return {
      saved: questions.length,
      failed: count - questions.length,
      paths,
    };
  }

  /**
   * Load generated questions for a topic
   */
  loadGeneratedQuestions(topic: TopicPath): GeneratedQuestion[] {
    const dir = getGeneratedDir(topic);

    if (!fs.existsSync(dir)) {
      return [];
    }

    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
    const questions: GeneratedQuestion[] = [];

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(dir, file), 'utf-8');
        const question = JSON.parse(content);
        questions.push(question);
      } catch (e) {
        console.error(`Failed to load question from ${file}: ${e}`);
      }
    }

    return questions;
  }

  /**
   * Default difficulty distribution for batch generation
   */
  private getDefaultDifficultyDistribution(count: number): DifficultyLevel[] {
    // Roughly follows SAT distribution: more medium, fewer extremes
    const distribution: DifficultyLevel[] = [];
    const weights = { 1: 0.15, 2: 0.20, 3: 0.30, 4: 0.20, 5: 0.15 };

    for (const [level, weight] of Object.entries(weights)) {
      const levelCount = Math.round(count * weight);
      for (let i = 0; i < levelCount; i++) {
        distribution.push(parseInt(level) as DifficultyLevel);
      }
    }

    // Fill any remaining slots with medium difficulty
    while (distribution.length < count) {
      distribution.push(3);
    }

    // Shuffle
    for (let i = distribution.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [distribution[i], distribution[j]] = [distribution[j], distribution[i]];
    }

    return distribution.slice(0, count);
  }

  /**
   * Extract JSON from a potentially wrapped response
   */
  private extractJSON(text: string): string {
    // Try to find JSON object in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let jsonStr = jsonMatch ? jsonMatch[0] : text.trim();

    // Sanitize control characters inside string values
    // This fixes "Bad control character in string literal" errors
    jsonStr = this.sanitizeJSONString(jsonStr);

    return jsonStr;
  }

  /**
   * Sanitize control characters in JSON string values
   * Handles newlines, tabs, and other control chars that break JSON.parse
   */
  private sanitizeJSONString(jsonStr: string): string {
    // More robust approach: process string segment by segment
    // This handles edge cases better than a simple state machine

    let result = '';
    let i = 0;

    while (i < jsonStr.length) {
      const char = jsonStr[i];

      if (char === '"') {
        // Start of a string - find the end
        result += char;
        i++;

        while (i < jsonStr.length) {
          const c = jsonStr[i];
          const code = c.charCodeAt(0);

          if (c === '\\') {
            // Escape sequence - copy both chars
            result += c;
            i++;
            if (i < jsonStr.length) {
              result += jsonStr[i];
              i++;
            }
          } else if (c === '"') {
            // End of string
            result += c;
            i++;
            break;
          } else if (code < 32) {
            // Control character - escape it
            switch (code) {
              case 9:  result += '\\t'; break;
              case 10: result += '\\n'; break;
              case 13: result += '\\r'; break;
              case 8:  result += '\\b'; break;
              case 12: result += '\\f'; break;
              default: result += `\\u${code.toString(16).padStart(4, '0')}`;
            }
            i++;
          } else {
            result += c;
            i++;
          }
        }
      } else {
        // Outside string - copy as-is
        result += char;
        i++;
      }
    }

    return result;
  }

  /**
   * Simple token-based Jaccard similarity to detect duplicates
   */
  private buildSignature(question: GeneratedQuestion): Set<string> {
    const textParts = [
      question.stem,
      ...question.choices.map((c) => c.text),
    ];
    const raw = textParts.join(' ').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const tokens = raw.split(/\s+/).filter((t) => t.length > 3);
    return new Set(tokens);
  }

  private jaccard(a: Set<string>, b: Set<string>): number {
    let intersection = 0;
    const smaller = a.size < b.size ? a : b;
    const larger = a.size < b.size ? b : a;
    for (const token of smaller) {
      if (larger.has(token)) intersection++;
    }
    const union = a.size + b.size - intersection;
    return union === 0 ? 0 : intersection / union;
  }

  private loadSimilarityCache(topic: TopicPath): Array<{ id: string; sig: Set<string> }> {
    const key = topicToString(topic);
    if (this.similarityCache.has(key)) {
      return this.similarityCache.get(key)!;
    }

    const cache: Array<{ id: string; sig: Set<string> }> = [];
    const existing = this.loadGeneratedQuestions(topic).slice(-300); // limit memory
    for (const q of existing) {
      cache.push({ id: q.id, sig: this.buildSignature(q) });
    }
    this.similarityCache.set(key, cache);
    return cache;
  }

  private isNovel(question: GeneratedQuestion, topic: TopicPath): boolean {
    const sig = this.buildSignature(question);
    const cache = this.loadSimilarityCache(topic);
    for (const entry of cache) {
      const sim = this.jaccard(sig, entry.sig);
      if (sim >= 0.85) {
        return false;
      }
    }
    return true;
  }

  private addToSimilarityCache(question: GeneratedQuestion, topic: TopicPath): void {
    const key = topicToString(topic);
    const cache = this.similarityCache.get(key) || [];
    cache.push({ id: question.id, sig: this.buildSignature(question) });
    // Keep cache size bounded
    if (cache.length > 500) {
      cache.shift();
    }
    this.similarityCache.set(key, cache);
  }
}

/**
 * Create generator with environment variables
 */
export function createGenerator(): QuestionGenerator {
  const apiKey = process.env.ZHIPU_API_KEY;

  if (!apiKey) {
    throw new Error('Missing ZHIPU_API_KEY environment variable');
  }

  return new QuestionGenerator(apiKey);
}
