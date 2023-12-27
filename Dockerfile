FROM node:18
WORKDIR /app
COPY . .

RUN apt-get update
RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

RUN yarn install
RUN yarn build
CMD [ "npm", "start" ]
