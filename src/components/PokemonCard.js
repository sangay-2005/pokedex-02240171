import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { artworkUrl } from '../api';
import { colors, softShadow, tintFor } from '../theme';

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function PokemonCard({ id, name, onPress, onRemove }) {
  const [tint, strong] = tintFor(id);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: tint },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <Text style={[styles.watermark, { color: strong }]}>
        {String(id).padStart(3, '0')}
      </Text>

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
        <Text style={[styles.number, { color: strong }]}>
          #{String(id).padStart(4, '0')}
        </Text>
        <Text style={styles.name} numberOfLines={1}>
          {capitalize(name)}
        </Text>
      </View>

      {onRemove && (
        <Pressable onPress={onRemove} style={styles.removeBtn} hitSlop={8}>
          <Text style={styles.removeText}>Remove</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginVertical: 7,
    overflow: 'hidden',
    ...softShadow,
  },
  watermark: {
    position: 'absolute',
    right: -6,
    bottom: -18,
    fontSize: 84,
    fontWeight: '900',
    opacity: 0.2,
  },
  badge: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...softShadow,
  },
  image: { width: 68, height: 68 },
  info: { flex: 1, marginLeft: 16 },
  number: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  removeBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.wrong,
  },
  removeText: { color: '#B3261E', fontWeight: '700', fontSize: 13 },
});