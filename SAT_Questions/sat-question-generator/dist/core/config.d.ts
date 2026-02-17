import type { TopicPath, SATSection, ReadingDomain, MathDomain, ReadingSubtopic, MathSubtopic, PREAMConfig, TemperatureConfig } from './types';
export declare const PACKAGE_ROOT: string;
export declare const PROMPTS_DIR: string;
export declare const SCHEMAS_DIR: string;
export declare const GENERATED_DIR: string;
export declare const EVALUATION_DIR: string;
export declare const GOLD_STANDARDS_DIR: string;
export declare const READING_HIERARCHY: Record<ReadingDomain, ReadingSubtopic[]>;
export declare const MATH_HIERARCHY: Record<MathDomain, MathSubtopic[]>;
export declare const DEFAULT_PREAM_CONFIG: PREAMConfig;
export declare const DEFAULT_TEMPERATURE_CONFIG: TemperatureConfig;
export declare const MODEL_CONFIG: {
    generation: {
        provider: "anthropic";
        model: string;
        maxTokens: number;
    };
    evaluation: {
        provider: "anthropic";
        model: string;
        maxTokens: number;
    };
    imageGeneration: {
        provider: "google";
        model: string;
    };
};
export declare const SSR_CONFIG: {
    temperature: number;
    epsilon: number;
    acceptableThreshold: number;
};
export declare function getTopicPath(section: SATSection, domain: ReadingDomain | MathDomain, subtopic: ReadingSubtopic | MathSubtopic): TopicPath;
export declare function getPromptDir(topic: TopicPath): string;
export declare function getSchemaPath(topic: TopicPath): string;
export declare function getPromptPath(topic: TopicPath, version: string): string;
export declare function getGeneratedDir(topic: TopicPath): string;
export declare function getEvaluationDir(topic: TopicPath): string;
export declare function getAllTopics(): TopicPath[];
export declare function ensureDirectoryExists(dirPath: string): void;
export declare function topicToString(topic: TopicPath): string;
export declare function parseTopicString(topicStr: string): TopicPath;
//# sourceMappingURL=config.d.ts.map