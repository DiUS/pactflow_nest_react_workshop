/* eslint-disable no-unused-expressions */
import { React, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import { API } from './api';
import './App.css';

const App = () => {
  const { loading, error, data } = useQuery(gql`
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
  `);
  
  // REST API call
  useEffect(() => {
    const api = new API('http://localhost:4000');
    (async () => {
      const res = await api.getGames();
      return res;
    })();
  }, [])

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;
  const gameBlocks = data.games.data.map((game) => {
    const { id, name, type, url } = game;
    return (
      <div key={`game_${id}`} className="game">
        <p>Game: {name}</p>
        <p>Type: {type}</p>
        <img src={url} width="400" alt={name} />
      </div>
    );
  });

  return (
    <>
      <h1>Blizzard Games</h1>
      <div className="game-gallery">{gameBlocks}</div>
    </>
  );
};

export default App;
