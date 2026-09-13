# KubeMind — Database Schema

## Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ project_members : "belongs to"
    users ||--o{ audit_logs : "generates"
    projects ||--o{ project_members : "has"
    projects ||--o{ applications : "contains"
    clusters ||--o{ nodes : "has"
    clusters ||--o{ applications : "hosts"
    applications ||--o{ deployments : "has"
    applications ||--o{ cost_records : "incurs"
    ai_decisions ||--o{ feedback_loops : "generates"
    predictions ||--o{ feedback_loops : "validates"

    users {
        uuid id PK
        varchar email UK
        varchar username UK
        varchar full_name
        varchar hashed_password
        varchar role FK
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    roles {
        varchar name PK
        varchar description
        jsonb permissions
    }

    projects {
        uuid id PK
        varchar name
        text description
        uuid owner_id FK
        timestamp created_at
        timestamp updated_at
    }

    project_members {
        uuid id PK
        uuid project_id FK
        uuid user_id FK
        varchar role
        timestamp joined_at
    }

    clusters {
        uuid id PK
        varchar name
        text description
        text kubeconfig_encrypted
        varchar api_server_url
        varchar status
        float health_score
        timestamp last_synced_at
        timestamp created_at
        timestamp updated_at
    }

    nodes {
        uuid id PK
        uuid cluster_id FK
        varchar name
        varchar status
        varchar role
        float cpu_capacity
        float memory_capacity_mb
        float cpu_usage
        float memory_usage_mb
        float disk_usage_percent
        float failure_risk
        jsonb labels
        jsonb conditions
        timestamp last_heartbeat
        timestamp created_at
        timestamp updated_at
    }

    applications {
        uuid id PK
        uuid project_id FK
        uuid cluster_id FK
        varchar name
        varchar image
        varchar namespace
        int replicas
        varchar cpu_request
        varchar memory_request
        varchar cpu_limit
        varchar memory_limit
        varchar status
        jsonb env_vars
        jsonb labels
        timestamp created_at
        timestamp updated_at
    }

    deployments {
        uuid id PK
        uuid application_id FK
        varchar image_tag
        varchar strategy
        varchar status
        varchar triggered_by
        jsonb ai_risk_analysis
        jsonb manifest_snapshot
        timestamp started_at
        timestamp completed_at
        timestamp created_at
    }

    ai_decisions {
        uuid id PK
        varchar decision_type
        varchar action
        jsonb input_factors
        text reasoning
        float confidence
        jsonb expected_outcome
        jsonb actual_outcome
        varchar status
        uuid related_entity_id
        varchar related_entity_type
        timestamp decided_at
        timestamp created_at
    }

    predictions {
        uuid id PK
        varchar prediction_type
        varchar target_entity
        uuid target_id
        jsonb predicted_values
        jsonb actual_values
        float prediction_error
        varchar model_name
        varchar model_version
        timestamp predicted_for
        timestamp created_at
    }

    feedback_loops {
        uuid id PK
        uuid prediction_id FK
        uuid decision_id FK
        float error_magnitude
        jsonb feedback_data
        boolean used_for_retraining
        timestamp created_at
    }

    audit_logs {
        uuid id PK
        uuid user_id FK
        varchar action
        varchar resource_type
        uuid resource_id
        jsonb details
        varchar ip_address
        varchar user_agent
        timestamp created_at
    }

    incidents {
        uuid id PK
        uuid cluster_id FK
        uuid application_id FK
        varchar severity
        varchar title
        text description
        varchar status
        jsonb root_cause_analysis
        jsonb remediation_actions
        timestamp detected_at
        timestamp resolved_at
        timestamp created_at
    }

    cost_records {
        uuid id PK
        uuid application_id FK
        uuid cluster_id FK
        float cpu_cost
        float memory_cost
        float storage_cost
        float total_cost
        varchar currency
        jsonb optimization_suggestions
        date record_date
        timestamp created_at
    }
```

---

## Table Definitions

### `users`
Stores user accounts with authentication credentials and roles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Login email |
| `username` | VARCHAR(100) | UNIQUE, NOT NULL | Display name |
| `full_name` | VARCHAR(255) | NOT NULL | Full name |
| `hashed_password` | VARCHAR(255) | NOT NULL | bcrypt hash |
| `role` | VARCHAR(50) | NOT NULL, DEFAULT 'developer' | FK to roles |
| `is_active` | BOOLEAN | DEFAULT true | Account status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update |

### `roles`
Defines available RBAC roles and their permissions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `name` | VARCHAR(50) | PK | Role name (admin, developer, viewer) |
| `description` | TEXT | | Role description |
| `permissions` | JSONB | NOT NULL | Permission set |

**Seed Data:**
```sql
INSERT INTO roles (name, description, permissions) VALUES
('admin', 'Full system access', '{"clusters": ["read","write","delete"], "applications": ["read","write","delete"], "users": ["read","write","delete"], "audit": ["read"]}'),
('developer', 'Deploy and manage applications', '{"clusters": ["read"], "applications": ["read","write"], "users": ["read"], "audit": []}'),
('viewer', 'Read-only access', '{"clusters": ["read"], "applications": ["read"], "users": [], "audit": []}');
```

### `projects`
Project/workspace containers for organizing applications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `name` | VARCHAR(255) | NOT NULL | Project name |
| `description` | TEXT | | Project description |
| `owner_id` | UUID | FK → users.id, NOT NULL | Project owner |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update |

### `clusters`
Registered Kubernetes clusters.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `name` | VARCHAR(255) | NOT NULL | Cluster name |
| `description` | TEXT | | Cluster description |
| `kubeconfig_encrypted` | TEXT | NOT NULL | Encrypted kubeconfig |
| `api_server_url` | VARCHAR(500) | NOT NULL | API server endpoint |
| `status` | VARCHAR(50) | DEFAULT 'pending' | Connection status |
| `health_score` | FLOAT | | Overall health (0-100) |
| `last_synced_at` | TIMESTAMPTZ | | Last node sync |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Registration time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update |

### `nodes`
Discovered Kubernetes nodes with resource metrics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `cluster_id` | UUID | FK → clusters.id, NOT NULL | Parent cluster |
| `name` | VARCHAR(255) | NOT NULL | Node name |
| `status` | VARCHAR(50) | | Ready/NotReady/Unknown |
| `role` | VARCHAR(50) | | control-plane/worker |
| `cpu_capacity` | FLOAT | | Total CPU cores |
| `memory_capacity_mb` | FLOAT | | Total memory in MB |
| `cpu_usage` | FLOAT | | Current CPU usage |
| `memory_usage_mb` | FLOAT | | Current memory usage |
| `disk_usage_percent` | FLOAT | | Disk utilization % |
| `failure_risk` | FLOAT | DEFAULT 0.0 | AI failure risk score |
| `labels` | JSONB | | K8s node labels |
| `conditions` | JSONB | | K8s node conditions |
| `last_heartbeat` | TIMESTAMPTZ | | Last health check |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Discovery time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update |

---

## Indexes

```sql
-- Users
CREATE UNIQUE INDEX idx_users_email ON users (email);
CREATE UNIQUE INDEX idx_users_username ON users (username);

-- Nodes
CREATE INDEX idx_nodes_cluster ON nodes (cluster_id);

-- Applications
CREATE INDEX idx_apps_project ON applications (project_id);
CREATE INDEX idx_apps_cluster ON applications (cluster_id);

-- Deployments
CREATE INDEX idx_deployments_app ON deployments (application_id);
CREATE INDEX idx_deployments_started ON deployments (application_id, started_at DESC);

-- AI Decisions
CREATE INDEX idx_ai_decisions_type ON ai_decisions (decision_type);
CREATE INDEX idx_ai_decisions_time ON ai_decisions (decided_at DESC);

-- Predictions
CREATE INDEX idx_predictions_type ON predictions (prediction_type);
CREATE INDEX idx_predictions_target ON predictions (target_entity, target_id);
CREATE INDEX idx_predictions_time ON predictions (predicted_for DESC);

-- Audit Logs
CREATE INDEX idx_audit_user ON audit_logs (user_id);
CREATE INDEX idx_audit_time ON audit_logs (created_at DESC);
CREATE INDEX idx_audit_user_time ON audit_logs (user_id, created_at DESC);

-- Incidents
CREATE INDEX idx_incidents_cluster ON incidents (cluster_id);
CREATE INDEX idx_incidents_severity ON incidents (severity, detected_at DESC);

-- Cost Records
CREATE INDEX idx_cost_app ON cost_records (application_id);
CREATE INDEX idx_cost_date ON cost_records (record_date DESC);
```
