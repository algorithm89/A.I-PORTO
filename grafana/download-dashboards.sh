#!/bin/bash
# ── Download Grafana dashboard JSONs for auto-provisioning ──
# Run this ONCE on the server after first deploy:
#   bash grafana/download-dashboards.sh

set -e

DASH_DIR="$(dirname "$0")/provisioning/dashboards"
mkdir -p "$DASH_DIR"

echo "Downloading dashboards..."

# ── Node Exporter Full (server CPU / RAM / disk / network) ──
curl -sL "https://grafana.com/api/dashboards/1860/revisions/latest/download" \
  | sed 's/${DS_PROMETHEUS}/Prometheus/g' \
  > "$DASH_DIR/node-exporter.json"
echo "✅  node-exporter.json"

# ── cAdvisor Container Metrics ──
curl -sL "https://grafana.com/api/dashboards/14282/revisions/latest/download" \
  | sed 's/${DS_PROMETHEUS}/Prometheus/g' \
  > "$DASH_DIR/cadvisor.json"
echo "✅  cadvisor.json"

# ── Spring Boot JVM + HTTP metrics ──
curl -sL "https://grafana.com/api/dashboards/12900/revisions/latest/download" \
  | sed 's/${DS_PROMETHEUS}/Prometheus/g' \
  > "$DASH_DIR/spring-boot.json"
echo "✅  spring-boot.json"

# ── Loki Logs dashboard ──
curl -sL "https://grafana.com/api/dashboards/13639/revisions/latest/download" \
  | sed 's/${DS_LOKI}/Loki/g' \
  > "$DASH_DIR/loki-logs.json"
echo "✅  loki-logs.json"

echo ""
echo "All dashboards downloaded. Restarting Grafana to load them..."
docker restart ai-grafana
echo "Done! Visit https://bublikstudios.net/grafana/ → Dashboards"

