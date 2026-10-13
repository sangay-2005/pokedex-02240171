import { FlatList, StyleSheet, Text, View } from 'react-native';
import PokemonCard from '../components/PokemonCard';
import { MAX_TEAM, useTeam } from '../context/TeamContext';
import { colors } from '../theme';

export default function TeamScreen({ navigation }) {
  const { team, removeFromTeam, totalStats } = useTeam();

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <View>
          <Text style={styles.count}>
            {team.length}/{MAX_TEAM} Pokémon
          </Text>
          <View style={styles.dots}>
            {Array.from({ length: MAX_TEAM }).map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i < team.length && styles.dotFilled]}
              />
            ))}
          </View>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statValue}>{totalStats}</Text>
          <Text style={styles.statLabel}>Combined base stats</Text>
        </View>
      </View>

      <FlatList
        data={team}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PokemonCard
            id={item.id}
            name={item.name}
            onPress={() => navigation.navigate('Detail', { id: item.id })}
            onRemove={() => removeFromTeam(item.id)}
          />
        )}
        contentContainerStyle={{ paddingVertical: 8, flexGrow: 1 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Your team is empty</Text>
            <Text style={styles.emptyText}>
              Open a Pokémon from the Pokédex tab and tap "Add to team".
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  banner: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  count: { color: '#fff', fontSize: 22, fontWeight: '900' },
  dots: { flexDirection: 'row', gap: 6, marginTop: 10 },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotFilled: { backgroundColor: colors.accent },
  statChip: {
    backgroundColor: colors.accent,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  statValue: { fontSize: 24, fontWeight: '900', color: colors.primaryDark },
  statLabel: { fontSize: 10, fontWeight: '800', color: colors.primaryDark },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: colors.text },
  emptyText: { marginTop: 8, color: colors.muted, textAlign: 'center' },
});