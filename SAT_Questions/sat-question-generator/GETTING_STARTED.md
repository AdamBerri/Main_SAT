# SAT Question Generator - Getting Started

## Quick Start

### 1. Install Dependencies

```bash
cd /Users/berri/Desktop/initial_claude_work/SAT_Questions/sat-question-generator
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your backend settings:

```env
# Option A: Hosted Zhipu (GLM)
ZHIPU_API_KEY=...

# Option B: Local/OpenAI-compatible backend (for RunPod or self-hosted MiniMax)
# LLM_BASE_URL=http://127.0.0.1:8000/v1
# LLM_MODEL=minimax-m1
# If your local endpoint needs auth:
# LLM_API_KEY=...

# Required for image generation (math questions with figures)
GOOGLE_API_KEY=...
```

### 3. Initialize Prompts

```bash
npm run dev -- prompts --init-all
```

This creates the initial v1.0.0 prompts for all 32 subtopics.

---

## Running with Auto-Approve

To run without confirmation prompts, use Claude Code's auto-approve mode:

```bash
# Start Claude Code with auto-approve for this project
claude --dangerously-skip-permissions
```

Or for specific tool patterns:

```bash
# Auto-approve only bash commands matching patterns
claude --allowedTools "Bash(npm:*)" "Bash(ts-node:*)"
```

---

## CLI Commands

### Generate Questions

```bash
# Single topic
npm run dev -- generate -t MATH/Algebra/linear_equations -c 10

# All math topics
npm run dev -- generate --section MATH -c 5

# All topics
npm run dev -- generate --all -c 3
```

### Evaluate Questions

```bash
npm run dev -- evaluate -t READING/Information_and_Ideas/central_ideas
```

### Run PREAM Optimization

```bash
# Optimize prompts for a topic (iterates until convergence)
npm run dev -- optimize -t MATH/Algebra/linear_equations -i 5 -s 20
```

### View Statistics

```bash
npm run dev -- stats --section READING
npm run dev -- stats -t MATH/Algebra/linear_equations
```

### Generate Images (Math)

```bash
npm run dev -- images -t MATH/Geometry_Trig/triangles
```

### List Topics

```bash
npm run dev -- topics
```

---

## File Structure

After generation, questions are saved by topic:

```
generated/
├── READING/
│   ├── Information_and_Ideas/
│   │   ├── central_ideas/
│   │   │   ├── {uuid}_pass_4.25.json
│   │   │   └── {uuid}_fail_2.50.json
│   │   └── inferences/
│   └── ...
├── MATH/
│   └── ...
├── images/
│   └── {uuid}_geometry.svg
└── batch_results/
    └── batch_all_1234567890.json
```

---

## Batch Generation Script

For running large batches unattended:

```bash
#!/bin/bash
# save as run-batch.sh

export ZHIPU_API_KEY="..."
export GOOGLE_API_KEY="..."

cd /Users/berri/Desktop/initial_claude_work/SAT_Questions/sat-question-generator

# Generate 10 questions per topic for all topics
npm run dev -- generate --all -c 10

# Run PREAM optimization on underperforming topics
npm run dev -- optimize -t READING/Information_and_Ideas/inferences -i 5

echo "Batch complete!"
```

Make executable: `chmod +x run-batch.sh`

---

## Using Programmatically

```typescript
import {
  createReadingGenerator,
  createBatchExecutor,
  createEvaluator,
  parseTopicString,
} from '@sat-prep/question-generator';

// Generate reading questions (two-stage: passage then question)
const generator = createReadingGenerator();
const topic = parseTopicString('READING/Information_and_Ideas/central_ideas');
const questions = await generator.generateBatch(topic, 10);

// Evaluate
const evaluator = createEvaluator();
const evaluations = await evaluator.evaluateBatch(questions);

// Batch with multiple API keys
const executor = createBatchExecutor(5); // concurrency = 5
const results = await executor.executeAllTopics(10);
```

---

## Tips

1. **Start small**: Generate 2-3 questions first to verify everything works
2. **Check logs**: Generation logs show passage type, length, and question type
3. **Review failures**: Questions saved with `_fail_` in filename need prompt improvement
4. **Run PREAM**: After initial generation, run optimization on topics with low pass rates
