import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type OpenAI from 'openai';
import type {
  TopicPath,
  DifficultyLevel,
  ReadingQuestion,
} from '../core/types';
import { MODEL_CONFIG, getGeneratedDir, ensureDirectoryExists } from '../core/config';
import { createGLMClient, extractText, resolveLLMApiKey } from '../core/glm-client';
import {
  sampleReadingParams,
  buildPassageGenerationPrompt,
  buildQuestionGenerationPrompt,
  type SampledReadingParams,
  type PassageAnalysis,
} from '../prompts/reading-templates';

/**
 * Reading Question Generator
 *
 * Uses TWO-STAGE generation:
 * 1. Generate passage with metadata (paragraph purposes, testable vocab, inferences, etc.)
 * 2. Generate question using passage analysis
 *
 * This ensures questions are tightly coupled to passage content and
 * enables sophisticated distractor generation.
 */
export class ReadingQuestionGenerator {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = createGLMClient(apiKey);
  }

  /**
   * Stage 1: Generate passage with analysis metadata
   */
  async generatePassage(params: SampledReadingParams): Promise<PassageAnalysis> {
    const prompt = buildPassageGenerationPrompt(params);

    const response = await this.client.chat.completions.create({
      model: MODEL_CONFIG.generation.model,
      max_tokens: MODEL_CONFIG.generation.maxTokens,
      temperature: 0.8, // Higher for creative passage generation
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = extractText(response);
    if (!responseText) {
      throw new Error('No text response from model');
    }

    // Parse JSON response
    const jsonStr = this.extractJSON(responseText);
    try {
      return JSON.parse(jsonStr) as PassageAnalysis;
    } catch (e) {
      throw new Error(`Failed to parse passage JSON: ${e}\n\nResponse: ${responseText}`);
    }
  }

  /**
   * Stage 2: Generate question from passage analysis
   */
  async generateQuestionFromPassage(
    topic: TopicPath,
    passageAnalysis: PassageAnalysis,
    params: SampledReadingParams
  ): Promise<ReadingQuestion> {
    const prompt = buildQuestionGenerationPrompt(
      topic.subtopic,
      passageAnalysis,
      params.distractorStrategies
    );

    const response = await this.client.chat.completions.create({
      model: MODEL_CONFIG.generation.model,
      max_tokens: MODEL_CONFIG.generation.maxTokens,
      temperature: 0.6, // Lower for more consistent question structure
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = extractText(response);
    if (!responseText) {
      throw new Error('No text response from model');
    }

    // Parse question response
    const jsonStr = this.extractJSON(responseText);
    let questionData;
    try {
      questionData = JSON.parse(jsonStr);
    } catch (e) {
      throw new Error(`Failed to parse question JSON: ${e}\n\nResponse: ${responseText}`);
    }

    // Build full question object
    const generationId = uuidv4();
    const question: ReadingQuestion = {
      id: uuidv4(),
      topic: {
        section: 'READING',
        domain: topic.domain,
        subtopic: topic.subtopic,
      },
      difficulty: {
        overall: this.computeOverallDifficulty(params),
        conceptual: params.inferenceDepth * 5,
        procedural: params.evidenceEvaluation * 5,
        linguistic: params.vocabularyLevel * 5,
      },
      passage: passageAnalysis.passage,
      passageMetadata: {
        genre: this.mapPassageTypeToGenre(params.passageType),
        wordCount: passageAnalysis.passage.split(/\s+/).length,
        source: passageAnalysis.source,
      },
      stem: questionData.questionStem,
      choices: this.buildChoices(questionData.choices, questionData.correctAnswer),
      correctAnswer: questionData.correctAnswer,
      explanation: questionData.explanation,
      distractorRationale: questionData.distractorExplanations || {},
      metadata: {
        generatedAt: new Date().toISOString(),
        promptVersion: '1.0.0',
        modelUsed: MODEL_CONFIG.generation.model,
        generationId,
      },
    };

    return question;
  }

  /**
   * Full generation: passage + question in two stages
   */
  async generateQuestion(
    topic: TopicPath,
    targetDifficulty: DifficultyLevel
  ): Promise<ReadingQuestion> {
    // Sample parameters
    const params = sampleReadingParams(topic.subtopic, {
      targetOverallDifficulty: targetDifficulty / 5,
    });

    // Stage 1: Generate passage
    console.log(`  Generating passage (${params.passageType}, ${params.passageLength})...`);
    const passageAnalysis = await this.generatePassage(params);

    // Stage 2: Generate question
    console.log(`  Generating ${topic.subtopic} question...`);
    const question = await this.generateQuestionFromPassage(topic, passageAnalysis, params);

    return question;
  }

  /**
   * Generate batch of questions
   */
  async generateBatch(
    topic: TopicPath,
    count: number
  ): Promise<ReadingQuestion[]> {
    const questions: ReadingQuestion[] = [];
    const difficulties = this.getDefaultDifficultyDistribution(count);

    for (let i = 0; i < count; i++) {
      try {
        console.log(`Generating question ${i + 1}/${count} for ${topic.subtopic}...`);
        const question = await this.generateQuestion(topic, difficulties[i]);
        questions.push(question);
      } catch (e) {
        console.error(`Failed to generate question ${i + 1}: ${e}`);
      }
    }

    return questions;
  }

  /**
   * Generate and save questions
   */
  async generateAndSave(
    topic: TopicPath,
    count: number
  ): Promise<{ saved: number; failed: number; paths: string[] }> {
    const questions = await this.generateBatch(topic, count);

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

  // ─────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────

  private extractJSON(text: string): string {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let jsonStr = jsonMatch ? jsonMatch[0] : text.trim();

    // Sanitize control characters inside string values
    jsonStr = this.sanitizeJSONString(jsonStr);
    return jsonStr;
  }

  /**
   * Sanitize control characters in JSON string values
   */
  private sanitizeJSONString(jsonStr: string): string {
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
          } else if (c === '"') {
            result += c;
            i++;
            break;
          } else if (code < 32) {
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
        result += char;
        i++;
      }
    }

    return result;
  }

  private computeOverallDifficulty(params: SampledReadingParams): DifficultyLevel {
    const avg =
      (params.passageComplexity +
        params.inferenceDepth +
        params.vocabularyLevel +
        params.evidenceEvaluation +
        params.synthesisRequired) /
      5;
    return Math.max(1, Math.min(5, Math.round(avg * 5))) as DifficultyLevel;
  }

  private mapPassageTypeToGenre(
    passageType: string
  ): 'literary' | 'informational' | 'argumentative' | 'scientific' {
    const map: Record<string, 'literary' | 'informational' | 'argumentative' | 'scientific'> = {
      literary_narrative: 'literary',
      social_science: 'informational',
      natural_science: 'scientific',
      humanities: 'argumentative',
    };
    return map[passageType] || 'informational';
  }

  private buildChoices(
    choicesObj: Record<string, string>,
    correctAnswer: string
  ): Array<{ label: 'A' | 'B' | 'C' | 'D'; text: string; isCorrect: boolean }> {
    return (['A', 'B', 'C', 'D'] as const).map((label) => ({
      label,
      text: choicesObj[label] || '',
      isCorrect: label === correctAnswer,
    }));
  }

  private getDefaultDifficultyDistribution(count: number): DifficultyLevel[] {
    const distribution: DifficultyLevel[] = [];
    const weights = { 1: 0.15, 2: 0.2, 3: 0.3, 4: 0.2, 5: 0.15 };

    for (const [level, weight] of Object.entries(weights)) {
      const levelCount = Math.round(count * weight);
      for (let i = 0; i < levelCount; i++) {
        distribution.push(parseInt(level) as DifficultyLevel);
      }
    }

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
}

/**
 * Create reading generator from environment
 */
export function createReadingGenerator(): ReadingQuestionGenerator {
  const apiKey = resolveLLMApiKey();
  return new ReadingQuestionGenerator(apiKey);
}
