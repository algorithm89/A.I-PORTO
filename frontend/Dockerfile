# ── Build & Serve with Node ──
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm install -g serve
EXPOSE 3000
# SERVE_HOST: "0.0.0.0" for local Docker, "127.0.0.1" for prod (set via docker-compose)
CMD ["sh", "-c", "serve -s dist -l tcp://${SERVE_HOST:-0.0.0.0}:3000"]
