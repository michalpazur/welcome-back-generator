FROM node:18-alpine
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn build
CMD [ "node", "dist/index.js" ]
