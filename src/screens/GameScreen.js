import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useFonts } from 'expo-font';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { artworkUrl, fetchFirst151 } from '../api';
import { colors } from '../theme';

const TOTAL_ROUNDS = 10;
const LIVES = 3;
const ROUND_SECONDS = 10;
const STORE_KEY = 'pokedex_game_records';

const PIXEL = 'PressStart2P_400Regular';

// small fixed palette for this screen
const C = {
  bg: colors.bg,
  panel: '#1B1240',
  panelLight: '#2A1C5E',
  white: '#F4F0FF',
  cyan: '#2EE6FF',
  pink: '#FF3D9A',
  gold: '#FFC933',
  green: '#39F5A0',
  red: '#FF4D6D',
  sky: '#2B1FA8',
  skyDark: '#1A1170',
  muted: '#8F86B8',
};

const pad2 = (n) => String(n).padStart(2, '0');

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
    ? 'POKEMON MASTER'
    : score >= 7
    ? 'ELITE TRAINER'
    : score >= 4
    ? 'RISING TRAINER'
    : 'ROOKIE';

// ---------- small pixel-art building blocks ----------

// square box with notched corners and a 4px border
function PixelBox({
  border = C.white,
  fill = C.panel,
  pad = 12,
  style,
  innerStyle,
  children,
}) {
  return (
    <View style={[{ backgroundColor: border, padding: 4 }, style]}>
      <View style={[styles.notch, { top: 0, left: 0 }]} />
      <View style={[styles.notch, { top: 0, right: 0 }]} />
      <View style={[styles.notch, { bottom: 0, left: 0 }]} />
      <View style={[styles.notch, { bottom: 0, right: 0 }]} />
      <View style={[{ backgroundColor: fill, padding: pad }, innerStyle]}>
        {children}
      </View>
    </View>
  );
}

// flat button that drops down 3px when pressed
function PixelButton({ label, color = C.gold, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        transform: [{ translateY: pressed ? 3 : 0 }],
      })}
    >
      <PixelBox border={C.white} fill={color} pad={14}>
        <Text style={styles.buttonText}>{label}</Text>
      </PixelBox>
    </Pressable>
  );
}

// heart drawn from squares
const HEART = [
  '0110110',
  '1111111',
  '1111111',
  '0111110',
  '0011100',
  '0001000',
];
function PixelHeart({ filled }) {
  const cell = 4;
  return (
    <View>
      {HEART.map((row, y) => (
        <View key={y} style={{ flexDirection: 'row' }}>
          {row.split('').map((c, x) => (
            <View
              key={x}
              style={{
                width: cell,
                height: cell,
                backgroundColor:
                  c === '1' ? (filled ? C.red : '#3A2A63') : 'transparent',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

// text that types itself out, one letter at a time
function Typewriter({ text, style }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    setN(0);
    const id = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(id);
          return v;
        }
        return v + 1;
      });
    }, 35);
    return () => clearInterval(id);
  }, [text]);

  return <Text style={style}>{text.slice(0, n)}</Text>;
}

// text that blinks on and off
function Blink({ children, style }) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setOn((v) => !v), 500);
    return () => clearInterval(id);
  }, []);
  return <Text style={[style, { opacity: on ? 1 : 0 }]}>{children}</Text>;
}

// fixed little stars for the stage sky: [left %, top %, size]
const STARS = [
  [8, 10, 4], [22, 24, 4], [40, 8, 4], [58, 18, 4], [74, 10, 4], [90, 26, 4],
  [14, 48, 4], [84, 52, 4], [48, 34, 4], [30, 62, 4], [66, 40, 4], [94, 8, 4],
];

function Stage({ children }) {
  return (
    <PixelBox
      border={C.cyan}
      fill={C.sky}
      pad={0}
      innerStyle={{ overflow: 'hidden' }}
    >
      <View style={styles.stageInner}>
        {STARS.map(([x, y, s], i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: s,
              height: s,
              backgroundColor: '#FFFFFF',
              opacity: i % 3 === 0 ? 1 : 0.55,
            }}
          />
        ))}
        <View style={styles.ground} />
        <View style={styles.stageContent}>{children}</View>
      </View>
    </PixelBox>
  );
}

function Records({ highScore, best }) {
  return (
    <PixelBox border={C.muted} pad={14} style={{ marginVertical: 14 }}>
      <View style={styles.recordLine}>
        <Text style={styles.small}>HI-SCORE</Text>
        <Text style={[styles.small, { color: C.gold }]}>{pad2(highScore)}</Text>
      </View>
      <View style={[styles.recordLine, { marginTop: 12 }]}>
        <Text style={styles.small}>BEST STREAK</Text>
        <Text style={[styles.small, { color: C.pink }]}>{pad2(best)}</Text>
      </View>
    </PixelBox>
  );
}

// ---------- the screen ----------
export default function GameScreen() {
  const [fontReady] = useFonts({ PressStart2P_400Regular });

  const [pool, setPool] = useState([]);
  const [teaser, setTeaser] = useState(null);
  const [phase, setPhase] = useState('menu'); // 'menu' | 'playing' | 'result'
  const [round, setRound] = useState(null);
  const [roundNo, setRoundNo] = useState(1);
  const [picked, setPicked] = useState(null); // option id, or 'timeout'
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [newHigh, setNewHigh] = useState(false);
  const [lives, setLives] = useState(LIVES);
  const [hints, setHints] = useState(3);
  const [hidden, setHidden] = useState([]);
  const [secs, setSecs] = useState(ROUND_SECONDS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const timer = useRef(new Animated.Value(1)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(1)).current;

  const roundRef = useRef(null);
  const lockRef = useRef(false);
  const resolveRef = useRef(() => {});
  roundRef.current = round;

  // the timer value drives the whole-second counter
  useEffect(() => {
    const id = timer.addListener(({ value }) =>
      setSecs(Math.ceil(value * ROUND_SECONDS))
    );
    return () => timer.removeListener(id);
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchFirst151();
      setPool(list);
      setTeaser(list[Math.floor(Math.random() * list.length)]);
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
      setError('COULD NOT LOAD THE GAME. CHECK YOUR INTERNET.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const answered = picked !== null;

  // ---------- game logic ----------
  const beginRound = (r) => {
    lockRef.current = false;
    setPicked(null);
    setHidden([]);
    setRound(r);
    setSecs(ROUND_SECONDS);
    timer.setValue(1);
    Animated.timing(timer, {
      toValue: 0,
      duration: ROUND_SECONDS * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) resolveRef.current(null); // time ran out
    });
  };

  const resolve = (optionId) => {
    if (lockRef.current || !roundRef.current) return;
    lockRef.current = true;
    timer.stopAnimation();
    setPicked(optionId === null ? 'timeout' : optionId);

    const correct =
      optionId !== null && optionId === roundRef.current.answer.id;

    pop.setValue(0.8);
    Animated.spring(pop, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

    if (correct) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const next = s + 1;
        setBest((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
      setLives((l) => l - 1);
      Animated.sequence([
        Animated.timing(shake, { toValue: 12, duration: 50, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -12, duration: 50, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  };
  resolveRef.current = resolve;

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setLives(LIVES);
    setHints(3);
    setRoundNo(1);
    setNewHigh(false);
    setPhase('playing');
    beginRound(makeRound(pool));
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

  const onNext = () => {
    if (roundNo >= TOTAL_ROUNDS || lives <= 0) {
      finishGame();
      return;
    }
    setRoundNo((n) => n + 1);
    beginRound(makeRound(pool));
  };

  const onHint = () => {
    if (lockRef.current || hints === 0 || hidden.length > 0) return;
    const wrong = round.options.filter((o) => o.id !== round.answer.id);
    setHidden(shuffle(wrong).slice(0, 2).map((o) => o.id));
    setHints((h) => h - 1);
  };

  // ---------- loading / error ----------
  if (loading || !fontReady) {
    return (
      <View style={styles.center}>
        <Blink style={styles.big}>LOADING...</Blink>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={[styles.small, { textAlign: 'center', lineHeight: 20 }]}>
          {error}
        </Text>
        <View style={{ alignSelf: 'stretch', marginTop: 20 }}>
          <PixelButton label="TRY AGAIN" color={C.cyan} onPress={load} />
        </View>
      </View>
    );
  }

  // ---------- start screen ----------
  if (phase === 'menu') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.pad}>
        <Text style={[styles.title, { color: C.pink }]}>WHO'S THAT</Text>
        <Text style={[styles.title, { color: C.gold }]}>POKEMON?</Text>

        <View style={{ marginTop: 18 }}>
          <Stage>
            {teaser && (
              <Image
                source={{ uri: artworkUrl(teaser.id) }}
                style={styles.silhouette}
                contentFit="contain"
                tintColor="#000000"
              />
            )}
          </Stage>
        </View>

        <Records highScore={highScore} best={best} />

        <Text style={[styles.tiny, { textAlign: 'center', marginBottom: 16 }]}>
          {TOTAL_ROUNDS} ROUNDS · {LIVES} LIVES · {ROUND_SECONDS} SEC
        </Text>

        <PixelButton label="PRESS START" onPress={startGame} />
      </ScrollView>
    );
  }

  // ---------- results screen ----------
  if (phase === 'result') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.pad}>
        <Text style={[styles.title, { color: C.red }]}>GAME OVER</Text>
        <Text style={[styles.tiny, { textAlign: 'center', marginTop: 12 }]}>
          {lives <= 0 ? 'YOU RAN OUT OF LIVES' : 'ALL ROUNDS COMPLETE'}
        </Text>

        <PixelBox border={C.gold} pad={22} style={{ marginTop: 22 }}>
          <Text style={styles.finalLabel}>YOUR SCORE</Text>
          <Text style={styles.finalScore}>
            {pad2(score)}
            <Text style={styles.finalOf}>/{TOTAL_ROUNDS}</Text>
          </Text>
          <Text style={styles.rank}>{rankFor(score)}</Text>
          {newHigh && (
            <Blink style={[styles.small, { color: C.green, marginTop: 16, textAlign: 'center' }]}>
              NEW HI-SCORE!
            </Blink>
          )}
        </PixelBox>

        <Records highScore={highScore} best={best} />

        <PixelButton label="PLAY AGAIN" onPress={startGame} />
      </ScrollView>
    );
  }

  // ---------- playing ----------
  const gotIt = answered && picked === round.answer.id;
  const timedOut = picked === 'timeout';
  const isLast = roundNo >= TOTAL_ROUNDS || lives <= 0;
  const answerName = round.answer.name.toUpperCase();

  const message = !answered
    ? "WHO'S THAT POKEMON?"
    : gotIt
    ? `YES! IT'S ${answerName}!`
    : timedOut
    ? `TIME UP! IT'S ${answerName}.`
    : `NO... IT'S ${answerName}.`;

  const blockColor = secs > 6 ? C.cyan : secs > 3 ? C.gold : C.red;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.pad}>
      {/* top bar: score, round, lives */}
      <View style={styles.hud}>
        <View>
          <Text style={styles.tinyGold}>SCORE</Text>
          <Text style={styles.hudValue}>{pad2(score)}</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.tinyGold}>ROUND</Text>
          <Text style={styles.hudValue}>
            {pad2(roundNo)}/{TOTAL_ROUNDS}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.tinyGold}>LIVES</Text>
          <View style={styles.hearts}>
            {Array.from({ length: LIVES }).map((_, i) => (
              <PixelHeart key={i} filled={i < lives} />
            ))}
          </View>
        </View>
      </View>

      {/* stage with the silhouette */}
      <Stage>
        <Animated.View
          style={{ transform: [{ translateX: shake }, { scale: pop }] }}
        >
          <Image
            source={{ uri: artworkUrl(round.answer.id) }}
            style={styles.silhouette}
            contentFit="contain"
            tintColor={answered ? undefined : '#000000'}
          />
        </Animated.View>
      </Stage>

      {/* timer: one block per second */}
      <View style={styles.blocks}>
        {Array.from({ length: ROUND_SECONDS }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.block,
              { backgroundColor: i < secs ? blockColor : C.panel },
            ]}
          />
        ))}
      </View>

      <Text style={[styles.tiny, { marginTop: 10 }]}>
        STREAK {pad2(streak)}   BEST {pad2(best)}
      </Text>

      {/* dialogue box */}
      <PixelBox border={C.white} pad={14} style={{ marginTop: 14 }}>
        <View style={{ minHeight: 44 }}>
          <Typewriter
            key={`${roundNo}-${picked}`}
            text={message}
            style={[
              styles.small,
              { lineHeight: 22 },
              answered && { color: gotIt ? C.green : C.pink },
            ]}
          />
        </View>
      </PixelBox>

      {/* answers as menu rows */}
      <View style={{ marginTop: 14, gap: 10 }}>
        {round.options.map((option, i) => {
          const isHidden = hidden.includes(option.id);
          const ok = answered && option.id === round.answer.id;
          const bad = answered && option.id === picked && !ok;
          const dim = answered && !ok && !bad;
          return (
            <Pressable
              key={option.id}
              disabled={answered || isHidden}
              onPress={() => resolve(option.id)}
              style={({ pressed }) => ({
                opacity: isHidden ? 0.15 : dim ? 0.45 : 1,
                transform: [{ translateY: pressed ? 3 : 0 }],
              })}
            >
              <PixelBox
                border={ok ? C.green : bad ? C.red : C.white}
                fill={ok ? C.green : bad ? C.red : C.panel}
                pad={14}
              >
                <View style={styles.optionRow}>
                  <Text
                    style={[
                      styles.small,
                      { color: ok ? '#06281A' : bad ? C.white : C.gold, width: 34 },
                    ]}
                  >
                    {'ABCD'[i]}
                  </Text>
                  <Text
                    style={[
                      styles.small,
                      { color: ok ? '#06281A' : C.white, flex: 1 },
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {option.name.toUpperCase()}
                  </Text>
                </View>
              </PixelBox>
            </Pressable>
          );
        })}
      </View>

      {!answered && (
        <Pressable
          onPress={onHint}
          disabled={hints === 0 || hidden.length > 0}
          style={[
            styles.hintWrap,
            (hints === 0 || hidden.length > 0) && { opacity: 0.35 },
          ]}
        >
          <PixelBox border={C.gold} pad={10}>
            <Text style={[styles.tiny, { color: C.gold }]}>
              HINT 50/50 x{hints}
            </Text>
          </PixelBox>
        </Pressable>
      )}

      {answered && (
        <View style={{ marginTop: 18 }}>
          <PixelButton
            label={isLast ? 'SEE RESULTS' : 'NEXT'}
            onPress={onNext}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  pad: { padding: 16, paddingBottom: 40 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bg,
    padding: 24,
  },

  // text styles (pixel font everywhere on this screen)
  title: {
    fontFamily: PIXEL,
    fontSize: 26,
    lineHeight: 36,
    textAlign: 'center',
    textShadowColor: '#000000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  big: { fontFamily: PIXEL, fontSize: 18, color: C.white },
  small: { fontFamily: PIXEL, fontSize: 12, color: C.white },
  tiny: { fontFamily: PIXEL, fontSize: 10, color: C.muted, lineHeight: 16 },
  tinyGold: { fontFamily: PIXEL, fontSize: 9, color: C.gold },
  buttonText: {
    fontFamily: PIXEL,
    fontSize: 14,
    color: '#1B1240',
    textAlign: 'center',
  },

  // pixel box corner notch (same colour as the screen background)
  notch: { position: 'absolute', width: 4, height: 4, backgroundColor: C.bg },

  // stage
  stageInner: { height: 250 },
  ground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 30,
    backgroundColor: C.skyDark,
    borderTopWidth: 4,
    borderTopColor: '#4B3BC4',
  },
  stageContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  silhouette: { width: 200, height: 200 },

  // hud
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  hudValue: { fontFamily: PIXEL, fontSize: 16, color: C.white, marginTop: 6 },
  hearts: { flexDirection: 'row', gap: 4, marginTop: 6 },

  // timer blocks
  blocks: { flexDirection: 'row', gap: 4, marginTop: 14 },
  block: { flex: 1, height: 14 },

  optionRow: { flexDirection: 'row', alignItems: 'center' },
  hintWrap: { alignSelf: 'flex-start', marginTop: 16 },

  // records + result
  recordLine: { flexDirection: 'row', justifyContent: 'space-between' },
  finalLabel: {
    fontFamily: PIXEL,
    fontSize: 10,
    color: C.muted,
    textAlign: 'center',
  },
  finalScore: {
    fontFamily: PIXEL,
    fontSize: 44,
    color: C.gold,
    textAlign: 'center',
    marginTop: 12,
  },
  finalOf: { fontSize: 20, color: C.muted },
  rank: {
    fontFamily: PIXEL,
    fontSize: 12,
    color: C.cyan,
    textAlign: 'center',
    marginTop: 14,
  },
});