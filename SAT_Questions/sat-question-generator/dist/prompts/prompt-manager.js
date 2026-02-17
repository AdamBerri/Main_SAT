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
exports.PromptManager = void 0;
exports.getPromptManager = getPromptManager;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_1 = require("../core/config");
const base_prompts_1 = require("./base-prompts");
/**
 * Manages prompt versions, loading, and configuration for each topic.
 */
class PromptManager {
    /**
     * Get or create prompt configuration for a topic
     */
    getPromptConfig(topic) {
        const promptDir = (0, config_1.getPromptDir)(topic);
        const configPath = path.join(promptDir, 'config.json');
        if (fs.existsSync(configPath)) {
            return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        }
        // Create default config
        const defaultConfig = {
            topic,
            currentVersion: '1.0.0',
            versions: [],
            temperatureConfig: config_1.DEFAULT_TEMPERATURE_CONFIG,
            schemaPath: (0, config_1.getSchemaPath)(topic),
        };
        return defaultConfig;
    }
    /**
     * Save prompt configuration
     */
    savePromptConfig(config) {
        const promptDir = (0, config_1.getPromptDir)(config.topic);
        (0, config_1.ensureDirectoryExists)(promptDir);
        const configPath = path.join(promptDir, 'config.json');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }
    /**
     * Get the current prompt for a topic
     */
    getCurrentPrompt(topic) {
        const config = this.getPromptConfig(topic);
        return this.getPromptByVersion(topic, config.currentVersion);
    }
    /**
     * Get a specific version of a prompt
     */
    getPromptByVersion(topic, version) {
        const promptPath = (0, config_1.getPromptPath)(topic, version);
        if (fs.existsSync(promptPath)) {
            return fs.readFileSync(promptPath, 'utf-8');
        }
        // Return base prompt if version doesn't exist
        return this.getBasePrompt(topic);
    }
    /**
     * Get the base prompt for a topic (before any PREAM optimization)
     */
    getBasePrompt(topic) {
        const basePrompts = topic.section === 'READING'
            ? base_prompts_1.READING_BASE_PROMPTS
            : base_prompts_1.MATH_BASE_PROMPTS;
        return basePrompts[topic.subtopic] || this.getGenericBasePrompt(topic);
    }
    /**
     * Generic fallback prompt
     */
    getGenericBasePrompt(topic) {
        return `Generate an SAT ${topic.section} question for the topic: ${topic.subtopic}.

Follow official SAT format and style precisely.
Create one unambiguously correct answer with well-crafted distractors.

{DIFFICULTY_DESCRIPTION}`;
    }
    /**
     * Initialize prompts for a topic (creates v1.0.0 from base prompt)
     */
    initializeTopic(topic) {
        const promptDir = (0, config_1.getPromptDir)(topic);
        (0, config_1.ensureDirectoryExists)(promptDir);
        const promptPath = (0, config_1.getPromptPath)(topic, '1.0.0');
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
    addVersion(topic, content, parentVersion, preamIteration) {
        const config = this.getPromptConfig(topic);
        // Calculate new version number
        const newVersion = this.incrementVersion(parentVersion);
        // Save prompt file
        const promptPath = (0, config_1.getPromptPath)(topic, newVersion);
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
    updateVersionMetrics(topic, version, metrics) {
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
    getVersionHistory(topic) {
        const config = this.getPromptConfig(topic);
        return config.versions;
    }
    /**
     * Set the current (active) version for a topic
     */
    setCurrentVersion(topic, version) {
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
    getTemperatureConfig(topic) {
        const config = this.getPromptConfig(topic);
        return config.temperatureConfig;
    }
    /**
     * Update temperature configuration
     */
    setTemperatureConfig(topic, tempConfig) {
        const config = this.getPromptConfig(topic);
        config.temperatureConfig = tempConfig;
        this.savePromptConfig(config);
    }
    /**
     * Build full prompt with difficulty for generation
     */
    buildGenerationPrompt(topic, difficulty, version, blueprint) {
        const promptTemplate = version
            ? this.getPromptByVersion(topic, version)
            : this.getCurrentPrompt(topic);
        const { system, user } = (0, base_prompts_1.buildPrompt)(topic, difficulty);
        // Replace the base prompt with the versioned/optimized prompt if available
        const optimizedUser = promptTemplate.includes('{DIFFICULTY_DESCRIPTION}')
            ? promptTemplate.replace('{DIFFICULTY_DESCRIPTION}', this.describeDifficulty(difficulty))
            : `${promptTemplate}\n\n${this.describeDifficulty(difficulty)}`;
        const blueprintBlock = blueprint
            ? `\nQUESTION BLUEPRINT (enforce this form to increase variety):\n- ID: ${blueprint.id}\n- Surface form: ${blueprint.surface}\n- Reasoning focus: ${blueprint.reasoning}\n- Representation: ${blueprint.representation}\n- Extra: ${blueprint.description}\nDo not reuse previous blueprints in this batch; follow this one closely.`
            : '';
        return { system, user: `${optimizedUser}\n${blueprintBlock}` };
    }
    /**
     * Format difficulty description
     */
    describeDifficulty(params) {
        const overallDescriptions = {
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
    incrementVersion(version) {
        const [major, minor, patch] = version.split('.').map(Number);
        return `${major}.${minor + 1}.${patch}`;
    }
    /**
     * Get all topics that have been initialized
     */
    getInitializedTopics() {
        const topics = [];
        const promptsDir = path.join(__dirname, '../../prompts');
        if (!fs.existsSync(promptsDir)) {
            return topics;
        }
        for (const section of ['READING', 'MATH']) {
            const sectionDir = path.join(promptsDir, section);
            if (!fs.existsSync(sectionDir))
                continue;
            for (const domain of fs.readdirSync(sectionDir)) {
                const domainDir = path.join(sectionDir, domain);
                if (!fs.statSync(domainDir).isDirectory())
                    continue;
                for (const subtopic of fs.readdirSync(domainDir)) {
                    const subtopicDir = path.join(domainDir, subtopic);
                    if (!fs.statSync(subtopicDir).isDirectory())
                        continue;
                    // Check if config exists
                    if (fs.existsSync(path.join(subtopicDir, 'config.json'))) {
                        topics.push({
                            section: section,
                            domain: domain,
                            subtopic: subtopic,
                        });
                    }
                }
            }
        }
        return topics;
    }
}
exports.PromptManager = PromptManager;
/**
 * Create singleton prompt manager
 */
let promptManagerInstance = null;
function getPromptManager() {
    if (!promptManagerInstance) {
        promptManagerInstance = new PromptManager();
    }
    return promptManagerInstance;
}
//# sourceMappingURL=prompt-manager.js.map