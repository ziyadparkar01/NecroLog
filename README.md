# NecroLog: Ambient Telemetry & Process Archaeology
> **Submission for the "Ghost in the Machine" Open-Source AI Track**  
> *An executive systems monitoring console treating orphan routines, lingering PIDs, and memory overhead as the ghosts in the machine.*

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_Python_3.11+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Ollama](https://img.shields.io/badge/Local_LLM-Ollama_(llama3.2:3b)-000000?style=flat-square&logo=ollama&logoColor=white)](https://ollama.ai)
[![Zero Dependencies](https://img.shields.io/badge/Frontend-Pure_ES6_Vanilla_JS-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](#frontend-architecture)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue?style=flat-square)](LICENSE)

---

## 1. Executive Summary & Concept

In UNIX architectures, background services are termed **daemons**, terminated processes waiting to be reaped are called **zombies**, and parentless routines are termed **orphans**. When a process crashes or severes its IPC descriptors, it does not simply vanish—its resident memory allocations remain trapped across physical memory pages, and its file handles linger as invisible fossils in kernel task structs.

**NecroLog** is an institutional systems telemetry and process archaeology console designed for site reliability engineers, security researchers, and systems architects. Rather than relying on cartoonish Halloween tropes or neon green gimmicks, NecroLog applies an institutional, high-end Datadog/Grafana aesthetic to examine the metaphorical **"Ghosts in the Machine"**:

1. **Ambient Process Telemetry:** Live hardware probing of CPU utilization, resident set size (RSS), thread entropy, swap overhead, and process lineage.
2. **The Process Graveyard:** Real-time classification of anomalous processes into forensic archetypes: *Orphan Routine*, *Memory Specter*, *Zombie Process*, *Hung Daemon*, and *Nominal Task*.
3. **Forensic Necrology Engine:** An open-weight inference model (`llama3.2:3b` or `qwen2.5:3b` via Ollama) acting as an advanced systems archaeologist that analyzes host telemetry and drafts technical, structured post-mortem autopsies with containment directives.
4. **Deterministic Air-Gap Failover:** A zero-dependency synthetic forensics engine that guarantees uninterrupted telemetry and diagnostic synthesis even in disconnected, restricted serverless containers (Vercel) or air-gapped secure enclaves.

---

## 2. Why Open-Weight Models Matter for System Telemetry

In modern enterprise infrastructure, using closed-source, cloud-hosted commercial LLM APIs (e.g., proprietary cloud endpoints) for operating system diagnostics is an untenable architectural anti-pattern. NecroLog was built specifically to demonstrate why **local, open-weight models** are non-negotiable for low-level systems monitoring:

### A. The Critical Security & Compliance Hazard of Telemetry Leakage
A host's process table (`/proc` on Linux, `sysctl` on BSD/Darwin) contains the most sensitive operational parameters of an enterprise server:
- Executed command-line arguments exposing database credentials, API secrets, and access tokens (`ps -ef` data).
- Internal IP addresses, private subnet topologies, and local socket bindings.
- Usernames, UID/GID mappings, file system paths, and internal service naming conventions.
- Exact memory address layouts and allocator footprints.

Piping raw process lists and memory statistics to third-party commercial cloud APIs violates GDPR, HIPAA, SOC 2 Type II, and PCI-DSS compliance frameworks. Local open-weight models run directly on the host socket (`localhost:11434`), ensuring **zero process table data ever leaves the local machine boundary**.

### B. True Air-Gapped Zero-Internet Operation
Critical systems—such as industrial SCADA controllers, financial transaction settlements, defense hardware, and air-gapped data centers—operate with zero outbound internet connectivity. Proprietary cloud models simply fail when the internet link drops. Open-weight models like `llama3.2:3b` and `qwen2.5:3b` execute entirely on local CPU/GPU compute, providing uninterrupted systems archaeology in completely dark, disconnected environments.

### C. The Economic Absurdity of Cloud Token Billing for Daemons
A continuous telemetry daemon polling system state every 3 seconds generates **28,800 audit events every 24 hours**. Passing full JSON process tables (averaging 1,500 tokens per prompt) to a cloud API would consume **43,200,000 tokens daily per server**. 
- With commercial cloud models, running background monitoring across a cluster of 50 nodes would cost tens of thousands of dollars per month in token fees alone.
- With open-weight models executed locally, the marginal inference cost is **$0.00**.

### D. Deterministic Fine-Tuning & Prompt Invariants
Open-weight weights allow engineering teams to quantize (GGUF 4-bit/8-bit), fine-tune on custom kernel dump datasets, and enforce strict, reproducible latency budgets without risk of unannounced model deprecation or vendor lock-in.

---

## 3. Architecture & Strict Language Boundaries

NecroLog enforces strict architectural diversity and zero-slop separation between tiers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NecroLog Enterprise Architecture                │
└────────────────────────────────────────────────────────────────────────┘

  [ BROWSER CLIENT (Vanilla ES6) ]
  ├── public/index.html   (Institutional 3-Zone Header, Split-Pane Canvas)
  ├── public/style.css    (Enterprise Dark Mode, Hairline Borders, Zero Pills)
  └── public/app.js       (Live Telemetry Poller, Markdown Parser, Dialogs)
               │
               ▼  HTTP REST (/api/health, /api/telemetry, /api/diagnose)
  [ BACKEND RUNTIME (FastAPI / Serverless) ]
  ├── api/index.py        (FastAPI Python 3.11+ Serverless Function)
  ├── requirements.txt    (fastapi, uvicorn, psutil, httpx)
  ├── vercel.json         (Vercel Edge & Serverless Python Rewrites)
               │
        ┌──────┴──────────────────────────────────┐
        │                                         │
        ▼                                         ▼
  [ psutil / /proc Subsystem ]         [ LOCAL INFERENCE ENGINE ]
  ├── Active PID Load                  ├── Ollama Daemon (localhost:11434)
  ├── Defunct Zombie Count             ├── Model: llama3.2:3b / qwen2.5:3b
  ├── Resident Set Size (RSS)          └── AIR-GAP FAILOVER:
  └── Thread Entropy                       Deterministic Systems Forensic
                                           Synthesis Module (Zero-Crash)
```

### Strict Language Boundaries:
- **Backend:** Pure Python 3.11+ using FastAPI (`api/index.py`). Zero TypeScript, zero Node.js server dependencies in the Python package.
- **Frontend:** Modern, clean Vanilla JavaScript (ES6+), HTML5, and pure CSS. Strictly zero React, Vue, Vite, Webpack, or npm frontend build steps in `public/`.
- **Styling System:** Institutional enterprise dark mode (`#090A0F`, `#10131B`), hairline borders (`rgba(255, 255, 255, 0.07)`), monospace tabular figures (`JetBrains Mono`), and sans-serif interface typography (`Plus Jakarta Sans`). Strictly adheres to zero-pill metadata discipline and zero cartoonish slop.

---

## 4. Local Execution Setup (with Ollama)

### Step 1: Install & Launch Ollama
If not already installed, download Ollama from [ollama.ai](https://ollama.ai):

```bash
# Pull the ultra-fast Llama 3.2 3B systems model
ollama pull llama3.2:3b

# Verify Ollama is running on localhost:11434
curl http://localhost:11434/api/tags
```

### Step 2: Clone & Launch Python Backend
```bash
git clone https://github.com/your-username/necro-log.git
cd necro-log

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install minimal production dependencies
pip install -r requirements.txt

# Run FastAPI telemetry server
uvicorn api.index:app --host 0.0.0.0 --port 8000 --reload
```

### Step 3: Open the Dashboard
Serve the static `public/` directory with any static server or Python's built-in server:
```bash
cd public
python3 -m http.server 3000
```
Open `http://localhost:3000` in your browser. The console will connect to `http://localhost:8000/api/telemetry` and Ollama on `http://localhost:11434`.

---

## 5. One-Click Vercel Deployment

NecroLog is pre-configured with a zero-configuration `vercel.json` manifest routing `/api/(.*)` to `api/index.py` and serving `public/` as high-performance static assets:

1. Push this repository to GitHub or GitLab.
2. Import the project into the [Vercel Dashboard](https://vercel.com/new).
3. Vercel automatically detects `@vercel/python` for `api/index.py` and `@vercel/static` for `public/`.
4. Deploy! In the serverless cloud environment where Ollama is not present, NecroLog's **deterministic systems forensics synthesizer** automatically activates, ensuring all telemetry cards, process tables, and autopsy dossiers function seamlessly without crashing.

---

## 6. API Specification & Contract

### `GET /api/health`
Returns service status, node runtime platform, and local Ollama socket connectivity:
```json
{
  "status": "nominal",
  "service": "NecroLog Telemetry & Process Archaeology Engine",
  "version": "1.4.0",
  "timestamp": "2026-10-26T20:30:00Z",
  "runtime": "Python 3.11.8",
  "telemetry_source": "psutil_live",
  "ollama": {
    "endpoint": "http://localhost:11434",
    "connected": true,
    "target_model": "llama3.2:3b",
    "air_gap_compliant": true
  }
}
```

### `GET /api/telemetry`
Collects live system vitals, hardware matrix, and top lingering process allocations:
```json
{
  "cpu": { "percent": 18.4, "cores": 8, "load_avg": [0.65, 0.42, 0.31] },
  "memory": { "total_mb": 16384.0, "used_mb": 6420.0, "percent": 39.2 },
  "processes": {
    "total_count": 184,
    "zombie_count": 1,
    "orphan_count": 5,
    "total_threads": 612,
    "top_table": [
      {
        "pid": 1042,
        "ppid": 1,
        "name": "node_worker_leaked",
        "status": "sleeping",
        "cpu_percent": 18.4,
        "rss_mb": 393.2,
        "archetype": "Orphan Routine"
      }
    ]
  },
  "archaeology": {
    "spectral_pressure_index": 48.7,
    "residual_memory_mb": 1778.0,
    "entropy_vector": "Orphan Accumulation Detected (PPID=1)"
  }
}
```

### `POST /api/diagnose`
Dispatches telemetry snapshot to Ollama or the local systems archaeology synthesizer:
```json
{
  "vitals": { ... },
  "target_pid": 1042,
  "model": "llama3.2:3b"
}
```
**Response:**
```json
{
  "status": "success",
  "inference_source": "ollama_local",
  "model": "llama3.2:3b",
  "generated_at": "2026-10-26T20:30:02Z",
  "post_mortem": "## SYSTEM ARCHAEOLOGY AUTOPSY REPORT: EXEC-NECRO-81042\n..."
}
```

---

## 7. Operational Safety & Ethical Invariant

NecroLog operates as an **observability and archaeological inspection instrument**. It audits orphan routines, inspects defunct structs, and generates post-mortem containment directives. Signals dispatched from containment recommendations are operator-confirmed and conform to standard POSIX IPC signals (`SIGTERM`, `SIGKILL`, `SIGHUP`).

*All memory traces, process trees, and telemetry vectors remain strictly within the host boundary.*
