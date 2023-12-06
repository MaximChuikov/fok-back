FROM node:18

ARG APP_NAME

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
RUN npx prisma generate
CMD [ "npm", "run", "start", "--name", "${APP_NAME}" ]