# ---------- Step 1: Build Vite frontend ----------
FROM node:22 AS build-frontend

WORKDIR /app/frontend/ui

# Install and build Vite app
COPY frontend/ui/package*.json ./
RUN npm install
COPY frontend/ui ./
RUN npm run build

# ---------- Step 2: Run Node.js backend ----------
FROM node:22

WORKDIR /app

# Copy backend source
COPY package*.json ./
RUN npm install
COPY . .

# (Optional) Copy built frontend (if you later want to serve it)
# COPY --from=build-frontend /app/frontend/ui/dist ./public

EXPOSE 5000

CMD ["node", "index.js"]
