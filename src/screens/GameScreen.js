import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { artworkUrl, fetchFirst151 } from '../api';
import { colors, softShadow } from '../theme';

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const LETTERS = ['A', 'B', 'C', 'D'];

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const makeRound = (pool) => {
  const answer = pool[Math.floor(Math.random() * pool.length)];
  const wrong = shuffle(pool.filter((p) => p.id !== answer.id)).slice(0, 3);
  return { answer, options: shuffle([answer, ...wrong]) };
};

export default function GameScreen() {
  const [pool, setPool] = useState([]);
  const [round, setRound] = useState(null);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hints, setHints] = useState(3);
  const [hidden, setHidden] = useState([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchFirst151();
      setPool(list);
      setRound(makeRound(list));
    } catch (e) {
      setError('Could not start the game. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const answered = picked !== null;

  const onPick = (option) => {
    if (answered) return;
    setPicked(option.id);
    if (option.id === round.answer.id) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const next = s + 1;
        setBest((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
    }
  };

  const onNext = () => {
    setPicked(null);
    setHidden([]);
    setRound(makeRound(pool));
  };

  const onHint = () => {
    if (answered || hints === 0 || hidden.length > 0) return;
    const wrong = round.options.filter((o) => o.id !== round.answer.id);
    setHidden(shuffle(wrong).slice(0, 2).map((o) => o.id));
    setHints((h) => h - 1);
  };

  const optionStyle = (option) => {
    if (hidden.includes(option.id)) return [styles.option, styles.removed];
    if (!answered) return styles.option;
    if (option.id === round.answer.id) return [styles.option, styles.correct];
    if (option.id === picked) return [styles.option, styles.wrong];
    return [styles.option, { opacity: 0.55 }];
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.nextBtn} onPress={load}>
          <Text style={styles.nextText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const gotIt = answered && picked === round.answer.id;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.pills}>
        <View style={styles.pill}>
          <Text style={styles.pillValue}>{score}</Text>
          <Text style={styles.pillLabel}>Score</Text>
        </View>
        <View style={[styles.pill, styles.pillHot]}>
          <Text style={[styles.pillValue, { color: colors.primaryDark }]}>
            {streak}
          </Text>
          <Text style={[styles.pillLabel, { color: colors.primaryDark }]}>
            Streak
          </Text>
        </View>
        <View style={styles.pill}>
          <Text style={styles.pillValue}>{best}</Text>
          <Text style={styles.pillLabel}>Best</Text>
        </View>
      </View>

      <Text style={styles.title}>Who's that Pokémon?</Text>

      <View style={styles.stage}>
        <View style={styles.glowOuter} />
        <View style={styles.glowInner} />
        <Image
          source={{ uri: artworkUrl(round.answer.id) }}
          style={styles.image}
          contentFit="contain"
          tintColor={answered ? undefined : '#000000'}
        />
      </View>

      {answered && (
        <Text style={styles.verdict}>
          {gotIt ? 'Correct!' : `It's ${capitalize(round.answer.name)}!`}
        </Text>
      )}

      {round.options.map((option, i) => (
        <Pressable
          key={option.id}
          style={optionStyle(option)}
          onPress={() => onPick(option)}
          disabled={answered || hidden.includes(option.id)}
        >
          <View style={styles.letter}>
            <Text style={styles.letterText}>{LETTERS[i]}</Text>
          </View>
          <Text style={styles.optionText}>{capitalize(option.name)}</Text>
        </Pressable>
      ))}

      {!answered && (
        <Pressable
          style={[
            styles.hintBtn,
            (hints === 0 || hidden.length > 0) && { opacity: 0.4 },
          ]}
          onPress={onHint}
          disabled={hints === 0 || hidden.length > 0}
        >
          <Text style={styles.hintText}>
            Hint: remove 2 wrong answers ({hints} left)
          </Text>
        </Pressable>
      )}

      {answered && (
        <Pressable style={styles.nextBtn} onPress={onNext}>
          <Text style={styles.nextText}>Next</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryDark },
  content: { alignItems: 'center', padding: 20, paddingBottom: 40 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark,
    padding: 24,
  },
  errorText: { color: '#fff', textAlign: 'center', marginBottom: 12 },

  pills: { flexDirection: 'row', gap: 10, alignSelf: 'stretch' },
  pill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    paddingVertical: 8,
    alignItems: 'center',
  },
  pillHot: { backgroundColor: colors.accent },
  pillValue: { color: '#fff', fontSize: 22, fontWeight: '900' },
  pillLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },

  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 18,
  },

  stage: {
    width: 270,
    height: 270,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  glowOuter: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,183,3,0.18)',
  },
  glowInner: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,183,3,0.9)',
  },
  image: { width: 230, height: 230 },

  verdict: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 10,
    marginVertical: 5,
    ...softShadow,
  },
  correct: { backgroundColor: colors.correct },
  wrong: { backgroundColor: colors.wrong },
  removed: { opacity: 0.25 },
  letter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: { fontWeight: '900', color: colors.primary },
  optionText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginRight: 34,
  },

  hintBtn: {
    alignSelf: 'stretch',
    borderWidth: 2,
    borderColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 14,
  },
  hintText: { color: colors.accent, fontWeight: '800', fontSize: 14 },

  nextBtn: {
    alignSelf: 'stretch',
    backgroundColor: colors.accent,
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  nextText: { color: colors.primaryDark, fontWeight: '900', fontSize: 17 },
});