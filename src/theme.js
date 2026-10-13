export const colors = {
  primary: '#6C3BD1',
  primaryDark: '#3B1F8C',
  accent: '#FFB703',
  background: '#F3EEFF',
  card: '#FFFFFF',
  text: '#1F1535',
  muted: '#7A7192',
  border: '#E3DBF7',
  correct: '#B7E4C7',
  wrong: '#F5B5B5',
};

export const APP_TITLE = "Wangzom's Pokédex";

// pastel card tints: [background, strong colour for the number]
const TINTS = [
  ['#EDE4FF', '#9B7BEA'],
  ['#FFF1CC', '#E5A500'],
  ['#DDF3EA', '#4FB587'],
  ['#FFE1E6', '#E7798C'],
  ['#DCEBFF', '#5B97E8'],
  ['#FFE8D6', '#EE9455'],
];

// every Pokémon always gets the same tint
export const tintFor = (id) => TINTS[id % TINTS.length];

// colours for the type chips on the Detail screen
export const typeColors = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

export const softShadow = {
  shadowColor: '#3B1F8C',
  shadowOpacity: 0.12,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};