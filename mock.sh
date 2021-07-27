#!/usr/bin/env bash
OLD_IFS=$IFS; IFS=$'\n'; for x in `grep -v '^#.*' .env`; do export $x; done; IFS=$OLD_IFS

node node_modules/@proscom/graphql-faker/dist/index.js \
  --override \
  --forward-headers Authorization \
  --extend "http://${APP_HOST}:${APP_PORT}/graphql" \
  --port ${GRAPHQL_FAKER_PORT} \
  ./mock.graphql
