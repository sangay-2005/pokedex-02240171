import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'pokedex_team';
export const MAX_TEAM = 6;

const TeamContext = createContext(null);

export function TeamProvider({ children }) {
  const [team, setTeam] = useState([]); // each: { id, name, total }
  const [loaded, setLoaded] = useState(false);

  // load the saved team when the app opens
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setTeam(JSON.parse(raw));
      } catch (e) {
        // ignore: start with an empty team
      }
      setLoaded(true);
    })();
  }, []);

  // save every time the team changes (only after loading finished)
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(KEY, JSON.stringify(team)).catch(() => {});
  }, [team, loaded]);

  const isInTeam = (id) => team.some((p) => p.id === id);
  const isFull = team.length >= MAX_TEAM;

  const addToTeam = (pokemon) =>
    setTeam((prev) =>
      prev.length >= MAX_TEAM || prev.some((p) => p.id === pokemon.id)
        ? prev
        : [...prev, pokemon]
    );

  const removeFromTeam = (id) =>
    setTeam((prev) => prev.filter((p) => p.id !== id));

  const totalStats = team.reduce((sum, p) => sum + p.total, 0);

  return (
    <TeamContext.Provider
      value={{ team, isInTeam, isFull, addToTeam, removeFromTeam, totalStats }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export const useTeam = () => useContext(TeamContext);