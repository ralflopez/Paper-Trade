# syntax=docker/dockerfile:1

FROM node:14.15.5-alpine3.13

# ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm ci

COPY . .

RUN npm run schema:generate

RUN npm run build

CMD ["node", "dist/src/index.js"]