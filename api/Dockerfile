FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
COPY node_modules ./node_modules
COPY prisma ./prisma
COPY dist ./dist
COPY nest-cli.json tsconfig.json ./
EXPOSE 3001
CMD ["sh","-c","node dist/main.js"]
