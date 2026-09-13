# KubeMind — Architecture Overview

## System Context

KubeMind sits as an **AI decision layer** between developers/operators and the Kubernetes execution layer. It transforms the standard reactive Kubernetes workflow into an intelligent, predictive loop.

```mermaid
graph TB
    DEV["👨‍💻 Developer"] -->|Push Code| GH["GitHub Repository"]
    GH -->|Trigger| CICD["GitHub Actions<br/>Build + Test + Scan"]
    CICD -->|Push Image| CR["Container Registry"]
    CR -->|Deploy Request| KM["🧠 KubeMind AI<br/>Decision Engine"]

    KM -->|Optimized Decision| K8S["☸️ Kubernetes API"]
    K8S --> W1["Worker Node 1"]
    K8S --> W2["Worker Node 2"]
    K8S --> W3["Worker Node 3"]

    W1 -->|Telemetry| OBS["📊 Observability Layer"]
    W2 -->|Telemetry| OBS
    W3 -->|Telemetry| OBS

    OBS -->|Metrics| PROM["Prometheus"]
    OBS -->|Logs| LOKI["Loki"]
    OBS -->|Traces| OT["OpenTelemetry / Jaeger"]

    PROM -->|Feed| KM
    LOKI -->|Feed| KM
    OT -->|Feed| KM

    style KM fill:#6366f1,stroke:#4f46e5,color:#fff
    style K8S fill:#326ce5,stroke:#2563eb,color:#fff
    style OBS fill:#059669,stroke:#047857,color:#fff
```

---

## Core Decision Loop

KubeMind operates on a continuous intelligence loop:

```mermaid
graph LR
    A["OBSERVE<br/>Collect metrics,<br/>logs, traces"] --> B["UNDERSTAND<br/>Process and<br/>correlate data"]
    B --> C["PREDICT<br/>Forecast workload,<br/>failures, costs"]
    C --> D["DECIDE<br/>Select optimal<br/>action"]
    D --> E["ACT<br/>Execute via<br/>Kubernetes"]
    E --> F["MEASURE<br/>Compare prediction<br/>vs reality"]
    F --> G["LEARN<br/>Update models,<br/>reduce error"]
    G --> A

    style A fill:#0ea5e9,stroke:#0284c7,color:#fff
    style B fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style C fill:#f59e0b,stroke:#d97706,color:#fff
    style D fill:#ef4444,stroke:#dc2626,color:#fff
    style E fill:#10b981,stroke:#059669,color:#fff
    style F fill:#6366f1,stroke:#4f46e5,color:#fff
    style G fill:#ec4899,stroke:#db2777,color:#fff
```

---

## Component Architecture

### Platform Layer

```mermaid
graph TB
    subgraph Platform["KubeMind Platform"]
        direction TB
        subgraph FE["Frontend — React Dashboard"]
            UI["Dashboard UI"]
            VIZ["AI Visualization"]
            MGMT["Management Console"]
        end

        subgraph BE["Backend — FastAPI"]
            AUTH["Auth Service"]
            CLUSTER["Cluster Service"]
            APP["Application Service"]
            AI_API["AI Decision API"]
            AUDIT_SVC["Audit Service"]
        end

        subgraph AI["AI Engine — Python"]
            WP["Workload Predictor"]
            FP["Failure Predictor"]
            SCHED["Intelligent Scheduler"]
            COST["Cost Optimizer"]
            XAI_MOD["Explainability Module"]
            RL["Reinforcement Learning"]
        end
    end

    subgraph INFRA["Infrastructure"]
        K8S["Kubernetes Cluster"]
        PROM["Prometheus"]
        GRAF["Grafana"]
        LOKI_C["Loki"]
        OTEL["OpenTelemetry"]
    end

    subgraph DATA["Data Layer"]
        PG["PostgreSQL"]
        REDIS_C["Redis"]
        KAFKA_C["Kafka"]
    end

    FE --> BE
    BE --> AI
    BE --> DATA
    AI --> DATA
    AI --> K8S
    BE --> K8S
    K8S --> INFRA
    INFRA --> AI

    style Platform fill:#f8fafc,stroke:#e2e8f0
    style FE fill:#dbeafe,stroke:#93c5fd
    style BE fill:#fef3c7,stroke:#fcd34d
    style AI fill:#ede9fe,stroke:#c4b5fd
    style INFRA fill:#d1fae5,stroke:#6ee7b7
    style DATA fill:#fee2e2,stroke:#fca5a5
```

---

## Data Flow

### Deployment Flow

```mermaid
sequenceDiagram
    actor Dev as Developer
    participant GH as GitHub
    participant CI as GitHub Actions
    participant CR as Container Registry
    participant KM as KubeMind AI
    participant K8S as Kubernetes

    Dev->>GH: Push code
    GH->>CI: Trigger pipeline
    CI->>CI: Build + Test + Scan
    CI->>CR: Push Docker image
    Dev->>KM: Deploy request
    KM->>KM: Analyze cluster state
    KM->>KM: Predict workload
    KM->>KM: Calculate risk score
    KM->>KM: Score candidate nodes
    KM->>K8S: Deploy with optimal placement
    K8S-->>KM: Deployment status
    KM-->>Dev: Deployment result + AI explanation
```

### Feedback Loop

```mermaid
sequenceDiagram
    participant AI as AI Model
    participant K8S as Kubernetes
    participant OBS as Observability
    participant FB as Feedback Engine

    AI->>K8S: Decision (e.g., scale to 5 replicas)
    K8S->>OBS: Runtime telemetry
    OBS->>FB: Actual metrics
    AI->>FB: Predicted metrics
    FB->>FB: Calculate prediction error
    FB->>AI: Feedback for retraining
    Note over AI,FB: Prediction error decreases over time
```

---

## Module Interaction Map

```mermaid
graph TB
    subgraph INPUT["Data Sources"]
        METRICS["Infrastructure Metrics<br/>CPU, Memory, Disk, Network"]
        APP_MET["Application Metrics<br/>Request Rate, Latency, Errors"]
        K8S_EVT["Kubernetes Events<br/>Restarts, Scheduling, Failures"]
        LOGS["Logs<br/>Application + System"]
        TRACES["Traces<br/>Distributed Request Paths"]
    end

    subgraph AI_ENGINE["AI Decision Engine"]
        WP2["Workload Prediction"]
        FP2["Failure Prediction"]
        AD["Anomaly Detection"]
        DE["Decision Engine"]
    end

    subgraph ACTIONS["Actions"]
        SCALE["Scale"]
        SCHEDULE["Schedule"]
        REMEDIATE["Remediate"]
        ROLLBACK["Rollback"]
        ALERT["Alert"]
    end

    INPUT --> AI_ENGINE
    WP2 --> DE
    FP2 --> DE
    AD --> DE
    DE --> ACTIONS
    ACTIONS -->|Telemetry| INPUT

    style INPUT fill:#dbeafe,stroke:#93c5fd
    style AI_ENGINE fill:#ede9fe,stroke:#c4b5fd
    style ACTIONS fill:#d1fae5,stroke:#6ee7b7
```

---

## Deployment Topology

### Local Development

```
Windows Host
│
├── Docker Desktop
│   ├── PostgreSQL (port 5432)
│   ├── Redis (port 6379)
│   └── Kafka (port 9092)
│
└── WSL2 Ubuntu
    ├── Kind Cluster
    │   ├── Control Plane
    │   ├── Worker Node 1
    │   ├── Worker Node 2
    │   └── Worker Node 3
    │
    ├── Backend (FastAPI — port 8000)
    └── Frontend (Vite — port 5173)
```

### Production (Future)

```
Cloud Provider (EKS / GKE / AKS)
│
├── KubeMind Namespace
│   ├── Backend Pods
│   ├── AI Engine Pods
│   └── Frontend Pods (Nginx)
│
├── Application Namespace
│   ├── Microservice Pods
│   └── Database Pods
│
├── Monitoring Namespace
│   ├── Prometheus
│   ├── Grafana
│   ├── Loki
│   └── Jaeger
│
└── GitOps
    └── Argo CD
```

---

## Key Design Principles

1. **Kubernetes remains the execution layer** — KubeMind never replaces K8s, it enhances it.
2. **AI decisions are explainable** — Every decision includes inputs, reasoning, confidence.
3. **Feedback drives improvement** — Prediction vs reality is always measured.
4. **Start simple, grow complex** — Linear Regression before Reinforcement Learning.
5. **Real data over synthetic** — Collect actual telemetry whenever possible.
6. **Modular architecture** — Each AI module is independently deployable and testable.
