# Grafana + Loki (Logging Stack)

## Overview
- **Grafana** — Dashboard UI at `https://bublikstudios.net/grafana/`
- **Loki** — Log aggregation (receives logs from Docker containers)

## First-time setup on server

```bash
cd ~/A.I-PORTO/grafana

# 1. Start Grafana + Loki
docker compose up -d

# 2. Install Loki Docker log driver (sends container logs to Loki)
docker plugin install grafana/loki-docker-driver:3.5.0 --alias loki --grant-all-permissions

# 3. Configure Docker daemon to use Loki driver
sudo tee /etc/docker/daemon.json <<'EOF'
{
  "log-driver": "loki",
  "log-opts": {
    "loki-url": "http://127.0.0.1:3200/loki/api/v1/push",
    "loki-batch-size": "400"
  }
}
EOF

# 4. Restart Docker (this will restart all containers!)
sudo systemctl restart docker

# 5. Restart all your stacks
docker compose up -d
cd ~/A.I-PORTO && docker compose -f docker-compose.prod.yml up -d
```

## First login
- URL: `https://bublikstudios.net/grafana/`
- Default credentials: `admin` / `admin` (you'll be prompted to change on first login)

## Datasources (auto-provisioned)
Both datasources are wired up automatically on startup — no manual setup needed:

| Datasource | URL | What it collects |
|---|---|---|
| **Prometheus** | `127.0.0.1:9090` | Metrics from Node Exporter, cAdvisor, Spring Boot |
| **Loki** | `127.0.0.1:3200` | Logs from Spring Boot (via Logback appender) |

## Dashboards — run once on server
```bash
cd ~/A.I-PORTO
bash grafana/download-dashboards.sh
```

This downloads and installs 4 dashboards automatically:

| Dashboard | What it shows |
|---|---|
| **Node Exporter Full** | Server CPU, RAM, disk, network |
| **cAdvisor** | Per-container CPU, RAM, restarts |
| **Spring Boot JVM** | Heap, HTTP requests, DB pool, GC |
| **Loki Logs** | All Spring Boot logs with filters |

## View logs in Loki (Explore tab)
```
# All Spring Boot logs
{app="ai-backend"}

# Errors only
{app="ai-backend", level="ERROR"}

# Specific user's requests
{app="ai-backend"} |= "user=admin"

# Auth failures
{app="ai-backend", level="WARN"} |= "JWT auth FAIL"

# Chat service
{app="ai-backend", logger="o.crypto.aiproject.service.ChatService"}
```

