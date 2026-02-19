#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const opts = {
    name: 'minimax_pream_lab',
    sourceVersion: null,
    maxIterations: 12,
    samples: 25,
    convergence: 0.005,
    subagents: 5,
    seedAllFromLinear: false,
    force: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--name') opts.name = argv[++i];
    else if (arg === '--source-version') opts.sourceVersion = argv[++i];
    else if (arg === '--max-iterations') opts.maxIterations = parseInt(argv[++i], 10);
    else if (arg === '--samples') opts.samples = parseInt(argv[++i], 10);
    else if (arg === '--convergence') opts.convergence = parseFloat(argv[++i]);
    else if (arg === '--subagents') opts.subagents = parseInt(argv[++i], 10);
    else if (arg === '--seed-all-from-linear') opts.seedAllFromLinear = true;
    else if (arg === '--force') opts.force = true;
    else if (arg === '--help' || arg === '-h') {
      console.log(`Usage:
  node scripts/setup-minimax-experiment.mjs [options]

Options:
  --name <name>             Experiment directory under experiments/ (default: minimax_pream_lab)
  --source-version <x.y.z>  Linear-equations prompt version to seed from
  --max-iterations <n>      Default PREAM iterations for experiment env (default: 12)
  --samples <n>             Default PREAM samples for experiment env (default: 25)
  --convergence <n>         Default PREAM convergence threshold (default: 0.005)
  --subagents <n>           Default subagents per loop (default: 5)
  --seed-all-from-linear    Seed all 32 topics from linear-equations prompt (default: math-only)
  --force                   Overwrite existing experiment directory
`);
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return opts;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readTopics(topicsFile) {
  return fs
    .readFileSync(topicsFile, 'utf-8')
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith('#'));
}

function semverCompare(a, b) {
  const ap = a.split('.').map(Number);
  const bp = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (ap[i] !== bp[i]) return ap[i] - bp[i];
  }
  return 0;
}

function getAvailablePromptVersions(topicDir) {
  if (!fs.existsSync(topicDir)) return [];
  return fs
    .readdirSync(topicDir)
    .map((name) => {
      const m = name.match(/^prompt_v(\d+\.\d+\.\d+)\.md$/);
      return m ? m[1] : null;
    })
    .filter(Boolean)
    .sort(semverCompare);
}

function getReadingSeedPrompt(section, domain, subtopic) {
  const promptPath = path.join(projectRoot, 'prompts', section, domain, subtopic, 'prompt_v1.0.0.md');
  if (fs.existsSync(promptPath)) {
    return fs.readFileSync(promptPath, 'utf-8');
  }

  return `Generate an SAT ${section} question for the topic: ${subtopic}.

{DIFFICULTY_DESCRIPTION}

Create one high-quality multiple-choice question with four answer choices (A-D), one unambiguously correct answer, and clear rationales.`;
}

function writeTopicSeed(rootDir, topic, mathSeedPrompt, seedAllFromLinear) {
  const [section, domain, subtopic] = topic.split('/');
  const topicDir = path.join(rootDir, 'prompts', section, domain, subtopic);
  ensureDir(topicDir);

  const prompt = (seedAllFromLinear || section === 'MATH')
    ? mathSeedPrompt
    : getReadingSeedPrompt(section, domain, subtopic);

  const promptFile = path.join(topicDir, 'prompt_v1.0.0.md');
  fs.writeFileSync(promptFile, prompt);

  const config = {
    topic: { section, domain, subtopic },
    currentVersion: '1.0.0',
    versions: [
      {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        parentVersion: null,
        preamIteration: 0,
        performanceMetrics: null,
      },
    ],
    temperatureConfig: {
      generation: 0.7,
      variation: 0.3,
    },
    schemaPath: path.join(topicDir, 'schema.json'),
  };
  fs.writeFileSync(path.join(topicDir, 'config.json'), JSON.stringify(config, null, 2));
}

function writeEnvAndRunner(rootDir, opts) {
  const envFile = path.join(rootDir, '.env.minimax');
  const envContent = `# Isolated experiment data root
PREAM_DATA_ROOT=${rootDir}

# Local MiniMax OpenAI-compatible endpoint
MINIMAX_BASE_URL=http://127.0.0.1:8000/v1

# Model names exposed by your MiniMax server
LLM_MODEL=minimax-m1
GENERATION_MODEL=minimax-m1
EVALUATION_MODEL=minimax-m1

# Optional if your local endpoint requires auth
# LLM_API_KEY=...

# Experiment defaults
PREAM_SUBAGENTS=${opts.subagents}
PREAM_CONVERGENCE=${opts.convergence}
MAX_ITERATIONS=${opts.maxIterations}
PREAM_SAMPLES=${opts.samples}
`;
  fs.writeFileSync(envFile, envContent);

  const runnerFile = path.join(rootDir, 'run-roundrobin.sh');
  const runner = `#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]:-$0}")" && pwd)"
PROJECT_DIR="${projectRoot}"

if [ -f "$SCRIPT_DIR/.env.minimax" ]; then
  set -a
  source "$SCRIPT_DIR/.env.minimax"
  set +a
fi

PREAM_DATA_ROOT="$SCRIPT_DIR" \\
PREAM_SUBAGENTS="\${PREAM_SUBAGENTS:-${opts.subagents}}" \\
PREAM_CONVERGENCE="\${PREAM_CONVERGENCE:-${opts.convergence}}" \\
MAX_ITERATIONS="\${MAX_ITERATIONS:-${opts.maxIterations}}" \\
PREAM_SAMPLES="\${PREAM_SAMPLES:-${opts.samples}}" \\
PARALLEL="\${PARALLEL:-32}" \\
"$PROJECT_DIR/run-pream-roundrobin.sh"
`;
  fs.writeFileSync(runnerFile, runner);
  fs.chmodSync(runnerFile, 0o755);
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const experimentRoot = path.join(projectRoot, 'experiments', opts.name);

  if (fs.existsSync(experimentRoot)) {
    if (!opts.force) {
      throw new Error(`Experiment directory already exists: ${experimentRoot} (use --force to overwrite)`);
    }
    fs.rmSync(experimentRoot, { recursive: true, force: true });
  }

  ensureDir(experimentRoot);
  ensureDir(path.join(experimentRoot, 'generated'));
  ensureDir(path.join(experimentRoot, 'evaluation'));
  ensureDir(path.join(experimentRoot, 'logs'));

  const topicsFile = path.join(projectRoot, 'cloud', 'topics.txt');
  const topics = readTopics(topicsFile);
  if (topics.length === 0) {
    throw new Error(`No topics found in ${topicsFile}`);
  }

  const linearTopicDir = path.join(projectRoot, 'prompts', 'MATH', 'Algebra', 'linear_equations');
  const availableVersions = getAvailablePromptVersions(linearTopicDir);
  if (availableVersions.length === 0) {
    throw new Error(`No linear-equations prompt versions found in ${linearTopicDir}`);
  }

  const sourceVersion = opts.sourceVersion || availableVersions[availableVersions.length - 1];
  if (!availableVersions.includes(sourceVersion)) {
    throw new Error(
      `Requested source version ${sourceVersion} not found. Available: ${availableVersions.join(', ')}`
    );
  }

  const sourcePromptPath = path.join(linearTopicDir, `prompt_v${sourceVersion}.md`);
  const mathSeedPrompt = fs.readFileSync(sourcePromptPath, 'utf-8');

  for (const topic of topics) {
    writeTopicSeed(experimentRoot, topic, mathSeedPrompt, opts.seedAllFromLinear);
  }

  writeEnvAndRunner(experimentRoot, opts);

  console.log('Created isolated MiniMax PREAM experiment workspace:');
  console.log(`  ${experimentRoot}`);
  console.log('');
  if (opts.seedAllFromLinear) {
    console.log(`Seeded ALL topics from linear_equations prompt_v${sourceVersion}.md`);
  } else {
    console.log(`Seeded MATH prompts from linear_equations prompt_v${sourceVersion}.md`);
    console.log('Seeded READING prompts from existing reading v1.0.0 prompts.');
  }
  console.log('');
  console.log('Next steps:');
  console.log(`  1) Edit ${path.join(experimentRoot, '.env.minimax')} with your MiniMax endpoint/model`);
  console.log(`  2) Start run: ${path.join(experimentRoot, 'run-roundrobin.sh')}`);
  console.log('  3) For cloud node launchers, pass PREAM_DATA_ROOT to run-pream-cloud-node.sh');
}

main();
