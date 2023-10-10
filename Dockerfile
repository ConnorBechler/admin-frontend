FROM node:16 as build-stage

# install dependencies
WORKDIR /opt/app
COPY ./package.json ./yarn.lock ./
RUN yarn install

COPY ./*.js ./
COPY ./public/ ./public
COPY ./src/ ./src

RUN yarn build

FROM nginx:latest as production-stage

COPY --from=build-stage /opt/app/dist /usr/share/nginx/html
COPY ./default.tmpl /etc/nginx/conf.d/default.tmpl

CMD /bin/bash -c "envsubst '\$VUE_APP_API_BASE_URL' < /etc/nginx/conf.d/default.tmpl > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
