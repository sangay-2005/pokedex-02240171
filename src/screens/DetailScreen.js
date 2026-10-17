import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import FadeIn from '../components/FadeIn';
import { artworkUrl, fetchPokemonDetail } from '../api';
import { useTeam } from '../context/TeamContext';
import { colors, MONO, typeColors } from '../theme';

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
    ? colors.danger
    : v < 80
    ? colors.gold
    : v < 110
    ? colors.accent
    : colors.hot;

// one stat bar that fills up when the screen opens
function StatBar({ label, value, delay }) {
  const w = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(w, {
      toValue: 1,
      duration: 700,
      delay,
      useNativeDriver: false,
    }).start();
  }, []);

  const pct = Math.min(value / 200, 1) * 100;

  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <Animated.View
          style={[
            styles.barFill,
            {
              backgroundColor: barColor(value),
              width: w.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', `${pct}%`],
              }),
            },
          ]}
        />
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export default function DetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { isInTeam, isFull, addToTeam, removeFromTeam } = useTeam();

  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // floating animation for the artwork
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

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
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>SCANNING...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <View style={styles.errorRing}>
          <Ionicons name="cloud-offline" size={34} color={colors.danger} />
        </View>
        <Text style={styles.errorTitle}>CONNECTION LOST</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryBtn} onPress={load}>
          <Ionicons name="refresh" size={18} color={colors.bg} />
          <Text style={styles.retryText}>RETRY</Text>
        </Pressable>
      </View>
    );
  }

  const main = typeColors[pokemon.types[0]] || colors.accent;
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
      {/* hero: halo in the type colour + floating artwork */}
      <View style={styles.hero}>
        <View style={[styles.haloOuter, { backgroundColor: main + '1A' }]} />
        <View
          style={[
            styles.haloInner,
            {
              backgroundColor: main + '33',
              borderColor: main,
              shadowColor: main,
            },
          ]}
        />
        <Animated.View
          style={{
            transform: [
              {
                translateY: float.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -12],
                }),
              },
            ],
          }}
        >
          <Image
            source={{ uri: artworkUrl(pokemon.id) }}
            style={styles.image}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={250}
          />
        </Animated.View>
      </View>

      <FadeIn delay={120} style={styles.body}>
        <Text style={[styles.number, { color: main }]}>
          No.{String(pokemon.id).padStart(4, '0')}
        </Text>
        <Text style={styles.name}>{capitalize(pokemon.name)}</Text>

        <View style={styles.typeRow}>
          {pokemon.types.map((t) => {
            const c = typeColors[t] || colors.accent;
            return (
              <View
                key={t}
                style={[
                  styles.typeChip,
                  { backgroundColor: c + '22', borderColor: c },
                ]}
              >
                <Text style={[styles.typeText, { color: c }]}>
                  {t.toUpperCase()}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.measureRow}>
          <View style={styles.measureBox}>
            <Text style={styles.measureValue}>{pokemon.height} m</Text>
            <Text style={styles.measureLabel}>HEIGHT</Text>
          </View>
          <View style={styles.measureBox}>
            <Text style={styles.measureValue}>{pokemon.weight} kg</Text>
            <Text style={styles.measureLabel}>WEIGHT</Text>
          </View>
        </View>

        <View style={styles.statsHeader}>
          <Text style={styles.sectionTitle}>BASE STATS</Text>
          <Text style={styles.totalText}>POWER {total}</Text>
        </View>

        {pokemon.stats.map((s, i) => (
          <StatBar
            key={s.name}
            label={STAT_LABELS[s.name] || s.name}
            value={s.value}
            delay={250 + i * 90}
          />
        ))}

        <Pressable
          onPress={onTeamPress}
          disabled={disabled}
          style={({ pressed }) => [
            styles.teamBtn,
            inTeam && styles.teamBtnRemove,
            disabled && styles.teamBtnDisabled,
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
        >
          <Ionicons
            name={
              inTeam ? 'close-circle' : disabled ? 'lock-closed' : 'add-circle'
            }
            size={22}
            color={inTeam ? colors.danger : disabled ? colors.muted : colors.bg}
          />
          <Text
            style={[
              styles.teamBtnText,
              inTeam && { color: colors.danger },
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
      </FadeIn>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    padding: 28,
  },
  loadingText: {
    fontFamily: MONO,
    color: colors.muted,
    letterSpacing: 2,
    fontSize: 12,
    marginTop: 14,
  },
  errorRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 1,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 14,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryText: {
    color: colors.bg,
    fontWeight: '900',
    letterSpacing: 1.5,
    fontFamily: MONO,
  },

  hero: {
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  haloOuter: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  haloInner: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    shadowOpacity: 0.8,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  image: { width: 250, height: 250 },

  body: { paddingHorizontal: 20, alignItems: 'center' },
  number: {
    fontFamily: MONO,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  name: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.text,
    marginTop: 2,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  typeRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  typeChip: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  typeText: { fontFamily: MONO, fontWeight: '800', letterSpacing: 1.5 },

  measureRow: { flexDirection: 'row', gap: 12, marginTop: 22 },
  measureBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  measureValue: {
    fontFamily: MONO,
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  measureLabel: {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.muted,
    marginTop: 3,
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
    fontFamily: MONO,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    color: colors.accent,
  },
  totalText: {
    fontFamily: MONO,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.gold,
  },
  statRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  statLabel: {
    width: 64,
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
  },
  barTrack: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.surface2,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  barFill: { height: 12, borderRadius: 6 },
  statValue: {
    width: 34,
    textAlign: 'right',
    fontFamily: MONO,
    fontWeight: '800',
    color: colors.text,
  },

  teamBtn: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.accent,
    borderRadius: 18,
    paddingVertical: 16,
    marginTop: 30,
  },
  teamBtnRemove: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.danger,
  },
  teamBtnDisabled: { backgroundColor: colors.surface2 },
  teamBtnText: {
    fontFamily: MONO,
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 1.5,
    color: colors.bg,
  },
});