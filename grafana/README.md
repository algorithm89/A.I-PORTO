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

## View logs
1. Go to Grafana → Explore
2. Select **Loki** datasource
3. Use LogQL queries like:
   - `{container_name="ai-backend"}` — Spring Boot logs
   - `{container_name="ai-frontend"}` — Frontend nginx logs
   - `{container_name="ai-ollama"}` — Ollama logs
   - `{container_name=~"ai-.*"}` — All your containers

