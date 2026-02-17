#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const config_1 = require("./core/config");
const generator_1 = require("./generation/generator");
const batch_executor_1 = require("./generation/batch-executor");
const evaluator_1 = require("./evaluation/evaluator");
const pream_loop_1 = require("./evaluation/pream-loop");
const prompt_manager_1 = require("./prompts/prompt-manager");
const image_generator_1 = require("./generation/image-generator");
// Load environment variables
dotenv.config();
const program = new commander_1.Command();
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
        const generator = (0, generator_1.createGenerator)();
        const count = parseInt(options.count);
        const difficulty = parseInt(options.difficulty);
        if (options.all) {
            // Generate for all topics
            const executor = (0, batch_executor_1.createBatchExecutor)();
            const result = await executor.executeAllTopics(count);
            console.log('\n=== Batch Complete ===');
            console.log(`Total generated: ${result.totalGenerated}`);
            console.log(`Total passed: ${result.totalPassed}`);
            console.log(`Errors: ${result.errors.length}`);
        }
        else if (options.section) {
            // Generate for a section
            const executor = (0, batch_executor_1.createBatchExecutor)();
            const result = await executor.executeSection(options.section, count);
            console.log('\n=== Section Batch Complete ===');
            console.log(`Total generated: ${result.totalGenerated}`);
            console.log(`Total passed: ${result.totalPassed}`);
        }
        else if (options.topic) {
            // Generate for a specific topic
            const topic = (0, config_1.parseTopicString)(options.topic);
            const { saved, failed, paths } = await generator.generateAndSave(topic, count, options.version);
            console.log(`\nGenerated ${saved} questions, ${failed} failed`);
            console.log(`Saved to: ${paths[0]?.split('/').slice(0, -1).join('/')}`);
        }
        else {
            console.error('Please specify --topic, --section, or --all');
            process.exit(1);
        }
    }
    catch (error) {
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
        const evaluator = (0, evaluator_1.createEvaluator)();
        const generator = (0, generator_1.createGenerator)();
        if (options.topic) {
            const topic = (0, config_1.parseTopicString)(options.topic);
            const questions = generator.loadGeneratedQuestions(topic);
            console.log(`Evaluating ${questions.length} questions for ${options.topic}...`);
            for (const question of questions) {
                const evaluation = await evaluator.evaluate(question);
                console.log(`\nQuestion ${question.id}:`);
                console.log(`  Score: ${evaluation.aggregateScore.toFixed(2)}`);
                console.log(`  Passes: ${evaluation.passesThreshold ? 'Yes' : 'No'}`);
                console.log(`  Issues: ${evaluation.errorCategories.join(', ') || 'None'}`);
            }
        }
        else {
            console.error('Please specify --topic');
            process.exit(1);
        }
    }
    catch (error) {
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
    .option('-i, --iterations <count>', 'Max iterations', '10')
    .option('-s, --samples <count>', 'Samples per iteration', '20')
    .option('--single-iteration', 'Run only one PREAM iteration (for round-robin orchestration)')
    .action(async (options) => {
    try {
        if (!options.topic) {
            console.error('Please specify --topic');
            process.exit(1);
        }
        const topic = (0, config_1.parseTopicString)(options.topic);
        const preamLoop = (0, pream_loop_1.createPREAMLoop)({
            maxIterations: parseInt(options.iterations),
            minSamplesPerIteration: parseInt(options.samples),
        });
        const generator = (0, generator_1.createGenerator)();
        // Single iteration mode for round-robin orchestration
        if (options.singleIteration) {
            console.log(`Running single PREAM iteration for ${options.topic}...`);
            const result = await preamLoop.runSingleIteration(topic, async (t, v, count) => generator.generateBatch(t, count, v));
            console.log('\n=== Iteration Complete ===');
            console.log(`Iteration: ${result.iterationNumber}`);
            console.log(`New version: ${result.newVersion}`);
            console.log(`Converged: ${result.converged}`);
            console.log(`Test score: ${result.testScore.toFixed(3)}`);
            // Exit with code 0 if converged, 1 if more iterations needed
            process.exit(result.converged ? 0 : 2);
        }
        console.log(`Starting PREAM optimization for ${options.topic}...`);
        const state = await preamLoop.optimize(topic, async (t, v, count) => generator.generateBatch(t, count, v));
        console.log('\n=== Optimization Complete ===');
        console.log(`Iterations: ${state.iterations.length}`);
        console.log(`Best version: ${state.currentBestVersion}`);
        console.log(`Converged: ${state.converged}`);
        if (state.iterations.length > 0) {
            const lastIter = state.iterations[state.iterations.length - 1];
            console.log(`Final test score: ${lastIter.testMetrics.avgScore.toFixed(3)}`);
            console.log(`Final pass rate: ${(lastIter.testMetrics.passRate * 100).toFixed(1)}%`);
        }
    }
    catch (error) {
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
        const promptManager = (0, prompt_manager_1.getPromptManager)();
        if (options.initAll) {
            const topics = (0, config_1.getAllTopics)();
            for (const topic of topics) {
                promptManager.initializeTopic(topic);
                console.log(`Initialized: ${(0, config_1.topicToString)(topic)}`);
            }
            console.log(`\nInitialized ${topics.length} topics`);
        }
        else if (options.init) {
            const topic = (0, config_1.parseTopicString)(options.init);
            promptManager.initializeTopic(topic);
            console.log(`Initialized: ${options.init}`);
        }
        else if (options.list) {
            console.log('=== Reading Topics ===');
            for (const [domain, subtopics] of Object.entries(config_1.READING_HIERARCHY)) {
                console.log(`\n${domain}:`);
                for (const subtopic of subtopics) {
                    const topic = {
                        section: 'READING',
                        domain: domain,
                        subtopic: subtopic,
                    };
                    const config = promptManager.getPromptConfig(topic);
                    console.log(`  ${subtopic}: v${config.currentVersion} (${config.versions.length} versions)`);
                }
            }
            console.log('\n=== Math Topics ===');
            for (const [domain, subtopics] of Object.entries(config_1.MATH_HIERARCHY)) {
                console.log(`\n${domain}:`);
                for (const subtopic of subtopics) {
                    const topic = {
                        section: 'MATH',
                        domain: domain,
                        subtopic: subtopic,
                    };
                    const config = promptManager.getPromptConfig(topic);
                    console.log(`  ${subtopic}: v${config.currentVersion} (${config.versions.length} versions)`);
                }
            }
        }
        else if (options.topic) {
            const topic = (0, config_1.parseTopicString)(options.topic);
            const prompt = options.version
                ? promptManager.getPromptByVersion(topic, options.version)
                : promptManager.getCurrentPrompt(topic);
            console.log(prompt);
        }
        else {
            console.log('Use --list, --init, --init-all, or --topic');
        }
    }
    catch (error) {
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
        const imageGen = (0, image_generator_1.createImageGenerator)();
        const generator = (0, generator_1.createGenerator)();
        // Determine which topics to process
        let topics = [];
        if (options.all) {
            topics = (0, config_1.getAllTopics)();
        }
        else if (options.section) {
            topics = (0, config_1.getAllTopics)().filter((t) => t.section === options.section);
        }
        else if (options.topic) {
            topics = [(0, config_1.parseTopicString)(options.topic)];
        }
        else {
            console.error('Please specify --topic, --section, or --all');
            process.exit(1);
        }
        let totalImages = 0;
        for (const topic of topics) {
            const questions = generator.loadGeneratedQuestions(topic);
            // Filter questions that have images (works for both Reading and Math)
            const questionsWithImages = questions.filter((q) => 'hasImage' in q && q.hasImage && 'imageDescription' in q && q.imageDescription);
            if (questionsWithImages.length > 0) {
                console.log(`\n[${(0, config_1.topicToString)(topic)}] Generating images for ${questionsWithImages.length} questions...`);
                const images = await imageGen.generateImagesForQuestions(questionsWithImages);
                totalImages += images.size;
                console.log(`[${(0, config_1.topicToString)(topic)}] Generated ${images.size} images`);
            }
        }
        console.log(`\nTotal images generated: ${totalImages}`);
    }
    catch (error) {
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
        const evaluator = (0, evaluator_1.createEvaluator)();
        const generator = (0, generator_1.createGenerator)();
        const topics = options.topic
            ? [(0, config_1.parseTopicString)(options.topic)]
            : options.section
                ? (0, config_1.getAllTopics)().filter((t) => t.section === options.section)
                : (0, config_1.getAllTopics)();
        console.log('=== Statistics ===\n');
        let totalQuestions = 0;
        let totalPassed = 0;
        for (const topic of topics) {
            const questions = generator.loadGeneratedQuestions(topic);
            const evaluations = evaluator.loadEvaluations(topic);
            const stats = evaluator.getEvaluationStats(evaluations);
            if (questions.length > 0 || evaluations.length > 0) {
                console.log(`${(0, config_1.topicToString)(topic)}:`);
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
    }
    catch (error) {
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
    for (const [domain, subtopics] of Object.entries(config_1.READING_HIERARCHY)) {
        console.log(`${domain}:`);
        for (const subtopic of subtopics) {
            console.log(`  - READING/${domain}/${subtopic}`);
        }
        console.log('');
    }
    console.log('=== Math Topics ===\n');
    for (const [domain, subtopics] of Object.entries(config_1.MATH_HIERARCHY)) {
        console.log(`${domain}:`);
        for (const subtopic of subtopics) {
            console.log(`  - MATH/${domain}/${subtopic}`);
        }
        console.log('');
    }
});
program.parse();
//# sourceMappingURL=cli.js.map