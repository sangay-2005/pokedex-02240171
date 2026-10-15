import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import HardShadow from '../components/HardShadow';
import { artworkUrl, fetchPokemonDetail } from '../api';
import { useTeam } from '../context/TeamContext';
import { colors, OUTLINE, tintFor, typeColors } from '../theme';

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const STAT_LABELS = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'SP.ATK',
  'special-defense': 'SP.DEF',
  speed: 'SPD',
};

const barColor = (v) =>
  v < 50
    ? colors.pink
    : v < 80
    ? colors.accent
    : v < 110
    ? colors.mint
    : colors.primary;

export default function DetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { isInTeam, isFull, addToTeam, removeFromTeam } = useTeam();

  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [tint] = tintFor(id);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPokemonDetail(id);
      setPokemon(data);
      navigation.setOptions({ title: capitalize(data.name) });
    } catch (e) {
      setError('Could not load details. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.ink} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <HardShadow radius={14}>
          <Pressable style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>RETRY</Text>
          </Pressable>
        </HardShadow>
      </View>
    );
  }

  const inTeam = isInTeam(pokemon.id);
  const total = pokemon.stats.reduce((sum, s) => sum + s.value, 0);
  const disabled = !inTeam && isFull;

  const onTeamPress = () => {
    if (inTeam) {
      removeFromTeam(pokemon.id);
    } else {
      addToTeam({ id: pokemon.id, name: pokemon.name, total });
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* hero */}
      <View style={[styles.hero, { backgroundColor: tint }]}>
        <Text style={styles.heroNumber}>
          {String(pokemon.id).padStart(3, '0')}
        </Text>
        <HardShadow radius={120} offset={7}>
          <View style={styles.imageCircle}>
            <Image
              source={{ uri: artworkUrl(pokemon.id) }}
              style={styles.image}
              contentFit="contain"
              cachePolicy="memory-disk"
              transition={250}
            />
          </View>
        </HardShadow>
      </View>

      <View style={styles.body}>
        <View style={styles.numTag}>
          <Text style={styles.numText}>
            #{String(pokemon.id).padStart(4, '0')}
          </Text>
        </View>
        <Text style={styles.name}>{pokemon.name.toUpperCase()}</Text>

        <View style={styles.typeRow}>
          {pokemon.types.map((t) => (
            <View
              key={t}
              style={[
                styles.typeChip,
                { backgroundColor: typeColors[t] || colors.accent },
              ]}
            >
              <Text style={styles.typeText}>{t.toUpperCase()}</Text>
            </View>
          ))}
        </View>

        <View style={styles.measureRow}>
          <View style={[styles.measureBox, { backgroundColor: colors.mint }]}>
            <Text style={styles.measureValue}>{pokemon.height} m</Text>
            <Text style={styles.measureLabel}>HEIGHT</Text>
          </View>
          <View style={[styles.measureBox, { backgroundColor: colors.sky }]}>
            <Text style={styles.measureValue}>{pokemon.weight} kg</Text>
            <Text style={styles.measureLabel}>WEIGHT</Text>
          </View>
        </View>

        <View style={styles.statsHeader}>
          <Text style={styles.sectionTitle}>BASE STATS</Text>
          <View style={styles.totalChip}>
            <Text style={styles.totalText}>TOTAL {total}</Text>
          </View>
        </View>

        {pokemon.stats.map((s) => (
          <View key={s.name} style={styles.statRow}>
            <Text style={styles.statLabel}>
              {STAT_LABELS[s.name] || s.name}
            </Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${Math.min(s.value / 200, 1) * 100}%`,
                    backgroundColor: barColor(s.value),
                  },
                ]}
              />
            </View>
            <Text style={styles.statValue}>{s.value}</Text>
          </View>
        ))}

        <HardShadow radius={18} offset={5} style={{ marginTop: 28 }}>
          <Pressable
            onPress={onTeamPress}
            disabled={disabled}
            style={[
              styles.teamBtn,
              inTeam && { backgroundColor: colors.pink },
              disabled && { backgroundColor: '#D9D4C7' },
            ]}
          >
            <Text
              style={[
                styles.teamBtnText,
                !inTeam && !disabled && { color: '#fff' },
                disabled && { color: colors.muted },
              ]}
            >
              {inTeam
                ? 'REMOVE FROM TEAM'
                : disabled
                ? 'TEAM IS FULL (6/6)'
                : 'ADD TO TEAM'}
            </Text>
          </Pressable>
        </HardShadow>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  errorText: {
    color: colors.ink,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: colors.accent,
    borderWidth: OUTLINE,
    borderColor: colors.ink,
    borderRadius: 14,
    paddingHorizontal: 26,
    paddingVertical: 10,
  },
  retryText: { color: colors.ink, fontWeight: '900', letterSpacing: 1 },

  hero: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: OUTLINE,
    borderBottomColor: colors.ink,
    overflow: 'hidden',
  },
  heroNumber: {
    position: 'absolute',
    fontSize: 200,
    fontWeight: '900',
    color: colors.ink,
    opacity: 0.1,
  },
  imageCircle: {
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: '#fff',
    borderWidth: OUTLINE,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: 200, height: 200 },

  body: { padding: 20, alignItems: 'center' },
  numTag: {
    backgroundColor: colors.ink,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  numText: { color: '#fff', fontWeight: '900', letterSpacing: 1.5 },
  name: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 6,
    letterSpacing: 1,
    textAlign: 'center',
  },
  typeRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  typeChip: {
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  typeText: { color: colors.ink, fontWeight: '900', letterSpacing: 1 },

  measureRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  measureBox: {
    flex: 1,
    borderWidth: OUTLINE,
    borderColor: colors.ink,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  measureValue: { fontSize: 20, fontWeight: '900', color: colors.ink },
  measureLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: colors.ink,
    marginTop: 2,
  },

  statsHeader: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 26,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: 1,
  },
  totalChip: {
    backgroundColor: colors.accent,
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  totalText: { fontWeight: '900', color: colors.ink, fontSize: 13 },

  statRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  statLabel: { width: 62, fontWeight: '900', color: colors.ink, fontSize: 13 },
  barTrack: {
    flex: 1,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 2.5,
    borderColor: colors.ink,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  barFill: {
    height: '100%',
    borderRightWidth: 2.5,
    borderRightColor: colors.ink,
  },
  statValue: {
    width: 34,
    textAlign: 'right',
    fontWeight: '900',
    color: colors.ink,
  },

  teamBtn: {
    backgroundColor: colors.primary,
    borderWidth: OUTLINE,
    borderColor: colors.ink,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  teamBtnText: {
    color: colors.ink,
    fontWeight: '900',
    fontSize: 17,
    letterSpacing: 1,
  },
});