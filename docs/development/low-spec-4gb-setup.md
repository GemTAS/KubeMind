# 💻 4 GB RAM PC Optimization Guide for KubeMind

This guide explains how to develop KubeMind smoothly on a machine with **4 GB RAM** without system crashes, freezes, or out-of-memory errors.

---

## ❓ Storage vs RAM: Demystifying Docker Desktop

### 1. Why is Docker Desktop using ~3+ GB of Storage?
- **Disk Storage (ROM / Hard Drive / SSD)** is space taken on your drive to store files permanently.
- Docker Desktop on Windows runs on **WSL 2 (Windows Subsystem for Linux)**. It installs:
  - A lightweight Linux kernel and distribution (Ubuntu/Alpine).
  - Container runtimes (`containerd`, `runc`).
  - Docker daemon binaries and command-line tools.
  - Virtual disk image (`ext4.vhdx`).
  - Base container images (Postgres, Redis, Kafka).
- **This 3+ GB is disk space, NOT active RAM.** It sits safely on your SSD/HDD.

### 2. Does Docker require 3+ GB of RAM to run too?
**No, but WARNING:**
- By default, **WSL 2 is configured to take up to 50% or more of your total RAM** dynamically.
- On a 4 GB RAM PC:
  - Windows 10/11 already uses **~2.0 GB to 2.4 GB** just for the operating system and background tasks.
  - That leaves only **~1.6 GB of free RAM**!
  - If Docker Desktop starts with default settings, WSL2 will try to grab **2 GB**, which immediately exceeds your physical RAM.
  - Windows begins aggressive paging/swapping to disk (`pagefile.sys`), causing your PC to **lag heavily, freeze, or crash**.

---

## 🛡️ Step-by-Step Fix: Capping WSL 2 Memory

To prevent Docker Desktop and WSL 2 from freezing your 4 GB PC, you must place a hard cap on WSL 2 memory.

### Step 1: Create `.wslconfig` in your User Home Directory
In Windows, create a file at:
```text
C:\Users\<YourUsername>\.wslconfig
```

Put the following configuration inside:

```ini
[wsl2]
# Strictly limit WSL2 memory to 1.5 GB
memory=1536MB

# Allocate 2 virtual processor cores
processors=2

# Enable 2 GB of swap on disk
swap=2048MB

# Prevent virtual disk from keeping unused memory
pageReporting=true
```

### Step 2: Restart WSL 2
Open PowerShell and run:
```powershell
wsl --shutdown
```
When you launch Docker Desktop or WSL again, it will strictly respect the 1.5 GB memory limit.

---

## 🛑 What to Run (and NOT to Run) on this 4 GB PC

| Component | Run on 4 GB PC? | Why? | Recommended Environment |
| :--- | :---: | :--- | :--- |
| **FastAPI Backend (`uvicorn`)** | ✅ **YES** | Consumes only ~60–120 MB RAM | Local PC |
| **React Frontend (`vite`)** | ✅ **YES** | Lightweight dev server (~150 MB RAM) | Local PC |
| **Lightweight Model Inference (ONNX/CatBoost)** | ✅ **YES** | Pretrained weights inference takes < 80 MB | Local PC |
| **PostgreSQL & Redis** | ⚠️ **CONDITIONAL** | Run lightweight containers OR local services | Local Docker (with `.wslconfig`) OR Teammate's PC |
| **Apache Kafka** | ❌ **NO** | Runs on the Java Virtual Machine (JVM); easily eats 1+ GB RAM alone | Teammate's 8 GB+ PC or mock via Redis/Python queue |
| **Kind / Minikube Kubernetes Cluster** | ❌ **NO** | Kubernetes control plane + kubelet + etcd takes 1.5–2.5 GB RAM | Teammate's 8 GB+ PC |
| **Prometheus + Loki + Grafana** | ❌ **NO** | Telemetry ingestion requires active memory | Teammate's 8 GB+ PC |
| **AI Model Training (Deep Learning / RL)** | ❌ **NO** | Will instantly crash 4 GB RAM | **Google Colab (Free GPU/TPU)** |

---

## 🤝 Team Division of Labor

As planned in the KubeMind project:

```
┌────────────────────────────────────────────────────────┐
│                   YOUR MACHINE (4 GB RAM)              │
│  - FastAPI Backend Development                         │
│  - API Endpoints, Pydantic Schemas, Business Logic     │
│  - React Dashboard UI                                  │
│  - Lightweight Model Inference (calling .onnx models)  │
└───────────────────────────┬────────────────────────────┘
                            │ (Git / Local Network)
┌───────────────────────────▼────────────────────────────┐
│              TEAMMATE'S MACHINE (8 GB+ RAM)            │
│  - Kind / Local Kubernetes Cluster                     │
│  - Prometheus, Loki, OpenTelemetry, Grafana            │
│  - Microservices Workload Simulation                   │
│  - Dockerized Integration Stack                        │
└───────────────────────────┬────────────────────────────┘
                            │ (Dataset Export / Import)
┌───────────────────────────▼────────────────────────────┐
│                   GOOGLE COLAB (FREE CLOUD)            │
│  - Deep Learning Training (PatchTST, TFT, GNNs)        │
│  - Reinforcement Learning (PPO, Gymnasium)             │
│  - Hyperparameter Tuning & Evaluation                  │
│  - Model Export to ONNX / TorchScript                  │
└────────────────────────────────────────────────────────┘
```

---

## 🧹 Docker Disk Cleanup (Freeing up Storage)

If Docker is eating too much disk space from old/dangling layers:
```powershell
# Prune all stopped containers, unused networks, and dangling images
docker system prune -a --volumes
```
