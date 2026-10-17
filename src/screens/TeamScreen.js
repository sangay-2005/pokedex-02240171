import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import FadeIn from '../components/FadeIn';
import { artworkUrl } from '../api';
import { MAX_TEAM, useTeam } from '../context/TeamContext';
import { colors, glow, MONO, tintFor } from '../theme';

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function Slot({ member, index, width, onOpen, onRemove, onRecruit }) {
  if (!member) {
    return (
      <FadeIn delay={index * 70} style={{ width }}>
        <Pressable
          onPress={onRecruit}
          style={({ pressed }) => [
            styles.slot,
            styles.slotEmpty,
            pressed && { backgroundColor: colors.surface },
          ]}
        >
          <Ionicons name="add" size={36} color={colors.muted} />
          <Text style={styles.slotNumber}>SLOT {index + 1}</Text>
          <Text style={styles.recruit}>RECRUIT</Text>
        </Pressable>
      </FadeIn>
    );
  }

  const [accent] = tintFor(member.id);

  return (
    <FadeIn delay={index * 70} style={{ width }}>
      <Pressable
        onPress={onOpen}
        style={({ pressed }) => [
          styles.slot,
          { borderColor: accent + '99' },
          pressed && { backgroundColor: colors.surface2 },
        ]}
      >
        <Text style={[styles.slotNumber, { color: accent }]}>
          No.{String(member.id).padStart(4, '0')}
        </Text>
        <View style={[styles.ring, { borderColor: accent }, glow(accent, 0.5, 10)]}>
          <Image
            source={{ uri: artworkUrl(member.id) }}
            style={styles.image}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={200}
          />
        </View>
        <Text style={styles.slotName} numberOfLines={1}>
          {capitalize(member.name)}
        </Text>
        <Pressable onPress={onRemove} style={styles.removeBtn} hitSlop={6}>
          <Text style={styles.removeText}>REMOVE</Text>
        </Pressable>
      </Pressable>
    </FadeIn>
  );
}

export default function TeamScreen({ navigation }) {
  const { team, removeFromTeam, totalStats } = useTeam();
  const { width: screenW } = useWindowDimensions();
  const slotW = (screenW - 32 - 12) / 2;

  const slots = Array.from({ length: MAX_TEAM }, (_, i) => team[i] || null);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
    >
      {/* party banner */}
      <View style={styles.banner}>
        <View>
          <Text style={styles.bannerLabel}>PARTY</Text>
          <Text style={styles.count}>
            {team.length}/{MAX_TEAM}
          </Text>
          <View style={styles.segments}>
            {slots.map((m, i) => (
              <View
                key={i}
                style={[styles.segment, m && styles.segmentFilled]}
              />
            ))}
          </View>
        </View>

        <View style={styles.powerBox}>
          <Text style={styles.powerValue}>{totalStats}</Text>
          <Text style={styles.powerLabel}>POWER</Text>
          <Text style={styles.powerSub}>combined base stats</Text>
        </View>
      </View>

      {/* 2 x 3 grid of slots */}
      <View style={styles.grid}>
        {slots.map((m, i) => (
          <Slot
            key={m ? m.id : `empty-${i}`}
            member={m}
            index={i}
            width={slotW}
            onOpen={() => navigation.navigate('Detail', { id: m.id })}
            onRemove={() => removeFromTeam(m.id)}
            onRecruit={() => navigation.navigate('Pokédex')}
          />
        ))}
      </View>

      <Text style={styles.hint}>
        {team.length === 0
          ? 'Your team is empty. Tap a slot to recruit your first Pokémon.'
          : team.length < MAX_TEAM
          ? 'Tap an empty slot to recruit more Pokémon.'
          : 'Your party is full. Remove a member to recruit another.'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  banner: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bannerLabel: {
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3,
    color: colors.hot,
  },
  count: { fontSize: 44, fontWeight: '900', color: colors.text, lineHeight: 50 },
  segments: { flexDirection: 'row', gap: 6, marginTop: 8 },
  segment: {
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface2,
  },
  segmentFilled: { backgroundColor: colors.accent },

  powerBox: { alignItems: 'flex-end' },
  powerValue: {
    fontFamily: MONO,
    fontSize: 34,
    fontWeight: '900',
    color: colors.gold,
  },
  powerLabel: {
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3,
    color: colors.gold,
  },
  powerSub: { fontSize: 11, color: colors.muted, marginTop: 2 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  slot: {
    height: 210,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  slotEmpty: { borderStyle: 'dashed', backgroundColor: 'transparent' },
  slotNumber: {
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.muted,
  },
  recruit: {
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    color: colors.accent,
    marginTop: 4,
  },
  ring: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.bg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  image: { width: 80, height: 80 },
  slotName: { fontSize: 17, fontWeight: '800', color: colors.text },
  removeBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  removeText: {
    fontFamily: MONO,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: colors.danger,
  },

  hint: {
    marginTop: 20,
    textAlign: 'center',
    color: colors.muted,
    lineHeight: 20,
  },
});