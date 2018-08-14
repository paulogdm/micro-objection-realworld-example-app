FROM mhart/alpine-node:10 as base
WORKDIR /usr/src
COPY package.json /usr/src
RUN yarn --production
COPY . .

FROM mhart/alpine-node:base-10
WORKDIR /usr/src
ENV NODE_ENV="development"
COPY --from=base /usr/src .
CMD ["node", "./node_modules/.bin/micro", "src/index.js"]
EXPOSE 3000
