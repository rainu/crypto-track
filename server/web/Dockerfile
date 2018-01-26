FROM node:9-alpine
MAINTAINER rainu <rainu@raysha.de>

ENV CFG_SERVER_ASSET_STATIC "/application/public/"
ENV NODE_ENV "production"

COPY ./dist /application/
WORKDIR /application/

RUN  npm install

EXPOSE 3000
CMD ["node", "/application/application-web.js"]
