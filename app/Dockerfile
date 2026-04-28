FROM node:24-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install 

COPY tsconfig*.json ./
COPY src ./src
COPY uploads ./uploads

RUN chown -R node:node /usr/src/app

USER node

EXPOSE 3000

CMD ["npm", "run", "dev"]
