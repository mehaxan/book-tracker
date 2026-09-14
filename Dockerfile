# Lightweight Production Nginx Container
FROM nginx:alpine

# Copy pre-compiled Vite production bundle
COPY dist /usr/share/nginx/html

# Copy custom reverse-proxy config for book.mehaxan.com
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
