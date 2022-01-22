import path from "path";
import { Pact, GraphQLInteraction } from "@pact-foundation/pact";
import { eachLike } from "@pact-foundation/pact/src/dsl/matchers";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { print } from "graphql";
import { GET_GAMES_QUERY } from "../graphql/query";

const provider = new Pact({
  consumer: "YOUR_CONSUMER",
  provider: "YOUR_PROVIDER",
  log: path.resolve(process.cwd(), "logs", "pact.log"),
  logLevel: "warn",
  dir: path.resolve(process.cwd(), "pacts"),
  spec: 2,
  cors: true,
  pactfileWriteMode: 'merge',
});

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
      .given("query for games")
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
