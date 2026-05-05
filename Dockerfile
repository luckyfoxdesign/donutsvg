FROM node:22-alpine
RUN apk add --no-cache bash && npm install -g vercel
WORKDIR /donutsvg
