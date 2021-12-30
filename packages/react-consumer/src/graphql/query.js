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
