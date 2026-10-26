/**
 * NecroLog: Ambient Telemetry & Process Archaeology
 * Client-Side State Engine & Forensic Telemetry Controller
 * Pure Vanilla ES6+ (Strictly Zero External Dependencies)
 */

(function () {
  'use strict';

  // Application State
  const state = {
    isStreaming: true,
    pollingIntervalMs: 3000,
    pollTimerId: null,
    currentVitals: null,
    targetPid: null,
    activeFilter: 'all',
    searchQuery: '',
    currentDossierMarkdown: '',
    selectedTab: 'rendered',
    isDiagnosing: false,
    activeModalProcess: null,
  };

  // DOM Elements Cache
  const el = {
    utcClock: document.getElementById('utc-clock'),
    statusLight: document.getElementById('status-light'),
    statusText: document.getElementById('status-text'),
    executeNecrologyBtn: document.getElementById('execute-necrology-btn'),
    btnSpinner: document.getElementById('btn-spinner'),
    btnText: document.getElementById('btn-text'),
    brandRefreshBtn: document.getElementById('brand-refresh-btn'),

    // Context bar
    nodeName: document.getElementById('node-name'),
    nodeArch: document.getElementById('node-arch'),
    telemetrySource: document.getElementById('telemetry-source'),
    modelBadge: document.getElementById('model-badge'),
    ollamaStatus: document.getElementById('ollama-status'),
    pollingInterval: document.getElementById('polling-interval'),
    toggleStreamBtn: document.getElementById('toggle-stream-btn'),
    manualPollBtn: document.getElementById('manual-poll-btn'),

    // Metric Cards
    metricCpu: document.getElementById('metric-cpu'),
    cpuCoresBadge: document.getElementById('cpu-cores-badge'),
    cpuProgressFill: document.getElementById('cpu-progress-fill'),
    cpuLoadAvg: document.getElementById('cpu-load-avg'),

    metricRamUsed: document.getElementById('metric-ram-used'),
    ramPctBadge: document.getElementById('ram-pct-badge'),
    ramProgressFill: document.getElementById('ram-progress-fill'),
    ramTotal: document.getElementById('ram-total'),
    swapUsed: document.getElementById('swap-used'),

    metricThreads: document.getElementById('metric-threads'),
    pidCountBadge: document.getElementById('pid-count-badge'),
    threadsProgressFill: document.getElementById('threads-progress-fill'),
    metricTotalPids: document.getElementById('metric-total-pids'),
    metricOrphans: document.getElementById('metric-orphans'),

    metricSpectralIndex: document.getElementById('metric-spectral-index'),
    spectralStatusBadge: document.getElementById('spectral-status-badge'),
    spectralProgressFill: document.getElementById('spectral-progress-fill'),
    metricZombies: document.getElementById('metric-zombies'),
    metricResidualRam: document.getElementById('metric-residual-ram'),

    // Process Table & Toolbar
    processSearchInput: document.getElementById('process-search-input'),
    processTableBody: document.getElementById('process-table-body'),
    segBtns: document.querySelectorAll('.seg-btn'),
    filterCountAll: document.getElementById('filter-count-all'),
    filterCountOrphan: document.getElementById('filter-count-orphan'),
    filterCountSpecter: document.getElementById('filter-count-specter'),
    filterCountZombie: document.getElementById('filter-count-zombie'),

    // Dossier Section
    inferenceEngineBadge: document.getElementById('inference-engine-badge'),
    copyReportBtn: document.getElementById('copy-report-btn'),
    downloadReportBtn: document.getElementById('download-report-btn'),
    clearReportBtn: document.getElementById('clear-report-btn'),
    tabLinks: document.querySelectorAll('.tab-link'),
    tabRendered: document.getElementById('tab-rendered'),
    tabRaw: document.getElementById('tab-raw'),
    tabTelemetryJson: document.getElementById('tab-telemetry-json'),
    renderedReportContent: document.getElementById('rendered-report-content'),
    rawMarkdownOutput: document.getElementById('raw-markdown-output'),
    telemetryJsonOutput: document.getElementById('telemetry-json-output'),
    emptyDossierState: document.getElementById('empty-dossier-state'),
    emptyTriggerBtn: document.getElementById('empty-trigger-btn'),
    synthesisLoading: document.getElementById('synthesis-loading'),
    loadingStepText: document.getElementById('loading-step-text'),

    // Target Focus Indicator
    targetFocusContainer: document.getElementById('target-focus-container'),
    focusPidPill: document.getElementById('focus-pid-pill'),
    clearFocusBtn: document.getElementById('clear-focus-btn'),

    // Dialog
    processModal: document.getElementById('process-modal'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalCancelBtn: document.getElementById('modal-cancel-btn'),
    modalExorciseBtn: document.getElementById('modal-exorcise-btn'),
    modalProcessTitle: document.getElementById('modal-process-title'),
    modalPid: document.getElementById('modal-pid'),
    modalPpid: document.getElementById('modal-ppid'),
    modalRss: document.getElementById('modal-rss'),
    modalCpu: document.getElementById('modal-cpu'),
    modalStatus: document.getElementById('modal-status'),
    modalArchetype: document.getElementById('modal-archetype'),
    modalExplanation: document.getElementById('modal-explanation'),

    // Toast Container
    toastContainer: document.getElementById('toast-container'),
  };

  /**
   * Initializes the UTC live clock.
   */
  function initClock() {
    function update() {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      if (el.utcClock) {
        el.utcClock.textContent = `${hours}:${minutes}:${seconds}`;
      }
    }
    update();
    setInterval(update, 1000);
  }

  /**
   * Shows a transient toast notification.
   */
  function showToast(message) {
    if (!el.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    el.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 200ms ease';
      setTimeout(() => toast.remove(), 200);
    }, 2800);
  }

  /**
   * Fetches service health and local Ollama state.
   */
  async function checkHealth() {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      el.statusLight.className = 'status-indicator-light healthy';
      el.statusText.textContent = 'Nominal Telemetry';

      if (data.host && data.host.node) {
        el.nodeName.textContent = data.host.node;
      }
      if (data.platform) {
        el.nodeArch.textContent = data.platform.split('-')[0] || data.platform;
      }
      if (data.telemetry_source) {
        el.telemetrySource.textContent = data.telemetry_source;
      }

      if (data.ollama) {
        if (data.ollama.connected) {
          el.ollamaStatus.textContent = 'Ollama Connected';
          el.ollamaStatus.className = 'meta-value status-socket online';
          el.modelBadge.textContent = data.ollama.target_model || 'llama3.2:3b';
        } else {
          el.ollamaStatus.textContent = 'Air-Gapped Synthesizer';
          el.ollamaStatus.className = 'meta-value status-socket';
          el.modelBadge.textContent = 'synthetic-archaeologist';
        }
      }
    } catch (err) {
      el.statusLight.className = 'status-indicator-light offline';
      el.statusText.textContent = 'Telemetry Reconnecting...';
      el.ollamaStatus.textContent = 'Synthetic Failover Active';
      el.ollamaStatus.className = 'meta-value status-socket';
    }
  }

  /**
   * Fetches real-time telemetry metrics.
   */
  async function fetchTelemetry() {
    try {
      const res = await fetch('/api/telemetry');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const vitals = await res.json();
      state.currentVitals = vitals;
      renderVitals(vitals);
    } catch (err) {
      console.warn('Telemetry fetch degraded:', err);
    }
  }

  /**
   * Renders metrics and process table.
   */
  function renderVitals(vitals) {
    if (!vitals) return;

    // CPU Card
    const cpuPct = vitals.cpu ? vitals.cpu.percent : 0.0;
    el.metricCpu.textContent = cpuPct.toFixed(1);
    el.cpuProgressFill.style.width = `${Math.min(100, Math.max(0, cpuPct))}%`;
    if (vitals.cpu && vitals.cpu.cores) {
      el.cpuCoresBadge.textContent = `${vitals.cpu.cores} Cores`;
    }
    if (vitals.cpu && vitals.cpu.load_avg) {
      el.cpuLoadAvg.textContent = vitals.cpu.load_avg.map(n => n.toFixed(2)).join(', ');
    }

    // RAM Card
    const mem = vitals.memory || {};
    const usedMb = mem.used_mb || 0;
    const totalMb = mem.total_mb || 1;
    const ramPct = mem.percent || 0.0;
    el.metricRamUsed.textContent = usedMb.toFixed(1);
    el.ramPctBadge.textContent = `${ramPct.toFixed(1)}%`;
    el.ramProgressFill.style.width = `${Math.min(100, Math.max(0, ramPct))}%`;
    el.ramTotal.textContent = `${totalMb.toFixed(0)} MB`;
    if (vitals.swap) {
      el.swapUsed.textContent = `${(vitals.swap.used_mb || 0).toFixed(0)} MB`;
    }

    // PID & Threads Card
    const procs = vitals.processes || {};
    el.metricThreads.textContent = (procs.total_threads || 0).toLocaleString();
    el.metricTotalPids.textContent = procs.total_count || 0;
    el.metricOrphans.textContent = procs.orphan_count || 0;
    el.pidCountBadge.textContent = `${procs.total_count || 0} Active`;
    const threadRatio = Math.min(100, Math.max(10, ((procs.total_threads || 100) / 1000) * 100));
    el.threadsProgressFill.style.width = `${threadRatio}%`;

    // Spectral Index Card
    const arch = vitals.archaeology || {};
    const spectralIdx = arch.spectral_pressure_index || 0.0;
    el.metricSpectralIndex.textContent = spectralIdx.toFixed(1);
    el.spectralProgressFill.style.width = `${Math.min(100, Math.max(0, spectralIdx))}%`;
    el.metricZombies.textContent = procs.zombie_count || 0;
    el.metricResidualRam.textContent = `${(arch.residual_memory_mb || 0).toFixed(1)} MB`;

    if (spectralIdx > 70) {
      el.spectralStatusBadge.textContent = 'Critical Haunting';
      el.spectralStatusBadge.className = 'metric-badge text-crimson';
    } else if (spectralIdx > 35) {
      el.spectralStatusBadge.textContent = 'Residue Detected';
      el.spectralStatusBadge.className = 'metric-badge badge-warning';
    } else {
      el.spectralStatusBadge.textContent = 'Nominal Ground';
      el.spectralStatusBadge.className = 'metric-badge';
    }

    // Host node info if provided
    if (vitals.host && vitals.host.node) {
      el.nodeName.textContent = vitals.host.node;
    }

    // Render Process Graveyard Table
    renderProcessTable(procs.top_table || []);
  }

  /**
   * Filters and renders the process table.
   */
  function renderProcessTable(processes) {
    if (!processes || !Array.isArray(processes)) return;

    // Calculate category counts
    const countAll = processes.length;
    const countOrphans = processes.filter(p => p.archetype === 'Orphan Routine').length;
    const countSpecters = processes.filter(p => p.archetype === 'Memory Specter').length;
    const countZombies = processes.filter(p => p.archetype === 'Zombie Process').length;

    el.filterCountAll.textContent = countAll;
    el.filterCountOrphan.textContent = countOrphans;
    el.filterCountSpecter.textContent = countSpecters;
    el.filterCountZombie.textContent = countZombies;

    // Apply active filter
    let filtered = processes.slice();
    if (state.activeFilter === 'orphan') {
      filtered = filtered.filter(p => p.archetype === 'Orphan Routine');
    } else if (state.activeFilter === 'specter') {
      filtered = filtered.filter(p => p.archetype === 'Memory Specter');
    } else if (state.activeFilter === 'zombie') {
      filtered = filtered.filter(p => p.archetype === 'Zombie Process');
    }

    // Apply search query
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.trim().toLowerCase();
      filtered = filtered.filter(p => {
        const pidStr = String(p.pid);
        const nameStr = (p.name || '').toLowerCase();
        const archStr = (p.archetype || '').toLowerCase();
        return pidStr.includes(q) || nameStr.includes(q) || archStr.includes(q);
      });
    }

    // Render Rows
    if (filtered.length === 0) {
      el.processTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="table-empty-row">No processes match the active archaeological criteria.</td>
        </tr>
      `;
      return;
    }

    const fragment = document.createDocumentFragment();

    filtered.forEach(p => {
      const tr = document.createElement('tr');
      if (state.targetPid === p.pid) {
        tr.className = 'row-focused';
      }

      // Archetype CSS class
      let archetypeClass = 'archetype-nominal';
      if (p.archetype === 'Orphan Routine') archetypeClass = 'archetype-orphan';
      else if (p.archetype === 'Memory Specter') archetypeClass = 'archetype-specter';
      else if (p.archetype === 'Zombie Process') archetypeClass = 'archetype-zombie';
      else if (p.archetype === 'Hung Daemon') archetypeClass = 'archetype-hung';
      else if (p.archetype === 'Ephemeral Worker') archetypeClass = 'archetype-worker';

      tr.innerHTML = `
        <td class="tabular font-mono"><strong>${p.pid}</strong></td>
        <td class="tabular font-mono">${p.ppid}</td>
        <td><strong>${escapeHtml(p.name)}</strong></td>
        <td><span class="font-mono">${escapeHtml(p.status)}</span></td>
        <td class="text-right tabular font-mono">${(p.rss_mb || 0).toFixed(1)} MB</td>
        <td class="text-right tabular font-mono">${(p.cpu_percent || 0).toFixed(1)}%</td>
        <td><span class="archetype-label ${archetypeClass}">${escapeHtml(p.archetype)}</span></td>
        <td class="text-right">
          <button class="inspect-action-btn" type="button" data-pid="${p.pid}">Inspect</button>
        </td>
      `;

      // Click to inspect
      tr.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('inspect-action-btn')) {
          e.stopPropagation();
          openProcessModal(p);
        } else {
          openProcessModal(p);
        }
      });

      fragment.appendChild(tr);
    });

    el.processTableBody.innerHTML = '';
    el.processTableBody.appendChild(fragment);
  }

  /**
   * Opens the process inspection modal.
   */
  function openProcessModal(proc) {
    state.activeModalProcess = proc;
    el.modalProcessTitle.textContent = `PID ${proc.pid} · ${proc.name}`;
    el.modalPid.textContent = proc.pid;
    el.modalPpid.textContent = proc.ppid;
    el.modalRss.textContent = `${(proc.rss_mb || 0).toFixed(1)} MB (${proc.memory_percent || 0}%)`;
    el.modalCpu.textContent = `${(proc.cpu_percent || 0).toFixed(1)}%`;
    el.modalStatus.textContent = proc.status;
    el.modalArchetype.textContent = proc.archetype;

    let explanation = 'This process exhibits nominal operating characteristics.';
    if (proc.archetype === 'Orphan Routine') {
      explanation = 'Reparented to PID 1 (Init/Launchd). The original invoking parent terminated without reaping child exit signals. File handles or listening network sockets may linger unmonitored.';
    } else if (proc.archetype === 'Memory Specter') {
      explanation = 'Holding an elevated resident set size (>300 MB) without proportional CPU activity. Strongly indicative of an uncollected heap fragmentation or memory leak.';
    } else if (proc.archetype === 'Zombie Process') {
      explanation = 'Execution has terminated, but the task structure remains preserved in the operating system kernel process table because the parent process has not invoked waitpid().';
    } else if (proc.archetype === 'Hung Daemon') {
      explanation = 'Consuming abnormal CPU cycles in an idle or background state. Suspected infinite spin-wait loop or stalled socket poll.';
    }

    el.modalExplanation.textContent = explanation;
    el.processModal.showModal();
  }

  /**
   * Executes the system necrology post-mortem analysis.
   */
  async function executeNecrology(targetPid = null) {
    if (state.isDiagnosing) return;

    state.isDiagnosing = true;
    state.targetPid = targetPid;

    // Update target focus pill
    if (targetPid) {
      el.focusPidPill.textContent = `PID ${targetPid}`;
      el.targetFocusContainer.style.display = 'inline-flex';
    } else {
      el.targetFocusContainer.style.display = 'none';
    }

    // Set UI Loading State
    el.executeNecrologyBtn.classList.add('loading');
    el.executeNecrologyBtn.disabled = true;
    el.btnText.textContent = 'Synthesizing Autopsy...';

    el.synthesisLoading.style.display = 'flex';
    el.emptyDossierState.style.display = 'none';
    el.renderedReportContent.style.display = 'none';

    // Simulated progress steps
    const steps = [
      'Tracing kernel task descriptors and lingering PID table allocations...',
      'Isolating reparented orphan subroutines bound to PID 1...',
      'Invoking local open-weight inference engine (Ollama)...',
      'Synthesizing archaeological autopsy dossier...',
    ];

    let stepIdx = 0;
    const progressTimer = setInterval(() => {
      if (stepIdx < steps.length) {
        el.loadingStepText.textContent = steps[stepIdx];
        stepIdx++;
      }
    }, 700);

    try {
      const payload = {
        vitals: state.currentVitals || null,
        target_pid: targetPid || undefined,
        model: 'llama3.2:3b',
      };

      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      clearInterval(progressTimer);

      const markdown = data.post_mortem || 'No post-mortem was returned.';
      state.currentDossierMarkdown = markdown;

      // Update inference badge
      if (data.inference_source === 'ollama_local') {
        el.inferenceEngineBadge.textContent = `Ollama (${data.model || 'llama3.2:3b'})`;
      } else {
        el.inferenceEngineBadge.textContent = 'Deterministic Forensics Failover';
      }

      // Render Markdown to HTML
      const html = renderMarkdownToHtml(markdown);
      el.renderedReportContent.innerHTML = html;
      el.renderedReportContent.style.display = 'block';

      // Update Raw and JSON views
      el.rawMarkdownOutput.value = markdown;
      el.telemetryJsonOutput.textContent = JSON.stringify(data.vitals_snapshot || state.currentVitals, null, 2);

      // Switch to rendered tab
      switchTab('rendered');
      showToast('Archaeological autopsy synthesis complete.');
    } catch (err) {
      console.error('Diagnosis failed:', err);
      clearInterval(progressTimer);
      el.renderedReportContent.innerHTML = `
        <div class="text-crimson" style="padding: 1.5rem; border: 1px solid rgba(220, 38, 38, 0.3); border-radius: 6px;">
          <h3>Synthesis Operation Failed</h3>
          <p>${escapeHtml(err.message || 'Unable to connect to diagnostic endpoint.')}</p>
        </div>
      `;
      el.renderedReportContent.style.display = 'block';
      showToast('Diagnostic autopsy encountered an error.');
    } finally {
      state.isDiagnosing = false;
      el.synthesisLoading.style.display = 'none';
      el.executeNecrologyBtn.classList.remove('loading');
      el.executeNecrologyBtn.disabled = false;
      el.btnText.textContent = 'Execute System Necrology';

      // Re-render table to highlight focused row if any
      if (state.currentVitals && state.currentVitals.processes) {
        renderProcessTable(state.currentVitals.processes.top_table || []);
      }
    }
  }

  /**
   * Simple, resilient, and secure client-side Markdown to HTML renderer.
   * Handles headers, tables, bold, italics, code blocks, lists, and hr dividers.
   */
  function renderMarkdownToHtml(md) {
    if (!md) return '';

    let lines = md.split('\n');
    let out = [];
    let inTable = false;
    let inPre = false;
    let preContent = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Code blocks (```)
      if (line.trim().startsWith('```')) {
        if (inPre) {
          out.push(`<pre><code>${escapeHtml(preContent.join('\n'))}</code></pre>`);
          preContent = [];
          inPre = false;
        } else {
          inPre = true;
          preContent = [];
        }
        continue;
      }

      if (inPre) {
        preContent.push(line);
        continue;
      }

      // Horizontal Rules
      if (/^(\*\*\*|---|___)$/.test(line.trim())) {
        if (inTable) { out.push('</tbody></table>'); inTable = false; }
        out.push('<hr>');
        continue;
      }

      // Tables (| Header | Header |)
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        let cells = line.split('|').slice(1, -1).map(c => c.trim());

        // Skip divider row like |:---|:---|
        if (cells.some(c => /^:?-+:?$/.test(c))) {
          continue;
        }

        if (!inTable) {
          inTable = true;
          out.push('<table><thead><tr>');
          cells.forEach(c => out.push(`<th>${parseInline(c)}</th>`));
          out.push('</tr></thead><tbody>');
        } else {
          out.push('<tr>');
          cells.forEach(c => out.push(`<td>${parseInline(c)}</td>`));
          out.push('</tr>');
        }
        continue;
      } else if (inTable) {
        out.push('</tbody></table>');
        inTable = false;
      }

      // Headers (# Header)
      if (line.startsWith('#### ')) {
        out.push(`<h4>${parseInline(line.substring(5))}</h4>`);
        continue;
      }
      if (line.startsWith('### ')) {
        out.push(`<h3>${parseInline(line.substring(4))}</h3>`);
        continue;
      }
      if (line.startsWith('## ')) {
        out.push(`<h2>${parseInline(line.substring(3))}</h2>`);
        continue;
      }
      if (line.startsWith('# ')) {
        out.push(`<h2>${parseInline(line.substring(2))}</h2>`);
        continue;
      }

      // Unordered lists (- or *)
      if (/^[-*]\s+/.test(line.trim())) {
        let content = line.trim().replace(/^[-*]\s+/, '');
        out.push(`<ul><li>${parseInline(content)}</li></ul>`);
        continue;
      }

      // Ordered lists (1. 2.)
      if (/^\d+\.\s+/.test(line.trim())) {
        let content = line.trim().replace(/^\d+\.\s+/, '');
        out.push(`<ol><li>${parseInline(content)}</li></ol>`);
        continue;
      }

      // Empty line
      if (!line.trim()) {
        continue;
      }

      // Normal paragraph
      out.push(`<p>${parseInline(line)}</p>`);
    }

    if (inTable) {
      out.push('</tbody></table>');
    }
    if (inPre) {
      out.push(`<pre><code>${escapeHtml(preContent.join('\n'))}</code></pre>`);
    }

    // Clean contiguous list blocks
    let joined = out.join('\n')
      .replace(/<\/ul>\n<ul>/g, '')
      .replace(/<\/ol>\n<ol>/g, '');

    return joined;
  }

  function parseInline(str) {
    let s = escapeHtml(str);
    // Bold
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Inline code
    s = s.replace(/`(.+?)`/g, '<code>$1</code>');
    return s;
  }

  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Tab switcher for Dossier view.
   */
  function switchTab(tabName) {
    state.selectedTab = tabName;
    el.tabLinks.forEach(link => {
      if (link.dataset.tab === tabName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    el.tabRendered.style.display = tabName === 'rendered' ? 'flex' : 'none';
    el.tabRaw.style.display = tabName === 'raw' ? 'flex' : 'none';
    el.tabTelemetryJson.style.display = tabName === 'telemetry-json' ? 'flex' : 'none';
  }

  /**
   * Sets up polling loop.
   */
  function startPolling() {
    stopPolling();
    state.pollTimerId = setInterval(() => {
      if (state.isStreaming) {
        fetchTelemetry();
      }
    }, state.pollingIntervalMs);
  }

  function stopPolling() {
    if (state.pollTimerId) {
      clearInterval(state.pollTimerId);
      state.pollTimerId = null;
    }
  }

  /**
   * Event Listeners Registration.
   */
  function setupEventListeners() {
    // Primary Necrology Execution
    el.executeNecrologyBtn.addEventListener('click', () => executeNecrology(state.targetPid));
    el.emptyTriggerBtn.addEventListener('click', () => executeNecrology(state.targetPid));

    // Brand click: refresh vitals
    el.brandRefreshBtn.addEventListener('click', (e) => {
      e.preventDefault();
      fetchTelemetry();
      checkHealth();
      showToast('Host telemetry refreshed.');
    });

    // Stream Toggle
    el.toggleStreamBtn.addEventListener('click', () => {
      state.isStreaming = !state.isStreaming;
      el.toggleStreamBtn.textContent = state.isStreaming ? 'Pause Stream' : 'Resume Stream';
      showToast(state.isStreaming ? 'Telemetry streaming resumed.' : 'Telemetry streaming paused.');
    });

    // Manual Poll
    el.manualPollBtn.addEventListener('click', () => {
      fetchTelemetry();
      checkHealth();
      showToast('Polled host vitals.');
    });

    // Interval Selector
    el.pollingInterval.addEventListener('change', (e) => {
      state.pollingIntervalMs = parseInt(e.target.value, 10) || 3000;
      startPolling();
      showToast(`Polling cadence set to ${state.pollingIntervalMs / 1000}s.`);
    });

    // Process Search Filter
    el.processSearchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (state.currentVitals && state.currentVitals.processes) {
        renderProcessTable(state.currentVitals.processes.top_table || []);
      }
    });

    // Segmented Buttons (All, Orphans, Memory Specters, Zombies)
    el.segBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        el.segBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeFilter = btn.dataset.filter || 'all';
        if (state.currentVitals && state.currentVitals.processes) {
          renderProcessTable(state.currentVitals.processes.top_table || []);
        }
      });
    });

    // Dossier Tabs
    el.tabLinks.forEach(btn => {
      btn.addEventListener('click', () => {
        switchTab(btn.dataset.tab);
      });
    });

    // Clear Target Focus
    el.clearFocusBtn.addEventListener('click', () => {
      state.targetPid = null;
      el.targetFocusContainer.style.display = 'none';
      if (state.currentVitals && state.currentVitals.processes) {
        renderProcessTable(state.currentVitals.processes.top_table || []);
      }
      showToast('Cleared target PID focus.');
    });

    // Copy Report Button
    el.copyReportBtn.addEventListener('click', async () => {
      if (!state.currentDossierMarkdown) {
        showToast('No dossier available to copy.');
        return;
      }
      try {
        await navigator.clipboard.writeText(state.currentDossierMarkdown);
        showToast('Dossier copied to clipboard.');
      } catch (err) {
        showToast('Failed to copy. Use raw tab to copy text.');
      }
    });

    // Download Report Button
    el.downloadReportBtn.addEventListener('click', () => {
      if (!state.currentDossierMarkdown) {
        showToast('No dossier generated yet.');
        return;
      }
      const blob = new Blob([state.currentDossierMarkdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `necro_dossier_${Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Dossier exported to file.');
    });

    // Clear Report
    el.clearReportBtn.addEventListener('click', () => {
      state.currentDossierMarkdown = '';
      el.renderedReportContent.style.display = 'none';
      el.renderedReportContent.innerHTML = '';
      el.rawMarkdownOutput.value = '';
      el.telemetryJsonOutput.textContent = '';
      el.emptyDossierState.style.display = 'flex';
      showToast('Dossier reset.');
    });

    // Modal Handlers
    el.modalCloseBtn.addEventListener('click', () => el.processModal.close());
    el.modalCancelBtn.addEventListener('click', () => el.processModal.close());
    el.modalExorciseBtn.addEventListener('click', () => {
      el.processModal.close();
      if (state.activeModalProcess) {
        executeNecrology(state.activeModalProcess.pid);
      }
    });
  }

  /**
   * Initializes application on DOMContentLoaded.
   */
  async function init() {
    initClock();
    setupEventListeners();
    await checkHealth();
    await fetchTelemetry();
    startPolling();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
