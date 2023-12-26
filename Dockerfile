FROM node:18-alpine
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn build
CMD [ "npm", "NODE_ENV=production", "dist/index.js" ]
