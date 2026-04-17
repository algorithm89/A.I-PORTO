# 🐳 BublikStudios — Portainer

Container management UI — deployed separately from the main app.
Accessible directly at `https://<server-ip>:9443` (built-in HTTPS).

---

## 🚀 Deploy

### Via GitHub Actions (recommended)

1. Go to **Actions** tab in your GitHub repo
2. Click **Deploy Portainer** on the left
3. Click **Run workflow**

### Manual (on server)

```bash
cd portainer
bash deploy.sh
```

---

## 📁 What Gets Deployed

```
/home/bublik/bublik-portainer/
└── docker-compose.yml   ← copied from this folder by the workflow
```

Portainer data is persisted in a Docker volume (`portainer_data`).

---

## 🌐 Access

| Where | URL |
|-------|-----|
| Direct | `https://<server-ip>:9443` |

### First-time setup
On first launch, Portainer asks you to create an admin password at the web UI.
Or the CI/CD pipeline creates it automatically via `PORTAINER_ADMIN_PASSWORD` GitHub Secret.

---

## 📊 Viewing Container Logs

1. Login to Portainer
2. Click **Local** environment
3. Click **Containers**
4. Click any container (e.g. `ai-backend`)
5. Click the **Logs** icon (📋)

All containers write to stdout/stderr → Docker captures them → Portainer reads via the Docker socket. **No configuration needed.**

---

## 🔒 Security

| What | How it's handled |
|------|------------------|
| HTTPS | Built-in self-signed cert on port 9443 |
| Docker socket | Mounted for container management |
| Access | Direct IP:9443 — restrict by firewall if needed |

---

## 🧹 Commands (on server)

```bash
# Start / redeploy
cd /home/bublik/bublik-portainer && docker compose up -d

# Upgrade to latest version
docker compose pull && docker compose up -d

# View logs
docker logs ai-portainer -f

# Stop
docker compose down

# Reset admin password (loses all Portainer settings)
docker compose down -v && docker compose up -d
```

---

## 🔑 GitHub Secrets

| Secret | Description |
|--------|-------------|
| `PORTAINER_ADMIN_PASSWORD` | Admin password (used on first boot only) |
