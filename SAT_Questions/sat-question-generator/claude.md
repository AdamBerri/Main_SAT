# SAT Question Generator - Project Context

## Overview

This project generates high-quality SAT practice questions using Claude AI with PREAM (Prompt Refinement through Error Analysis and Modification) optimization. It covers 32 topics across Reading and Math sections.

## Key Commands

```bash
# Generate questions for a topic
npm run dev -- generate -t "READING/Information_and_Ideas/central_ideas" -n 10

# Evaluate generated questions
npm run dev -- evaluate -t "READING/Information_and_Ideas/central_ideas"

# Run PREAM optimization (generates, evaluates, improves prompts iteratively)
npm run dev -- optimize -t "TOPIC_PATH" -i 5 -s 10
# -i = iterations (default 5), -s = samples per iteration (default 10)

# Generate images for questions that need them
npm run dev -- images -t "MATH/Geometry_Trig/circles"
npm run dev -- images --all  # All topics

# View statistics
npm run dev -- stats
```

## Running Full Optimization

### Parallel PREAM (Recommended)
```bash
# Runs 4 topics simultaneously, much faster with raised rate limits
./run-pream-parallel.sh

# Monitor progress
open http://localhost:3456  # Start status-server.js first
node status-server.js &
```

### Sequential PREAM
```bash
./run-pream-only.sh  # One topic at a time
```

### Full Pipeline (Generate + Optimize + Images)
```bash
./run-autonomous.sh
```

## Topic Hierarchy (32 Total)

### Reading (12 topics)
- **Information_and_Ideas**: central_ideas, inferences, command_of_evidence, textual_evidence
- **Craft_and_Structure**: words_in_context, text_structure, cross_text_connections, overall_purpose
- **Expression_of_Ideas**: rhetorical_synthesis, transitions
- **Standard_English_Conventions**: boundaries, form_structure_sense

### Math (20 topics)
- **Algebra**: linear_equations, linear_functions, systems_of_equations, linear_inequalities
- **Advanced_Math**: equivalent_expressions, nonlinear_equations, nonlinear_functions
- **Problem_Solving**: ratios_rates, percentages, units, data_distributions, probability, inference, evaluating_claims, two_variable_data
- **Geometry_Trig**: area_volume, lines_angles, triangles, circles, right_triangles

## Model Configuration

Located in `src/core/config.ts`:

```typescript
export const MODEL_CONFIG = {
  generation: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-5-20250929',  // Sonnet 4.5
    maxTokens: 4096,
  },
  evaluation: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-5-20250929',
    maxTokens: 2048,
  },
  imageGeneration: {
    provider: 'google',
    model: 'gemini-2.0-flash-exp',
  },
};
```

**Important**: The correct Sonnet 4.5 model ID is `claude-sonnet-4-5-20250929` (NOT `claude-sonnet-4-5-20250514`).

## PREAM Optimization Process

Each topic goes through iterative optimization:

1. **Generate samples** (default 10: 8 train, 2 test)
2. **Evaluate** training and test sets using SSR (Structured Semantic Rating)
3. **Categorize errors** found in low-scoring questions
4. **Generate improved prompt** based on error patterns
5. **Repeat** until convergence (< 2% improvement) or max iterations

Convergence threshold: 0.02 (2%) - set in `DEFAULT_PREAM_CONFIG`.

## Directory Structure

```
prompts/
  READING|MATH/
    Domain/
      subtopic/
        prompt_v1.0.0.md    # Base prompt
        prompt_v1.1.0.md    # PREAM-improved versions
        schema.json         # Output schema for topic

generated/
  READING|MATH/
    Domain/
      subtopic/
        question_*.json     # Generated questions

evaluation/
  READING|MATH/
    Domain/
      subtopic/
        evaluation_*.json   # Evaluation results

schemas/
  math-schema.json          # Master schema for math questions
  reading-schema.json       # Master schema for reading questions
```

## Known Issues & Fixes

### JSON Parsing Errors
The generator includes `sanitizeJSONString()` in `src/generation/generator.ts` and `reading-generator.ts` to handle control characters in model output. If you see "Bad control character" errors, the sanitizer should catch them.

### Schema Validation
Both Reading and Math questions support images:
- `hasImage: boolean`
- `imageDescription: string`
- `imagePath: string` (populated after image generation)

### Rate Limits
With default Anthropic rate limits, parallel PREAM with 4 workers is optimal. If you have higher limits, increase `PARALLEL` in `run-pream-parallel.sh`.

## Status Dashboard

`status-server.js` provides a live web dashboard at http://localhost:3456 showing:
- Topics completed / total
- Active agents with iteration progress
- Current phase (generating, evaluating, categorizing, improving)
- Test scores and improvements per iteration
- Auto-refreshes every 3 seconds

## Environment Setup

Requires `.env` file with:
```
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...  # For image generation
```

## Evaluation Scoring

Questions are scored 1-6 using SSR (Structured Semantic Rating):
- **6**: Perfect, publication-ready
- **5**: High quality, minor issues
- **4**: Acceptable with some improvements needed
- **3.5+**: Passing threshold
- **< 3.5**: Needs significant revision

Pass rate = percentage of questions scoring >= 3.5

## Importing Questions to SAT Big App

Generated questions can be imported into the SAT Big App (`/sat-prep-app/`) Convex database.

### Prerequisites

1. Ensure config.json files point to the highest prompt versions:
   ```bash
   node update-config-versions.mjs
   ```

2. Ensure Convex dev server is running in sat-prep-app:
   ```bash
   cd /Users/berri/Desktop/initial_claude_work/sat-prep-app
   npx convex dev
   ```

### Full Workflow

```bash
# 1. Generate questions (5 per topic for testing, 25 for production)
cd /Users/berri/Desktop/initial_claude_work/SAT_Questions/sat-question-generator
./run-batch-5-parallel.sh  # Runs all 32 topics concurrently

# 2. Backup existing questions (optional but recommended)
cd /Users/berri/Desktop/initial_claude_work/sat-prep-app
CONVEX_URL=http://127.0.0.1:3210 npm run export:questions -- --output backup-$(date +%Y%m%d).json

# 3. Clear existing questions (dry-run first!)
npx convex run seed:clearAllQuestions '{"dryRun": true}'
npx convex run seed:clearAllQuestions '{}'

# 4. Transform generator output to Big App format (shuffles answers)
node scripts/transform-generator-questions.mjs --passing-only

# 5. Import transformed questions
CONVEX_URL=http://127.0.0.1:3210 npm run import:questions generator-import.json

# 6. Generate images for questions that need them
npx convex run graphImagePipeline:generateGraphImages
```

### Key Scripts

| Script | Location | Purpose |
|--------|----------|---------|
| `update-config-versions.mjs` | sat-question-generator/ | Updates all config.json to highest prompt version |
| `run-batch-5-parallel.sh` | sat-question-generator/ | Generates 5 questions per topic (32 topics in parallel) |
| `transform-generator-questions.mjs` | sat-prep-app/scripts/ | Transforms JSON format + shuffles answers |
| `import-questions.mjs` | sat-prep-app/scripts/ | Imports to Convex database |

### Answer Shuffling

The transformer script uses Fisher-Yates shuffle to distribute correct answers evenly:
- **Before shuffle**: ~49% B, ~39% A, ~11% C, ~1% D (generator bias)
- **After shuffle**: ~25% each A/B/C/D

### What Gets Imported

- Only **passing questions** (score >= 3.5) with `--passing-only` flag
- Questions imported with `reviewStatus: "pending"`
- Passages extracted and deduplicated
- Images marked for generation (Big App's pipeline generates them)

### Troubleshooting

**"Cannot find module api.mjs"**: Run `npx convex codegen` first

**Schema validation errors**: The transformer maps fields to Big App's schema:
- `source.type` → "agent_generated"
- `generationMetadata` → includes agentVersion, promptTemplate, generatedAt
- `generationType` (passages) → "agent_generated"
