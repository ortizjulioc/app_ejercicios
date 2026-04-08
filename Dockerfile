# Cambia la línea 2 de: FROM node:18-alpine AS build
# A esta:
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Producción (Esta se queda igual)
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3005 
CMD ["nginx", "-g", "daemon off;"]