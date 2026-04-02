FROM node:18-alpine AS builder
WORKDIR /app
ARG REACT_APP_SUPABASE_URL
ARG REACT_APP_SUPABASE_KEY
ARG REACT_APP_API_URL
ARG REACT_APP_ENCRYPTION_KEY
ARG REACT_APP_SYSTEM_URL
ARG REACT_APP_GOOGLE_MAPS_API_KEY
ARG REACT_APP_AWS_BUCKET
ARG REACT_APP_AWS_REGION
ARG REACT_APP_AWS_ACCESS_KEY_ID
ARG REACT_APP_AWS_SECRET_ACCESS_KEY
ENV REACT_APP_SUPABASE_URL=$REACT_APP_SUPABASE_URL
ENV REACT_APP_SUPABASE_KEY=$REACT_APP_SUPABASE_KEY
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_ENCRYPTION_KEY=$REACT_APP_ENCRYPTION_KEY
ENV REACT_APP_SYSTEM_URL=$REACT_APP_SYSTEM_URL
ENV REACT_APP_GOOGLE_MAPS_API_KEY=$REACT_APP_GOOGLE_MAPS_API_KEY
ENV REACT_APP_AWS_BUCKET=$REACT_APP_AWS_BUCKET
ENV REACT_APP_AWS_REGION=$REACT_APP_AWS_REGION
ENV REACT_APP_AWS_ACCESS_KEY_ID=$REACT_APP_AWS_ACCESS_KEY_ID
ENV REACT_APP_AWS_SECRET_ACCESS_KEY=$REACT_APP_AWS_SECRET_ACCESS_KEY
COPY package.json ./
RUN npm install --legacy-peer-deps && npm install ajv@8.17.1 --save --legacy-peer-deps
COPY . .
ENV NODE_OPTIONS=--max_old_space_size=4096
ENV CI=false
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
RUN chmod -R 755 /usr/share/nginx/html && \
    printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  index index.html;\n\n  location /assets/ {\n    expires 1y;\n    add_header Cache-Control "public, immutable";\n  }\n\n  location /static/ {\n    expires 1y;\n    add_header Cache-Control "public, immutable";\n  }\n\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
