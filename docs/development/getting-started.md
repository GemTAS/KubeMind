# KubeMind — Getting Started

## Prerequisites

### Windows Host
- **Windows 10/11** with WSL2 enabled
- **Docker Desktop** with WSL2 backend integration enabled
- **Git** for Windows

### WSL2 Ubuntu
Ensure the following are installed:
```bash
sudo apt update && sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    build-essential \
    python3.12 \
    python3.12-venv \
    python3-pip
```

### Node.js (in WSL2 or Windows)
Install Node.js 20+ via [nvm](https://github.com/nvm-sh/nvm):
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

### Kind (Kubernetes in Docker)
```bash
# Install Go (if not already installed)
sudo apt install golang-go -y

# Install Kind v0.33.0
go install sigs.k8s.io/kind@v0.33.0
echo 'export PATH=$PATH:$(go env GOPATH)/bin' >> ~/.bashrc
source ~/.bashrc

# Verify
kind version
```

### kubectl
```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
kubectl version --client
```

### Helm
```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
helm version
```

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/<your-org>/KubeMind.git
cd KubeMind
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your preferred values
```

### 3. Start Infrastructure Services

```bash
# Start PostgreSQL, Redis, Kafka
docker compose up -d

# Verify all services are healthy
docker compose ps
```

### 4. Set Up the Backend

```bash
cd backend

# Create virtual environment
python3.12 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -e ".[dev]"

# Run database migrations
alembic upgrade head

# Start the development server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 5. Set Up the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The dashboard will be available at http://localhost:5173

### 6. Create Kubernetes Cluster (WSL2)

```bash
cd kubernetes/kind

# Create the 3-node cluster
bash setup.sh

# Verify
kubectl get nodes
```

Expected output:
```
NAME                     STATUS   ROLES           AGE   VERSION
kubemind-control-plane   Ready    control-plane   1m    v1.31.x
kubemind-worker          Ready    <none>          1m    v1.31.x
kubemind-worker2         Ready    <none>          1m    v1.31.x
kubemind-worker3         Ready    <none>          1m    v1.31.x
```

---

## Development Workflow

### Backend Development
```bash
cd backend
source .venv/bin/activate

# Run the server with auto-reload
uvicorn src.main:app --reload

# Run tests
pytest tests/ -v

# Lint
ruff check src/

# Format
ruff format src/

# Type check
mypy src/
```

### Frontend Development
```bash
cd frontend

# Dev server with hot reload
npm run dev

# Lint
npx eslint src/

# Build
npm run build
```

### Database Migrations
```bash
cd backend

# Create a new migration
alembic revision --autogenerate -m "description of change"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

---

## Project Structure Quick Reference

```
KubeMind/
├── frontend/          → React dashboard (port 5173)
├── backend/           → FastAPI backend (port 8000)
├── ai/                → AI/ML modules
├── kubernetes/        → K8s configs & manifests
├── monitoring/        → Observability stack
├── docs/              → Documentation
├── docker-compose.yml → Local infrastructure
└── .env               → Environment variables
```

---

## Troubleshooting

### Docker Desktop not connecting in WSL2
Ensure Docker Desktop → Settings → Resources → WSL Integration is enabled for your Ubuntu distro.

### Kind cluster fails to create
Ensure Docker is running:
```bash
docker ps
```

### Backend can't connect to PostgreSQL
Check that the Docker Compose PostgreSQL container is running and healthy:
```bash
docker compose ps postgres
docker compose logs postgres
```

### Frontend can't reach backend API
Ensure the backend is running on port 8000 and `VITE_API_BASE_URL` is set correctly in `.env`.
