# Pactflow Workshop

## Introduction
This workshop is aimed at demonstrating core features and benefits of contract testing with Pactflow and contract testing.

This workshop should take from 1 to 2 hours, depending on how deep you want to go into each topic.And it is fully self-driven so you can just follow each step to finish it at your pace.

**Workshop outline**
- [Step 1: Setup environment](#step-1---setup-environment) create consumer and provider apps. 
- [Step 2 - Add consumer tests - REST API](#step-2---add-consumer-tests---rest-api) Add the first consumer test for REST API.
- [Step 3 - Add consumer tests - GraphQL](#step-3---add-consumer-tests---graphql) Add the consumer test for GraphQL endpoint.

*NOTE: Each step is tied to, and must be run within, a git branch, allowing you to progress through each stage incrementally. For example, to move to a specific, you can run the following: `git checkout [step_index]`*

## Prerequisite
----
- [Docker](https://www.docker.com)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node v14+](https://nodejs.org/en/)
- [Yarn v3](https://yarnpkg.com/)

*NOTE: Please follow this [guide](https://yarnpkg.com/getting-started/migration) to upgrade your local yarn to v3.*

## Step 1 - Setup environment
In this step, we need to first create an HTTP client to make the calls to our provider service:

![Simple Consumer](diagrams/workshop_step1.svg)

The provider and consumer are built within a monorepo, managed by [Lerna](https://github.com/lerna/lerna). 

- *Consumer: React + Apollo-client*
- *Provider: Nest.js App (enabling both REST and GraphQL)*

To install the dependencies of the app, simply go to the root directory and run:
```
yarn install
```
We've set up two endpoints to use:
- GET /games - REST API to retrieve all the games.
- POST /graphql - Use GraphQL queries to fetch data. 

There's no need to establish any database connection as we are simply using a mock json as the source. It is saved under `/nest-provider/src/data/mock.json` feel free to update the data as you wish.

Running `localhost:5000/graphql` will open the GraphQL playground in the browser so you can interactively debug and test the queries. You can use the following query to fetch the data in our example:
```
query Games {
  games {
    data {
      id
      name
      url
      reviews {
        rating
        comment
      }
      type
    }
  }
}
```

The `api.js` has the REST api functions and we use `apollo-client` with `useQuery` hooks to fetch data via GraphQL endpoint.

**Run the apps**

To run the app, go to the root directory and run `yarn start`. Alternatively, you can go to each package and run them independently.

## Step 2 - Add consumer tests - REST API
Unit tests are written and executed in isolation of any other services. When we write tests for code that talk to other services, they are built on trust that the contracts are upheld. There is no way to validate that the consumer and provider can communicate correctly.

> *An integration contract test is a test at the boundary of an external service verifying that it meets the contract expected by a consuming service - [Martin Fowler](https://martinfowler.com/bliki/ContractTest.html)*

Now is time to add the first Pact test. Because of the natature of consumer-driven, we are going to start with the consumer tests.

You can find the api class in `/src/react-consumer/api.js`:

```
export class API {
  constructor(url) {
    if (url === undefined || url === '') {
      url = process.env.REACT_APP_API_BASE_URL;
    }
    if (url.endsWith('/')) {
      url = url.substr(0, url.length - 1);
    }
    this.url = url;
  }

  withPath(path) {
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    return `${this.url}${path}`;
  }

  async getGames() {
    const res = await axios.get(this.withPath('/game')).then((r) => r.data);
    return res;
  }
}
```

Firstly, we need to install the dependencies required for Pact:
```
yarn add @pact-foundation/pact @pact-foundation/pact-node
```

Then create a `/pact` folder under `/src`, and add `api.pact.spec.js`. 

Add the Pact config to the top:
```
const provider = new Pact({
  consumer: "YOUR_CONSUMER_NAME",
  provider: "YOUR_PROVIDER_NAME",
  log: path.resolve(process.cwd(), "logs", "pact.log"),
  logLevel: "warn",
  dir: path.resolve(process.cwd(), "pacts"),
  spec: 2
});
```
*NOTE: Please make sure you create the unique consumer and provider names, if using the same Pactflow account.*

Then you can add the following test for GET `/games` endpoint:
```
describe("API Pact test Game API - REST", () => {
  beforeAll(() => provider.setup());
  afterEach(() => provider.verify());
  afterAll(() => provider.finalize());

  describe("getting all games", () => {
    test("games exists", async () => {
      const expectedResult = {
        id: 1,
        name: "Heathstone",
        type: "TCG",
        url: "https://content.api.news/v3/images/bin/c316d90c344632190cbd595a42ac44ad",
        reviews: [
          { rating: 5, comment: "Great game!" },
          { rating: 4, comment: "Good game!" },
        ]
      };
      // set up Pact interactions
      await provider.addInteraction({
        state: "games exist",
        uponReceiving: "get all games",
        withRequest: {
          method: "GET",
          path: "/game",
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: eachLike(expectedResult),
        },
      });

      const gameAPI = new API(provider.mockService.baseUrl);

      // make request to Pact mock server
      const games = await gameAPI.getGames();
      expect(games).toStrictEqual([expectedResult]);
    });
  });
});
```

The above test looks very similar to the normal unit test with [Jest](https://jestjs.io/). 

![Consumer test](diagrams/consumer-test_step2.svg)

This test starts a mock server a random port that acts as our provider service. To get this to work we update the URL in the Client that we create, after initialising Pact.

To simplify running the tests, add this to `react-consumer/package.json`:
```
// add it under scripts
"test:pact": "CI=true react-scripts test --testTimeout 30000 pact.spec.js"
```

Running this test should pass, and it creates a pact file which we can use to validate our assumptions on the provider side, and have conversation around.

```console
❯ yarn test:pact

PASS src/pact/api.pact.spec.js (14.28 s)
  API Pact test Game API - REST
    getting all games
      ✓ games exists (42 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        15.462 s
Ran all test suites matching /pact.spec.js/i.
```

You can run `git checkout step2/add-consumer-rest-test` to complete this step too.

## Step 3 - Add consumer tests - GraphQL
Okay, if everything goes well with the above steps, we are pretty much set up at the consumer side. However, accordingly to the API usage, most of the requests at Brighte are via GraphQL endpoints. Let's add the GraphQL Pact tests now.

To avoid testing the UI and component logic, instead of testing `useQuery()` React hooks in Pact, we have to extract its business logic and test it independently. 

Let's create a folder `/graphql` to store all the queries and mutations, and add a file `query.js` inside. Then, you can copy the query from `App.js`, so the file looks like:
```
import { gql } from "@apollo/client";

const GET_GAMES_QUERY = gql`
  query Games {
      games {
        data {
          id
          name
          url
          reviews {
            rating
            comment
          }
          type
        }
      }
    }
`;

export {
  GET_GAMES_QUERY,
};
```

And you can replace the code of `App.js` with the above query:
```
import { GET_GAMES_QUERY } from './graphql/query';
...
const { loading, error, data } = useQuery(GET_GAMES_QUERY);
```

Once the above is done, we can add a new file `/src/pact/graphql.pact.spec.js` and add the following config of Pact instance at the top:
```
const provider = new Pact({
  consumer: "YOUR_CONSUMER_NAME",
  provider: "YOUR_PROVIDER_NAME",
  log: path.resolve(process.cwd(), "logs", "pact.log"),
  logLevel: "warn",
  dir: path.resolve(process.cwd(), "pacts"),
  spec: 2,
  pactfileWriteMode: 'merge',
});
```
The code should be very similar to step 2, but we've added `pactfileWriteMode: 'merge'` here. Because if you run pact testing with multiple files, they can run in parallel and the final output file will be override by whichever test file runs last. With this option set to `merge`, it will combine multiple pact test output into one pact file when it finishes testing.

Then you can add the following test for POST `/graphql` endpoint:
```
describe("API Pact test Game API - GraphQL", () => {
  let client;

  beforeAll(async () => {
    await provider.setup();
    client = new ApolloClient({
      link: new HttpLink({
        uri: `${provider.mockService.baseUrl}/graphql`,
        fetch,
      }),
      cache: new InMemoryCache({ addTypename: false }),
    });
  });

  afterEach(async () => {
    await provider.verify();
  });

  afterAll(async () => {
    await provider.finalize();
    client.stop();
  });

  test("games exists", async () => {
    const expectedResult = {
      id: 1,
      name: "Heathstone",
      type: "TCG",
      url: "https://content.api.news/v3/images/bin/c316d90c344632190cbd595a42ac44ad",
      reviews: [
        {
          rating: 5,
          comment: "Great game!",
        },
        {
          rating: 4,
          comment: "Good game!",
        },
      ]
    };

    const graphqlQuery = new GraphQLInteraction()
      .uponReceiving("get games query")
      .withQuery(print(GET_GAMES_QUERY))
      .withOperation("Games")
      .withVariables({})
      .withRequest({
        path: "/graphql",
        method: "POST",
      })
      .willRespondWith({
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: {
          data: {
            games: {
              data: eachLike(expectedResult),
            },
          },
        },
      });

    provider.addInteraction(graphqlQuery);

    const res = await client.query({
      query: GET_GAMES_QUERY,
      variables: {},
    });
    expect(res.data.games.data).toStrictEqual([expectedResult]);
  });
});
```
A few things to be noticed here:

- We are calling `new GraphQLInteraction()` to add a GraphQL interaction to Pact test. It comes with some functions like `withQuery()`, `withVariables()`, etc to set the GraphQL queries and inputs.
- Initalise the apolloClient instance before the test:
```
client = new ApolloClient({
  link: new HttpLink({
    uri: `${provider.mockService.baseUrl}/graphql`,
    fetch,
  }),
  cache: new InMemoryCache({ addTypename: false }),
});
```
- Set test query with `print()` in the GraphQL interaction

If everything goes well, you can run `yarn test:pact` again and see the result:
```console
❯ yarn test:pact
PASS src/pact/api.pact.spec.js (5.071 s)
PASS src/pact/graphql.pact.spec.js (5.25 s)

Test Suites: 2 passed, 2 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        6.998 s
Ran all test suites matching /pact.spec.js/i.
```
And if you go to `/pacts` folder you should see the generated pact file with both REST and GraphQL tests inside.

