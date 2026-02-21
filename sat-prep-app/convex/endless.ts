import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";

// ─────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────

type MasteryLevel =
  | "novice"
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

function getMasteryLevel(points: number): MasteryLevel {
  if (points >= 900) return "expert";
  if (points >= 600) return "advanced";
  if (points >= 300) return "intermediate";
  if (points >= 100) return "beginner";
  return "novice";
}

// ─────────────────────────────────────────────────────────
// SM-2 SPACED REPETITION HELPERS
// ─────────────────────────────────────────────────────────

interface SM2Update {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: number;
  lastReviewedAt: number;
}

function calculateSM2Update(
  correct: boolean,
  currentEaseFactor: number,
  currentInterval: number,
  currentRepetitions: number
): SM2Update {
  const now = Date.now();
  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  if (correct) {
    const newRepetitions = currentRepetitions + 1;
    let newInterval: number;

    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * currentEaseFactor);
    }

    // Ease factor increases slightly for correct answers
    const newEaseFactor = Math.max(1.3, currentEaseFactor + 0.1);

    return {
      easeFactor: newEaseFactor,
      interval: newInterval,
      repetitions: newRepetitions,
      nextReviewAt: now + newInterval * MS_PER_DAY,
      lastReviewedAt: now,
    };
  } else {
    // Incorrect answer - reset
    return {
      easeFactor: Math.max(1.3, currentEaseFactor - 0.2),
      interval: 1,
      repetitions: 0,
      nextReviewAt: now + MS_PER_DAY, // Review tomorrow
      lastReviewedAt: now,
    };
  }
}

// ─────────────────────────────────────────────────────────
// MASTERY CALCULATION HELPERS
// ─────────────────────────────────────────────────────────

function calculateMasteryPointChange(
  correct: boolean,
  questionDifficulty: number,
  currentStreak: number,
  currentMasteryPoints: number
): number {
  const basePoints = correct ? 15 : -10;

  // Difficulty multiplier (1-3 difficulty -> 0.8-1.4 multiplier)
  const difficultyMultiplier = 0.6 + questionDifficulty * 0.2;

  // Streak bonus (only for correct)
  const streakBonus = correct ? Math.min(10, currentStreak * 2) : 0;

  // Diminishing returns at higher levels (correct only)
  const levelPenalty = correct
    ? Math.max(0.5, 1 - currentMasteryPoints / 2000)
    : 1;

  const pointChange = Math.round(
    (basePoints * difficultyMultiplier + streakBonus) * levelPenalty
  );

  // Clamp to 0-1000
  const newPoints = Math.max(
    0,
    Math.min(1000, currentMasteryPoints + pointChange)
  );
  return newPoints - currentMasteryPoints;
}

// ─────────────────────────────────────────────────────────
// QUESTION SELECTION ALGORITHM
// ─────────────────────────────────────────────────────────

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const RECENT_SESSION_WINDOW = 6;
const TOP_CANDIDATE_POOL = 5;
const FRUSTRATION_WINDOW_SIZE = 6;
const LATE_REVIEW_CHANCE = 0.65;
const HEAVY_BACKLOG_REVIEW_CHANCE = 0.8;
const LAPSE_RECOVERY_CHANCE = 0.45;
const WEAK_SKILL_CHANCE = 0.7;
const MASTERED_REFRESH_CHANCE = 0.35;
const STRETCH_CHALLENGE_CHANCE = 0.45;
const MODERATE_FRUSTRATION_RECOVERY_CHANCE = 0.7;
const HIGH_FRUSTRATION_RECOVERY_CHANCE = 0.9;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

function getNormalizedQuestionDifficulty(question: {
  overallDifficulty?: number;
  difficulty: number;
}): number {
  if (typeof question.overallDifficulty === "number") {
    return clamp01(question.overallDifficulty);
  }

  // Legacy difficulty is 1-3, convert to 0-1
  return clamp01((question.difficulty - 1) / 2);
}

function getTargetDifficulty(globalAccuracy: number): number {
  if (globalAccuracy < 0.55) return 0.35;
  if (globalAccuracy < 0.7) return 0.5;
  if (globalAccuracy < 0.82) return 0.65;
  return 0.78;
}

function getSkillRefreshIntervalDays(masteryPoints: number): number {
  if (masteryPoints >= 900) return 7;
  if (masteryPoints >= 600) return 4;
  if (masteryPoints >= 300) return 2;
  return 1;
}

function pickFromTopCandidates<T extends { score: number }>(
  sortedCandidates: T[]
): T | null {
  if (sortedCandidates.length === 0) return null;

  const top = sortedCandidates.slice(
    0,
    Math.min(TOP_CANDIDATE_POOL, sortedCandidates.length)
  );

  // Weighted random pick from top candidates to keep variation while
  // still strongly favoring highest-priority items.
  const baseline = top[top.length - 1].score;
  const weights = top.map((candidate) =>
    Math.max(1, candidate.score - baseline + 1)
  );
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  let threshold = Math.random() * totalWeight;
  for (let i = 0; i < top.length; i++) {
    threshold -= weights[i];
    if (threshold <= 0) {
      return top[i];
    }
  }

  return top[top.length - 1];
}

interface SelectionSignals {
  recentIncorrectStreak?: number;
  recentWindowAccuracy?: number;
}

interface RecentPerformanceSignals {
  recentIncorrectStreak: number;
  recentWindowAccuracy: number;
}

async function getRecentPerformanceSignals(
  ctx: MutationCtx,
  attemptId: Id<"examAttempts">
): Promise<RecentPerformanceSignals> {
  const answers = await ctx.db
    .query("userAnswers")
    .withIndex("by_attempt", (q) => q.eq("attemptId", attemptId))
    .collect();

  const gradedAnswers = answers
    .filter(
      (answer) =>
        answer.status === "graded" && typeof answer.isCorrect === "boolean"
    )
    .sort(
      (a, b) =>
        (b.submittedAt ?? b.lastModifiedAt) - (a.submittedAt ?? a.lastModifiedAt)
    );

  let recentIncorrectStreak = 0;
  for (const answer of gradedAnswers) {
    if (answer.isCorrect === false) {
      recentIncorrectStreak++;
    } else {
      break;
    }
  }

  const recentWindow = gradedAnswers.slice(0, FRUSTRATION_WINDOW_SIZE);
  const recentCorrect = recentWindow.filter((answer) => answer.isCorrect).length;
  const recentWindowAccuracy =
    recentWindow.length > 0 ? recentCorrect / recentWindow.length : 1;

  return {
    recentIncorrectStreak,
    recentWindowAccuracy,
  };
}

async function selectNextQuestion(
  ctx: MutationCtx,
  visitorId: string,
  answeredQuestionIds: Id<"questions">[],
  category?: "reading_writing" | "math",
  domain?: string,
  signals?: SelectionSignals
): Promise<Id<"questions"> | null> {
  const now = Date.now();

  // Step 1: Get the candidate pool
  let allQuestions = await ctx.db.query("questions").collect();

  // Filter by category if specified
  if (category) {
    allQuestions = allQuestions.filter((q) => q.category === category);
  }

  // Filter by domain if specified (e.g., "geometry_and_trigonometry")
  if (domain) {
    allQuestions = allQuestions.filter((q) => q.domain === domain);
  }

  // Filter for verified questions only (or official questions)
  allQuestions = allQuestions.filter((q) => {
    // Official questions are always allowed
    if (
      q.source?.type === "official_collegeboard" ||
      q.source?.type === "official_practice_test"
    ) {
      return true;
    }
    // Agent-generated questions must be verified
    if (q.source?.type === "agent_generated") {
      return q.reviewStatus === "verified";
    }
    // Default: allow (legacy/seeded questions without source)
    return true;
  });

  if (allQuestions.length === 0) {
    return null;
  }

  // Filter out already answered questions in this session
  const answeredSet = new Set(answeredQuestionIds.map((id) => id.toString()));
  let eligibleQuestions = allQuestions.filter(
    (q) => !answeredSet.has(q._id.toString())
  );

  // If all questions exhausted, reset pool (allow repeats)
  if (eligibleQuestions.length === 0) {
    eligibleQuestions = allQuestions;
  }

  // Step 2: Preload user state once (avoids N+1 queries per candidate)
  const [reviewSchedules, skillMasteries] = await Promise.all([
    ctx.db
      .query("questionReviewSchedule")
      .withIndex("by_visitor", (q) => q.eq("visitorId", visitorId))
      .collect(),
    ctx.db
      .query("skillMastery")
      .withIndex("by_visitor", (q) => q.eq("visitorId", visitorId))
      .collect(),
  ]);

  const reviewScheduleByQuestion = new Map(
    reviewSchedules.map((schedule) => [schedule.questionId.toString(), schedule])
  );

  const skillMasteryBySkill = new Map(
    skillMasteries.map((mastery) => [mastery.skill, mastery])
  );

  // Derive global target difficulty from user history
  const totalTrackedQuestions = skillMasteries.reduce(
    (sum, mastery) => sum + mastery.totalQuestions,
    0
  );
  const totalTrackedCorrect = skillMasteries.reduce(
    (sum, mastery) => sum + mastery.correctAnswers,
    0
  );
  const globalAccuracy =
    totalTrackedQuestions > 0
      ? totalTrackedCorrect / totalTrackedQuestions
      : 0.6;
  const targetDifficulty = getTargetDifficulty(globalAccuracy);

  // Anti-frustration signal: if recent performance dips, ease difficulty slightly
  // to rebuild confidence while still keeping practice productive.
  const recentIncorrectStreak = signals?.recentIncorrectStreak ?? 0;
  const recentWindowAccuracy = signals?.recentWindowAccuracy ?? globalAccuracy;
  const frustrationFromStreak = clamp01((recentIncorrectStreak - 1) / 4);
  const frustrationFromAccuracy =
    recentWindowAccuracy < 0.55
      ? clamp01((0.55 - recentWindowAccuracy) / 0.55)
      : 0;
  const frustrationLevel = clamp01(
    Math.max(frustrationFromStreak, frustrationFromAccuracy)
  );
  const recoveryDifficultyTarget = clamp01(
    targetDifficulty -
      frustrationLevel * 0.28 -
      (recentIncorrectStreak >= 3 ? 0.08 : 0)
  );

  // Short-memory diversity: avoid drilling the same skill/domain repeatedly.
  const recentAnsweredIds = answeredQuestionIds.slice(-RECENT_SESSION_WINDOW);
  const recentAnsweredQuestions = await Promise.all(
    recentAnsweredIds.map((id) => ctx.db.get(id))
  );
  const recentSkillCounts = new Map<string, number>();
  const recentDomainCounts = new Map<string, number>();
  for (const question of recentAnsweredQuestions) {
    if (!question) continue;
    recentSkillCounts.set(
      question.skill,
      (recentSkillCounts.get(question.skill) ?? 0) + 1
    );
    recentDomainCounts.set(
      question.domain,
      (recentDomainCounts.get(question.domain) ?? 0) + 1
    );
  }

  // Step 3: Score each candidate
  const scoredQuestions = eligibleQuestions.map((question) => {
    let score = 0;
    let weakSkill = false;
    let masteredRefresh = false;
    const schedule = reviewScheduleByQuestion.get(question._id.toString());
    const mastery = skillMasteryBySkill.get(question.skill);

    const dueForReview = Boolean(schedule && schedule.nextReviewAt <= now);
    const lapseRecovery = Boolean(schedule && schedule.repetitions === 0);

    // 3a. Question-level spaced repetition urgency
    if (schedule) {
      const overdueMs = now - schedule.nextReviewAt;
      if (overdueMs >= 0) {
        const overdueDays = overdueMs / MS_PER_DAY;
        score += 120 + Math.min(80, overdueDays * 18);
      } else {
        const daysUntilDue = -overdueMs / MS_PER_DAY;
        if (daysUntilDue <= 0.5) {
          score += 24;
        } else if (daysUntilDue <= 1.5) {
          score += 12;
        }
      }

      // If this exact question is still error-prone, reinforce it more.
      if (schedule.totalAttempts >= 2) {
        const questionAccuracy = schedule.correctAttempts / schedule.totalAttempts;
        if (questionAccuracy < 0.8) {
          const instability = clamp01((0.8 - questionAccuracy) / 0.8);
          score += instability * 30;
        }
      }

      // Lapse recovery: after an incorrect answer, bring it back soon,
      // but not immediately to avoid short-term memorization.
      if (schedule.repetitions === 0) {
        const minutesSinceReview = (now - schedule.lastReviewedAt) / MS_PER_MINUTE;
        if (minutesSinceReview < 3) {
          score -= 90;
        } else if (minutesSinceReview < 25) {
          score += 55;
        } else {
          score += 30;
        }
      }
    } else {
      // Unseen questions remain important, especially for coverage.
      score += 36;
    }

    // 3b. Skill weakness + mastery-gap targeting
    if (mastery) {
      const skillAccuracy =
        mastery.totalQuestions > 0
          ? mastery.correctAnswers / mastery.totalQuestions
          : 0.5;

      weakSkill = mastery.masteryPoints < 600 || skillAccuracy < 0.75;

      const masteryGap = clamp01((750 - mastery.masteryPoints) / 750);
      const accuracyGap = clamp01((0.85 - skillAccuracy) / 0.85);
      score += Math.max(masteryGap, accuracyGap) * 70;

      // Keep mastered skills alive via periodic refresh (spaced by level).
      const daysSinceSkillPractice = (now - mastery.lastPracticedAt) / MS_PER_DAY;
      const refreshIntervalDays = getSkillRefreshIntervalDays(mastery.masteryPoints);
      const refreshOverdueDays = daysSinceSkillPractice - refreshIntervalDays;
      if (mastery.masteryPoints >= 600 && refreshOverdueDays > 0) {
        masteredRefresh = true;
        score += Math.min(45, 15 + refreshOverdueDays * 6);
      }

      // Short-term anti-repetition penalty.
      const minutesSinceSkillPractice =
        (now - mastery.lastPracticedAt) / MS_PER_MINUTE;
      if (minutesSinceSkillPractice < 2) {
        score -= 35;
      } else if (minutesSinceSkillPractice < 7) {
        score -= 20;
      } else if (minutesSinceSkillPractice < 20) {
        score -= 8;
      }
    } else {
      // New/untested skill discovery is considered weak by default.
      weakSkill = true;
      score += 45;
    }

    // 3c. Difficulty targeting ("just-right" difficulty + recovery when frustrated)
    const normalizedDifficulty = getNormalizedQuestionDifficulty(question);
    const effectiveTargetDifficulty =
      frustrationLevel > 0 ? recoveryDifficultyTarget : targetDifficulty;
    const stretchCandidate =
      frustrationLevel < 0.25 &&
      normalizedDifficulty > targetDifficulty + 0.08;
    const confidenceRecoveryCandidate =
      frustrationLevel > 0 &&
      normalizedDifficulty <= recoveryDifficultyTarget + 0.08 &&
      normalizedDifficulty >= Math.max(0, recoveryDifficultyTarget - 0.22);

    const difficultyDelta = Math.abs(
      normalizedDifficulty - effectiveTargetDifficulty
    );
    score += Math.max(0, 24 - difficultyDelta * 44);
    if (globalAccuracy >= 0.8 && normalizedDifficulty > targetDifficulty + 0.1) {
      score += 10;
    }
    if (frustrationLevel > 0) {
      if (normalizedDifficulty > recoveryDifficultyTarget + 0.12) {
        // Temporarily de-prioritize hard items after a miss streak.
        score -= 30 * frustrationLevel;
      } else if (confidenceRecoveryCandidate) {
        score += 26 * frustrationLevel;
      }
    }

    // 3d. Session-level diversity (avoid long same-skill/domain runs)
    const recentSkillCount = recentSkillCounts.get(question.skill) ?? 0;
    if (recentSkillCount >= 2) {
      score -= (recentSkillCount - 1) * 12;
    }

    const recentDomainCount = recentDomainCounts.get(question.domain) ?? 0;
    if (recentDomainCount >= 3) {
      score -= (recentDomainCount - 2) * 8;
    } else if (recentDomainCount === 0) {
      score += 8;
    }

    // 3e. Controlled randomness for variety
    score += Math.random() * 6;

    return {
      question,
      score,
      dueForReview,
      lapseRecovery,
      weakSkill,
      masteredRefresh,
      stretchCandidate,
      confidenceRecoveryCandidate,
    };
  });

  // Step 4: Policy-based pool selection for better learning dynamics
  const dueCandidates = scoredQuestions.filter((candidate) => candidate.dueForReview);
  const lapseCandidates = scoredQuestions.filter(
    (candidate) => candidate.lapseRecovery
  );
  const weakSkillCandidates = scoredQuestions.filter(
    (candidate) => candidate.weakSkill
  );
  const masteredRefreshCandidates = scoredQuestions.filter(
    (candidate) => candidate.masteredRefresh
  );
  const stretchCandidates = scoredQuestions.filter(
    (candidate) => candidate.stretchCandidate
  );
  const frustrationRecoveryCandidates = scoredQuestions.filter(
    (candidate) =>
      candidate.confidenceRecoveryCandidate &&
      (candidate.weakSkill || candidate.dueForReview || candidate.lapseRecovery)
  );

  const frustrationRecoveryChance =
    frustrationLevel >= 0.6
      ? HIGH_FRUSTRATION_RECOVERY_CHANCE
      : frustrationLevel >= 0.3
        ? MODERATE_FRUSTRATION_RECOVERY_CHANCE
        : 0;

  let candidatePool = scoredQuestions;
  if (
    frustrationRecoveryCandidates.length > 0 &&
    Math.random() < frustrationRecoveryChance
  ) {
    candidatePool = frustrationRecoveryCandidates;
  } else if (lapseCandidates.length > 0 && Math.random() < LAPSE_RECOVERY_CHANCE) {
    candidatePool = lapseCandidates;
  } else if (
    dueCandidates.length > 0 &&
    Math.random() <
      (dueCandidates.length > 5
        ? HEAVY_BACKLOG_REVIEW_CHANCE
        : LATE_REVIEW_CHANCE)
  ) {
    candidatePool = dueCandidates;
  } else if (
    weakSkillCandidates.length > 0 &&
    Math.random() < WEAK_SKILL_CHANCE
  ) {
    candidatePool = weakSkillCandidates;
  } else if (
    masteredRefreshCandidates.length > 0 &&
    Math.random() < MASTERED_REFRESH_CHANCE
  ) {
    candidatePool = masteredRefreshCandidates;
  } else if (
    globalAccuracy >= 0.75 &&
    stretchCandidates.length > 0 &&
    Math.random() < STRETCH_CHALLENGE_CHANCE
  ) {
    candidatePool = stretchCandidates;
  }

  candidatePool.sort((a, b) => b.score - a.score);
  const selected = pickFromTopCandidates(candidatePool);

  return selected?.question._id ?? null;
}

// ─────────────────────────────────────────────────────────
// MUTATIONS
// ─────────────────────────────────────────────────────────

// Start an endless mode session
export const startEndlessSession = mutation({
  args: {
    visitorId: v.string(),
    category: v.optional(
      v.union(v.literal("reading_writing"), v.literal("math"))
    ),
    domain: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check for existing in-progress endless session
    const existingAttempt = await ctx.db
      .query("examAttempts")
      .withIndex("by_visitor_and_status", (q) =>
        q.eq("visitorId", args.visitorId).eq("status", "in_progress")
      )
      .filter((q) => q.eq(q.field("mode"), "endless"))
      .first();

    if (existingAttempt) {
      // Return existing session
      const existingSession = await ctx.db
        .query("endlessSession")
        .withIndex("by_attempt", (q) => q.eq("attemptId", existingAttempt._id))
        .first();

      if (existingSession) {
        return {
          attemptId: existingAttempt._id,
          sessionId: existingSession._id,
          currentQuestionId: existingSession.currentQuestionId,
          isResumed: true,
        };
      }
    }

    // Create new exam attempt
    const attemptId = await ctx.db.insert("examAttempts", {
      visitorId: args.visitorId,
      mode: "endless",
      section: args.category,
      currentSectionIndex: 0,
      currentQuestionIndex: 0,
      status: "in_progress",
      startedAt: now,
      lastActiveAt: now,
    });

    // Get user's best streak
    const previousSessions = await ctx.db
      .query("endlessSession")
      .withIndex("by_visitor", (q) => q.eq("visitorId", args.visitorId))
      .collect();

    const bestStreak = previousSessions.reduce(
      (max, s) => Math.max(max, s.bestStreak),
      0
    );

    // Select first question
    const firstQuestionId = await selectNextQuestion(
      ctx,
      args.visitorId,
      [],
      args.category,
      args.domain
    );

    // Create endless session
    const sessionId = await ctx.db.insert("endlessSession", {
      attemptId,
      visitorId: args.visitorId,
      category: args.category,
      domain: args.domain,
      currentStreak: 0,
      bestStreak,
      sessionStreak: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      questionIdsAnswered: [],
      currentQuestionId: firstQuestionId ?? undefined,
      startedAt: now,
      lastActiveAt: now,
    });

    return {
      attemptId,
      sessionId,
      currentQuestionId: firstQuestionId,
      isResumed: false,
    };
  },
});

// Submit answer in endless mode
export const submitEndlessAnswer = mutation({
  args: {
    attemptId: v.id("examAttempts"),
    questionId: v.id("questions"),
    selectedAnswer: v.string(),
    timeSpentMs: v.number(),
    visitorId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get the question to check answer
    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    const isCorrect = args.selectedAnswer === question.correctAnswer;

    // Get the endless session
    const session = await ctx.db
      .query("endlessSession")
      .withIndex("by_attempt", (q) => q.eq("attemptId", args.attemptId))
      .first();

    if (!session) {
      throw new Error("Endless session not found");
    }

    // 1. Save the user answer
    await ctx.db.insert("userAnswers", {
      attemptId: args.attemptId,
      questionId: args.questionId,
      visitorId: args.visitorId,
      selectedAnswer: args.selectedAnswer,
      status: "graded",
      isCorrect,
      flagged: false,
      firstViewedAt: now - args.timeSpentMs,
      lastModifiedAt: now,
      submittedAt: now,
      timeSpentMs: args.timeSpentMs,
    });

    // 1b. Record performance stats for question quality tracking
    await ctx.scheduler.runAfter(0, internal.questionPerformance.recordQuestionAttempt, {
      questionId: args.questionId,
      selectedAnswer: args.selectedAnswer,
      isCorrect,
    });

    // 2. Update streaks
    const newSessionStreak = isCorrect ? session.sessionStreak + 1 : 0;
    const newCurrentStreak = isCorrect ? session.currentStreak + 1 : 0;
    const newBestStreak = Math.max(session.bestStreak, newCurrentStreak);

    // 3. Update question review schedule (SM-2)
    const existingSchedule = await ctx.db
      .query("questionReviewSchedule")
      .withIndex("by_visitor_and_question", (q) =>
        q.eq("visitorId", args.visitorId).eq("questionId", args.questionId)
      )
      .first();

    const sm2Update = calculateSM2Update(
      isCorrect,
      existingSchedule?.easeFactor ?? 2.5,
      existingSchedule?.interval ?? 1,
      existingSchedule?.repetitions ?? 0
    );

    if (existingSchedule) {
      await ctx.db.patch(existingSchedule._id, {
        ...sm2Update,
        totalAttempts: existingSchedule.totalAttempts + 1,
        correctAttempts: existingSchedule.correctAttempts + (isCorrect ? 1 : 0),
      });
    } else {
      await ctx.db.insert("questionReviewSchedule", {
        visitorId: args.visitorId,
        questionId: args.questionId,
        ...sm2Update,
        totalAttempts: 1,
        correctAttempts: isCorrect ? 1 : 0,
      });
    }

    // 4. Update skill mastery
    const existingMastery = await ctx.db
      .query("skillMastery")
      .withIndex("by_visitor_and_skill", (q) =>
        q.eq("visitorId", args.visitorId).eq("skill", question.skill)
      )
      .first();

    const currentMasteryPoints = existingMastery?.masteryPoints ?? 0;
    const currentSkillStreak = existingMastery?.currentStreak ?? 0;

    const pointChange = calculateMasteryPointChange(
      isCorrect,
      question.difficulty,
      isCorrect ? currentSkillStreak : 0,
      currentMasteryPoints
    );

    const newMasteryPoints = currentMasteryPoints + pointChange;
    const newMasteryLevel = getMasteryLevel(newMasteryPoints);
    const newSkillStreak = isCorrect ? currentSkillStreak + 1 : 0;

    if (existingMastery) {
      await ctx.db.patch(existingMastery._id, {
        masteryPoints: newMasteryPoints,
        masteryLevel: newMasteryLevel,
        totalQuestions: existingMastery.totalQuestions + 1,
        correctAnswers: existingMastery.correctAnswers + (isCorrect ? 1 : 0),
        currentStreak: newSkillStreak,
        lastPracticedAt: now,
      });
    } else {
      await ctx.db.insert("skillMastery", {
        visitorId: args.visitorId,
        category: question.category,
        domain: question.domain,
        skill: question.skill,
        masteryLevel: newMasteryLevel,
        masteryPoints: newMasteryPoints,
        totalQuestions: 1,
        correctAnswers: isCorrect ? 1 : 0,
        currentStreak: newSkillStreak,
        lastPracticedAt: now,
      });
    }

    // 5. Update daily goals
    const today = new Date().toISOString().split("T")[0];

    const dailyGoal = await ctx.db
      .query("dailyGoals")
      .withIndex("by_visitor_and_date", (q) =>
        q.eq("visitorId", args.visitorId).eq("date", today)
      )
      .first();

    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_visitor", (q) => q.eq("visitorId", args.visitorId))
      .first();

    const dailyTarget = preferences?.dailyQuestionTarget ?? 10;

    if (dailyGoal) {
      const newQuestionsAnswered = dailyGoal.questionsAnswered + 1;
      await ctx.db.patch(dailyGoal._id, {
        questionsAnswered: newQuestionsAnswered,
        correctAnswers: dailyGoal.correctAnswers + (isCorrect ? 1 : 0),
        timeSpentMs: dailyGoal.timeSpentMs + args.timeSpentMs,
        dailyGoalMet: newQuestionsAnswered >= dailyTarget,
      });
    } else {
      await ctx.db.insert("dailyGoals", {
        visitorId: args.visitorId,
        date: today,
        targetQuestions: dailyTarget,
        questionsAnswered: 1,
        correctAnswers: isCorrect ? 1 : 0,
        timeSpentMs: args.timeSpentMs,
        dailyGoalMet: 1 >= dailyTarget,
      });
    }

    // 6. Select next question
    const recentSignals = await getRecentPerformanceSignals(ctx, args.attemptId);
    const answeredIds = [...session.questionIdsAnswered, args.questionId];
    const nextQuestionId = await selectNextQuestion(
      ctx,
      args.visitorId,
      answeredIds,
      session.category,
      session.domain,
      recentSignals
    );

    // 7. Update endless session
    await ctx.db.patch(session._id, {
      currentStreak: newCurrentStreak,
      bestStreak: newBestStreak,
      sessionStreak: newSessionStreak,
      questionsAnswered: session.questionsAnswered + 1,
      correctAnswers: session.correctAnswers + (isCorrect ? 1 : 0),
      questionIdsAnswered: answeredIds,
      currentQuestionId: nextQuestionId ?? undefined,
      lastActiveAt: now,
    });

    // Update attempt lastActiveAt
    await ctx.db.patch(args.attemptId, {
      lastActiveAt: now,
    });

    return {
      isCorrect,
      correctAnswer: question.correctAnswer,
      nextQuestionId,
      currentStreak: newCurrentStreak,
      sessionStreak: newSessionStreak,
      bestStreak: newBestStreak,
      masteryLevel: newMasteryLevel,
      masteryPoints: newMasteryPoints,
      pointChange,
      recentIncorrectStreak: recentSignals.recentIncorrectStreak,
      recentWindowAccuracy: recentSignals.recentWindowAccuracy,
    };
  },
});

// End endless session
export const endEndlessSession = mutation({
  args: {
    attemptId: v.id("examAttempts"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Mark attempt as completed
    await ctx.db.patch(args.attemptId, {
      status: "completed",
      completedAt: now,
      lastActiveAt: now,
    });

    // Get session for summary
    const session = await ctx.db
      .query("endlessSession")
      .withIndex("by_attempt", (q) => q.eq("attemptId", args.attemptId))
      .first();

    if (!session) {
      return null;
    }

    return {
      questionsAnswered: session.questionsAnswered,
      correctAnswers: session.correctAnswers,
      accuracy:
        session.questionsAnswered > 0
          ? Math.round(
              (session.correctAnswers / session.questionsAnswered) * 100
            )
          : 0,
      sessionStreak: session.sessionStreak,
      bestStreak: session.bestStreak,
    };
  },
});

// Set daily goal target
export const setDailyGoalTarget = mutation({
  args: {
    visitorId: v.string(),
    target: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_visitor", (q) => q.eq("visitorId", args.visitorId))
      .first();

    const clampedTarget = Math.max(1, Math.min(100, args.target));

    if (existing) {
      await ctx.db.patch(existing._id, {
        dailyQuestionTarget: clampedTarget,
      });
    } else {
      await ctx.db.insert("userPreferences", {
        visitorId: args.visitorId,
        dailyQuestionTarget: clampedTarget,
      });
    }
  },
});

// ─────────────────────────────────────────────────────────
// QUERIES (Real-time via WebSocket)
// ─────────────────────────────────────────────────────────

// Get current endless session state
export const getEndlessSessionState = query({
  args: { attemptId: v.id("examAttempts") },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("endlessSession")
      .withIndex("by_attempt", (q) => q.eq("attemptId", args.attemptId))
      .first();

    if (!session) return null;

    return {
      currentStreak: session.currentStreak,
      bestStreak: session.bestStreak,
      sessionStreak: session.sessionStreak,
      questionsAnswered: session.questionsAnswered,
      correctAnswers: session.correctAnswers,
      accuracy:
        session.questionsAnswered > 0
          ? Math.round(
              (session.correctAnswers / session.questionsAnswered) * 100
            )
          : 0,
      currentQuestionId: session.currentQuestionId,
    };
  },
});

// Get current question with full data
export const getCurrentEndlessQuestion = query({
  args: { attemptId: v.id("examAttempts") },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("endlessSession")
      .withIndex("by_attempt", (q) => q.eq("attemptId", args.attemptId))
      .first();

    if (!session || !session.currentQuestionId) return null;

    const question = await ctx.db.get(session.currentQuestionId);
    if (!question) return null;

    // Get answer options
    const options = await ctx.db
      .query("answerOptions")
      .withIndex("by_question", (q) => q.eq("questionId", question._id))
      .collect();

    // Get passage if applicable
    let passage = null;
    if (question.passageId) {
      passage = await ctx.db.get(question.passageId);
    }

    // Get passage2 for cross-text questions (stored in tags)
    let passage2 = null;
    if (question.skill === "cross_text_connections" && question.tags) {
      const passage2Tag = question.tags.find((tag: string) => tag.startsWith("passage2:"));
      if (passage2Tag) {
        const passage2Id = passage2Tag.replace("passage2:", "");
        passage2 = await ctx.db.get(passage2Id as Id<"passages">);
      }
    }

    // Get skill mastery for this question's skill
    const mastery = await ctx.db
      .query("skillMastery")
      .withIndex("by_visitor_and_skill", (q) =>
        q.eq("visitorId", session.visitorId).eq("skill", question.skill)
      )
      .first();

    return {
      question: {
        ...question,
        options: options.sort((a, b) => a.order - b.order),
      },
      passage,
      passage2,
      mastery: mastery
        ? {
            level: mastery.masteryLevel,
            points: mastery.masteryPoints,
            skill: mastery.skill,
            domain: mastery.domain,
          }
        : null,
    };
  },
});

// Get skill mastery overview
export const getSkillMasteryOverview = query({
  args: { visitorId: v.string() },
  handler: async (ctx, args) => {
    const masteries = await ctx.db
      .query("skillMastery")
      .withIndex("by_visitor", (q) => q.eq("visitorId", args.visitorId))
      .collect();

    // Group by category and domain
    const byCategory = {
      reading_writing: [] as typeof masteries,
      math: [] as typeof masteries,
    };

    for (const m of masteries) {
      byCategory[m.category].push(m);
    }

    return byCategory;
  },
});

// Get daily goal progress
export const getDailyGoalProgress = query({
  args: { visitorId: v.string() },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];

    const dailyGoal = await ctx.db
      .query("dailyGoals")
      .withIndex("by_visitor_and_date", (q) =>
        q.eq("visitorId", args.visitorId).eq("date", today)
      )
      .first();

    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_visitor", (q) => q.eq("visitorId", args.visitorId))
      .first();

    const target = preferences?.dailyQuestionTarget ?? 10;

    if (!dailyGoal) {
      return {
        questionsAnswered: 0,
        target,
        progress: 0,
        goalMet: false,
        correctAnswers: 0,
        accuracy: 0,
      };
    }

    return {
      questionsAnswered: dailyGoal.questionsAnswered,
      target: dailyGoal.targetQuestions,
      progress: Math.min(
        100,
        Math.round((dailyGoal.questionsAnswered / dailyGoal.targetQuestions) * 100)
      ),
      goalMet: dailyGoal.dailyGoalMet,
      correctAnswers: dailyGoal.correctAnswers,
      accuracy:
        dailyGoal.questionsAnswered > 0
          ? Math.round(
              (dailyGoal.correctAnswers / dailyGoal.questionsAnswered) * 100
            )
          : 0,
    };
  },
});

// Get streak stats for user
export const getStreakStats = query({
  args: { visitorId: v.string() },
  handler: async (ctx, args) => {
    // Get all endless sessions for this user
    const sessions = await ctx.db
      .query("endlessSession")
      .withIndex("by_visitor", (q) => q.eq("visitorId", args.visitorId))
      .collect();

    // Calculate overall best streak
    const overallBestStreak = sessions.reduce(
      (max, s) => Math.max(max, s.bestStreak),
      0
    );

    // Get current streak from active session, or 0
    let currentStreak = 0;
    for (const session of sessions) {
      const attempt = await ctx.db.get(session.attemptId);
      if (attempt?.status === "in_progress") {
        currentStreak = session.currentStreak;
        break;
      }
    }

    return {
      currentStreak,
      bestStreak: overallBestStreak,
      totalSessions: sessions.length,
    };
  },
});

// Get current endless attempt for resume
export const getCurrentEndlessAttempt = query({
  args: { visitorId: v.string() },
  handler: async (ctx, args) => {
    const attempt = await ctx.db
      .query("examAttempts")
      .withIndex("by_visitor_and_status", (q) =>
        q.eq("visitorId", args.visitorId).eq("status", "in_progress")
      )
      .filter((q) => q.eq(q.field("mode"), "endless"))
      .first();

    if (!attempt) return null;

    const session = await ctx.db
      .query("endlessSession")
      .withIndex("by_attempt", (q) => q.eq("attemptId", attempt._id))
      .first();

    return { attempt, session };
  },
});
