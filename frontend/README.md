# 🎨 BublikStudios — Frontend

React 19 + Vite 7 SPA served by nginx:alpine in production.

---

## 🏗️ Tech Stack

| Tech | Purpose |
|------|---------|
| React 19 | UI framework |
| Vite 7 | Build tool + dev server |
| React Router 7 | Client-side routing |
| nginx:alpine | Production static file server (gzip, caching) |

---

## 📁 Structure

```
frontend/
├── src/
│   ├── App.jsx                ← Main app with routes
│   ├── main.jsx               ← Entry point
│   ├── assets/                ← Images (PIC1–PIC25, LOGO)
│   ├── components/
│   │   ├── Hero.jsx           ← Landing hero with water ripple effect
│   │   ├── ChatBot.jsx        ← AI chatbot (SSE streaming to Ollama)
│   │   ├── LoginForm.jsx      ← JWT login
│   │   ├── RegisterForm.jsx   ← Registration with email confirmation
│   │   ├── AdminPanel.jsx     ← Admin user management
│   │   ├── CategoryCards.jsx  ← Explore section cards
│   │   ├── StoriesSection.jsx ← Featured stories grid
│   │   ├── CartoonBelt.jsx    ← Favourite animations belt
│   │   ├── AISection.jsx      ← AI & Animation learning roadmap
│   │   ├── Header.jsx         ← Navigation bar
│   │   ├── Footer.jsx         ← Site footer
│   │   ├── TronGrid.jsx       ← Animated background grid
│   │   ├── HexGrid.jsx        ← Hex pattern background
│   │   ├── TriGrid3D.jsx      ← 3D triangle grid effect
│   │   └── WaterRipple.jsx    ← Canvas water ripple effect
│   └── pages/
│       ├── BlogPage.jsx       ← Inner Compass blog
│       └── TutorialsPage.jsx  ← MLOps / AI tutorials
├── Dockerfile                 ← Multi-stage: Node build → nginx serve
├── nginx.conf                 ← nginx config (port 3000, gzip, caching)
└── package.json
```

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start dev server (hot reload)
npm run dev
```

Opens at `http://localhost:5173`.

The dev server proxies `/api` requests to the backend — configure in `vite.config.js` if needed.

---

## 🐳 Docker

### Local

```bash
# From project root
docker compose up --build -d frontend
# → http://localhost:3000
```

### Production

Built and deployed automatically by the CI/CD pipeline. The Dockerfile:

1. **Stage 1 (Node):** `npm ci` + `npm run build` → produces `dist/`
2. **Stage 2 (nginx:alpine):** copies `dist/` + `nginx.conf` → serves on port 3000

Features in production:
- **gzip compression** — JS/CSS compressed for fast mobile loading
- **Cache headers** — static assets cached for 1 year (`immutable`)
- **React Router** — all routes fall back to `index.html`

---

## 🔗 API Integration

The frontend talks to the backend through the main nginx reverse proxy:

| Frontend calls | nginx routes to |
|---------------|----------------|
| `/api/auth/login` | Spring Boot `:8080` |
| `/api/auth/register` | Spring Boot `:8080` |
| `/api/chat` | Spring Boot `:8080` (SSE stream) |
| `/api/admin/users` | Spring Boot `:8080` |

No CORS issues — everything goes through the same domain.

---

## 🛠️ Build for production (manual)

```bash
npm run build    # → dist/
npm run preview  # Preview the production build locally
```
