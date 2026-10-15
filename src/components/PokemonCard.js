import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { artworkUrl } from '../api';
import HardShadow from './HardShadow';
import { colors, OUTLINE, tintFor } from '../theme';

export default function PokemonCard({ id, name, onPress, onRemove }) {
  const [tint] = tintFor(id);

  return (
    <HardShadow style={styles.wrap} radius={18}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: tint },
          pressed && { transform: [{ translateX: 3 }, { translateY: 3 }] },
        ]}
      >
        <View style={styles.badge}>
          <Image
            source={{ uri: artworkUrl(id) }}
            style={styles.image}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={200}
          />
        </View>

        <View style={styles.info}>
          <View style={styles.numTag}>
            <Text style={styles.numText}>#{String(id).padStart(4, '0')}</Text>
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {name.toUpperCase()}
          </Text>
        </View>

        {onRemove && (
          <Pressable onPress={onRemove} style={styles.removeBtn} hitSlop={8}>
            <Text style={styles.removeText}>REMOVE</Text>
          </Pressable>
        )}
      </Pressable>
    </HardShadow>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 16, marginVertical: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: OUTLINE,
    borderColor: colors.ink,
    padding: 10,
  },
  badge: {
    width: 76,
    height: 76,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: OUTLINE,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: 64, height: 64 },
  info: { flex: 1, marginLeft: 14 },
  numTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.ink,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  numText: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  name: {
    fontSize: 21,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  removeBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: colors.ink,
  },
  removeText: { color: colors.ink, fontWeight: '900', fontSize: 12 },
});