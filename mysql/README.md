# 🗄️ BublikStudios — MySQL Setup

This folder contains the `docker-compose.yml` used by the **Deploy MySQL** GitHub Actions workflow.
The workflow runs on your self-hosted runner and deploys MySQL directly on your server.

---

## 🔑 Step 1 — Add Secrets in GitHub

Go to your repo on GitHub:

```
Settings → Secrets and variables → Actions → New repository secret
```

Add these **two secrets**:

| Secret Name | Description | Example |
|---|---|---|
| `MYSQL_ROOT_PASSWORD` | Root password for MySQL (full admin access) | `Sup3rS3cur3R00t!` |
| `MYSQL_USER_PASSWORD` | Password for the `bublik` app user | `AppUs3rP@ss!` |

> ⚠️ Use strong passwords — at least 16 characters, mix of letters, numbers and symbols.  
> ❌ Never commit real passwords to the repo.

---

## 🌍 Step 2 — Set Up the GitHub Environment (SKYNET)

The workflow uses a GitHub **environment** called `SKYNET` for extra protection.

Go to:
```
Settings → Environments → New environment
```

- Name it: `SKYNET`
- *(Optional but recommended)* Add **required reviewers** so deploys need manual approval
- The secrets above can also be scoped to this environment instead of repo-level

---

## 🚀 Step 3 — Run the Workflow

1. Go to **Actions** tab in your GitHub repo
2. Click **Deploy MySQL** on the left
3. Click **Run workflow**
4. Enter your database name (default: `bublikdb`)
5. Click the green **Run workflow** button

---

## 📁 What Gets Deployed

```
/home/bublik/bublik-mysql/
├── docker-compose.yml   ← copied from this folder by the workflow
└── .env                 ← written at runtime, deleted after container starts
```

MySQL data is persisted at:
```
/home/bublik/mysql-data/
```

---

## 🔒 Security Notes

| What | How it's handled |
|---|---|
| Passwords in repo | ❌ Never stored — GitHub Secrets only |
| `.env` file on server | ✅ Deleted automatically after `docker compose up` |
| MySQL port | ✅ Bound to `127.0.0.1:3306` — not exposed to internet |
| App user | ✅ Separate `bublik` user, not root |

---

## ♻️ On Every Server Restart

MySQL data persists in `/home/bublik/mysql-data/` — just re-run the workflow  
or manually run on the server:

```bash
cd /home/bublik/bublik-mysql
docker compose up -d
```

---

## 🧹 Reset Everything (Nuclear Option)

```bash
docker compose down
sudo rm -rf /home/bublik/mysql-data
```

Then re-run the workflow — MySQL will reinitialize with a fresh database.

