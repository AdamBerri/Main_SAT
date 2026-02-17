const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 3456;
const LOGS_DIR = path.join(__dirname, 'logs');

function getLatestMainLog() {
  try {
    const files = fs.readdirSync(LOGS_DIR)
      .filter(f => (f.startsWith('pream_parallel_') || f.startsWith('pream_roundrobin_')) && f.endsWith('.log'))
      .sort()
      .reverse();
    return files[0] ? path.join(LOGS_DIR, files[0]) : null;
  } catch { return null; }
}

function getTopicLogs() {
  try {
    // Get today's date in YYYYMMDD format for filtering recent logs
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const files = fs.readdirSync(LOGS_DIR)
      .filter(f => (f.startsWith('pream_READING') || f.startsWith('pream_MATH')) && f.includes(today))
      .sort((a, b) => {
        // Sort by modification time (most recent first for active ones)
        const statA = fs.statSync(path.join(LOGS_DIR, a));
        const statB = fs.statSync(path.join(LOGS_DIR, b));
        return statB.mtimeMs - statA.mtimeMs;
      });
    return files.map(f => ({
      name: f,
      path: path.join(LOGS_DIR, f),
      size: fs.statSync(path.join(LOGS_DIR, f)).size,
      mtime: fs.statSync(path.join(LOGS_DIR, f)).mtimeMs
    }));
  } catch { return []; }
}

function getRunningProcesses() {
  try {
    const output = execSync('ps aux | grep -E "ts-node.*optimize" | grep -v grep', { encoding: 'utf8' });
    const lines = output.trim().split('\n').filter(Boolean);
    return lines.map(line => {
      const match = line.match(/-t\s+([^\s]+)/);
      return match ? match[1] : 'unknown';
    });
  } catch { return []; }
}

function getRunningProcessesWithPids() {
  try {
    const output = execSync('ps aux | grep -E "ts-node.*optimize" | grep -v grep', { encoding: 'utf8' });
    const lines = output.trim().split('\n').filter(Boolean);
    return lines.map(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[1];
      const topicMatch = line.match(/-t\s+([^\s]+)/);
      const topic = topicMatch ? topicMatch[1] : 'unknown';
      return { pid: parseInt(pid), topic };
    });
  } catch { return []; }
}

function killProcessByTopic(topic) {
  const processes = getRunningProcessesWithPids();
  const matching = processes.filter(p => p.topic.includes(topic));
  let killed = 0;
  for (const proc of matching) {
    try {
      process.kill(proc.pid, 'SIGTERM');
      killed++;
    } catch (e) {
      console.error(`Failed to kill PID ${proc.pid}:`, e.message);
    }
  }
  return killed;
}

function killAllProcesses() {
  const processes = getRunningProcessesWithPids();
  let killed = 0;
  for (const proc of processes) {
    try {
      process.kill(proc.pid, 'SIGTERM');
      killed++;
    } catch (e) {
      console.error(`Failed to kill PID ${proc.pid}:`, e.message);
    }
  }
  return killed;
}

function tailFile(filepath, lines = 50) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    const allLines = content.split('\n');
    return allLines.slice(-lines).join('\n');
  } catch { return ''; }
}

function parseTopicLog(logPath) {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');

  let currentIteration = 0;
  let maxIterations = 5;
  let questionsGenerated = 0;
  let totalQuestions = 20;
  let phase = 'starting';
  let testScore = null;
  let improvement = null;
  let isComplete = false;
  let converged = false;
  let finalScore = null;
  let passRate = null;

  for (const line of lines) {
    // Track iteration
    const iterMatch = line.match(/PREAM Iteration (\d+)/);
    if (iterMatch) {
      currentIteration = parseInt(iterMatch[1]);
      phase = 'generating';
      questionsGenerated = 0;
    }

    // Track question generation
    const genMatch = line.match(/Generated question (\d+)\/(\d+)/);
    if (genMatch) {
      questionsGenerated = parseInt(genMatch[1]);
      totalQuestions = parseInt(genMatch[2]);
      phase = 'generating';
    }

    // Track evaluation phases
    if (line.includes('Evaluating training set')) phase = 'eval_train';
    if (line.includes('Evaluating test set')) phase = 'eval_test';
    if (line.includes('Categorizing errors')) phase = 'categorizing';
    if (line.includes('Generating improved prompt')) phase = 'improving';

    // Track scores
    const scoreMatch = line.match(/Test score: ([\d.]+), Improvement: ([-\d.]+)/);
    if (scoreMatch) {
      testScore = parseFloat(scoreMatch[1]);
      improvement = parseFloat(scoreMatch[2]);
    }

    // Check completion
    if (line.includes('Optimization Complete')) isComplete = true;
    if (line.includes('Convergence threshold reached')) converged = true;

    // Final stats
    const finalMatch = line.match(/Final test score: ([\d.]+)/);
    if (finalMatch) finalScore = parseFloat(finalMatch[1]);
    const passMatch = line.match(/Final pass rate: ([\d.]+)%/);
    if (passMatch) passRate = parseFloat(passMatch[1]);
  }

  return {
    currentIteration,
    maxIterations,
    questionsGenerated,
    totalQuestions,
    phase,
    testScore,
    improvement,
    isComplete,
    converged,
    finalScore,
    passRate
  };
}

function getDetailedStatus() {
  const mainLog = getLatestMainLog();
  const mainLogContent = mainLog ? tailFile(mainLog, 20) : 'No main log';
  const running = getRunningProcesses();
  const topicLogs = getTopicLogs();

  // Parse completed count from main log
  const completedMatches = mainLogContent.match(/Batch complete\. Progress: (\d+)\/(\d+)/g) || [];
  let completedTopics = 0;
  if (completedMatches.length > 0) {
    const lastMatch = completedMatches[completedMatches.length - 1].match(/(\d+)\/(\d+)/);
    if (lastMatch) completedTopics = parseInt(lastMatch[1]);
  }

  // Get detailed status for each active/recent topic
  const agents = [];
  const runningSet = new Set(running);

  for (const log of topicLogs.slice(0, 12)) {
    const topicMatch = log.name.match(/pream_(READING|MATH)_(.+)_\d{8}/);
    if (!topicMatch) continue;

    const section = topicMatch[1];
    const rest = topicMatch[2]; // e.g., "Geometry_Trig_area_volume" or "Information_and_Ideas_central_ideas"

    // Find matching running process to get correct path
    const matchingProcess = running.find(r => {
      const subtopic = r.split('/').pop();
      return rest.endsWith(subtopic);
    });

    const topicPath = matchingProcess || `${section}/${rest}`;
    const topicName = topicPath.split('/').pop();
    const isRunning = !!matchingProcess;

    const details = parseTopicLog(log.path);

    agents.push({
      topic: topicName,
      fullPath: topicPath,
      isRunning,
      ...details,
      lastUpdate: log.mtime
    });
  }

  // Sort: running first, then by last update
  agents.sort((a, b) => {
    if (a.isRunning && !b.isRunning) return -1;
    if (!a.isRunning && b.isRunning) return 1;
    return b.lastUpdate - a.lastUpdate;
  });

  return {
    completedTopics,
    totalTopics: 32,
    runningCount: running.length,
    agents,
    mainLogContent
  };
}

const HTML = `<!DOCTYPE html>
<html>
<head>
  <title>PREAM Status</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
      background: #0d1117; color: #c9d1d9; padding: 20px;
    }
    h1 { color: #58a6ff; margin-bottom: 8px; }
    .subtitle { color: #8b949e; margin-bottom: 20px; font-size: 14px; }

    .stats {
      display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap;
    }
    .stat {
      background: #161b22; border: 1px solid #30363d; border-radius: 8px;
      padding: 16px 24px; text-align: center;
    }
    .stat-value { font-size: 36px; font-weight: bold; color: #3fb950; }
    .stat-label { font-size: 12px; color: #8b949e; margin-top: 4px; }

    .agents-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px; margin-bottom: 20px;
    }

    .agent {
      background: #161b22; border: 1px solid #30363d; border-radius: 8px;
      padding: 16px; position: relative; overflow: hidden;
    }
    .agent.running { border-color: #238636; }
    .agent.complete { border-color: #a371f7; opacity: 0.7; }

    .agent-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 12px;
    }
    .agent-name { font-weight: bold; color: #58a6ff; }
    .agent-badge {
      font-size: 10px; padding: 2px 8px; border-radius: 12px;
      text-transform: uppercase; font-weight: bold;
    }
    .agent-badge.running { background: #238636; color: white; animation: pulse 1.5s infinite; }
    .agent-badge.complete { background: #a371f7; color: white; }
    .agent-badge.waiting { background: #6e7681; color: white; }

    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

    .agent-progress { margin-bottom: 8px; }
    .progress-bar {
      height: 8px; background: #21262d; border-radius: 4px; overflow: hidden;
    }
    .progress-fill {
      height: 100%; background: #238636; transition: width 0.3s;
    }
    .progress-fill.eval { background: #f0883e; }
    .progress-fill.complete { background: #a371f7; }

    .agent-details {
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
      font-size: 12px;
    }
    .detail { display: flex; justify-content: space-between; }
    .detail-label { color: #8b949e; }
    .detail-value { color: #c9d1d9; font-weight: 500; }
    .detail-value.good { color: #3fb950; }
    .detail-value.warning { color: #f0883e; }

    .phase-indicator {
      font-size: 11px; color: #8b949e; margin-top: 8px;
      padding-top: 8px; border-top: 1px solid #21262d;
    }
    .phase-indicator strong { color: #f0883e; }

    .card {
      background: #161b22; border: 1px solid #30363d; border-radius: 8px;
      padding: 16px; margin-top: 20px;
    }
    .card h2 { color: #8b949e; font-size: 14px; margin-bottom: 12px; }
    .log {
      background: #0d1117; padding: 12px; border-radius: 4px;
      font-size: 11px; line-height: 1.5; white-space: pre-wrap;
      max-height: 200px; overflow-y: auto; font-family: monospace;
    }

    .refresh { color: #8b949e; font-size: 12px; margin-top: 16px; text-align: center; }

    .btn {
      border: none; border-radius: 6px; padding: 8px 16px;
      font-size: 12px; font-weight: 600; cursor: pointer;
      transition: all 0.2s;
    }
    .btn-danger {
      background: #da3633; color: white;
    }
    .btn-danger:hover { background: #f85149; }
    .btn-danger:disabled { background: #6e7681; cursor: not-allowed; }

    .btn-cancel {
      position: absolute; top: 8px; right: 8px;
      width: 24px; height: 24px; padding: 0;
      background: transparent; border: 1px solid #da3633;
      color: #da3633; border-radius: 4px; font-size: 14px;
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.2s;
    }
    .agent.running:hover .btn-cancel { opacity: 1; }
    .btn-cancel:hover { background: #da3633; color: white; }

    .controls {
      display: flex; gap: 12px; margin-bottom: 20px; align-items: center;
    }
  </style>
</head>
<body>
  <h1>PREAM Optimization Dashboard</h1>
  <div class="subtitle">Parallel prompt optimization with round-robin sync</div>

  <div class="stats">
    <div class="stat">
      <div class="stat-value" id="completed">0/32</div>
      <div class="stat-label">Topics Completed</div>
    </div>
    <div class="stat">
      <div class="stat-value" id="running">0</div>
      <div class="stat-label">Agents Running</div>
    </div>
  </div>

  <div class="controls">
    <button class="btn btn-danger" id="stopAll" onclick="stopAll()">Stop All Agents</button>
    <span id="stopStatus" style="color: #8b949e; font-size: 12px;"></span>
  </div>

  <div class="agents-grid" id="agents"></div>

  <div class="card">
    <h2>Main Log</h2>
    <div class="log" id="log"></div>
  </div>

  <div class="refresh">Auto-refreshes every 3 seconds</div>

  <script>
    function getPhaseLabel(phase) {
      const labels = {
        'starting': 'Starting up...',
        'generating': 'Generating questions',
        'eval_train': 'Evaluating training set',
        'eval_test': 'Evaluating test set',
        'categorizing': 'Categorizing errors',
        'improving': 'Generating improved prompt'
      };
      return labels[phase] || phase;
    }

    function getProgressPercent(agent) {
      if (agent.isComplete) return 100;

      // Each iteration has: generate (50%) + evaluate/improve (50%)
      const iterProgress = (agent.currentIteration - 1) / agent.maxIterations;

      let phaseProgress = 0;
      if (agent.phase === 'generating') {
        phaseProgress = (agent.questionsGenerated / agent.totalQuestions) * 0.5;
      } else if (['eval_train', 'eval_test', 'categorizing', 'improving'].includes(agent.phase)) {
        const phases = ['eval_train', 'eval_test', 'categorizing', 'improving'];
        const idx = phases.indexOf(agent.phase);
        phaseProgress = 0.5 + ((idx + 1) / phases.length) * 0.5;
      }

      const totalProgress = (iterProgress + phaseProgress / agent.maxIterations) * 100;
      return Math.min(Math.round(totalProgress), 99);
    }

    function renderAgent(agent) {
      const progress = getProgressPercent(agent);
      const statusClass = agent.isComplete ? 'complete' : (agent.isRunning ? 'running' : 'waiting');
      const badgeText = agent.isComplete ? (agent.converged ? 'Converged' : 'Done') : (agent.isRunning ? 'Running' : 'Queued');

      let progressClass = '';
      if (agent.isComplete) progressClass = 'complete';
      else if (!['starting', 'generating'].includes(agent.phase)) progressClass = 'eval';

      return \`
        <div class="agent \${statusClass}">
          \${agent.isRunning ? \`<button class="btn-cancel" onclick="cancelAgent('\${agent.fullPath}')" title="Stop this agent">X</button>\` : ''}
          <div class="agent-header">
            <span class="agent-name">\${agent.topic}</span>
            <span class="agent-badge \${statusClass}">\${badgeText}</span>
          </div>

          <div class="agent-progress">
            <div class="progress-bar">
              <div class="progress-fill \${progressClass}" style="width: \${progress}%"></div>
            </div>
          </div>

          <div class="agent-details">
            <div class="detail">
              <span class="detail-label">Iteration</span>
              <span class="detail-value">\${agent.currentIteration}/\${agent.maxIterations}</span>
            </div>
            <div class="detail">
              <span class="detail-label">Questions</span>
              <span class="detail-value">\${agent.questionsGenerated}/\${agent.totalQuestions}</span>
            </div>
            \${agent.testScore !== null ? \`
            <div class="detail">
              <span class="detail-label">Test Score</span>
              <span class="detail-value \${agent.testScore >= 4.5 ? 'good' : 'warning'}">\${agent.testScore.toFixed(2)}</span>
            </div>
            <div class="detail">
              <span class="detail-label">Improvement</span>
              <span class="detail-value \${agent.improvement >= 0 ? 'good' : 'warning'}">\${agent.improvement >= 0 ? '+' : ''}\${agent.improvement.toFixed(2)}</span>
            </div>
            \` : ''}
          </div>

          \${!agent.isComplete ? \`
          <div class="phase-indicator">
            <strong>\${getPhaseLabel(agent.phase)}</strong>
          </div>
          \` : \`
          <div class="phase-indicator">
            Final: <strong style="color: #3fb950">\${agent.finalScore?.toFixed(2) || '-'}</strong>
            | Pass rate: <strong style="color: #3fb950">\${agent.passRate || '-'}%</strong>
          </div>
          \`}
        </div>
      \`;
    }

    async function stopAll() {
      if (!confirm('Stop all running agents?')) return;

      const btn = document.getElementById('stopAll');
      const status = document.getElementById('stopStatus');
      btn.disabled = true;
      status.textContent = 'Stopping...';

      try {
        const res = await fetch('/api/cancel-all', { method: 'POST' });
        const data = await res.json();
        status.textContent = \`Stopped \${data.killed} agent(s)\`;
        setTimeout(() => { status.textContent = ''; }, 3000);
        update();
      } catch(e) {
        status.textContent = 'Failed to stop agents';
        console.error(e);
      } finally {
        btn.disabled = false;
      }
    }

    async function cancelAgent(topic) {
      if (!confirm(\`Stop agent for \${topic}?\`)) return;

      try {
        const res = await fetch(\`/api/cancel/\${encodeURIComponent(topic)}\`, { method: 'POST' });
        const data = await res.json();
        if (data.killed > 0) {
          update();
        }
      } catch(e) {
        console.error('Failed to cancel agent:', e);
      }
    }

    async function update() {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();

        document.getElementById('completed').textContent = data.completedTopics + '/32';
        document.getElementById('running').textContent = data.runningCount;
        document.getElementById('agents').innerHTML = data.agents.map(renderAgent).join('');
        document.getElementById('log').textContent = data.mainLogContent;

        // Disable stop button if no agents running
        document.getElementById('stopAll').disabled = data.runningCount === 0;
      } catch(e) { console.error(e); }
    }

    update();
    setInterval(update, 3000);
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  // CORS headers for API requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getDetailedStatus()));
  } else if (req.method === 'POST' && req.url === '/api/cancel-all') {
    const killed = killAllProcesses();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, killed }));
  } else if (req.method === 'POST' && req.url.startsWith('/api/cancel/')) {
    const topic = decodeURIComponent(req.url.replace('/api/cancel/', ''));
    const killed = killProcessByTopic(topic);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, topic, killed }));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(HTML);
  }
});

server.listen(PORT, () => {
  console.log(`Status dashboard running at http://localhost:${PORT}`);
});
