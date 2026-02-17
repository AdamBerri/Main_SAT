import type { AnchorSet, EvaluationDimension } from '../core/types';
/**
 * Anchor sets for Semantic Similarity Rating (SSR)
 * Each anchor represents a Likert scale point (1-5) for a specific evaluation dimension.
 * These are used to convert free-text evaluations into numerical scores via embedding similarity.
 */
export declare const FAITHFULNESS_ANCHORS: AnchorSet;
export declare const ANSWER_VALIDITY_ANCHORS: AnchorSet;
export declare const DISTRACTOR_QUALITY_ANCHORS: AnchorSet;
export declare const DIFFICULTY_ACCURACY_ANCHORS: AnchorSet;
export declare const FRONTEND_CONVERTIBILITY_ANCHORS: AnchorSet;
export declare const IMAGE_QUALITY_ANCHORS: AnchorSet;
export declare const GRAMMAR_AUTHENTICITY_ANCHORS: AnchorSet;
export declare const ANCHOR_SETS: Record<EvaluationDimension, AnchorSet>;
export declare function getAnchorSet(dimension: EvaluationDimension): AnchorSet;
//# sourceMappingURL=anchors.d.ts.map