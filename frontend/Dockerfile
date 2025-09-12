FROM nginx:alpine

# Copie de la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/nginx.conf

# Copie des fichiers statiques de l’interface dans le dossier servi par Nginx
COPY index.html app.js styles.css service-worker.js manifest.json /usr/share/nginx/html/

# Exposer le port 80 (sera mappé vers 3000 dans docker-compose)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]