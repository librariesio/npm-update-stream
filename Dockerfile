FROM node:10.16.0-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NODE_ENV production

COPY package.json yarn.lock /usr/src/app/
RUN yarn install --production

COPY . /usr/src/app

CMD node index.js
