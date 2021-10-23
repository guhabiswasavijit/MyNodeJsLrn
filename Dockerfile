FROM node:17-alpine3.14
LABEL maintainer="Avijit GuhaBiswas <guhabiswas.avijit@gmail.com>"
LABEL name="admin/node-client-kafka"

RUN apk add bash\
    && adduser --disabled-password admin \
	&& echo 'admin ALL=(ALL) NOPASSWD:ALL' >>/etc/sudoers
	

USER admin
WORKDIR /home/admin/NodeApps
RUN npm install kafkajs \
	&& npm install fs \
	&& npm install util \
	&& npm install async \
	&& npm install os
	
ENV SHELL=/bin/bash \
	USER=admin
COPY package.json package.json
COPY package-lock.json package-lock.json
COPY kafka-produce.js kafka-produce.js

CMD ["node","kafka-produce.js"]