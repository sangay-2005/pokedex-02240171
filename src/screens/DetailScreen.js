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
import { artworkUrl, fetchPokemonDetail } from '../api';
import { useTeam } from '../context/TeamContext';
import { colors, softShadow, tintFor, typeColors } from '../theme';

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const STAT_LABELS = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
};

// light chip colours need dark text
const LIGHT_TYPES = ['electric', 'ice', 'ground', 'steel', 'bug', 'normal'];

const barColor = (v) =>
  v < 50 ? '#EF6B6B' : v < 80 ? '#FFB703' : v < 110 ? '#4FB587' : '#6C3BD1';

export default function DetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { isInTeam, isFull, addToTeam, removeFromTeam } = useTeam();

  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [tint, strong] = tintFor(id);

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
      <View style={[styles.center, { backgroundColor: tint }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: tint }]}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
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
    <ScrollView style={{ backgroundColor: tint }} bounces={false}>
      {/* hero area */}
      <View style={[styles.hero, { backgroundColor: tint }]}>
        <Text style={[styles.heroNumber, { color: strong }]}>
          {String(pokemon.id).padStart(3, '0')}
        </Text>
        <Image
          source={{ uri: artworkUrl(pokemon.id) }}
          style={styles.heroImage}
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={250}
        />
      </View>

      {/* white sheet */}
      <View style={styles.sheet}>
        <Text style={[styles.number, { color: strong }]}>
          #{String(pokemon.id).padStart(4, '0')}
        </Text>
        <Text style={styles.name}>{capitalize(pokemon.name)}</Text>

        <View style={styles.typeRow}>
          {pokemon.types.map((t) => (
            <View
              key={t}
              style={[styles.typeChip, { backgroundColor: typeColors[t] || colors.primary }]}
            >
              <Text
                style={[
                  styles.typeText,
                  LIGHT_TYPES.includes(t) && { color: '#1F1535' },
                ]}
              >
                {capitalize(t)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.measureRow}>
          <View style={styles.measureBox}>
            <Text style={styles.measureValue}>{pokemon.height} m</Text>
            <Text style={styles.measureLabel}>Height</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.measureBox}>
            <Text style={styles.measureValue}>{pokemon.weight} kg</Text>
            <Text style={styles.measureLabel}>Weight</Text>
          </View>
        </View>

        <View style={styles.statsHeader}>
          <Text style={styles.sectionTitle}>Base stats</Text>
          <Text style={styles.totalText}>Total {total}</Text>
        </View>

        {pokemon.stats.map((s) => (
          <View key={s.name} style={styles.statRow}>
            <Text style={styles.statLabel}>{STAT_LABELS[s.name] || s.name}</Text>
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

        <Pressable
          onPress={onTeamPress}
          disabled={disabled}
          style={[
            styles.teamBtn,
            inTeam && styles.teamBtnRemove,
            disabled && styles.teamBtnDisabled,
          ]}
        >
          <Text style={[styles.teamBtnText, inTeam && { color: '#B3261E' }]}>
            {inTeam
              ? 'Remove from team'
              : disabled
              ? 'Team is full (6/6)'
              : 'Add to team'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { color: colors.text, textAlign: 'center', marginBottom: 12 },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: { color: '#fff', fontWeight: 'bold' },

  hero: { height: 280, alignItems: 'center', justifyContent: 'center' },
  heroNumber: {
    position: 'absolute',
    fontSize: 190,
    fontWeight: '900',
    opacity: 0.2,
    top: 10,
  },
  heroImage: { width: 240, height: 240, marginBottom: 20 },

  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginTop: -30,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 40,
    minHeight: 480,
    ...softShadow,
  },
  number: { fontWeight: '800', letterSpacing: 1.5, textAlign: 'center' },
  name: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  typeChip: { paddingHorizontal: 18, paddingVertical: 6, borderRadius: 16 },
  typeText: { color: '#fff', fontWeight: '800' },

  measureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingVertical: 14,
    marginTop: 18,
  },
  measureBox: { flex: 1, alignItems: 'center' },
  measureValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  measureLabel: { color: colors.muted, marginTop: 2 },
  divider: { width: 1, height: 30, backgroundColor: colors.border },

  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 6,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.primaryDark },
  totalText: { color: colors.muted, fontWeight: '700' },
  statRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  statLabel: { width: 64, color: colors.muted, fontWeight: '700', fontSize: 13 },
  barTrack: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  barFill: { height: 12, borderRadius: 6 },
  statValue: { width: 34, textAlign: 'right', fontWeight: '800', color: colors.text },

  teamBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 28,
    ...softShadow,
  },
  teamBtnRemove: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: colors.wrong },
  teamBtnDisabled: { backgroundColor: colors.border },
  teamBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});