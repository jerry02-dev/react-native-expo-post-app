import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator,
  Alert, RefreshControl, TextInput,
  Animated
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import postApi      from '../../api/postApi';

// ── Skeleton Card ──────────────────────────────────────────────────────
const SkeletonCard = ({ colors }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1,   duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[skeletonStyles.card, { backgroundColor: colors.card, opacity }]}>
      <View style={[skeletonStyles.badge,    { backgroundColor: colors.divider }]} />
      <View style={[skeletonStyles.titleFull, { backgroundColor: colors.divider }]} />
      <View style={[skeletonStyles.titleHalf, { backgroundColor: colors.divider }]} />
      <View style={[skeletonStyles.line,      { backgroundColor: colors.divider }]} />
      <View style={[skeletonStyles.line,      { backgroundColor: colors.divider }]} />
      <View style={[skeletonStyles.lineShort, { backgroundColor: colors.divider }]} />
      <View style={[skeletonStyles.footer,    { borderTopColor: colors.divider }]}>
        <View style={[skeletonStyles.dateBar, { backgroundColor: colors.divider }]} />
        <View style={[skeletonStyles.arrowBar, { backgroundColor: colors.divider }]} />
      </View>
    </Animated.View>
  );
};

const skeletonStyles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  badge: {
    width: 90,
    height: 24,
    borderRadius: 20,
    marginBottom: 12,
  },
  titleFull: {
    width: '85%',
    height: 18,
    borderRadius: 6,
    marginBottom: 8,
  },
  titleHalf: {
    width: '55%',
    height: 18,
    borderRadius: 6,
    marginBottom: 14,
  },
  line: {
    width: '100%',
    height: 13,
    borderRadius: 6,
    marginBottom: 7,
  },
  lineShort: {
    width: '70%',
    height: 13,
    borderRadius: 6,
    marginBottom: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  dateBar: {
    width: 90,
    height: 12,
    borderRadius: 6,
  },
  arrowBar: {
    width: 50,
    height: 12,
    borderRadius: 6,
  },
});

// ── Skeleton List ──────────────────────────────────────────────────────
const SkeletonList = ({ colors }) => (
  <View style={{ padding: 16 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <SkeletonCard key={i} colors={colors} />
    ))}
  </View>
);

// ── Main Screen ────────────────────────────────────────────────────────
export default function PostsListScreen({ navigation, route }) {
  const { colors }                    = useTheme();
  const filterStatus                  = route?.params?.filterStatus || '';
  const [posts, setPosts]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [page, setPage]               = useState(1);
  const [lastPage, setLastPage]       = useState(1);
  const [total, setTotal]             = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch]           = useState('');
  const [searching, setSearching]     = useState(false);
  const debounceRef                   = useRef(null);
  const listRef                       = useRef(null);

  // ── Fetch Posts ──────────────────────────────────
  const fetchPosts = async (pageNum = 1, searchTerm = '', refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      if (pageNum === 1 && searchTerm !== '') setSearching(true);

      const response                    = await postApi.getAll(pageNum, searchTerm, filterStatus);
      const { data, last_page, total: t } = response.data.data;

      setPosts(prev => pageNum === 1 ? data : [...prev, ...data]);
      setLastPage(last_page);
      setTotal(t);
      setPage(pageNum);
    } catch (error) {
      Alert.alert('Error', 'Failed to load posts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
      setSearching(false);
    }
  };

  // ── Initial Load ──────────────────────────────────
  useEffect(() => {
    fetchPosts();
    const unsubscribe = navigation.addListener('focus', () => fetchPosts(1, search));
    return unsubscribe;
  }, [navigation]);

  // ── Live Search ───────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLoadingMore(false);
    setPage(1);
    debounceRef.current = setTimeout(() => fetchPosts(1, search), 500);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const onRefresh   = () => fetchPosts(1, search, true);
  const clearSearch = () => setSearch('');

  // ── Load More ─────────────────────────────────────
  const onLoadMore = () => {
    if (loadingMore || page >= lastPage || searching) return;
    setLoadingMore(true);
    fetchPosts(page + 1, search);
  };

  // ── Scroll to Top ─────────────────────────────────
  const scrollToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // ── Header Title ──────────────────────────────────
  const getHeaderTitle = () => {
    if (filterStatus === 'published') return '🌐 Published Posts';
    if (filterStatus === 'draft')     return '📝 Draft Posts';
    return 'My Posts';
  };

  // ── Range Text ────────────────────────────────────
  const getRangeText = () => {
    if (total === 0) return 'No posts found';
    const from = 1;
    const to   = Math.min(page * 10, total);
    return `Showing ${from}–${to} of ${total} post${total !== 1 ? 's' : ''}`;
  };

  // ── Status Badge ──────────────────────────────────
  const getStatusStyle = (status) => ({
    backgroundColor: status === 'published' ? '#e6f4ea' : '#fff3e0',
    color:           status === 'published' ? '#2e7d32' : '#e65100',
  });

  const s = makeStyles(colors);

  // ── Render Post Card ──────────────────────────────
  const renderPost = ({ item }) => (
    <TouchableOpacity
      style={s.card}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
      activeOpacity={0.8}
    >
      <View>
      </View>
      <Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={s.cardBody}  numberOfLines={3}>{item.body}</Text>
      <View style={s.cardFooter}>
        <Text style={s.cardDate}>
          {new Date(item.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
          })}
        </Text>
        <Text style={s.cardArrow}> <Text style={[s.badgeText, { color: getStatusStyle(item.status).color }]}>
          {item.status === 'published' ? '● Published' : '● Draft'}
        </Text></Text>
      </View>
    </TouchableOpacity>
  );

  // ── Top Info Bar ──────────────────────────────────
  const renderHeader = () => (
    <View style={s.rangeBar}>
      <Text style={s.rangeText}>{getRangeText()}</Text>
      {page > 1 ? (
        <TouchableOpacity onPress={scrollToTop} style={s.scrollTopBtn}>
          <Text style={s.scrollTopText}>↑ Top</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  // ── Empty State ───────────────────────────────────
  const renderEmpty = () => (
    <View style={s.emptyContainer}>
      <Text style={s.emptyEmoji}>{search ? '🔍' : '📝'}</Text>
      <Text style={s.emptyTitle}>
        {search ? 'No results found' : 'No posts yet'}
      </Text>
      <Text style={s.emptySubtitle}>
        {search
          ? `No posts matched "${search}"`
          : 'Tap the + button to create your first post'
        }
      </Text>
      {search ? (
        <TouchableOpacity style={s.clearBtn} onPress={clearSearch}>
          <Text style={s.clearBtnText}>Clear Search</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  // ── Footer ────────────────────────────────────────
  const renderFooter = () => {
    // All loaded
    if (!loadingMore && page >= lastPage && posts.length > 0) {
      return (
        <View style={s.endBar}>
          <View style={s.endLine} />
          <Text style={s.endText}>All {total} post{total !== 1 ? 's' : ''} loaded</Text>
          <View style={s.endLine} />
        </View>
      );
    }

    // Loading more skeletons
    if (loadingMore) {
      return (
        <View>
          {[1, 2].map(i => <SkeletonCard key={i} colors={colors} />)}
        </View>
      );
    }

    return null;
  };

  // ── Initial Skeleton ──────────────────────────────
  if (loading) {
    return (
      <View style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.backButton}>Back</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>{getHeaderTitle()}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CreatePost')}>
            <Text style={s.addButton}>＋</Text>
          </TouchableOpacity>
        </View>
        <SkeletonList colors={colors} />
      </View>
    );
  }

  // ── Main Render ───────────────────────────────────
  return (
    <View style={s.container}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{getHeaderTitle()}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreatePost')}>
          <Text style={s.addButton}>＋</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={s.searchWrapper}>
        <View style={s.searchBar}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search by title, body or status..."
            placeholderTextColor={colors.placeholder}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity onPress={clearSearch}>
              <Text style={s.clearIcon}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {searching ? (
          <ActivityIndicator size="small" color={colors.purple} style={{ marginLeft: 4 }} />
        ) : null}
      </View>

      {/* Posts List */}
      <FlatList
        ref={listRef}
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        ListHeaderComponent={posts.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={s.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.purple}
          />
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />

    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────
const makeStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backButton: {
    fontSize: 16,
    color: colors.purple,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  addButton: {
    fontSize: 28,
    color: colors.purple,
    fontWeight: 'bold',
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    padding: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: colors.subtext,
    paddingLeft: 8,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },

  // ── Range Bar ──────────────────────────────────────
  rangeBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  rangeText: {
    fontSize: 13,
    color: colors.subtext,
    fontWeight: '500',
  },
  scrollTopBtn: {
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  scrollTopText: {
    fontSize: 12,
    color: colors.purple,
    fontWeight: '600',
  },

  // ── Post Card ──────────────────────────────────────
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 14,
    color: colors.subtext,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 10,
  },
  cardDate: {
    fontSize: 12,
    color: colors.subtext,
  },
  cardArrow: {
    fontSize: 13,
    color: colors.purple,
    fontWeight: '600',
  },

  // ── End Bar ────────────────────────────────────────
  endBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  endLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  endText: {
    fontSize: 12,
    color: colors.subtext,
    fontWeight: '500',
  },

  // ── Empty ──────────────────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.subtext,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  clearBtn: {
    backgroundColor: colors.purple,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  clearBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});