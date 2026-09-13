# KubeMind — Low-Level Design (LLD)

## Phase 1 Components

This LLD covers the detailed design for Phase 1: Authentication, Cluster Management, and Application Deployment.

---

## 1. Authentication Module

### 1.1 Class Diagram

```mermaid
classDiagram
    class User {
        +UUID id
        +String email
        +String username
        +String hashed_password
        +String role
        +Boolean is_active
        +DateTime created_at
        +DateTime updated_at
    }

    class AuthService {
        +register(data: RegisterRequest) User
        +login(data: LoginRequest) TokenPair
        +refresh(token: str) TokenPair
        +get_current_user(token: str) User
        -_hash_password(password: str) str
        -_verify_password(plain: str, hashed: str) bool
        -_create_access_token(user_id: UUID) str
        -_create_refresh_token(user_id: UUID) str
    }

    class TokenPair {
        +String access_token
        +String refresh_token
        +String token_type
        +Int expires_in
    }

    AuthService --> User
    AuthService --> TokenPair
```

### 1.2 Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant AuthRouter
    participant AuthService
    participant DB as PostgreSQL

    Note over Client,DB: Registration
    Client->>AuthRouter: POST /auth/register
    AuthRouter->>AuthService: register(data)
    AuthService->>AuthService: Hash password (bcrypt)
    AuthService->>DB: INSERT user
    DB-->>AuthService: User record
    AuthService-->>AuthRouter: User response
    AuthRouter-->>Client: 201 Created

    Note over Client,DB: Login
    Client->>AuthRouter: POST /auth/login
    AuthRouter->>AuthService: login(data)
    AuthService->>DB: SELECT user by email
    AuthService->>AuthService: Verify password
    AuthService->>AuthService: Create JWT tokens
    AuthService-->>Client: TokenPair

    Note over Client,DB: Authenticated Request
    Client->>AuthRouter: GET /auth/me (Bearer token)
    AuthRouter->>AuthService: get_current_user(token)
    AuthService->>AuthService: Decode & validate JWT
    AuthService->>DB: SELECT user by ID
    AuthService-->>Client: User data
```

### 1.3 JWT Token Structure

```json
{
  "sub": "user-uuid",
  "role": "developer",
  "exp": 1234567890,
  "iat": 1234567890,
  "type": "access"
}
```

### 1.4 RBAC Permission Matrix

| Action | Admin | Developer | Viewer |
|--------|-------|-----------|--------|
| Create project | ✅ | ✅ | ❌ |
| Delete project | ✅ | ❌ | ❌ |
| Deploy application | ✅ | ✅ | ❌ |
| View dashboard | ✅ | ✅ | ✅ |
| View AI decisions | ✅ | ✅ | ✅ |
| Manage users | ✅ | ❌ | ❌ |
| Register cluster | ✅ | ❌ | ❌ |
| View audit logs | ✅ | ❌ | ❌ |
| Trigger remediation | ✅ | ✅ | ❌ |

---

## 2. Cluster Management Module

### 2.1 Class Diagram

```mermaid
classDiagram
    class Cluster {
        +UUID id
        +String name
        +String description
        +String kubeconfig_encrypted
        +String api_server_url
        +String status
        +Float health_score
        +DateTime last_synced_at
        +DateTime created_at
    }

    class Node {
        +UUID id
        +UUID cluster_id
        +String name
        +String status
        +String role
        +Float cpu_capacity
        +Float memory_capacity
        +Float cpu_usage
        +Float memory_usage
        +Float disk_usage
        +Float failure_risk
        +DateTime last_heartbeat
    }

    class ClusterService {
        +register(data: ClusterCreate) Cluster
        +sync_nodes(cluster_id: UUID) List~Node~
        +get_health(cluster_id: UUID) HealthReport
        +get_events(cluster_id: UUID) List~Event~
        -_connect(kubeconfig: str) K8sClient
        -_discover_nodes(client: K8sClient) List~Node~
    }

    Cluster "1" --> "*" Node
    ClusterService --> Cluster
    ClusterService --> Node
```

### 2.2 Node Discovery Flow

```mermaid
sequenceDiagram
    participant API as Cluster Router
    participant SVC as Cluster Service
    participant K8S as Kubernetes API
    participant DB as PostgreSQL

    API->>SVC: sync_nodes(cluster_id)
    SVC->>DB: Get cluster kubeconfig
    SVC->>K8S: List nodes
    K8S-->>SVC: Node list + status
    SVC->>K8S: Get node metrics
    K8S-->>SVC: CPU, Memory, Disk
    SVC->>DB: Upsert nodes
    SVC-->>API: Updated node list
```

---

## 3. Application Deployment Module

### 3.1 Class Diagram

```mermaid
classDiagram
    class Application {
        +UUID id
        +UUID project_id
        +UUID cluster_id
        +String name
        +String image
        +String namespace
        +Int replicas
        +String cpu_request
        +String memory_request
        +String cpu_limit
        +String memory_limit
        +String status
        +JSON env_vars
        +DateTime created_at
    }

    class Deployment {
        +UUID id
        +UUID application_id
        +String image_tag
        +String strategy
        +String status
        +String triggered_by
        +JSON ai_risk_analysis
        +DateTime started_at
        +DateTime completed_at
    }

    class ApplicationService {
        +deploy(data: AppCreate) Application
        +scale(app_id: UUID, replicas: int) Application
        +restart(app_id: UUID) Application
        +rollback(app_id: UUID, deployment_id: UUID) Application
        +delete(app_id: UUID) None
        -_generate_manifest(app: Application) dict
        -_apply_to_k8s(manifest: dict) None
    }

    Application "1" --> "*" Deployment
    ApplicationService --> Application
    ApplicationService --> Deployment
```

### 3.2 Deployment Flow

```mermaid
sequenceDiagram
    participant User
    participant API as App Router
    participant SVC as App Service
    participant AI as AI Decision Engine
    participant K8S as Kubernetes API
    participant DB as PostgreSQL

    User->>API: POST /applications/ (deploy)
    API->>SVC: deploy(data)
    SVC->>AI: Analyze deployment risk
    AI-->>SVC: Risk score + recommendation
    SVC->>SVC: Generate K8s manifest
    SVC->>AI: Score candidate nodes
    AI-->>SVC: Optimal node selection
    SVC->>K8S: Apply manifest
    K8S-->>SVC: Deployment status
    SVC->>DB: Record deployment
    SVC-->>User: Deployment result + AI explanation
```

---

## 4. AI Decision Module

### 4.1 Class Diagram

```mermaid
classDiagram
    class AIDecision {
        +UUID id
        +String decision_type
        +String action
        +JSON input_factors
        +String reasoning
        +Float confidence
        +JSON expected_outcome
        +JSON actual_outcome
        +String status
        +DateTime decided_at
    }

    class Prediction {
        +UUID id
        +String prediction_type
        +String target_entity
        +UUID target_id
        +JSON predicted_values
        +JSON actual_values
        +Float prediction_error
        +DateTime predicted_for
        +DateTime created_at
    }

    class FeedbackLoop {
        +UUID id
        +UUID prediction_id
        +UUID decision_id
        +Float error_magnitude
        +JSON feedback_data
        +Boolean used_for_retraining
        +DateTime created_at
    }

    AIDecision "1" --> "*" FeedbackLoop
    Prediction "1" --> "*" FeedbackLoop
```

---

## 5. API Contract Details

### 5.1 Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### 5.2 Pagination Format

```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "page_size": 20,
  "pages": 5
}
```

### 5.3 Standard HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 204 | Deleted |
| 400 | Validation error |
| 401 | Unauthorized |
| 403 | Forbidden (insufficient role) |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 500 | Internal server error |

---

## 6. Database Indexes

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| `users` | `email` | UNIQUE | Login lookup |
| `users` | `username` | UNIQUE | Display name |
| `nodes` | `cluster_id` | B-tree | Cluster node listing |
| `applications` | `project_id` | B-tree | Project app listing |
| `deployments` | `application_id, started_at` | Composite | Deployment history |
| `ai_decisions` | `decided_at` | B-tree | Decision timeline |
| `predictions` | `predicted_for` | B-tree | Prediction lookup |
| `audit_logs` | `user_id, created_at` | Composite | Audit trail query |

---

## 7. Configuration Management

All configuration is managed through environment variables via Pydantic Settings:

```python
class Settings(BaseSettings):
    # Database
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "kubemind"
    postgres_user: str = "kubemind"
    postgres_password: str

    # Redis
    redis_host: str = "localhost"
    redis_port: int = 6379

    # JWT
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7

    # Backend
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    backend_debug: bool = False

    @property
    def database_url(self) -> str:
        return f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"

    model_config = SettingsConfigDict(env_file=".env")
```
