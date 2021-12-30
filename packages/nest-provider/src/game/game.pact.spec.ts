const { Verifier, VerifierOptions } = require('@pact-foundation/pact');
const path = require('path');
const { bootstrap } = require('../main');

// Setup provider server to verify
let app;
(async() => {
  app = await bootstrap(3999);
})();

const opts: typeof VerifierOptions = {
  logLevel: 'info',
  providerBaseUrl: 'http://localhost:3999',
  provider: 'YOUR_PROVIDER',
  providerVersion: '1.0.0',
  pactUrls: [
      path.resolve(__dirname, '../../../react-consumer/pacts/your_consumer-your_provider.json')
  ]
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
