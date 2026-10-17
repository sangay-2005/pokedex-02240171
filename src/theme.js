import { Platform } from 'react-native';

export const colors = {
  // Arcade Neon palette
  bg: '#0B0618', // deep violet-black
  surface: '#140D2B',
  surface2: '#1E1440',
  border: '#33236B',
  text: '#F4F0FF',
  muted: '#9A8FC4',
  accent: '#2EE6FF', // electric cyan: main highlight
  violet: '#8B5CFF',
  hot: '#FF3D9A', // hot magenta: second neon
  gold: '#FFC933', // score and rewards
  danger: '#FF4D6D',
  success: '#39F5A0',

  // old names, so nothing crashes
  primary: '#2EE6FF',
  primaryDark: '#0B0618',
  background: '#0B0618',
  card: '#140D2B',
  ink: '#F4F0FF',
  pink: '#FF3D9A',
  mint: '#39F5A0',
  sky: '#2EE6FF',
  correct: '#39F5A0',
  wrong: '#FF4D6D',
};

export const APP_TITLE = "Wangzom's Pokédex";

export const OUTLINE = 3; // old screens only

// monospace font for numbers and labels (game HUD feel)
export const MONO = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

// a soft coloured glow around an element
export const glow = (color, strength = 0.6, radius = 12) => ({
  shadowColor: color,
  shadowOpacity: strength,
  shadowRadius: radius,
  shadowOffset: { width: 0, height: 0 },
  elevation: 8,
});

// neon ring colours (every Pokémon always gets the same one)
const NEON = ['#2EE6FF', '#FF3D9A', '#8B5CFF', '#FFC933', '#39F5A0', '#FF7A3D'];
export const tintFor = (id) => [NEON[id % NEON.length], '#0B0618'];

// saturated type colours
export const typeColors = {
  normal: '#B4BAD6',
  fire: '#FF6A2B',
  water: '#2D8CFF',
  electric: '#FFE01A',
  grass: '#35E06B',
  ice: '#5EF2F2',
  fighting: '#FF3B3B',
  poison: '#C73DFF',
  ground: '#F2B84B',
  flying: '#7FA2FF',
  psychic: '#FF4FA3',
  bug: '#A8E02A',
  rock: '#D4B24A',
  ghost: '#8F6BFF',
  dragon: '#5B3DFF',
  dark: '#8A7A9E',
  steel: '#8FB4D9',
  fairy: '#FF8AD4',
};

// old screens only
export const softShadow = {
  shadowColor: '#000000',
  shadowOpacity: 0.3,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};