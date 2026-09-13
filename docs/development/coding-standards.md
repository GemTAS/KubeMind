# KubeMind — Coding Standards

## 1. Git Workflow

### Branching Strategy
```
main            → Production-ready code
├── develop     → Integration branch
├── feature/*   → New features (feature/ai-workload-prediction)
├── bugfix/*    → Bug fixes (bugfix/auth-token-expiry)
└── hotfix/*    → Critical production fixes
```

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`

**Examples**:
```
feat(auth): add JWT refresh token endpoint
fix(cluster): handle K8s API timeout during node discovery
docs(api): update application deployment API spec
test(ai): add unit tests for workload prediction model
ci(github): add Docker image build step to pipeline
```

### Pull Request Guidelines
- Reference the issue number
- Include description of changes
- Ensure all tests pass
- Request review from at least one team member
- Squash merge to keep history clean

---

## 2. Python Standards (Backend + AI)

### Version
- Python 3.12+

### Code Style
- **Formatter**: `ruff format` (Black-compatible)
- **Linter**: `ruff check`
- **Type Checker**: `mypy` (strict mode)
- **Line Length**: 120 characters
- **Import Sorting**: Handled by Ruff (isort-compatible)

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Variables | snake_case | `user_count` |
| Functions | snake_case | `get_cluster_health()` |
| Classes | PascalCase | `ClusterService` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Modules | snake_case | `workload_prediction.py` |
| Packages | snake_case | `ai_decisions` |

### FastAPI Patterns

```python
# Router — thin, only HTTP concerns
@router.post("/", response_model=UserResponse, status_code=201)
async def register_user(
    data: RegisterRequest,
    service: AuthService = Depends(get_auth_service),
) -> UserResponse:
    """Register a new user account."""
    return await service.register(data)

# Service — business logic
class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def register(self, data: RegisterRequest) -> User:
        # Business logic here
        ...

# Schema — Pydantic validation
class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=8)
    full_name: str

# Model — SQLAlchemy ORM
class User(Base):
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True)
```

### Docstrings
Use Google-style docstrings:
```python
async def predict_workload(
    node_id: str,
    horizon_minutes: int = 10,
) -> WorkloadPrediction:
    """Predict future workload for a specific node.

    Args:
        node_id: The UUID of the target node.
        horizon_minutes: Prediction horizon in minutes.

    Returns:
        Predicted CPU, memory, and network values.

    Raises:
        NodeNotFoundError: If the node doesn't exist.
    """
```

### Testing
- **Framework**: pytest
- **Async**: pytest-asyncio
- **Coverage**: minimum 70% for new code
- **Naming**: `test_<function_name>_<scenario>`

```python
@pytest.mark.asyncio
async def test_register_user_success(db_session):
    """Test successful user registration."""
    ...

@pytest.mark.asyncio
async def test_register_user_duplicate_email(db_session):
    """Test registration fails with duplicate email."""
    ...
```

---

## 3. TypeScript/React Standards (Frontend)

### Version
- TypeScript 5+
- React 19+

### Code Style
- **Linter**: ESLint with TypeScript plugin
- **Formatter**: Prettier (via ESLint)
- **Line Length**: 100 characters

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `ClusterDashboard` |
| Hooks | camelCase with `use` prefix | `useClusterHealth` |
| Utilities | camelCase | `formatBytes` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Types/Interfaces | PascalCase | `ClusterHealth` |
| Files | PascalCase for components | `ClusterDashboard.tsx` |

### Component Pattern
```tsx
// Functional component with TypeScript
interface ClusterCardProps {
  cluster: Cluster;
  onSelect: (id: string) => void;
}

export function ClusterCard({ cluster, onSelect }: ClusterCardProps) {
  return (
    <div
      className="cluster-card"
      onClick={() => onSelect(cluster.id)}
    >
      <h3>{cluster.name}</h3>
      <span>Health: {cluster.healthScore}%</span>
    </div>
  );
}
```

### File Structure per Component
```
components/
└── ClusterCard/
    ├── ClusterCard.tsx        # Component
    ├── ClusterCard.test.tsx   # Tests
    └── index.ts               # Re-export
```

---

## 4. API Design Standards

- Use REST conventions consistently
- Prefix all routes with `/api/v1/`
- Use plural nouns for resource collections
- Return consistent error response format
- Include pagination on list endpoints
- Use UUID for all resource identifiers
- Document all endpoints with OpenAPI docstrings

---

## 5. Database Standards

- Use UUID primary keys (not auto-increment)
- Include `created_at` and `updated_at` on all tables
- Use `TIMESTAMPTZ` for all timestamps
- Use JSONB for flexible/extensible data
- Name foreign keys as `<entity>_id`
- Create indexes for all foreign keys and common query patterns
- Use Alembic for all schema changes (no manual DDL)
