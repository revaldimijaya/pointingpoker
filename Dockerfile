FROM node:14.20.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .