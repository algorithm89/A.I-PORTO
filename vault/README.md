# 🔐 BublikStudios — HashiCorp Vault Setup

Vault stores all your secrets (DB passwords, JWT keys, API tokens).  
Your Spring Boot app reads from Vault at startup — **nothing sensitive is ever in the repo**.

---

## 📁 Step 1 — Create Persistence Folders on the Server

Run this **once** on your Linux server before anything else.  
These folders keep your Vault data alive across container restarts.

```bash
mkdir -p /home/bublik/vault-data
mkdir -p /home/bublik/vault-logs
chmod 700 /home/bublik/vault-data
chmod 700 /home/bublik/vault-logs
```

> ⚠️ Without these folders, all your secrets are lost every time the container restarts.

---

## 🐳 Step 2 — Start the Vault Container

From your project root on the server:

```bash
cd /home/bublik/your-project/vault
docker compose up -d vault
```

Check it started:
```bash
docker ps | grep bublik-vault
```

---

## 🔑 Step 3 — Initialize Vault (FIRST TIME ONLY)

> **Only do this once.** If you do it again you will generate new keys and lose access to old secrets.

```bash
docker exec -it bublik-vault vault operator init \
  -key-shares=5 \
  -key-threshold=3 \
  -format=json > vault-init.json

cat vault-init.json
```

This gives you:
- **5 unseal keys** — you need any 3 to unseal
- **1 root token** — full admin access

### 🚨 SAVE THESE IMMEDIATELY

Copy the output and store it in your **password manager** (Bitwarden, 1Password, etc).  
Then delete the file from the server:

```bash
# Save the content first, then:
rm -f vault-init.json
```

> ❌ Never commit `vault-init.json` to Git.  
> ❌ Never leave it on the server.

---

## 🔓 Step 4 — Unseal Vault (After Every Restart)

Vault is always **sealed** after a restart. Run the unseal script and enter 3 of your 5 keys:

```bash
bash vault/unseal.sh
```

You will be prompted for 3 keys one at a time (input is hidden).  
At the end you will see `Sealed: false` confirming it worked.

---

## 🗝️ Step 5 — Put Your Secrets Into Vault (Manually)

First, log in with your root token:

```bash
docker exec -it bublik-vault vault login
# paste your root token when prompted
```

Enable the KV secrets engine (first time only):

```bash
docker exec -it bublik-vault vault secrets enable -path=secret kv-v2
```

Now add all your secrets in one command:

```bash
docker exec -it bublik-vault vault kv put secret/bublikstudios \
  SPRING_DATASOURCE_URL="jdbc:mysql://db:3306/bublikstd?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true" \
  SPRING_DATASOURCE_USERNAME="bublik" \
  SPRING_DATASOURCE_PASSWORD="YOUR_DB_PASSWORD" \
  MAILTRAP_TOKEN="YOUR_MAILTRAP_TOKEN" \
  MAILTRAP_FROM_EMAIL="mail@bublikstudios.net" \
  MAILTRAP_FROM_NAME="BublikStudios" \
  JWT_SECRET="YOUR_JWT_SECRET_BASE64" \
  JWT_EXPIRATION_MS="86400000" \
  APP_BASE_URL="https://bublikstudios.net" \
  APP_FRONTEND_URL="https://bublikstudios.net"
```

Verify the secrets were saved:

```bash
docker exec -it bublik-vault vault kv get secret/bublikstudios
```

---

## ✏️ Updating a Single Secret

You don't need to re-enter all secrets. Just patch the one you want to change:

```bash
docker exec -it bublik-vault vault kv patch secret/bublikstudios \
  MAILTRAP_TOKEN="NEW_TOKEN_HERE"
```

---

## 🔄 Every Time the Server Restarts

Vault data is persisted in `/home/bublik/vault-data/` but Vault always starts **sealed**.  
Your workflow is:

```
1. Server boots
2. docker compose up -d          ← starts all containers (Vault starts sealed)
3. bash vault/unseal.sh          ← enter 3 keys to unseal
4. App can now read secrets ✅
```

---

## 🗂️ Folder Structure on the Server

```
/home/bublik/
├── vault-data/          ← Vault encrypted storage (NEVER delete this)
├── vault-logs/          ← Vault logs
├── mysql-data/          ← MySQL database files
└── bublik-mysql/        ← MySQL docker-compose + .env (runtime only)
```

---

## 🔒 Security Summary

| What | How it's protected |
|---|---|
| Unseal keys | Stored only in your password manager |
| Root token | Stored only in your password manager |
| Secrets at rest | AES-256 encrypted by Vault |
| Vault port (8200) | Bound to `127.0.0.1` — not exposed to internet |
| `.env` files | Written at deploy time, deleted immediately after |
| Repo | Zero secrets — all values come from Vault at runtime |

