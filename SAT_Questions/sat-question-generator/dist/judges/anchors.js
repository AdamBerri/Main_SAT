"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANCHOR_SETS = exports.GRAMMAR_AUTHENTICITY_ANCHORS = exports.IMAGE_QUALITY_ANCHORS = exports.FRONTEND_CONVERTIBILITY_ANCHORS = exports.DIFFICULTY_ACCURACY_ANCHORS = exports.DISTRACTOR_QUALITY_ANCHORS = exports.ANSWER_VALIDITY_ANCHORS = exports.FAITHFULNESS_ANCHORS = void 0;
exports.getAnchorSet = getAnchorSet;
/**
 * Anchor sets for Semantic Similarity Rating (SSR)
 * Each anchor represents a Likert scale point (1-5) for a specific evaluation dimension.
 * These are used to convert free-text evaluations into numerical scores via embedding similarity.
 */
exports.FAITHFULNESS_ANCHORS = {
    id: 'faithfulness_v1',
    dimension: 'faithfulness',
    anchors: {
        1: "This question bears no resemblance to authentic SAT questions. The format is completely wrong, the style is inappropriate, and it would never appear on an actual College Board SAT exam. The question type, structure, and content are fundamentally misaligned with SAT standards.",
        2: "This question has significant deviations from SAT format and style. While it attempts to follow SAT conventions, there are major structural issues, inappropriate language complexity, or content that doesn't match what College Board would publish. It needs substantial revision.",
        3: "This question partially matches SAT style but has noticeable inconsistencies. The format is roughly correct but some elements feel off - perhaps the answer choices are formatted unusually, the stem is too long or short, or the difficulty calibration seems wrong for the stated level.",
        4: "This question closely follows SAT conventions with only minor deviations. The format, style, and difficulty are appropriate. A student would recognize this as SAT-like. There may be subtle differences from official questions but nothing that would confuse test-takers.",
        5: "This question is indistinguishable from an official College Board SAT question. The format is perfect, the language style matches exactly, the difficulty is precisely calibrated, and all conventions are followed flawlessly. It could be inserted into an official test without detection.",
    },
};
exports.ANSWER_VALIDITY_ANCHORS = {
    id: 'answer_validity_v1',
    dimension: 'answer_validity',
    anchors: {
        1: "The designated correct answer is clearly wrong, or multiple answer choices could be considered correct. The question has fundamental logical or factual errors that make it unsolvable or misleading. A knowledgeable student would be confused and potentially answer incorrectly despite understanding the material.",
        2: "The correct answer is technically defensible but problematic. There may be ambiguity that makes another choice seem equally valid, or the reasoning required to reach the answer is flawed. Students might reasonably disagree with the keyed answer based on legitimate interpretations.",
        3: "The correct answer is generally acceptable but has minor issues. The logic is sound but perhaps the justification could be clearer, or there's slight ambiguity that doesn't significantly impact solvability. Most students would get it right but some might have valid concerns.",
        4: "The correct answer is clearly correct and well-justified. The logic is sound, there's no ambiguity, and a student who understands the material would reliably choose this answer. Minor improvements in explanation might be possible but aren't necessary.",
        5: "The correct answer is unambiguously and definitively correct. The reasoning is airtight, the answer is the only defensible choice, and the explanation perfectly justifies why it's correct and why all distractors are wrong. No reasonable person could argue for a different answer.",
    },
};
exports.DISTRACTOR_QUALITY_ANCHORS = {
    id: 'distractor_quality_v1',
    dimension: 'distractor_quality',
    anchors: {
        1: "The distractors are obviously wrong and would fool no one. They may be absurd, completely unrelated to the question, or so different from the correct answer that students can eliminate them instantly. The question essentially becomes a true/false question.",
        2: "The distractors are weak and easily eliminated. While not absurd, they represent common misconceptions poorly or contain obvious tells that mark them as wrong. A minimally prepared student could eliminate 2-3 choices quickly.",
        3: "The distractors are moderately effective. They represent some common errors but may not be as carefully crafted as they could be. Some are more plausible than others, creating uneven difficulty. Prepared students can eliminate some but not all.",
        4: "The distractors are well-crafted and represent genuine misconceptions. Each wrong answer targets a specific error that students commonly make. Elimination requires actual understanding rather than test-taking tricks. The difficulty distribution feels appropriate.",
        5: "The distractors are expertly crafted, each representing a distinct, psychometrically valid misconception. They are carefully calibrated to attract students who make specific errors while being clearly distinguishable from the correct answer upon careful analysis. This is graduate-level item design.",
    },
};
exports.DIFFICULTY_ACCURACY_ANCHORS = {
    id: 'difficulty_accuracy_v1',
    dimension: 'difficulty_accuracy',
    anchors: {
        1: "The stated difficulty is completely misaligned with the actual question. A question marked as 'easy' is actually extremely hard, or vice versa. The cognitive load, prerequisite knowledge, and problem-solving steps don't match the difficulty label at all.",
        2: "The difficulty calibration is significantly off. There's a 2-3 level discrepancy between stated and actual difficulty. For example, a 'medium' question that requires advanced reasoning, or a 'hard' question that can be solved with basic recall.",
        3: "The difficulty is roughly in the right range but imprecise. The question might be on the border between two difficulty levels, or some aspects are harder/easier than the stated difficulty suggests. Calibration is in the ballpark but not exact.",
        4: "The difficulty matches the stated level well. The cognitive demands, prerequisite knowledge, and solution complexity align with expectations for this difficulty tier. Minor discrepancies might exist but don't significantly affect appropriate placement.",
        5: "The difficulty is perfectly calibrated to the stated level. Every aspect of the question - complexity, required knowledge, solution steps, time pressure - precisely matches what's expected at this difficulty. This demonstrates expert-level difficulty targeting.",
    },
};
exports.FRONTEND_CONVERTIBILITY_ANCHORS = {
    id: 'frontend_convertibility_v1',
    dimension: 'frontend_convertibility',
    anchors: {
        1: "The JSON structure is fundamentally broken or incompatible with frontend rendering. Required fields are missing, data types are wrong, or the structure doesn't match the expected schema. This would cause crashes or render failures in the application.",
        2: "The JSON has significant structural issues that would require manual intervention. Some fields are incorrectly formatted, nested structures are malformed, or content includes unparseable elements. Rendering would be degraded or partially broken.",
        3: "The JSON is structurally valid but has formatting issues. Special characters may not be properly escaped, LaTeX/math notation might not follow conventions, or some content might render awkwardly. Functional but not optimal.",
        4: "The JSON is well-formed and renders correctly. All fields are present and properly typed, content is correctly escaped, and the structure follows the expected schema. Minor formatting improvements might enhance display but aren't necessary.",
        5: "The JSON is perfectly structured for frontend consumption. All content is optimally formatted, special characters are correctly handled, math notation renders beautifully, and the data structure exactly matches the schema. No modifications needed.",
    },
};
exports.IMAGE_QUALITY_ANCHORS = {
    id: 'image_quality_v1',
    dimension: 'image_quality',
    anchors: {
        1: "The generated image is completely unusable. It doesn't match the description, contains errors that would confuse students, or is visually incomprehensible. The image would actively harm understanding of the question rather than help it.",
        2: "The image has significant issues that affect usability. It roughly matches the description but contains noticeable errors, unclear labels, or visual problems. Students might be confused or misled by the image.",
        3: "The image is functional but not polished. It conveys the necessary information but could be clearer, better labeled, or more professionally presented. It serves its purpose but doesn't enhance the question's quality.",
        4: "The image is well-designed and clearly communicates the intended information. Labels are clear, proportions are accurate, and the visual style is appropriate. Minor improvements might be possible but the image effectively supports the question.",
        5: "The image is publication-quality and perfectly matches what would appear on an official SAT. It's clear, accurate, appropriately styled, and enhances understanding. Indistinguishable from official College Board graphics.",
    },
};
exports.GRAMMAR_AUTHENTICITY_ANCHORS = {
    id: 'grammar_authenticity_v1',
    dimension: 'grammar_authenticity',
    anchors: {
        1: "The grammar question doesn't test actual SAT grammar concepts. It may test obscure rules, use inappropriate sentence structures, or create artificial scenarios that wouldn't appear on the real test. The tested skill is misaligned with SAT requirements.",
        2: "The question tests a legitimate grammar concept but does so poorly. The sentence structure is unnatural, the error is either too obvious or too subtle, or the context doesn't match SAT style. It needs significant revision.",
        3: "The question tests an appropriate grammar concept in a reasonable way. The sentence structure is acceptable and the error is appropriately challenging. However, something about the presentation doesn't quite match official SAT grammar questions.",
        4: "The question effectively tests SAT grammar concepts with appropriate sentence structures and error types. The style closely matches official questions and the difficulty is well-calibrated. Minor refinements might perfect it.",
        5: "The question is a perfect example of SAT grammar testing. The sentence structure, error type, answer choices, and overall presentation are indistinguishable from official College Board grammar questions. Expert-level item design.",
    },
};
// Map of all anchor sets by dimension
exports.ANCHOR_SETS = {
    faithfulness: exports.FAITHFULNESS_ANCHORS,
    answer_validity: exports.ANSWER_VALIDITY_ANCHORS,
    distractor_quality: exports.DISTRACTOR_QUALITY_ANCHORS,
    difficulty_accuracy: exports.DIFFICULTY_ACCURACY_ANCHORS,
    frontend_convertibility: exports.FRONTEND_CONVERTIBILITY_ANCHORS,
    image_quality: exports.IMAGE_QUALITY_ANCHORS,
    grammar_authenticity: exports.GRAMMAR_AUTHENTICITY_ANCHORS,
};
// Get anchor set for a dimension
function getAnchorSet(dimension) {
    return exports.ANCHOR_SETS[dimension];
}
//# sourceMappingURL=anchors.js.map