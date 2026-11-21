FROM node:22-alpine
LABEL org.opencontainers.image.title="Concrete Contractors Estimator" \
      org.opencontainers.image.description="Concrete calculator web app and JSON API: cubic yards, bag counts, rebar, rough cost and hot-weather pour advice" \
      org.opencontainers.image.source="https://github.com/nbkdevs/concrete-contractors-phoenix" \
      org.opencontainers.image.url="https://concretecontractorsphoenix.net/" \
      org.opencontainers.image.documentation="https://github.com/nbkdevs/concrete-contractors-phoenix/tree/main/packages/docker" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.vendor="Phoenix Concrete Contractors" \
      org.opencontainers.image.version="1.0.1"
WORKDIR /app
COPY package.json server.js ./
COPY lib ./lib
COPY public ./public
ENV NODE_ENV=production PORT=8080
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
CMD ["node", "server.js"]
