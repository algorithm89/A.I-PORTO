# 🐳 BublikStudios — Portainer

Container management UI — deployed separately from the main app via its own GitHub Actions pipeline.
Accessible at `https://bublikstudios.net/portainer/` — no extra subdomain needed.

---

## 🚀 Deploy via GitHub Actions

1. Go to **Actions** tab in your GitHub repo
2. Click **Deploy Portainer** on the left
3. Click **Run workflow**
4. Click the green **Run workflow** button

That's it — the pipeline pulls the latest image and starts Portainer on your server.

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
| Local (on server) | `http://localhost:9000/portainer/` |
| Production (SSL) | `https://bublikstudios.net/portainer/` |

### First-time setup
On first launch, Portainer asks you to create an admin password at the web UI.

---

## 🔒 Security

| What | How it's handled |
|------|------------------|
| Port binding | `127.0.0.1:9000` — not exposed to internet |
| SSL access | Via nginx reverse proxy at `/portainer/` |
| Docker socket | Mounted read/write for container management |

---

## 🧹 Manual Commands (on server)

```bash
# Start / redeploy
cd /home/bublik/bublik-portainer
docker compose up -d

# Upgrade to latest version
docker compose pull && docker compose up -d

# View logs
docker logs ai-portainer -f

# Stop
docker compose down

# Reset everything (loses admin password)
docker compose down -v
```
