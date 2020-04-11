FROM node:12.13.0-alpine

RUN apk add --no-cache git curl

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . ./

RUN npm run build

CMD ["npm", "run", "start:prod"]
