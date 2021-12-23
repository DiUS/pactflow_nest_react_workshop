# Pactflow Workshop

## Introduction
This workshop is aimed at demonstrating core features and benefits of contract testing with Pactflow and contract testing.

This workshop should take from 2 to 3 hours, depending on how deep you want to go into each topic.And it is fully self-driven so you can just follow each step to finish it at your pace.

**Workshop outline**
- [Step 1: Setup environment](#step-1---setup-environment) create consumer and provider apps. 

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

