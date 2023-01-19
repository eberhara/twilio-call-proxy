FROM node:16-alpine

# update packages
RUN apk update

# create root application folder
WORKDIR /app

# copy configs to /app folder
COPY package*.json ./

# install dependencies
RUN npm install

# copy tsc configs to /app folder
COPY tsconfig*.json ./

# copy source code to /app/src folder
COPY src /app/src

# check files list
RUN ls -a

# build 
RUN npm run build

EXPOSE 8999

CMD [ "npm", "run", "start:prod" ]