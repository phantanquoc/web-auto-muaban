FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY node_modules ./node_modules
COPY .next ./.next
COPY next.config.js postcss.config.js tailwind.config.js tsconfig.json ./
EXPOSE 3000
CMD ["npm","run","start"]
