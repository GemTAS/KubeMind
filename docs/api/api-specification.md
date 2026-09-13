# KubeMind — API Specification

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

All endpoints (except `/auth/register` and `/auth/login`) require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

---

## 1. Auth Endpoints

### POST `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "developer@kubemind.io",
  "username": "dev_john",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "developer@kubemind.io",
  "username": "dev_john",
  "full_name": "John Doe",
  "role": "developer",
  "is_active": true,
  "created_at": "2026-09-09T12:00:00Z"
}
```

---

### POST `/auth/login`

Authenticate and receive tokens.

**Request Body:**
```json
{
  "email": "developer@kubemind.io",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

---

### GET `/auth/me`

Get current authenticated user.

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "developer@kubemind.io",
  "username": "dev_john",
  "full_name": "John Doe",
  "role": "developer",
  "is_active": true,
  "created_at": "2026-09-09T12:00:00Z"
}
```

---

### POST `/auth/refresh`

Refresh access token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

---

## 2. Project Endpoints

### POST `/projects/`

Create a new project workspace.

**Request Body:**
```json
{
  "name": "KubeMind Demo",
  "description": "Demo cluster for KubeMind evaluation"
}
```

**Response (201):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "name": "KubeMind Demo",
  "description": "Demo cluster for KubeMind evaluation",
  "owner_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-09-09T12:00:00Z"
}
```

---

### GET `/projects/`

List all projects for current user.

**Query Parameters:**
- `page` (int, default: 1)
- `page_size` (int, default: 20)

**Response (200):**
```json
{
  "items": [...],
  "total": 5,
  "page": 1,
  "page_size": 20,
  "pages": 1
}
```

---

## 3. Cluster Endpoints

### POST `/clusters/`

Register a Kubernetes cluster.

**Request Body:**
```json
{
  "name": "dev-cluster",
  "description": "Local Kind development cluster",
  "api_server_url": "https://127.0.0.1:6443",
  "kubeconfig": "base64-encoded-kubeconfig"
}
```

**Response (201):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "name": "dev-cluster",
  "description": "Local Kind development cluster",
  "api_server_url": "https://127.0.0.1:6443",
  "status": "connected",
  "health_score": null,
  "created_at": "2026-09-09T12:00:00Z"
}
```

---

### GET `/clusters/{cluster_id}/nodes`

List all nodes in a cluster.

**Response (200):**
```json
{
  "items": [
    {
      "id": "...",
      "name": "kubemind-worker",
      "status": "Ready",
      "role": "worker",
      "cpu_capacity": 4.0,
      "memory_capacity": 8192.0,
      "cpu_usage": 1.2,
      "memory_usage": 3400.0,
      "disk_usage": 45.2,
      "failure_risk": 0.04,
      "last_heartbeat": "2026-09-09T12:00:00Z"
    }
  ],
  "total": 3
}
```

---

### GET `/clusters/{cluster_id}/health`

Get cluster health summary.

**Response (200):**
```json
{
  "cluster_id": "770e8400-...",
  "health_score": 94.0,
  "total_nodes": 5,
  "ready_nodes": 5,
  "total_pods": 37,
  "running_pods": 35,
  "pending_pods": 2,
  "cpu_utilization": 62.0,
  "memory_utilization": 57.0,
  "failure_risk": "low",
  "last_synced_at": "2026-09-09T12:00:00Z"
}
```

---

## 4. Application Endpoints

### POST `/applications/`

Deploy a new application.

**Request Body:**
```json
{
  "name": "payment-service",
  "project_id": "660e8400-...",
  "cluster_id": "770e8400-...",
  "image": "payment:v3",
  "namespace": "default",
  "replicas": 3,
  "cpu_request": "250m",
  "memory_request": "256Mi",
  "cpu_limit": "500m",
  "memory_limit": "512Mi",
  "env_vars": {
    "DATABASE_URL": "postgresql://...",
    "LOG_LEVEL": "info"
  }
}
```

**Response (201):**
```json
{
  "id": "880e8400-...",
  "name": "payment-service",
  "image": "payment:v3",
  "namespace": "default",
  "replicas": 3,
  "status": "deploying",
  "deployment": {
    "id": "990e8400-...",
    "strategy": "RollingUpdate",
    "status": "in_progress",
    "ai_risk_analysis": {
      "risk_level": "LOW",
      "confidence": 0.92,
      "reasoning": "Cluster utilization is moderate, no recent failures detected."
    }
  },
  "created_at": "2026-09-09T12:00:00Z"
}
```

---

### POST `/applications/{app_id}/scale`

Scale application replicas.

**Request Body:**
```json
{
  "replicas": 5
}
```

---

### POST `/applications/{app_id}/restart`

Restart all pods of an application.

---

### POST `/applications/{app_id}/rollback`

Rollback to a previous deployment.

**Request Body:**
```json
{
  "deployment_id": "990e8400-..."
}
```

---

## 5. AI Decision Endpoints

### GET `/ai/decisions/`

List AI decisions.

**Query Parameters:**
- `decision_type` (optional): `scheduling`, `scaling`, `remediation`, `deployment_risk`
- `page`, `page_size`

**Response (200):**
```json
{
  "items": [
    {
      "id": "aa0e8400-...",
      "decision_type": "scheduling",
      "action": "Moved workload from Node 2 → Node 4",
      "input_factors": {
        "node_2_cpu": 0.89,
        "node_2_failure_risk": 0.72,
        "node_4_cpu": 0.31,
        "node_4_failure_risk": 0.04
      },
      "reasoning": "Node 2 shows high CPU utilization and increasing failure risk. Node 4 has available capacity and low risk.",
      "confidence": 0.91,
      "status": "executed",
      "decided_at": "2026-09-09T10:42:00Z"
    }
  ]
}
```

---

### GET `/ai/predictions/`

List AI predictions.

**Query Parameters:**
- `prediction_type` (optional): `workload`, `failure`, `cost`
- `target_entity` (optional): `node`, `pod`, `application`

**Response (200):**
```json
{
  "items": [
    {
      "id": "bb0e8400-...",
      "prediction_type": "workload",
      "target_entity": "node",
      "target_id": "node-3-uuid",
      "predicted_values": {
        "cpu_10min": 0.70,
        "cpu_20min": 0.89,
        "memory_10min": 0.65
      },
      "actual_values": {
        "cpu_10min": 0.73,
        "cpu_20min": 0.83
      },
      "prediction_error": 0.06,
      "predicted_for": "2026-09-09T11:00:00Z",
      "created_at": "2026-09-09T10:50:00Z"
    }
  ]
}
```

---

## 6. Audit Log Endpoints

### GET `/audit/logs`

Query audit logs. **Admin only.**

**Query Parameters:**
- `user_id` (optional)
- `action` (optional): `login`, `deploy`, `scale`, `delete`, `register_cluster`
- `from_date`, `to_date` (optional)
- `page`, `page_size`

**Response (200):**
```json
{
  "items": [
    {
      "id": "cc0e8400-...",
      "user_id": "550e8400-...",
      "action": "deploy",
      "resource_type": "application",
      "resource_id": "880e8400-...",
      "details": {
        "application": "payment-service",
        "image": "payment:v3"
      },
      "ip_address": "192.168.1.10",
      "created_at": "2026-09-09T12:00:00Z"
    }
  ]
}
```
