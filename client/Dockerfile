FROM node:20-alpine as base
RUN apk add --no-cache g++ make py3-pip libc6-compat && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001
WORKDIR /home/node/app
COPY package*.json ./
EXPOSE 3000

FROM base as builder
WORKDIR /home/node/app
COPY . .
RUN npm run build


FROM base as production
WORKDIR /home/node/app

ENV NODE_ENV=production
RUN npm ci

COPY --from=builder --chown=nextjs:nodejs /home/node/app/.next ./.next
COPY --from=builder /home/node/app/node_modules ./node_modules
COPY --from=builder /home/node/app/package.json ./package.json
COPY --from=builder /home/node/app/public ./public

CMD npm start

FROM base as dev
ENV NODE_ENV=development
RUN npm install 
COPY . .
CMD npm run dev