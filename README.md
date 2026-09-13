<p align="center">
  <h1 align="center">🧠 KubeMind</h1>
  <p align="center">
    <strong>Autonomous AI-Powered Kubernetes Cloud Operations Platform</strong>
  </p>
  <p align="center">
    <em>Observe → Understand → Predict → Decide → Act → Measure → Learn → Improve</em>
  </p>
</p>

---

## 📖 Overview

**KubeMind** is an AI-powered cloud operations and orchestration platform that transforms Kubernetes from a reactive orchestration system into a **predictive and autonomous** cloud operations platform.

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              KUBEMIND AI ENGINE                 │
│                                                 │
│   Live Metrics → Workload Prediction            │
│        ↓                                        │
│   Failure Prediction → Cost/Latency Analysis    │
│        ↓                                        │
│   AI Decision Engine → Kubernetes Execution     │
│        ↓                                        │
│   Telemetry Feedback → Model Improvement        │
│                                                 │
└─────────────────────────────────────────────────┘
```

Instead of relying solely on predefined thresholds and policies, KubeMind continuously analyzes historical and real-time cluster data to:

- 🔮 **Predict** future workload and potential failures
- 🧠 **Decide** optimal workload placement and scaling
- 💰 **Optimize** resource allocation and infrastructure cost
- 🔧 **Remediate** issues with intelligent auto-healing
- 📊 **Explain** every AI decision with confidence scores
- 🔄 **Learn** continuously from operational feedback

---

## 🏗️ Architecture

```
Developer → GitHub → CI/CD → Container Registry
                                     ↓
                            ┌────────────────┐
                            │  KubeMind AI   │
                            │  Decision      │
                            │  Engine        │
                            └───────┬────────┘
                                    ↓
                             Kubernetes API
                                    ↓
                    ┌───────────────┼───────────────┐
                    ↓               ↓               ↓
                 Node 1          Node 2          Node 3
                    ↓               ↓               ↓
               Prometheus      Loki          OpenTelemetry
                    └───────────────┼───────────────┘
                                    ↓
                           Feedback → KubeMind
```

---

## 🧩 Core Modules

| Module | Description |
|--------|-------------|
| **User & Project Management** | RBAC, project workspaces, audit logs |
| **Cluster Management** | Node discovery, health monitoring, resource overview |
| **Application Deployment** | Deploy, scale, restart, rollback, canary deployments |
| **CI/CD Pipeline** | GitHub Actions integration, automated build/test/scan |
| **GitOps** | Argo CD integration, Git-driven desired state |
| **Observability** | Prometheus, Grafana, Loki, OpenTelemetry, Jaeger |
| **AI Workload Prediction** | Time-series forecasting (XGBoost, LSTM, etc.) |
| **AI Failure Prediction** | Anomaly detection, failure probability scoring |
| **Intelligent Scheduling** | AI-scored node selection beyond default K8s scheduler |
| **Predictive Autoscaling** | Scale before demand spikes, not after |
| **Cost Optimization** | Resource waste detection, cost-aware scheduling |
| **Auto-Remediation** | Intelligent self-healing beyond simple restarts |
| **Deployment Risk Analysis** | Pre-deployment risk scoring and recommendations |
| **Root Cause Analysis** | Incident correlation and probable cause identification |
| **Explainable AI** | Decision transparency with confidence scores |
| **Feedback Loop** | Prediction vs reality tracking, continuous model improvement |

---

## 🛠️ Technology Stack

### Frontend
- **React** + **TypeScript** — UI framework
- **Tailwind CSS** v4 — Styling
- **Recharts** — Data visualization
- **React Flow** — Topology visualization
- **Vite** — Build tool

### Backend
- **Python** + **FastAPI** — Primary API framework
- **SQLAlchemy** — ORM
- **Alembic** — Database migrations
- **Go** — Optional high-performance components

### AI/ML
- **Scikit-learn** — Baseline statistical models & preprocessing
- **XGBoost / LightGBM / CatBoost** — Gradient boosting & low-latency edge inference
- **PyTorch** — Deep learning (PatchTST, Temporal Transformers, GNNs via PyTorch Geometric)
- **Stable-Baselines3** — Reinforcement Learning (PPO, SAC)

### Infrastructure
- **Docker** — Containerization
- **Kubernetes** — Container orchestration
- **Kind** — Local development clusters
- **Helm** — Package management
- **Terraform** — Infrastructure as Code

### Observability
- **Prometheus** — Metrics collection
- **Grafana** — Metrics visualization
- **Loki** — Centralized logging
- **OpenTelemetry** — Telemetry collection
- **Jaeger** — Distributed tracing

### Data & Messaging
- **PostgreSQL** — Primary database
- **Redis** — Caching and sessions
- **Apache Kafka** — Event streaming

### CI/CD & GitOps
- **GitHub Actions** — CI/CD pipelines
- **Argo CD** — GitOps deployment

### Security
- **Keycloak** — Identity management (future)
- **Trivy** — Container vulnerability scanning

---

## 📁 Repository Structure

```
KubeMind/
├── frontend/              # React + TypeScript + Tailwind dashboard
├── backend/               # FastAPI backend services
│   └── src/
│       ├── core/          # Shared config, DB, security, middleware
│       ├── auth/          # Authentication & RBAC
│       ├── clusters/      # Cluster management
│       ├── applications/  # Application deployment
│       ├── ai_decisions/  # AI decision logging & predictions
│       └── audit/         # Audit logging
├── ai/                    # AI/ML modules
│   ├── workload-prediction/
│   ├── failure-prediction/
│   ├── scheduler/
│   ├── cost-optimizer/
│   └── explainability/
├── kubernetes/            # K8s manifests, Helm charts, operators
│   ├── kind/              # Local cluster configs
│   ├── manifests/         # K8s resource manifests
│   └── helm/              # Helm charts
├── scheduler/             # Custom K8s scheduler
├── monitoring/            # Observability stack configs
├── cicd/                  # CI/CD pipeline definitions
├── gitops/                # Argo CD configurations
├── data/                  # Data engineering pipelines
├── experiments/           # ML experiment tracking
├── tests/                 # Integration & E2E tests
└── docs/                  # Project documentation
    ├── architecture/      # Architecture, HLD, LLD
    ├── api/               # API specifications
    ├── database/          # Schema & ERD
    └── development/       # Dev guides, coding standards
```

---

## 👥 Team

| Member | Responsibility |
|--------|---------------|
| **Member 1** | AI/ML + Data Engineering — Workload prediction, failure prediction, AI scheduling, RL, explainability, data pipelines |
| **Member 2** | Kubernetes/Cloud + DevOps — K8s cluster, scheduler framework, controllers, Docker, CI/CD, Argo CD, observability stack |
| **Member 3** | Backend/Frontend — React dashboard, FastAPI backend, authentication, database, AI visualization |

---

## 🚀 Getting Started

### Prerequisites

- Windows with WSL2 (Ubuntu)
- Docker Desktop (with WSL2 backend)
- Kind v0.33.0+
- kubectl
- Python 3.12+
- Node.js 20+
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/<your-org>/KubeMind.git
cd KubeMind

# Start infrastructure (PostgreSQL, Redis)
docker compose up -d

# Backend
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -e ".[dev]"
alembic upgrade head
uvicorn src.main:app --reload

# Frontend
cd frontend
npm install
npm run dev

# Kubernetes (in WSL2)
cd kubernetes/kind
bash setup.sh
```


---

## 📄 License

This project is developed as a Final-Year Major Project.

---

<p align="center">
  <strong>KubeMind</strong> — Transforming Kubernetes from reactive orchestration to predictive intelligence.
</p>
