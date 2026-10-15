export const colors = {
  ink: '#111111',
  primary: '#7B4DFF',
  primaryDark: '#1B1033',
  accent: '#FFD23F',
  pink: '#FF8FAB',
  mint: '#7DF9C2',
  sky: '#8EC5FF',
  background: '#FFF6E5',
  card: '#FFFFFF',
  text: '#111111',
  muted: '#5C5470',
  border: '#111111',
  correct: '#7DF9C2',
  wrong: '#FF8FAB',
};

export const APP_TITLE = "Wangzom's Pokédex";

export const OUTLINE = 3; // thick border width used everywhere

// bright flat card colours (every Pokémon always gets the same one)
const TINTS = ['#FFD23F', '#FF8FAB', '#7DF9C2', '#8EC5FF', '#C8A2FF', '#FFB26B'];

export const tintFor = (id) => [TINTS[id % TINTS.length], '#111111'];

export const typeColors = {
  normal: '#C9C8A0',
  fire: '#FF9F5A',
  water: '#7FA8FF',
  electric: '#FFE14D',
  grass: '#8EDB5C',
  ice: '#A8EDEA',
  fighting: '#E2564F',
  poison: '#C063BE',
  ground: '#EBCB7A',
  flying: '#B9A4FF',
  psychic: '#FF7BA9',
  bug: '#BCCF3A',
  rock: '#C9B64A',
  ghost: '#9078B8',
  dragon: '#8A5CFF',
  dark: '#8B6F5E',
  steel: '#C5C5DA',
  fairy: '#F2A0C8',
};

// kept so the screens we haven't redesigned yet still work
export const softShadow = {
  shadowColor: '#111111',
  shadowOpacity: 0.12,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};