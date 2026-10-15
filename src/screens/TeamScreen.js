import { FlatList, StyleSheet, Text, View } from 'react-native';
import PokemonCard from '../components/PokemonCard';
import HardShadow from '../components/HardShadow';
import { MAX_TEAM, useTeam } from '../context/TeamContext';
import { colors, OUTLINE } from '../theme';

export default function TeamScreen({ navigation }) {
  const { team, removeFromTeam, totalStats } = useTeam();

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <View>
          <Text style={styles.count}>
            {team.length}/{MAX_TEAM}
          </Text>
          <Text style={styles.countLabel}>POKÉMON</Text>
          <View style={styles.slots}>
            {Array.from({ length: MAX_TEAM }).map((_, i) => (
              <View
                key={i}
                style={[styles.slot, i < team.length && styles.slotFilled]}
              />
            ))}
          </View>
        </View>

        <HardShadow radius={16} offset={5} color={colors.ink}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalStats}</Text>
            <Text style={styles.statLabel}>COMBINED{'\n'}BASE STATS</Text>
          </View>
        </HardShadow>
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
          <View style={styles.emptyWrap}>
            <HardShadow radius={24} offset={6}>
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>YOUR TEAM IS EMPTY</Text>
                <Text style={styles.emptyText}>
                  Open a Pokémon from the Pokédex tab and tap "Add to team".
                </Text>
              </View>
            </HardShadow>
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
    borderBottomWidth: OUTLINE,
    borderBottomColor: colors.ink,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  count: { color: '#fff', fontSize: 44, fontWeight: '900', lineHeight: 48 },
  countLabel: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 2,
    fontSize: 12,
  },
  slots: { flexDirection: 'row', gap: 6, marginTop: 10 },
  slot: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 2.5,
    borderColor: colors.ink,
  },
  slotFilled: { backgroundColor: colors.accent },

  statBox: {
    backgroundColor: '#fff',
    borderWidth: OUTLINE,
    borderColor: colors.ink,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statValue: { fontSize: 30, fontWeight: '900', color: colors.ink },
  statLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    color: colors.ink,
    textAlign: 'center',
  },

  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  emptyCard: {
    backgroundColor: colors.mint,
    borderWidth: OUTLINE,
    borderColor: colors.ink,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: 0.5,
  },
  emptyText: {
    marginTop: 8,
    color: colors.ink,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
});