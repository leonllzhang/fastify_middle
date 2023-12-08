FROM node:18.15.0
COPY ./ /app
WORKDIR /app
RUN npm install && npm run build
COPY ./appsettings.yaml /app/dist

FROM nginx
RUN mkdir /app
COPY --from=0 /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf