FROM node:18.15.0

WORKDIR /servers

COPY . .

RUN npm i --registry=https://registry.npm.taobao.org

EXPOSE 7788

CMD ["npm", "run", "start"]