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
import {
  fetchAllNames,
  fetchPokemonPage,
  PAGE_SIZE,
  START_OFFSET,
} from '../api';
import { colors } from '../theme';

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

  const ErrorBox = ({ message, onRetry }) => (
    <View style={styles.center}>
      <Text style={styles.errorText}>{message}</Text>
      <Pressable style={styles.retryBtn} onPress={onRetry}>
        <Text style={styles.retryText}>Retry</Text>
      </Pressable>
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
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    } else if (results.length === 0) {
      body = (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="search" size={34} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Pokémon found</Text>
            <Text style={styles.emptyText}>
              Nothing matches "{debounced}". Check the spelling or try a
              shorter name.
            </Text>
          </View>
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
        <ActivityIndicator size="large" color={colors.primary} />
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
            <ActivityIndicator style={{ margin: 16 }} color={colors.primary} />
          ) : error ? (
            <View style={styles.footerError}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable style={styles.retryBtn} onPress={loadMore}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : null
        }
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Gotta fetch 'em all!</Text>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={20} color={colors.muted} />
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
      </View>
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  banner: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 6,
  },
  bannerText: {
    color: colors.accent,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    fontSize: 16,
    color: colors.text,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#3B1F8C',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: colors.text },
  emptyText: {
    marginTop: 6,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: { color: colors.text, textAlign: 'center', marginBottom: 12 },
  footerError: { alignItems: 'center', padding: 16 },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: { color: '#fff', fontWeight: 'bold' },
});