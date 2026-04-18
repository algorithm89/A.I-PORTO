# 🚀 BublikStudios — AI Portfolio & Blog Platform

A full-stack AI-powered portfolio site with blog, tutorials, chatbot, and admin panel.

**Live:** [https://bublikstudios.net](https://bublikstudios.net)

---

## 🏗️ Architecture

```
Internet → CDN (SSL) → Nginx (port 80)
                          ├── /           → Frontend  (React/Vite, nginx on :3000)
                          ├── /api/       → Backend   (Spring Boot on :8080)
                          ├── /api/chat   → AI Chat   (SSE streaming)
                          └── /vault/     → Vault UI  (HashiCorp on :8200)

Portainer → https://<server-ip>:9443 (direct access)
Ollama    → 127.0.0.1:11434 (internal only)
MySQL     → 127.0.0.1:3306  (internal only)
```

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, React Router |
| Backend | Spring Boot 3.5, Java 21, Spring Security |
| Database | MySQL 8 |
| AI Chat | Ollama (llama3.2:3b) via SSE streaming |
| Auth | JWT (stateless, BCrypt passwords) |
| Email | Mailtrap SDK (registration confirmation) |
| Secrets | HashiCorp Vault (KV v2) |
| Reverse Proxy | Nginx |
| Containers | Docker, Docker Compose |
| CI/CD | GitHub Actions (self-hosted runner) |
| Monitoring | Portainer CE |

---

## 📁 Project Structure

```
├── .github/workflows/
│   ├── deploy.yml              ← Main CI/CD pipeline (auto on push)
│   └── deploy-portainer.yml    ← Portainer pipeline (manual trigger)
│
├── src/                        ← Spring Boot backend
│   └── main/java/org/crypto/aiproject/
│       ├── config/             ← Vault logger, DataInitializer
│       ├── controller/         ← AuthController, AdminController, ChatController
│       ├── dto/                ← LoginRequest, RegistrationRequest
│       ├── entity/             ← User entity (JPA)
│       ├── repository/         ← UserRepository
│       ├── security/           ← SecurityConfig, JwtFilter, JwtUtil
│       └── service/            ← UserService, EmailService, ChatService
│
├── frontend/                   ← React SPA
│   ├── src/components/         ← Hero, ChatBot, AdminPanel, CartoonBelt, etc.
│   ├── src/pages/              ← BlogPage, TutorialsPage
│   ├── Dockerfile              ← Multi-stage: Node build → nginx serve
│   └── nginx.conf              ← Frontend nginx (port 3000, gzip, caching)
│
├── mysql/                      ← MySQL docker-compose + deploy docs
├── vault/                      ← Vault config, unseal script, deploy docs
├── portainer/                  ← Portainer docker-compose + deploy docs
│
├── docker-compose.yml          ← Local dev (Windows)
├── docker-compose.prod.yml     ← Production (Linux server)
├── nginx.conf                  ← Main reverse proxy config
├── Dockerfile                  ← Backend multi-stage: Maven build → JRE run
└── deploy.sh                   ← Manual deploy script (alternative to CI/CD)
```

---

## 🔑 Secrets & Security

**Zero secrets in the repo.** Everything sensitive comes from HashiCorp Vault at runtime:

| Secret | Source |
|--------|--------|
| `spring.datasource.password` | Vault `secret/ai-backend` |
| `jwt.secret` | Vault `secret/ai-backend` |
| `mailtrap.token` | Vault `secret/ai-backend` |
| `VAULT_TOKEN` | `.env` file (gitignored) / GitHub Secret |

See [`vault/README.md`](vault/README.md) for full Vault setup instructions.

---

## 💻 Local Development (Windows)

### Prerequisites
- Java 21 (Eclipse Temurin)
- Node.js 22+
- Docker Desktop
- IntelliJ IDEA (recommended)

### 1. Set the Vault token

Create a `.env` file in the project root:
```
VAULT_TOKEN=hvs.your_vault_token_here
```

Or set it in IntelliJ: **Run → Edit Configurations → Environment Variables**:
```
VAULT_TOKEN=hvs.your_vault_token_here
```

### 2. Run the backend (IntelliJ)

Open the project, run `Application.java`. Uses `application.properties` (dev profile).

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173` with hot reload.

### 4. Or use Docker Compose (local)

```bash
docker compose up --build -d
```

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:3000`

---

## 🐧 Production Deployment (Linux Server)

### First-time server setup

```bash
# 1. Set up MySQL (see mysql/README.md)
cd mysql && docker compose up -d

# 2. Set up Vault (see vault/README.md)
cd vault && docker compose up -d
# Then: init, unseal, add secrets

# 3. Set up Portainer (see portainer/README.md)
cd portainer && docker compose up -d

# 4. Create .env with your Vault token
echo "VAULT_TOKEN=hvs.your_token" > .env

# 5. Deploy the app
bash deploy.sh
```

### Subsequent deploys

**Automatic (recommended):** Push to `master` → GitHub Actions deploys automatically.

**Manual:** Go to GitHub → Actions → Deploy to Production → Run workflow.

See [CI/CD Pipeline](#-cicd-pipeline) below for details.

---

## 🔄 CI/CD Pipeline

### `deploy.yml` — Main pipeline

| Trigger | What happens |
|---------|-------------|
| Push to `master` | Detects changed files, rebuilds only what changed |
| Manual (Run workflow) | Rebuilds everything (backend + frontend + infra) |

**Change detection:**

| Files changed | What rebuilds |
|--------------|--------------|
| `src/**`, `pom.xml`, `Dockerfile` | Backend only |
| `frontend/**` | Frontend only |
| `docker-compose.prod.yml`, `nginx.conf` | All services |

**GitHub Secrets required:**

| Secret | Description |
|--------|-------------|
| `VAULT_TOKEN` | HashiCorp Vault access token |
| `PORTAINER_ADMIN_PASSWORD` | Portainer admin password (first boot) |

### `deploy-portainer.yml` — Portainer pipeline

Manual trigger only. Pulls latest Portainer image and deploys.

---

## 🌐 API Endpoints

### Auth (`/api/auth/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/confirm` | Public | Confirm email token |

### Chat (`/api/chat`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/chat` | Public | AI chat (SSE streaming) |

### Admin (`/api/admin/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/users` | ADMIN | List all users |
| DELETE | `/api/admin/users/{id}` | ADMIN | Delete user |

### Using JWT in Postman
1. POST `/api/auth/login` with `{"username":"...", "password":"..."}`
2. Copy the `token` from response
3. Add header: `Authorization: Bearer <token>`

---

## 🗄️ Infrastructure READMEs

| Component | Docs |
|-----------|------|
| MySQL | [`mysql/README.md`](mysql/README.md) |
| Vault | [`vault/README.md`](vault/README.md) |
| Portainer | [`portainer/README.md`](portainer/README.md) |

---

## 🔓 Vault — Quick Reference

```bash
# Unseal after server restart (enter 3 of 5 keys)
bash vault/unseal.sh

# Login
docker exec -it bublik-vault vault login

# View secrets
docker exec -it bublik-vault vault kv get secret/ai-backend

# Update a secret
docker exec -it bublik-vault vault kv patch secret/ai-backend \
  jwt.secret="NEW_VALUE"

# Revoke a token
docker exec -it bublik-vault vault token revoke <TOKEN>

# Generate new root token (needs 3 unseal keys)
docker exec -it bublik-vault vault operator generate-root -init
```

---

## 🧹 Useful Commands

```bash
# === Logs ===
docker logs ai-backend --tail 50 -f
docker logs ai-frontend --tail 20
docker logs ai-ollama --tail 20

# === Restart a service ===
docker rm -f ai-backend && docker compose -f docker-compose.prod.yml up --build -d --no-deps backend

# === MySQL shell ===
docker exec -it ai-mysql mysql -u bublik -p bublikstd

# === Check all containers ===
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# === Clean up Docker (free disk space) ===
docker system prune -af --volumes
```

---

## 🔒 Server Security Checklist

| Check | Status |
|-------|--------|
| Secrets in repo | ✅ None — all from Vault |
| Vault port (8200) | ✅ `127.0.0.1` only |
| MySQL port (3306) | ✅ `127.0.0.1` only |
| Ollama port (11434) | ✅ `127.0.0.1` only |
| Spring Boot (8080) | ✅ `127.0.0.1` only, behind nginx |
| Frontend (3000) | ✅ Behind nginx |
| Portainer (9443) | ⚠️ Open — restrict by IP if needed |
| SSL | ✅ CDN handles HTTPS → nginx on port 80 |
| `.env` files | ✅ Gitignored, deleted after pipeline |
| Vault startup logs | ✅ Secrets fully masked |

