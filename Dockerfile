FROM node:14-alpine

WORKDIR /dns-updater

ADD . .

RUN npm ci

CMD node index.js
