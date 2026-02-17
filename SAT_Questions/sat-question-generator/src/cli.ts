#!/usr/bin/env node

import { Command } from 'commander';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import type { TopicPath, DifficultyLevel } from './core/types';
import {
  getAllTopics,
  topicToString,
  parseTopicString,
  READING_HIERARCHY,
  MATH_HIERARCHY,
} from './core/config';
import { createGenerator, QuestionGenerator } from './generation/generator';
import { createBatchExecutor } from './generation/batch-executor';
import { createEvaluator } from './evaluation/evaluator';
import { createPREAMLoop } from './evaluation/pream-loop';
import { getPromptManager } from './prompts/prompt-manager';
import { createImageGenerator } from './generation/image-generator';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('sat-gen')
  .description('PREAM-based SAT Question Generator')
  .version('1.0.0');

// ============================================
// Generate Commands
// ============================================

program
  .command('generate')
  .description('Generate SAT questions')
  .option('-t, --topic <topic>', 'Topic path (e.g., READING/Information_and_Ideas/central_ideas)')
  .option('-s, --section <section>', 'Section (READING or MATH)')
  .option('-c, --count <count>', 'Number of questions to generate', '5')
  .option('-d, --difficulty <level>', 'Target difficulty (1-5)', '3')
  .option('-v, --version <version>', 'Prompt version to use')
  .option('--all', 'Generate for all topics')
  .action(async (options) => {
    try {
      const generator = createGenerator();
      const count = parseInt(options.count);
      const difficulty = parseInt(options.difficulty) as DifficultyLevel;

      if (options.all) {
        // Generate for all topics
        const executor = createBatchExecutor();
        const result = await executor.executeAllTopics(count);
        console.log('\n=== Batch Complete ===');
        console.log(`Total generated: ${result.totalGenerated}`);
        console.log(`Total passed: ${result.totalPassed}`);
        console.log(`Errors: ${result.errors.length}`);
      } else if (options.section) {
        // Generate for a section
        const executor = createBatchExecutor();
        const result = await executor.executeSection(options.section, count);
        console.log('\n=== Section Batch Complete ===');
        console.log(`Total generated: ${result.totalGenerated}`);
        console.log(`Total passed: ${result.totalPassed}`);
      } else if (options.topic) {
        // Generate for a specific topic
        const topic = parseTopicString(options.topic);
        const { saved, failed, paths } = await generator.generateAndSave(
          topic,
          count,
          options.version
        );
        console.log(`\nGenerated ${saved} questions, ${failed} failed`);
        console.log(`Saved to: ${paths[0]?.split('/').slice(0, -1).join('/')}`);
      } else {
        console.error('Please specify --topic, --section, or --all');
        process.exit(1);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      process.exit(1);
    }
  });

// ============================================
// Evaluate Commands
// ============================================

program
  .command('evaluate')
  .description('Evaluate generated questions')
  .option('-t, --topic <topic>', 'Topic path to evaluate')
  .option('-q, --question <id>', 'Specific question ID')
  .option('--all', 'Evaluate all generated questions')
  .action(async (options) => {
    try {
      const evaluator = createEvaluator();
      const generator = createGenerator();

      if (options.topic) {
        const topic = parseTopicString(options.topic);
        const questions = generator.loadGeneratedQuestions(topic);

        console.log(`Evaluating ${questions.length} questions for ${options.topic}...`);

        for (const question of questions) {
          const evaluation = await evaluator.evaluate(question);
          console.log(`\nQuestion ${question.id}:`);
          console.log(`  Score: ${evaluation.aggregateScore.toFixed(2)}`);
          console.log(`  Passes: ${evaluation.passesThreshold ? 'Yes' : 'No'}`);
          console.log(`  Issues: ${evaluation.errorCategories.join(', ') || 'None'}`);
        }
      } else {
        console.error('Please specify --topic');
        process.exit(1);
      }
    } catch (error) {
      console.error('Evaluation failed:', error);
      process.exit(1);
    }
  });

// ============================================
// Optimize Commands (PREAM)
// ============================================

program
  .command('optimize')
  .description('Run PREAM optimization for a topic')
  .option('-t, --topic <topic>', 'Topic path to optimize')
  .option('-i, --iterations <count>', 'Max iterations', '5')
  .option('-s, --samples <count>', 'Samples per iteration', '25')
  .option('--single-iteration', 'Run only one PREAM iteration (for round-robin orchestration)')
  .action(async (options) => {
    try {
      if (!options.topic) {
        console.error('Please specify --topic');
        process.exit(1);
      }

      const topic = parseTopicString(options.topic);
      const preamLoop = createPREAMLoop({
        maxIterations: parseInt(options.iterations),
        minSamplesPerIteration: parseInt(options.samples),
      });

      const generator = createGenerator();

      // Single iteration mode for round-robin orchestration
      if (options.singleIteration) {
        console.log(`Running single PREAM iteration for ${options.topic}...`);

        const result = await preamLoop.runSingleIteration(
          topic,
          async (t, v, count) => generator.generateBatch(t, count, v)
        );

        console.log('\n=== Iteration Complete ===');
        console.log(`Iteration: ${result.iterationNumber}`);
        console.log(`New version: ${result.newVersion}`);
        console.log(`Converged: ${result.converged}`);
        console.log(`Test score: ${result.testScore.toFixed(3)}`);

        // Exit with code 0 if converged, 1 if more iterations needed
        process.exit(result.converged ? 0 : 2);
      }

      console.log(`Starting PREAM optimization for ${options.topic}...`);

      const state = await preamLoop.optimize(
        topic,
        async (t, v, count) => generator.generateBatch(t, count, v)
      );

      console.log('\n=== Optimization Complete ===');
      console.log(`Iterations: ${state.iterations.length}`);
      console.log(`Best version: ${state.currentBestVersion}`);
      console.log(`Converged: ${state.converged}`);

      if (state.iterations.length > 0) {
        const lastIter = state.iterations[state.iterations.length - 1];
        console.log(`Final test score: ${lastIter.testMetrics.avgScore.toFixed(3)}`);
        console.log(`Final pass rate: ${(lastIter.testMetrics.passRate * 100).toFixed(1)}%`);
      }
    } catch (error) {
      console.error('Optimization failed:', error);
      process.exit(1);
    }
  });

// ============================================
// Prompt Management Commands
// ============================================

program
  .command('prompts')
  .description('Manage prompts')
  .option('-l, --list', 'List all topics and their prompt versions')
  .option('-t, --topic <topic>', 'Show prompt for a specific topic')
  .option('-v, --version <version>', 'Show specific version')
  .option('--init <topic>', 'Initialize prompts for a topic')
  .option('--init-all', 'Initialize prompts for all topics')
  .action(async (options) => {
    try {
      const promptManager = getPromptManager();

      if (options.initAll) {
        const topics = getAllTopics();
        for (const topic of topics) {
          promptManager.initializeTopic(topic);
          console.log(`Initialized: ${topicToString(topic)}`);
        }
        console.log(`\nInitialized ${topics.length} topics`);
      } else if (options.init) {
        const topic = parseTopicString(options.init);
        promptManager.initializeTopic(topic);
        console.log(`Initialized: ${options.init}`);
      } else if (options.list) {
        console.log('=== Reading Topics ===');
        for (const [domain, subtopics] of Object.entries(READING_HIERARCHY)) {
          console.log(`\n${domain}:`);
          for (const subtopic of subtopics) {
            const topic: TopicPath = {
              section: 'READING',
              domain: domain as any,
              subtopic: subtopic as any,
            };
            const config = promptManager.getPromptConfig(topic);
            console.log(`  ${subtopic}: v${config.currentVersion} (${config.versions.length} versions)`);
          }
        }

        console.log('\n=== Math Topics ===');
        for (const [domain, subtopics] of Object.entries(MATH_HIERARCHY)) {
          console.log(`\n${domain}:`);
          for (const subtopic of subtopics) {
            const topic: TopicPath = {
              section: 'MATH',
              domain: domain as any,
              subtopic: subtopic as any,
            };
            const config = promptManager.getPromptConfig(topic);
            console.log(`  ${subtopic}: v${config.currentVersion} (${config.versions.length} versions)`);
          }
        }
      } else if (options.topic) {
        const topic = parseTopicString(options.topic);
        const prompt = options.version
          ? promptManager.getPromptByVersion(topic, options.version)
          : promptManager.getCurrentPrompt(topic);
        console.log(prompt);
      } else {
        console.log('Use --list, --init, --init-all, or --topic');
      }
    } catch (error) {
      console.error('Prompt management failed:', error);
      process.exit(1);
    }
  });

// ============================================
// Image Generation Commands
// ============================================

program
  .command('images')
  .description('Generate images for questions (both Reading and Math)')
  .option('-t, --topic <topic>', 'Topic path')
  .option('-s, --section <section>', 'Section (READING or MATH)')
  .option('--all', 'Generate images for all topics')
  .option('-q, --question <id>', 'Specific question ID')
  .action(async (options) => {
    try {
      const imageGen = createImageGenerator();
      const generator = createGenerator();

      // Determine which topics to process
      let topics: TopicPath[] = [];

      if (options.all) {
        topics = getAllTopics();
      } else if (options.section) {
        topics = getAllTopics().filter((t) => t.section === options.section);
      } else if (options.topic) {
        topics = [parseTopicString(options.topic)];
      } else {
        console.error('Please specify --topic, --section, or --all');
        process.exit(1);
      }

      let totalImages = 0;

      for (const topic of topics) {
        const questions = generator.loadGeneratedQuestions(topic);
        // Filter questions that have images (works for both Reading and Math)
        const questionsWithImages = questions.filter(
          (q) => 'hasImage' in q && q.hasImage && 'imageDescription' in q && q.imageDescription
        );

        if (questionsWithImages.length > 0) {
          console.log(`\n[${topicToString(topic)}] Generating images for ${questionsWithImages.length} questions...`);
          const images = await imageGen.generateImagesForQuestions(questionsWithImages);
          totalImages += images.size;
          console.log(`[${topicToString(topic)}] Generated ${images.size} images`);
        }
      }

      console.log(`\nTotal images generated: ${totalImages}`);
    } catch (error) {
      console.error('Image generation failed:', error);
      process.exit(1);
    }
  });

// ============================================
// Stats Commands
// ============================================

program
  .command('stats')
  .description('Show generation and evaluation statistics')
  .option('-t, --topic <topic>', 'Topic path')
  .option('-s, --section <section>', 'Section (READING or MATH)')
  .action(async (options) => {
    try {
      const evaluator = createEvaluator();
      const generator = createGenerator();

      const topics = options.topic
        ? [parseTopicString(options.topic)]
        : options.section
        ? getAllTopics().filter((t) => t.section === options.section)
        : getAllTopics();

      console.log('=== Statistics ===\n');

      let totalQuestions = 0;
      let totalPassed = 0;

      for (const topic of topics) {
        const questions = generator.loadGeneratedQuestions(topic);
        const evaluations = evaluator.loadEvaluations(topic);
        const stats = evaluator.getEvaluationStats(evaluations);

        if (questions.length > 0 || evaluations.length > 0) {
          console.log(`${topicToString(topic)}:`);
          console.log(`  Generated: ${questions.length}`);
          console.log(`  Evaluated: ${stats.total}`);
          console.log(`  Passed: ${stats.passed} (${(stats.passRate * 100).toFixed(1)}%)`);
          console.log(`  Avg Score: ${stats.avgScore.toFixed(2)}`);
          console.log('');

          totalQuestions += questions.length;
          totalPassed += stats.passed;
        }
      }

      console.log('=== Total ===');
      console.log(`Questions: ${totalQuestions}`);
      console.log(`Passed: ${totalPassed}`);
    } catch (error) {
      console.error('Stats failed:', error);
      process.exit(1);
    }
  });

// ============================================
// Topic List Command
// ============================================

program
  .command('topics')
  .description('List all available topics')
  .action(() => {
    console.log('=== Reading Topics ===\n');
    for (const [domain, subtopics] of Object.entries(READING_HIERARCHY)) {
      console.log(`${domain}:`);
      for (const subtopic of subtopics) {
        console.log(`  - READING/${domain}/${subtopic}`);
      }
      console.log('');
    }

    console.log('=== Math Topics ===\n');
    for (const [domain, subtopics] of Object.entries(MATH_HIERARCHY)) {
      console.log(`${domain}:`);
      for (const subtopic of subtopics) {
        console.log(`  - MATH/${domain}/${subtopic}`);
      }
      console.log('');
    }
  });

program.parse();
