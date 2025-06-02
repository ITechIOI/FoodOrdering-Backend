# ========================
# 🔨 Build stage
# ========================
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Cài dependency
COPY package*.json ./
RUN npm install

# Copy toàn bộ source code
COPY . .

# Build NestJS
RUN npm run build


# ========================
# 🚀 Production stage
# ========================
FROM node:20-alpine

WORKDIR /usr/src/app

# Biến môi trường
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# 👉 Copy build output
COPY --from=build /usr/src/app/dist ./dist

# 👉 Copy cấu hình app và file cần thiết
COPY package*.json ./

# 👉 Copy file TLS cert (ví dụ ca.pem)
COPY src/resources/ca.pem ./src/resources/ca.pem

# Cài dependency production only
RUN npm install --only=production

# Dọn sạch file không cần thiết
RUN rm package*.json

EXPOSE 3001

# Chạy app
CMD ["node", "dist/main.js"]
