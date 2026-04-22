# Grafana + Loki + Prometheus (Observability Stack)

## Overview
| Service | Port | Purpose |
|---|---|---|
| **Grafana** | 3100 | Dashboard UI — `https://bublikstudios.net/grafana/` |
| **Loki** | 3200 | Log aggregation |
| **Prometheus** | 9090 | Metrics collection |
| **Node Exporter** | 9100 | Server CPU / RAM / disk / network |
| **cAdvisor** | 9101 | Per-container CPU / RAM / restarts |

---

## How logs get into Loki

Two paths:
1. **Spring Boot** → Logback appender → pushes directly to Loki (port 3200)
2. **All other containers** → Docker Loki log driver → pushes to Loki

---

## First-time setup on server

### Step 1 — Start the stack
```bash
cd ~/A.I-PORTO/grafana
docker compose up -d
docker compose ps   # all should be Up
```

### Step 2 — Install Loki Docker log driver (once ever)
```bash
docker plugin install grafana/loki-docker-driver:3.5.0 --alias loki --grant-all-permissions
```

### Step 3 — Configure Docker daemon to use Loki
```bash
sudo tee /etc/docker/daemon.json <<'EOF'
{
  "log-driver": "loki",
  "log-opts": {
    "loki-url": "http://127.0.0.1:3200/loki/api/v1/push",
    "loki-batch-size": "400"
  }
}
EOF
```

### Step 4 — Restart Docker + all stacks
```bash
sudo systemctl restart docker
cd ~/A.I-PORTO/grafana && docker compose up -d
cd ~/A.I-PORTO && docker compose -f docker-compose.prod.yml up -d
```

### Step 5 — Download dashboards (once ever)
```bash
cd ~/A.I-PORTO
bash grafana/download-dashboards.sh
```

---

## Diagnose "No logs" in Grafana

Run these on the server to find what's broken:

```bash
# 1. Is Loki running and healthy?
curl -s http://127.0.0.1:3200/ready

# 2. Is Spring Boot pushing logs to Loki?
curl -s http://127.0.0.1:3200/loki/api/v1/labels | python3 -m json.tool

# 3. Is Prometheus scraping all targets?
curl -s http://127.0.0.1:9090/api/v1/targets | python3 -m json.tool | grep -E '"health"|"job"'

# 4. Check Loki logs for errors
docker logs ai-loki --tail 30

# 5. Check Spring Boot is sending to Loki (look for loki4j lines)
docker logs ai-backend --tail 50 | grep -i loki
```

**Expected results:**
- Step 1: `ready`
- Step 2: should list labels like `app`, `level`, `logger`
- Step 3: all 4 jobs should show `"health": "up"`
- Step 5: no `ERROR` from loki4j

---

## First login
- URL: `https://bublikstudios.net/grafana/`
- Default credentials: `admin` / `admin` (prompted to change on first login)

---

## Datasources (auto-provisioned — no manual setup)
| Datasource | URL | What it collects |
|---|---|---|
| **Loki** | `127.0.0.1:3200` | Spring Boot logs + all container logs |
| **Prometheus** | `127.0.0.1:9090` | System + container + JVM metrics |

---

## Dashboards
| Dashboard | Datasource | What it shows |
|---|---|---|
| **Node Exporter Full** | Prometheus | Server CPU, RAM, disk, network |
| **cAdvisor** | Prometheus | Per-container CPU, RAM, restarts |
| **Spring Boot JVM** | Prometheus | Heap, HTTP requests, DB pool, GC |
| **Loki Logs** | Loki | Structured Spring Boot logs |

---

## Useful Loki queries (Explore tab)
```logql
# All Spring Boot logs
{app="ai-backend"}

# Errors only
{app="ai-backend", level="ERROR"}

# Specific user's requests
{app="ai-backend"} |= "user=admin"

# Auth failures
{app="ai-backend", level="WARN"} |= "JWT auth FAIL"

# Chat service only
{app="ai-backend", logger="o.crypto.aiproject.service.ChatService"}

# All containers (via Docker log driver)
{container_name=~"ai-.*"}
```
