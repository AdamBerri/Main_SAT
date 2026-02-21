/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as achievements from "../achievements.js";
import type * as admin from "../admin.js";
import type * as agentQuestions from "../agentQuestions.js";
import type * as answers from "../answers.js";
import type * as attempts from "../attempts.js";
import type * as claudeImagePrompts from "../claudeImagePrompts.js";
import type * as crossTextPrompts from "../crossTextPrompts.js";
import type * as crossTextQuestionGeneration from "../crossTextQuestionGeneration.js";
import type * as crossTextTemplates from "../crossTextTemplates.js";
import type * as dailyChallenges from "../dailyChallenges.js";
import type * as endless from "../endless.js";
import type * as geminiImages from "../geminiImages.js";
import type * as generateTestPdf from "../generateTestPdf.js";
import type * as grammarConventionsTemplates from "../grammarConventionsTemplates.js";
import type * as grammarPrompts from "../grammarPrompts.js";
import type * as grammarQuestionGeneration from "../grammarQuestionGeneration.js";
import type * as graphImagePipeline from "../graphImagePipeline.js";
import type * as graphQuestionTemplates from "../graphQuestionTemplates.js";
import type * as imageGenerationDLQ from "../imageGenerationDLQ.js";
import type * as images from "../images.js";
import type * as mathFigureImagePrompts from "../mathFigureImagePrompts.js";
import type * as mathQuestionDLQ from "../mathQuestionDLQ.js";
import type * as mathQuestionGeneration from "../mathQuestionGeneration.js";
import type * as mathQuestionPrompts from "../mathQuestionPrompts.js";
import type * as mathQuestionTemplates from "../mathQuestionTemplates.js";
import type * as officialQuestions from "../officialQuestions.js";
import type * as passages from "../passages.js";
import type * as pdfImport from "../pdfImport.js";
import type * as pdfTests from "../pdfTests.js";
import type * as progressTracking from "../progressTracking.js";
import type * as questionExport from "../questionExport.js";
import type * as questionImport from "../questionImport.js";
import type * as questionPerformance from "../questionPerformance.js";
import type * as questionReview from "../questionReview.js";
import type * as questionReviewBatch from "../questionReviewBatch.js";
import type * as questionReviewMutations from "../questionReviewMutations.js";
import type * as questions from "../questions.js";
import type * as questionsByDifficulty from "../questionsByDifficulty.js";
import type * as readingDataDLQ from "../readingDataDLQ.js";
import type * as readingDataGeneration from "../readingDataGeneration.js";
import type * as readingDataImagePrompts from "../readingDataImagePrompts.js";
import type * as readingDataTemplates from "../readingDataTemplates.js";
import type * as readingQuestionDLQ from "../readingQuestionDLQ.js";
import type * as readingQuestionGeneration from "../readingQuestionGeneration.js";
import type * as readingQuestionPrompts from "../readingQuestionPrompts.js";
import type * as readingQuestionTemplates from "../readingQuestionTemplates.js";
import type * as scores from "../scores.js";
import type * as seed from "../seed.js";
import type * as seedTutoring from "../seedTutoring.js";
import type * as subscriptions from "../subscriptions.js";
import type * as transitionsPrompts from "../transitionsPrompts.js";
import type * as transitionsQuestionGeneration from "../transitionsQuestionGeneration.js";
import type * as transitionsTemplates from "../transitionsTemplates.js";
import type * as tutoring from "../tutoring.js";
import type * as userSettings from "../userSettings.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  achievements: typeof achievements;
  admin: typeof admin;
  agentQuestions: typeof agentQuestions;
  answers: typeof answers;
  attempts: typeof attempts;
  claudeImagePrompts: typeof claudeImagePrompts;
  crossTextPrompts: typeof crossTextPrompts;
  crossTextQuestionGeneration: typeof crossTextQuestionGeneration;
  crossTextTemplates: typeof crossTextTemplates;
  dailyChallenges: typeof dailyChallenges;
  endless: typeof endless;
  geminiImages: typeof geminiImages;
  generateTestPdf: typeof generateTestPdf;
  grammarConventionsTemplates: typeof grammarConventionsTemplates;
  grammarPrompts: typeof grammarPrompts;
  grammarQuestionGeneration: typeof grammarQuestionGeneration;
  graphImagePipeline: typeof graphImagePipeline;
  graphQuestionTemplates: typeof graphQuestionTemplates;
  imageGenerationDLQ: typeof imageGenerationDLQ;
  images: typeof images;
  mathFigureImagePrompts: typeof mathFigureImagePrompts;
  mathQuestionDLQ: typeof mathQuestionDLQ;
  mathQuestionGeneration: typeof mathQuestionGeneration;
  mathQuestionPrompts: typeof mathQuestionPrompts;
  mathQuestionTemplates: typeof mathQuestionTemplates;
  officialQuestions: typeof officialQuestions;
  passages: typeof passages;
  pdfImport: typeof pdfImport;
  pdfTests: typeof pdfTests;
  progressTracking: typeof progressTracking;
  questionExport: typeof questionExport;
  questionImport: typeof questionImport;
  questionPerformance: typeof questionPerformance;
  questionReview: typeof questionReview;
  questionReviewBatch: typeof questionReviewBatch;
  questionReviewMutations: typeof questionReviewMutations;
  questions: typeof questions;
  questionsByDifficulty: typeof questionsByDifficulty;
  readingDataDLQ: typeof readingDataDLQ;
  readingDataGeneration: typeof readingDataGeneration;
  readingDataImagePrompts: typeof readingDataImagePrompts;
  readingDataTemplates: typeof readingDataTemplates;
  readingQuestionDLQ: typeof readingQuestionDLQ;
  readingQuestionGeneration: typeof readingQuestionGeneration;
  readingQuestionPrompts: typeof readingQuestionPrompts;
  readingQuestionTemplates: typeof readingQuestionTemplates;
  scores: typeof scores;
  seed: typeof seed;
  seedTutoring: typeof seedTutoring;
  subscriptions: typeof subscriptions;
  transitionsPrompts: typeof transitionsPrompts;
  transitionsQuestionGeneration: typeof transitionsQuestionGeneration;
  transitionsTemplates: typeof transitionsTemplates;
  tutoring: typeof tutoring;
  userSettings: typeof userSettings;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
