const resolve = require('path').resolve;
const pact = require('@pact-foundation/pact-node');

const { publishPacts } = pact;
const gitHash = require('child_process')
    .execSync('git rev-parse --short HEAD')
    .toString().trim();

const pactBrokerUrl = 'https://{YOUR_DOMAIN}.pactflow.io'; // your pactflow url, usually it is {YOUR_DOMAIN}.pact.io

const opts = {
  pactFilesOrDirs: [resolve(process.cwd(), 'pacts')],
  pactBroker: pactBrokerUrl,
  pactBrokerToken: '', // copy the API token and put it here
  tags: ['prod', 'test'],
  consumerVersion: gitHash,
};

publishPacts(opts).catch((e) => {
  console.error(`Pact contract publishing failed at ${pactBrokerUrl}: `, e);
});
