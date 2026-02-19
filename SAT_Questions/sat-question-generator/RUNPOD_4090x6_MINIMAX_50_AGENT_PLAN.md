# RunPod 4090x6 + MiniMax + PREAM: First-Time Operator Plan (up to 50 agents)

## 1. What you asked for
You want to run the SAT question generator + PREAM loop in the cloud on a 4090x6 RunPod setup, using **MiniMax running on-pod** (so no external API key requirement), and push concurrency from your current level (~5 agents) toward ~50 agents.

This plan is designed for first-time cloud operation and is written as an execution playbook.

## 2. Important reality check before you launch
- This repo currently has **32 SAT topics total**.
- PREAM state is stored **per topic** (`prompts/<section>/<domain>/<subtopic>/pream_state.json`).
- Safe parallelism for one shared run is therefore **max 32 active topic workers** at once.
- You can still configure `AGENT_COUNT=50`; the extra agents will be idle by design (safe behavior).

If you truly want 50 workers fully busy, you need a second layer (multi-seed/multi-run branches per topic in isolated directories). That is possible, but it is a Phase 2 optimization, not the safest first run.

## 3. What was added/updated in this repo for your MiniMax-on-pod workflow

### 3.1 Local backend support (no key required)
The code now supports an OpenAI-compatible local endpoint via env vars:
- `LLM_BASE_URL` (or `MINIMAX_BASE_URL`)
- `LLM_MODEL` / `GENERATION_MODEL` / `EVALUATION_MODEL`
- Optional `LLM_API_KEY` if your local endpoint needs auth

If no API key is present but `LLM_BASE_URL` is set, the client uses a placeholder key internally (required by SDK), so keyless local operation works.

### 3.2 New cloud orchestration scripts
- `run-pream-cloud-agent.sh`
- `run-pream-cloud-node.sh`
- `cloud/topics.txt`

These scripts provide deterministic sharding across many agents/pods without topic collisions.

### 3.3 Existing script compatibility updates
`run-autonomous.sh`, `run-pream-only.sh`, `run-pream-parallel.sh`, and `run-pream-roundrobin.sh` now accept either:
- hosted key mode (`ZHIPU_API_KEY`), or
- local endpoint mode (`LLM_BASE_URL` / `MINIMAX_BASE_URL`).

## 4. RunPod architecture for your setup

## 4.1 Recommended topology (first run)
- 6 pods (your 4090x6 target)
- 1 shared Network Volume mounted into each pod
- Same repo path on every pod
- One MiniMax inference service per pod (local to pod)
- One PREAM node launcher per pod

## 4.2 Why a shared volume matters
All pods need to read/write the same PREAM state + prompt versions consistently.

Without shared storage, each pod evolves prompts independently and your run fragments.

## 4.3 Agent distribution math
For `AGENT_COUNT=50` and `NODE_COUNT=6`, the launcher computes:
- Node 0: agents 0-8 (9)
- Node 1: agents 9-17 (9)
- Node 2: agents 18-25 (8)
- Node 3: agents 26-33 (8)
- Node 4: agents 34-41 (8)
- Node 5: agents 42-49 (8)

But only the first 32 logical agents get topic work (because there are 32 topics).

## 5. Pre-flight checklist
Before paying for full cloud runtime, verify these locally:

1. `npm run build` succeeds in `/Users/berri/Desktop/initial_claude_work/SAT_Questions/sat-question-generator`.
2. `npm run dev -- topics` prints all 32 topics.
3. You know your MiniMax server startup command and endpoint (example: `http://127.0.0.1:8000/v1`).
4. You know the model ID your MiniMax endpoint expects.

## 6. Step-by-step deployment (first-time safe path)

## 6.1 Create or choose shared storage on RunPod
Create a Network Volume and mount it to all 6 pods.

Suggested mount path on each pod: `/workspace`

Repo target path:
`/workspace/sat-question-generator`

## 6.2 Create 6 pods
You can do this from UI or `runpodctl`.

Example `runpodctl` pattern (adjust flags for your account/region/template):
```bash
runpodctl create pod \
  --name pream-node-0 \
  --gpuType "NVIDIA GeForce RTX 4090" \
  --gpuCount 1 \
  --imageName "runpod/pytorch:2.3.0-py3.10-cuda12.1.1-devel-ubuntu22.04" \
  --networkVolumeId <YOUR_NETWORK_VOLUME_ID>
```

Repeat for node 1..5 (or automate via script/API).

## 6.3 Bootstrap each pod
On each pod:
```bash
cd /workspace
if [ ! -d sat-question-generator ]; then
  git clone <your-repo-url> sat-question-generator
fi
cd sat-question-generator/SAT_Questions/sat-question-generator
npm install
```

## 6.4 Configure `.env` for local MiniMax
Create `/workspace/sat-question-generator/SAT_Questions/sat-question-generator/.env`:
```env
# Local MiniMax endpoint on this pod
MINIMAX_BASE_URL=http://127.0.0.1:8000/v1

# Use the actual model name exposed by your MiniMax server
LLM_MODEL=<your-minimax-model-id>
GENERATION_MODEL=<your-minimax-model-id>
EVALUATION_MODEL=<your-minimax-model-id>

# Optional, only if your local endpoint requires auth
# LLM_API_KEY=<token>

# Still needed only if you run image generation
GOOGLE_API_KEY=<optional-for-images>
```

No Zhipu key is needed in this local mode.

## 6.5 Start MiniMax service on each pod
Use your MiniMax serving command (must expose OpenAI-compatible `/v1` APIs). Example placeholder:
```bash
# Replace with your actual MiniMax startup command
<start_minimax_server_command>
```

Then test:
```bash
curl -s http://127.0.0.1:8000/v1/models
```
You should see model metadata JSON.

## 6.6 Start PREAM workers (one command per pod)
On each pod, from:
`/workspace/sat-question-generator/SAT_Questions/sat-question-generator`

Use your pod index:
- pod 0 -> `NODE_INDEX=0`
- pod 1 -> `NODE_INDEX=1`
- ...
- pod 5 -> `NODE_INDEX=5`

Command:
```bash
NODE_INDEX=<0-5> \
NODE_COUNT=6 \
AGENT_COUNT=50 \
MAX_ITERATIONS=5 \
PREAM_SAMPLES=25 \
./run-pream-cloud-node.sh
```

## 6.7 Recommended first launch variant (more efficient)
If you want max useful concurrency with today’s 32-topic design, run:
```bash
AGENT_COUNT=32
```
instead of 50. It avoids paying for idle workers.

## 7. Monitoring and control

## 7.1 Per-agent logs
Logs go to:
`logs/cloud_agents/agent_<id>_*.log`

Quick monitor:
```bash
ls -lt logs/cloud_agents | head
```

Tail one agent:
```bash
tail -f logs/cloud_agents/agent_0_latest.log
```

## 7.2 Check convergence quickly
```bash
find prompts -name pream_state.json -print0 | xargs -0 grep -H '"converged"'
```

## 7.3 Count converged topics
```bash
find prompts -name pream_state.json -print0 | xargs -0 grep -l '"converged": true' | wc -l
```

## 8. Throughput tuning order (do this in sequence)

1. **Stabilize endpoint first**: ensure MiniMax server can handle sustained load without OOM/timeouts.
2. **Raise agent count gradually**: 8 -> 16 -> 24 -> 32 active agents.
3. **Only then increase samples**: `PREAM_SAMPLES` from 25 to 30/35 if quality gain justifies cost.
4. **Keep iterations fixed initially**: `MAX_ITERATIONS=5` for reproducibility.

If you get timeouts:
- Reduce `AGENT_COUNT`
- Reduce MiniMax internal request concurrency
- Keep one inference server per pod (avoid noisy neighbors)

## 9. Failure/recovery plan
This setup is restart-friendly.

If a pod crashes:
1. Restart the pod.
2. Re-launch MiniMax service.
3. Re-run the same node command (`NODE_INDEX` unchanged).

Because PREAM state lives in shared storage and workers use `--single-iteration`, runs resume from saved iteration state.

## 10. Cost control guidance
- For this exact codebase, **32 active agents is the practical ceiling**.
- 50 logical agents can be used, but some will idle.
- Start with 3-4 pods for dry-run; expand to 6 only after endpoint stability is proven.

## 11. Phase 2 (optional): how to keep all 50 truly busy
If you later want all 50 workers active continuously:
- Run multiple isolated experiment roots (example: `/workspace/runs/run_A`, `/workspace/runs/run_B`) so each has its own `prompts/` state.
- Assign hard topics to multiple independent prompt trajectories.
- Compare final prompt versions by held-out evaluation, then promote winner into canonical prompt tree.

This is a bigger orchestration extension and should be done after your first stable distributed run.

## 12. Exact command cheat sheet

### On every pod (once)
```bash
cd /workspace/sat-question-generator/SAT_Questions/sat-question-generator
npm install
```

### On every pod (each run)
```bash
# 1) Start MiniMax server (your command)
<start_minimax_server_command>

# 2) Start PREAM node launcher
NODE_INDEX=<0-5> NODE_COUNT=6 AGENT_COUNT=50 MAX_ITERATIONS=5 PREAM_SAMPLES=25 ./run-pream-cloud-node.sh
```

### If you prefer max useful efficiency now
```bash
NODE_INDEX=<0-5> NODE_COUNT=6 AGENT_COUNT=32 MAX_ITERATIONS=5 PREAM_SAMPLES=25 ./run-pream-cloud-node.sh
```

## 13. Reference links used for platform assumptions
- RunPod Instant Clusters quick start: https://docs.runpod.io/instant-clusters/quick-start
- RunPod Network Volumes: https://docs.runpod.io/pods/storage/network-volumes
- RunPod Pod Networking reference: https://docs.runpod.io/pods/references/networking
- RunPod `runpodctl create pod` command reference: https://docs.runpod.io/runpodctl/commands/create/pod
