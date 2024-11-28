FROM node:22-slim
RUN mkdir -p /app && chown -R node:node /app
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
CMD ["node","index.js"]
