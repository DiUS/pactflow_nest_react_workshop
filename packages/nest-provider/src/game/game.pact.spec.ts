const { Verifier, VerifierOptions } = require('@pact-foundation/pact');
const path = require('path');
const { bootstrap } = require('../main');

// Setup provider server to verify
let app;
(async() => {
  app = await bootstrap(4000);
})();

const opts: typeof VerifierOptions = {
  // logLevel: 'info',
  // providerBaseUrl: 'http://localhost:5000',
  // provider: 'NestProvider',
  // providerVersion: '1.0.0',
  // pactUrls: [
  //     path.resolve(__dirname, '../../../react-consumer/pacts/reactconsumermatt-nestprovidermatt.json')
  // ]
  logLevel: 'info',
  provider: 'NestProviderMatt',
  providerBaseUrl: 'http://localhost:4000',
  pactBrokerUrl: 'https://brighte.pactflow.io',
  pactBrokerToken: '#PUT_MY_TOKEN', // Load the real Pactflow API token (read-only)
  publishVerificationResult: process.env.CI === 'true',
  providerVersion: process.env.GIT_COMMIT || '1.0.0',
};

describe('Pact Verification', () => {
    it('validates the expectations of ProductService', () => {
        if (process.env.CI || process.env.PACT_PUBLISH_RESULTS) {
            Object.assign(opts, {
                publishVerificationResult: true,
            });
        }
        return new Verifier(opts).verifyProvider().then(output => {
          console.log(output);
        }).finally(() => {
          app.close();
        });
    })
});
