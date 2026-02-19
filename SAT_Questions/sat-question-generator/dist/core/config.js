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
exports.SSR_CONFIG = exports.MODEL_CONFIG = exports.DEFAULT_TEMPERATURE_CONFIG = exports.DEFAULT_PREAM_CONFIG = exports.MATH_HIERARCHY = exports.READING_HIERARCHY = exports.GOLD_STANDARDS_DIR = exports.EVALUATION_DIR = exports.GENERATED_DIR = exports.SCHEMAS_DIR = exports.PROMPTS_DIR = exports.DATA_ROOT = exports.PACKAGE_ROOT = void 0;
exports.getTopicPath = getTopicPath;
exports.getPromptDir = getPromptDir;
exports.getSchemaPath = getSchemaPath;
exports.getPromptPath = getPromptPath;
exports.getGeneratedDir = getGeneratedDir;
exports.getEvaluationDir = getEvaluationDir;
exports.getAllTopics = getAllTopics;
exports.ensureDirectoryExists = ensureDirectoryExists;
exports.topicToString = topicToString;
exports.parseTopicString = parseTopicString;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ============================================
// Directory Paths
// ============================================
exports.PACKAGE_ROOT = path.resolve(__dirname, '../..');
exports.DATA_ROOT = process.env.PREAM_DATA_ROOT
    ? path.resolve(process.env.PREAM_DATA_ROOT)
    : exports.PACKAGE_ROOT;
exports.PROMPTS_DIR = path.join(exports.DATA_ROOT, 'prompts');
exports.SCHEMAS_DIR = path.join(exports.PACKAGE_ROOT, 'schemas');
exports.GENERATED_DIR = path.join(exports.DATA_ROOT, 'generated');
exports.EVALUATION_DIR = path.join(exports.DATA_ROOT, 'evaluation');
exports.GOLD_STANDARDS_DIR = path.join(exports.DATA_ROOT, 'gold_standards');
// ============================================
// Topic Hierarchy
// ============================================
exports.READING_HIERARCHY = {
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
exports.MATH_HIERARCHY = {
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
exports.DEFAULT_PREAM_CONFIG = {
    maxIterations: 5,
    trainTestSplit: 0.8,
    convergenceThreshold: 0.02, // 2% improvement threshold
    minSamplesPerIteration: 25,
    errorCategoryCount: 5,
    repairEnabled: true,
    maxRepairAttempts: 1,
};
exports.DEFAULT_TEMPERATURE_CONFIG = {
    generation: 0.7,
    variation: 0.3,
};
// ============================================
// Model Configuration
// ============================================
exports.MODEL_CONFIG = {
    generation: {
        provider: 'openai',
        model: process.env.GENERATION_MODEL ||
            process.env.LLM_MODEL ||
            process.env.MINIMAX_MODEL ||
            'glm-5',
        maxTokens: 4096,
    },
    evaluation: {
        provider: 'openai',
        model: process.env.EVALUATION_MODEL ||
            process.env.LLM_MODEL ||
            process.env.MINIMAX_MODEL ||
            process.env.GENERATION_MODEL ||
            'glm-5',
        maxTokens: 2048,
    },
    imageGeneration: {
        provider: 'google',
        model: 'gemini-2.0-flash-exp', // Nano Banana
    },
};
// ============================================
// SSR Configuration
// ============================================
exports.SSR_CONFIG = {
    temperature: 2.0, // Temperature parameter for PMF softmax calculation
    acceptableThreshold: 3.5, // Score >= this is acceptable (pass/fail threshold)
};
// ============================================
// Utility Functions
// ============================================
function getTopicPath(section, domain, subtopic) {
    return { section, domain, subtopic };
}
function getPromptDir(topic) {
    return path.join(exports.PROMPTS_DIR, topic.section, topic.domain, topic.subtopic);
}
function getSchemaPath(topic) {
    return path.join(getPromptDir(topic), 'schema.json');
}
function getPromptPath(topic, version) {
    return path.join(getPromptDir(topic), `prompt_v${version}.md`);
}
function getGeneratedDir(topic) {
    return path.join(exports.GENERATED_DIR, topic.section, topic.domain, topic.subtopic);
}
function getEvaluationDir(topic) {
    return path.join(exports.EVALUATION_DIR, topic.section, topic.domain, topic.subtopic);
}
function getAllTopics() {
    const topics = [];
    // Reading topics
    for (const [domain, subtopics] of Object.entries(exports.READING_HIERARCHY)) {
        for (const subtopic of subtopics) {
            topics.push({
                section: 'READING',
                domain: domain,
                subtopic: subtopic,
            });
        }
    }
    // Math topics
    for (const [domain, subtopics] of Object.entries(exports.MATH_HIERARCHY)) {
        for (const subtopic of subtopics) {
            topics.push({
                section: 'MATH',
                domain: domain,
                subtopic: subtopic,
            });
        }
    }
    return topics;
}
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}
function topicToString(topic) {
    return `${topic.section}/${topic.domain}/${topic.subtopic}`;
}
function parseTopicString(topicStr) {
    const [section, domain, subtopic] = topicStr.split('/');
    return {
        section: section,
        domain: domain,
        subtopic: subtopic,
    };
}
//# sourceMappingURL=config.js.map