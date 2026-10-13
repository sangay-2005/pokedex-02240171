const BASE = 'https://pokeapi.co/api/v2';

export const PAGE_SIZE = 20;
export const START_OFFSET = 171; // last three digits of 02240171

// the id is the number at the end of the url
export const getIdFromUrl = (url) =>
  Number(url.split('/').filter(Boolean).pop());

export const artworkUrl = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

async function request(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const toItem = (p) => ({ id: getIdFromUrl(p.url), name: p.name });

// one page of 20 for the infinite scroll
export async function fetchPokemonPage(offset) {
  const data = await request(
    `${BASE}/pokemon?offset=${offset}&limit=${PAGE_SIZE}`
  );
  return { items: data.results.map(toItem), hasMore: data.next !== null };
}

// every name, used by the search box
export async function fetchAllNames() {
  const data = await request(`${BASE}/pokemon?limit=1025`);
  return data.results.map(toItem);
}

// details for one Pokémon (height in m, weight in kg)
export async function fetchPokemonDetail(id) {
  const d = await request(`${BASE}/pokemon/${id}`);
  return {
    id: d.id,
    name: d.name,
    types: d.types.map((t) => t.type.name),
    height: d.height / 10,
    weight: d.weight / 10,
    stats: d.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
  };
}

// names of the first 151 Pokémon, used by the game
export async function fetchFirst151() {
  const data = await request(`${BASE}/pokemon?limit=151`);
  return data.results.map(toItem);
}