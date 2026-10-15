import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PokemonCard from '../components/PokemonCard';
import HardShadow from '../components/HardShadow';
import {
  fetchAllNames,
  fetchPokemonPage,
  PAGE_SIZE,
  START_OFFSET,
} from '../api';
import { colors, OUTLINE } from '../theme';

export default function PokedexScreen({ navigation }) {
  // ---- infinite scroll list ----
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(START_OFFSET);
  const busyRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (busyRef.current || !hasMore) return;
    busyRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const page = await fetchPokemonPage(offsetRef.current);
      offsetRef.current += PAGE_SIZE;
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...page.items.filter((p) => !seen.has(p.id))];
      });
      setHasMore(page.hasMore);
    } catch (e) {
      setError('Could not load Pokémon. Check your internet connection.');
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  }, [hasMore]);

  useEffect(() => {
    loadMore();
  }, []);

  // ---- search ----
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [allNames, setAllNames] = useState(null);
  const [namesError, setNamesError] = useState(false);
  const namesBusyRef = useRef(false);

  // debounce: only update after 400 ms without typing
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 400);
    return () => clearTimeout(t);
  }, [query]);

  const loadNames = useCallback(async () => {
    if (namesBusyRef.current) return;
    namesBusyRef.current = true;
    setNamesError(false);
    try {
      setAllNames(await fetchAllNames());
    } catch (e) {
      setNamesError(true);
    } finally {
      namesBusyRef.current = false;
    }
  }, []);

  // download all names the first time the user searches
  useEffect(() => {
    if (debounced && !allNames) loadNames();
  }, [debounced]);

  const searching = debounced.length > 0;
  const results = allNames
    ? allNames.filter((p) => p.name.includes(debounced))
    : [];

  const openDetail = (id) => navigation.navigate('Detail', { id });

  const renderCard = ({ item }) => (
    <PokemonCard
      id={item.id}
      name={item.name}
      onPress={() => openDetail(item.id)}
    />
  );

  const RetryButton = ({ onPress }) => (
    <HardShadow radius={14} style={{ marginTop: 6 }}>
      <Pressable style={styles.retryBtn} onPress={onPress}>
        <Text style={styles.retryText}>RETRY</Text>
      </Pressable>
    </HardShadow>
  );

  const ErrorBox = ({ message, onRetry }) => (
    <View style={styles.center}>
      <Text style={styles.errorText}>{message}</Text>
      <RetryButton onPress={onRetry} />
    </View>
  );

  let body;
  if (searching) {
    if (namesError) {
      body = (
        <ErrorBox
          message="Could not search. Check your internet connection."
          onRetry={loadNames}
        />
      );
    } else if (!allNames) {
      body = (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.ink} />
        </View>
      );
    } else if (results.length === 0) {
      body = (
        <View style={styles.emptyWrap}>
          <HardShadow radius={24} offset={6}>
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Ionicons name="search" size={36} color={colors.ink} />
              </View>
              <Text style={styles.emptyTitle}>NO POKÉMON FOUND</Text>
              <Text style={styles.emptyText}>
                Nothing matches "{debounced}". Check the spelling or try a
                shorter name.
              </Text>
            </View>
          </HardShadow>
        </View>
      );
    } else {
      body = (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCard}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      );
    }
  } else if (error && items.length === 0) {
    body = <ErrorBox message={error} onRetry={loadMore} />;
  } else if (loading && items.length === 0) {
    body = (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.ink} />
      </View>
    );
  } else {
    body = (
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCard}
        keyboardShouldPersistTaps="handled"
        onEndReached={error ? null : loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingVertical: 8 }}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator style={{ margin: 16 }} color={colors.ink} />
          ) : error ? (
            <View style={styles.footerError}>
              <Text style={styles.errorText}>{error}</Text>
              <RetryButton onPress={loadMore} />
            </View>
          ) : null
        }
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>GOTTA FETCH 'EM ALL!</Text>
        </View>
        <HardShadow radius={16}>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={22} color={colors.ink} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search all Pokémon"
              placeholderTextColor={colors.muted}
              autoCorrect={false}
              autoCapitalize="none"
              style={styles.searchInput}
            />
          </View>
        </HardShadow>
      </View>
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  top: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderWidth: OUTLINE,
    borderColor: colors.ink,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
    transform: [{ rotate: '-2deg' }],
  },
  tagText: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 1,
    fontSize: 12,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: OUTLINE,
    borderColor: colors.ink,
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: colors.ink,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  footerError: { alignItems: 'center', padding: 16 },
  retryBtn: {
    backgroundColor: colors.accent,
    borderWidth: OUTLINE,
    borderColor: colors.ink,
    borderRadius: 14,
    paddingHorizontal: 26,
    paddingVertical: 10,
  },
  retryText: { color: colors.ink, fontWeight: '900', letterSpacing: 1 },

  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  emptyCard: {
    backgroundColor: colors.pink,
    borderWidth: OUTLINE,
    borderColor: colors.ink,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#fff',
    borderWidth: OUTLINE,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
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