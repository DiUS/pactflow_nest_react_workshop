import path from "path";
import { Pact } from "@pact-foundation/pact";
import { eachLike } from "@pact-foundation/pact/src/dsl/matchers";
import { API } from "../api";

const provider = new Pact({
  consumer: "YOUR_CONSUMER",
  provider: "YOUR_PROVIDER",
  log: path.resolve(process.cwd(), "logs", "pact.log"),
  logLevel: "warn",
  dir: path.resolve(process.cwd(), "pacts"),
  spec: 2,
  pactfileWriteMode: 'merge',
});

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
          path: "/games",
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

  describe('get one game', () => {
    test("game does not exist", async () => {
      // set up Pact interactions
      await provider.addInteraction({
        state: 'game with id 3 does not exist',
        uponReceiving: 'get game with id 3',
        withRequest: {
          method: 'GET',
          path: '/game/3'
        },
        willRespondWith: {
          status: 404
        },
      });

      const gameAPI = new API(provider.mockService.baseUrl);

      // make request to Pact mock server
      await expect(gameAPI.getGame(3)).rejects.toThrow('Request failed with status code 404');
    });
  })
  
});
