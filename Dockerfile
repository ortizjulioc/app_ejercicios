# Etapa 1: Construcción
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:stable-alpine
# Copia los archivos construidos desde la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html
# Copia una configuración básica de Nginx para manejar rutas de SPA
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3005
CMD ["nginx", "-g", "daemon off;"]