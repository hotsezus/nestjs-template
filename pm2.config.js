require('dotenv').config();

const { tryNumber } = require('@proscom/ui-utils');

const project = process.env.PM2_PROJECT_NAME || '';
const apiInstances = +process.env.PM2_API_CLUSTER_SIZE || 1;
const schedulerInstances = +process.env.PM2_SCHEDULER_CLUSTER_SIZE || 1;
const workerInstances = +process.env.PM2_WORKER_CLUSTER_SIZE || 1;
const uid = +process.env.PM2_UID || undefined;
const gid = +process.env.PM2_GID || undefined;

const appPort = tryNumber(process.env.APP_PORT, 5000);
const appHost = process.env.APP_HOST || 'localhost';
const fakerEnable = process.env.GRAPHQL_FAKER_ENABLE === 'true';
const fakerPort = tryNumber(process.env.GRAPHQL_FAKER_PORT, 5001);

const appName = (name) => (project ? `${project}_${name}` : name);

console.log(
  `Using parameters: project=${project} (api=${apiInstances}, scheduler=${schedulerInstances}, worker=${workerInstances}) uid=${uid} gid=${gid}`,
);

const appConfig = ({ script, name, instances }) =>
  instances > 0 && {
    name: appName(name),
    script,
    env: {
      NODE_ENV: 'production',
    },
    out_file: `storage/logs/${name}.log`,
    error_file: `storage/logs/${name}-error.log`,
    combine_logs: true,
    log_type: 'json',
    log_date_format: 'YYYY-MM-DDTHH:mm:ssZ',
    instances,
    uid,
    gid,
  };

module.exports = {
  apps: [
    appConfig({
      script: 'dist/bin/api.js',
      name: 'api',
      instances: apiInstances,
    }),
    appConfig({
      script: 'dist/bin/scheduler.js',
      name: 'scheduler',
      instances: schedulerInstances,
    }),
    appConfig({
      script: 'dist/bin/worker.js',
      name: 'worker',
      instances: workerInstances,
    }),
    fakerEnable &&
      appConfig({
        script: `graphql-faker --override --forward-headers Authorization --extend "http://${appHost}:${appPort}/graphql" --port ${fakerPort} ./mock.graphql`,
        name: 'faker',
      }),
  ].filter(Boolean),
};
