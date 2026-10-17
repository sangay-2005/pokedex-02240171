import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import FadeIn from './FadeIn';
import { artworkUrl } from '../api';
import { colors, glow, MONO, tintFor } from '../theme';

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function PokemonCard({ id, name, onPress, onRemove, index = 0 }) {
  const [accent] = tintFor(id);

  return (
    <FadeIn delay={Math.min(index % 20, 8) * 45} style={styles.wrap}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        <View style={[styles.ring, { borderColor: accent }, glow(accent, 0.55, 10)]}>
          <Image
            source={{ uri: artworkUrl(id) }}
            style={styles.image}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={200}
          />
        </View>

        <View style={styles.info}>
          <Text style={[styles.number, { color: accent }]}>
            No.{String(id).padStart(4, '0')}
          </Text>
          <Text style={styles.name} numberOfLines={1}>
            {capitalize(name)}
          </Text>
        </View>

        {onRemove ? (
          <Pressable onPress={onRemove} style={styles.removeBtn} hitSlop={8}>
            <Text style={styles.removeText}>REMOVE</Text>
          </Pressable>
        ) : (
          <Ionicons name="chevron-forward" size={22} color={colors.muted} />
        )}
      </Pressable>
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 16, marginVertical: 6 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  pressed: { backgroundColor: colors.surface2, transform: [{ scale: 0.98 }] },
  ring: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.bg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: 62, height: 62 },
  info: { flex: 1, marginLeft: 14 },
  number: { fontFamily: MONO, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  name: { fontSize: 21, fontWeight: '800', color: colors.text, marginTop: 2 },
  removeBtn: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  removeText: {
    fontFamily: MONO,
    color: colors.danger,
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 1,
  },
});