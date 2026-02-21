```
Generate an SAT Writing question testing sentence structure and punctuation.

The passage should:
- Present a complete paragraph of 40-60 words with proper context (academic topic: science, history, social studies, or humanities)
- Show the FULL original sentence(s) with one portion marked as underlined [number]
- The underlined portion must contain the exact punctuation/words that need evaluation
- Include at least one sentence before and after the underlined portion to establish clear context
- Use NATURAL, CLEAR PROSE — no awkward constructions, no artificially forced clause structures, no convoluted phrasing that creates unintended ambiguity
- Both sides of the boundary under test must be CLEARLY independent or CLEARLY dependent — never on the border

PASSAGE QUALITY STANDARD (addresses inconsistent_passage_quality failures):
- Write the passage as a competent academic author would — smooth, purposeful prose
- Avoid stacking multiple modifying phrases that make clause boundaries hard to parse
- Avoid sentences where a participial phrase or appositive could be misread as an independent clause
- If you find yourself unsure whether a clause is independent, rewrite the passage — do not use it
- Each sentence in the passage (not just the tested portion) must be grammatically correct and natural-sounding
- After drafting the passage, read it aloud: if anything sounds stilted or forced, revise before proceeding

The question format must be:
- Question stem: "Which choice best maintains sentence boundaries?" or equivalent SAT phrasing
- Choice A: Always "NO CHANGE" - represents keeping the underlined portion exactly as written
- Choices B, C, D: Show the exact replacement text for the underlined portion
- Test ONE primary concept: run-on sentences, comma splices, fragments, semicolon vs. colon usage, or correct joining of independent clauses

ANSWER VALIDITY — MANDATORY WRITTEN VERIFICATION (primary failure source):
Before finalizing, you MUST write out the following explicitly in your reasoning (do not shortcut this):

Step 1 — Write out the LEFT side of the underlined boundary: Copy the text before the underlined portion up to and including any sentence break point. Label it: "LEFT: [text]". Then state: "Is this an independent clause? YES / NO — because [reason]."

Step 2 — Write out the RIGHT side of the underlined boundary: Copy the text after the underlined portion to the end of the sentence. Label it: "RIGHT: [text]". Then state: "Is this an independent clause? YES / NO — because [reason]."

Step 3 — For EACH of the four choices (A, B, C, D), write:
  "Choice [X]: [full reconstructed sentence with this choice substituted in]"
  "Verdict: CORRECT / INCORRECT — because [specific grammar rule]"

Step 4 — Count how many choices received "CORRECT" verdict. If the count is not exactly 1, you MUST redesign the question entirely before proceeding. Do not attempt to patch it.

Step 5 — Confirm: "Exactly one choice is correct. It is Choice [X]."

COMMON ANSWER_VALIDITY TRAPS TO AVOID:
- Do not create a scenario where both a period AND a semicolon produce two valid independent clauses — they are both correct in that case. Use a scenario where only one is valid (e.g., one side is actually dependent, making only a comma or conjunction work).
- Do not use a coordinating conjunction (for, and, nor, but, or, yet, so) in a distractor if that distractor would actually produce a grammatically correct compound sentence.
- Do not mark "NO CHANGE" as incorrect if the original text is actually grammatically valid — verify the original first.
- If the right side begins with a word that could be either a subordinating conjunction OR a regular word (e.g., "since," "while," "as"), explicitly determine which reading applies in this passage before writing choices.
- Do not write a distractor that is a correct alternative to the intended answer. Every distractor must produce a sentence that is unambiguously wrong by a named rule.

BOUNDARY RULE VERIFICATION (addresses ambiguous_boundary_rules failures):
Choose question scenarios only from this list of CLEAR, unambiguous cases:
- COMMA SPLICE: Two fully independent clauses (each with its own subject and verb, no subordinator) joined only by a comma. Fix = period, semicolon, or comma + coordinating conjunction.
- RUN-ON (fused sentence): Two fully independent clauses with no punctuation between them. Fix = period or semicolon.
- FRAGMENT after period: A sentence beginning with a subordinating conjunction (e.g., "Because," "Although,") or lacking a main verb, where the preceding sentence is complete. Fix = attach to the adjacent sentence.
- SEMICOLON misuse: A semicolon placed between a clause and a phrase (not a full independent clause). Fix = comma or rewrite.
- COLON misuse: A colon placed after an incomplete clause (e.g., after a verb or preposition without a subject completing the first clause). Fix = semicolon or rewrite.

DO NOT write questions based on:
- Sentences where adding or removing a comma between adjectives is debatable (serial comma, coordinate vs. cumulative adjective edge cases)
- Participial or absolute phrase placement where attachment is genuinely ambiguous
- Transitional adverb placement (e.g., "however" at sentence start vs. mid-sentence) if multiple positions are grammatically defensible
- Any scenario where Standard English style guides disagree
- Cases where both a period and a semicolon are equally valid fixes (pick one as the error and engineer the passage so the other is NOT in the distractor set, or use a scenario where only one option applies)

DISTRACTOR QUALITY (addresses implausible_distractors failures):
Each wrong answer choice MUST represent a specific, named student error that is genuinely tempting:
- COMMA SPLICE distractor: Two independent clauses joined with only a comma (students confuse this for a compound sentence)
- SEMICOLON + CONJUNCTION distractor: "independent clause; and independent clause" — students think semicolons and conjunctions can be paired
- COLON WHERE SEMICOLON NEEDED distractor: Students confuse colon (introduces) with semicolon (connects equals)
- PERIOD CREATING FRAGMENT distractor: Students place a period before a dependent clause, creating an illegal fragment
- FUSED/RUN-ON distractor: Two independent clauses with no punctuation, which students miss when reading quickly

Rules for distractors:
- Every distractor must be grammatically WRONG in Standard English — no distractor may be defensibly correct
- Every distractor must look plausible on a quick first read — it must represent a real mistake a grammar-aware student could make
- No distractor should be obviously absurd (e.g., random punctuation in the middle of a noun phrase, missing required words)
- At least TWO distractors must seem tempting to a student who understands basic grammar but makes common errors
- Distractors should differ from each other meaningfully — do not create two distractors that are essentially the same error

Answer choices must:
- Include exactly ONE grammatically correct option according to Standard English conventions
- Show the complete underlined portion replacement in each choice (not just punctuation marks)
- Create distractors reflecting authentic student misconceptions (see DISTRACTOR QUALITY above)
- Avoid obviously wrong compound errors (e.g., semicolon + wrong capitalization + missing word)
- Ensure at least TWO choices appear defensible on first read to students who understand basic grammar

For the correct answer:
- Verify the logical relationship between clauses (cause-effect = colon; parallel ideas = semicolon; full separation = period)
- Confirm conjunctions and transitional phrases are used appropriately
- Double-check that semicolons only join two complete independent clauses

Difficulty calibration:
- Easy (2/5): Clear run-on vs. correct period/semicolon; obvious fragment; 65-75% correct rate
- Medium (3/5): Comma splice vs. multiple valid-seeming punctuation options; requires careful clause analysis; 50-60% correct
- Hard (4-5/5): Semicolon vs. colon distinction based on logical relationship; subtle dependent clause identification; three choices appear initially correct; 35-50% correct

DIFFICULTY ACCURACY: After writing the question, re-read it and estimate what percentage of students familiar with grammar rules would get it correct. If that estimate does not match the target range for the assigned difficulty, revise the passage or choices to close the gap before finalizing.

{DIFFICULTY_DESCRIPTION}

Required verification checklist (complete ALL steps — do not skip):
1. Is the complete original sentence with underlined portion shown?
2. Does Choice A say "NO CHANGE"?
3. CRITICAL: Have you written out Steps 1–5 of the ANSWER VALIDITY verification above, explicitly, in your reasoning? Do not proceed without doing so.
4. Did Step 4 confirm exactly one "CORRECT" verdict? If not, redesign the question.
5. Are at least 40 words of surrounding context provided?
6. Do at least TWO distractors seem plausible without careful analysis?
7. Does the stated difficulty match the actual cognitive demand? (Check against target % correct range.)
8. For easy questions: Is the correct answer obvious to a student who knows basic punctuation rules?
9. For all questions: Are the clause boundaries (independent vs. dependent) COMPLETELY unambiguous?
10. PASSAGE QUALITY CHECK: Does the passage read as natural, smooth academic prose? Are there any awkward or strained constructions? If yes, rewrite before finalizing.
11. DISTRACTOR CHECK: Does each wrong choice represent a specific, named, common student error? Is any distractor obviously absurd or clearly the same error as another distractor? Fix if so.
```
