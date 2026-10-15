import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { artworkUrl, fetchFirst151 } from '../api';
import { colors, softShadow } from '../theme';

const TOTAL_ROUNDS = 10;
const STORE_KEY = 'pokedex_game_records';
const LETTERS = ['A', 'B', 'C', 'D'];

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

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

const rankFor = (score) =>
  score >= 9
    ? 'Pokémon Master!'
    : score >= 7
    ? 'Great trainer!'
    : score >= 4
    ? 'Nice try, trainer!'
    : 'Keep training!';

export default function GameScreen() {
  const [pool, setPool] = useState([]);
  const [phase, setPhase] = useState('menu'); // 'menu' | 'playing' | 'result'
  const [round, setRound] = useState(null);
  const [roundNo, setRoundNo] = useState(1);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [newHigh, setNewHigh] = useState(false);
  const [hints, setHints] = useState(3);
  const [hidden, setHidden] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchFirst151();
      setPool(list);
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (raw) {
          const r = JSON.parse(raw);
          setHighScore(r.highScore || 0);
          setBest(r.bestStreak || 0);
        }
      } catch (e) {
        // no saved records yet
      }
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

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setHints(3);
    setHidden([]);
    setPicked(null);
    setRoundNo(1);
    setNewHigh(false);
    setRound(makeRound(pool));
    setPhase('playing');
  };

  const finishGame = () => {
    const isHigh = score > highScore;
    const nextHigh = Math.max(score, highScore);
    setNewHigh(isHigh);
    setHighScore(nextHigh);
    AsyncStorage.setItem(
      STORE_KEY,
      JSON.stringify({ highScore: nextHigh, bestStreak: best })
    ).catch(() => {});
    setPhase('result');
  };

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
    if (roundNo >= TOTAL_ROUNDS) {
      finishGame();
      return;
    }
    setRoundNo((n) => n + 1);
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

  // ---------- loading / error ----------
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
        <Pressable style={styles.bigBtn} onPress={load}>
          <Text style={styles.bigBtnText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  // ---------- start screen ----------
  if (phase === 'menu') {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.menuContent}
      >
        <Text style={styles.menuTitle}>Who's that Pokémon?</Text>
        <Text style={styles.menuSub}>
          {TOTAL_ROUNDS} rounds · 3 hints · guess from the silhouette
        </Text>

        <View style={styles.stage}>
          <View style={styles.glowOuter} />
          <View style={styles.glowInner} />
          <Text style={styles.bigQ}>?</Text>
        </View>

        <View style={styles.recordRow}>
          <View style={styles.recordBox}>
            <Text style={styles.recordValue}>{highScore}</Text>
            <Text style={styles.recordLabel}>HIGH SCORE</Text>
          </View>
          <View style={styles.recordBox}>
            <Text style={styles.recordValue}>{best}</Text>
            <Text style={styles.recordLabel}>BEST STREAK</Text>
          </View>
        </View>

        <Pressable style={styles.bigBtn} onPress={startGame}>
          <Ionicons name="play" size={22} color={colors.primaryDark} />
          <Text style={styles.bigBtnText}>Play</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ---------- results screen ----------
  if (phase === 'result') {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.menuContent}
      >
        <Text style={styles.menuTitle}>Game over</Text>

        <View style={styles.stage}>
          <View style={styles.glowOuter} />
          <View style={styles.glowInner} />
          <Ionicons name="trophy" size={110} color={colors.primaryDark} />
        </View>

        <Text style={styles.finalScore}>
          {score}/{TOTAL_ROUNDS}
        </Text>
        <Text style={styles.rank}>{rankFor(score)}</Text>
        {newHigh && <Text style={styles.newHigh}>New high score!</Text>}

        <View style={styles.recordRow}>
          <View style={styles.recordBox}>
            <Text style={styles.recordValue}>{highScore}</Text>
            <Text style={styles.recordLabel}>HIGH SCORE</Text>
          </View>
          <View style={styles.recordBox}>
            <Text style={styles.recordValue}>{best}</Text>
            <Text style={styles.recordLabel}>BEST STREAK</Text>
          </View>
        </View>

        <Pressable style={styles.bigBtn} onPress={startGame}>
          <Ionicons name="refresh" size={22} color={colors.primaryDark} />
          <Text style={styles.bigBtnText}>Play again</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ---------- playing ----------
  const gotIt = answered && picked === round.answer.id;
  const doneRounds = roundNo - 1 + (answered ? 1 : 0);
  const isLast = roundNo >= TOTAL_ROUNDS;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.roundRow}>
        <Text style={styles.roundText}>
          Round {roundNo}/{TOTAL_ROUNDS}
        </Text>
        <View style={styles.track}>
          <View
            style={[
              styles.trackFill,
              { width: `${(doneRounds / TOTAL_ROUNDS) * 100}%` },
            ]}
          />
        </View>
      </View>

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
          <Text style={styles.nextText}>
            {isLast ? 'See results' : 'Next'}
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryDark },
  content: { alignItems: 'center', padding: 20, paddingBottom: 40 },
  menuContent: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark,
    padding: 24,
  },
  errorText: { color: '#fff', textAlign: 'center', marginBottom: 12 },

  // menu + result
  menuTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
  },
  menuSub: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 6,
    textAlign: 'center',
  },
  bigQ: { fontSize: 120, fontWeight: '900', color: colors.primaryDark },
  recordRow: { flexDirection: 'row', gap: 12, alignSelf: 'stretch' },
  recordBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  recordValue: { color: '#fff', fontSize: 28, fontWeight: '900' },
  recordLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },
  bigBtn: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    ...softShadow,
  },
  bigBtnText: { color: colors.primaryDark, fontWeight: '900', fontSize: 19 },
  finalScore: { color: '#fff', fontSize: 56, fontWeight: '900' },
  rank: { color: colors.accent, fontSize: 22, fontWeight: '900' },
  newHigh: {
    color: colors.primaryDark,
    backgroundColor: colors.accent,
    fontWeight: '900',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 14,
    marginTop: 8,
    overflow: 'hidden',
  },

  // playing
  roundRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  roundText: { color: '#fff', fontWeight: '800' },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  trackFill: { height: 8, borderRadius: 4, backgroundColor: colors.accent },

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