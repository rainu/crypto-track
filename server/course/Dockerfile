FROM node:9-alpine
MAINTAINER rainu <rainu@raysha.de>

ENV NODE_ENV "production"

COPY ./dist /application/
WORKDIR /application/

RUN npm install

CMD [ "node", "/application/application-course.js" ]
