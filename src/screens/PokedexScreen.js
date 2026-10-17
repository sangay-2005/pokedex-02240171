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
import FadeIn from '../components/FadeIn';
import {
  fetchAllNames,
  fetchPokemonPage,
  PAGE_SIZE,
  START_OFFSET,
} from '../api';
import { colors, glow, MONO } from '../theme';

function RetryButton({ onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.8 }]}
      onPress={onPress}
    >
      <Ionicons name="refresh" size={18} color={colors.bg} />
      <Text style={styles.retryText}>RETRY</Text>
    </Pressable>
  );
}

function ErrorBox({ message, onRetry }) {
  return (
    <View style={styles.center}>
      <View style={styles.iconRing}>
        <Ionicons name="cloud-offline" size={34} color={colors.danger} />
      </View>
      <Text style={styles.errorTitle}>CONNECTION LOST</Text>
      <Text style={styles.errorText}>{message}</Text>
      <RetryButton onPress={onRetry} />
    </View>
  );
}

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
  const [focused, setFocused] = useState(false);
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

  const renderCard = ({ item, index }) => (
    <PokemonCard
      id={item.id}
      name={item.name}
      index={index}
      onPress={() => openDetail(item.id)}
    />
  );

  const statusLabel = searching
    ? allNames
      ? `${results.length} MATCHES`
      : 'SEARCHING...'
    : `${items.length} DISCOVERED`;

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
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      );
    } else if (results.length === 0) {
      body = (
        <View style={styles.center}>
          <FadeIn style={styles.emptyCard}>
            <View style={styles.iconRing}>
              <Ionicons name="search" size={34} color={colors.accent} />
            </View>
            <Text style={styles.errorTitle}>NO POKÉMON FOUND</Text>
            <Text style={styles.errorText}>
              Nothing matches "{debounced}". Check the spelling or try a
              shorter name.
            </Text>
          </FadeIn>
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
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>LOADING POKÉDEX...</Text>
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
            <ActivityIndicator style={{ margin: 18 }} color={colors.accent} />
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
        <View style={styles.statusRow}>
          <View style={styles.dot} />
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>

        {/* only the border colour changes on focus, so the input is never rebuilt */}
        <View
          style={[
            styles.searchWrap,
            { borderColor: focused ? colors.accent : colors.border },
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={focused ? colors.accent : colors.muted}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search all Pokémon"
            placeholderTextColor={colors.muted}
            autoCorrect={false}
            autoCapitalize="none"
            selectionColor={colors.accent}
            style={styles.searchInput}
          />
          <Pressable
            onPress={() => setQuery('')}
            hitSlop={10}
            disabled={query.length === 0}
            style={{ opacity: query.length === 0 ? 0 : 1 }}
          >
            <Ionicons name="close-circle" size={20} color={colors.muted} />
          </Pressable>
        </View>
      </View>
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  top: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.hot,
    marginRight: 8,
  },
  statusText: {
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.hot,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    marginLeft: 10,
    fontSize: 16,
    color: colors.text,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  loadingText: {
    fontFamily: MONO,
    color: colors.muted,
    letterSpacing: 2,
    fontSize: 12,
    marginTop: 14,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignSelf: 'stretch',
  },
  iconRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.bg,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 1,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 14,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerError: { alignItems: 'center', padding: 16 },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
    ...glow(colors.accent, 0.5, 12),
  },
  retryText: {
    color: colors.bg,
    fontWeight: '900',
    letterSpacing: 1.5,
    fontFamily: MONO,
  },
});