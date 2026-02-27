import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  Alert, RefreshControl, Dimensions,
  Switch, ScrollView as RNScrollView
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useAuth }        from '../context/AuthContext';
import { useTheme }       from '../context/ThemeContext';
import postApi            from '../api/postApi';
import { useFocusEffect } from '@react-navigation/native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH  = SCREEN_WIDTH - 48;

export default function HomeScreen({ navigation }) {
  const { user, logout }                = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();
  const [stats, setStats]               = useState({ total: 0, published: 0, drafts: 0, monthly: [] });
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [loggingOut, setLoggingOut]     = useState(false);
  const [activeChart, setActiveChart]   = useState(0);
  const sliderRef                       = useRef(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

const nameParts = user?.name?.split(' ');
const fullName = nameParts?.length > 1 
  ? `${nameParts[0]} ${nameParts.slice(1).join(' ')}` 
  : nameParts?.[0] || 'User';

  // ── Fetch Stats ────────────────────────────────────
  const fetchStats = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      const response = await postApi.getStats();
      setStats(response.data.data);
    } catch (e) {
      console.log('Stats error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchStats(); }, []));
  const onRefresh = () => fetchStats(true);

  // ── Logout ─────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try { await logout(); }
          catch { Alert.alert('Error', 'Something went wrong.'); }
          finally { setLoggingOut(false); }
        },
      },
    ]);
  };

  // ── Chart Switcher ─────────────────────────────────
  const switchChart = (index) => {
    setActiveChart(index);
    sliderRef.current?.scrollTo({ x: index * CHART_WIDTH, animated: true });
  };

  const onSliderScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / CHART_WIDTH);
    setActiveChart(index);
  };

  // ── Line Chart Data ────────────────────────────────
  const buildLineData = () => {
    if (!stats.monthly || stats.monthly.length === 0) {
      return { labels: ['No Data'], datasets: [{ data: [0] }] };
    }
    return {
      labels:   stats.monthly.map(m => m.month),
      datasets: [{ data: stats.monthly.map(m => Number(m.count)) }],
    };
  };

  // ── Pie Chart Data ─────────────────────────────────
  const buildPieData = () => [
    {
      name:            'Published',
      count:            stats.published || 0,
      color:           '#4CAF50',
      legendFontColor:  colors.text,
      legendFontSize:   13,
    },
    {
      name:            'Drafts',
      count:            stats.drafts || 0,
      color:           '#FF9800',
      legendFontColor:  colors.text,
      legendFontSize:   13,
    },
  ];

  // ── Chart Stats ────────────────────────────────────
  const getLatestMonth = () =>
    stats.monthly?.length > 0
      ? stats.monthly[stats.monthly.length - 1].month
      : '—';

  const getBestMonth = () =>
    stats.monthly?.length > 0
      ? Math.max(...stats.monthly.map(m => Number(m.count)))
      : 0;

  const getAvgMonth = () =>
    stats.monthly?.length > 0
      ? Math.round(
          stats.monthly.reduce((sum, m) => sum + Number(m.count), 0) /
          stats.monthly.length
        )
      : 0;

  const chartConfig = {
    backgroundGradientFrom:        '#6C63FF',
    backgroundGradientTo:          '#8b85ff',
    backgroundGradientFromOpacity: 1,
    backgroundGradientToOpacity:   1,
    color:      (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
    propsForDots: { r: '5', strokeWidth: '2', stroke: '#fff' },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: 'rgba(255,255,255,0.15)',
    },
  };

  const s = makeStyles(colors);

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C63FF" />
      }
    >

      {/* ── Purple Banner Header ───────────────────── */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <View>
            <Text style={s.greeting}>{getGreeting()} 👋</Text>
            <Text style={s.userName}>{fullName}</Text>
          </View>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{fullName.charAt(0).toUpperCase()}</Text>
          </View>
        </View>
        <Text style={s.userEmail}>{user?.email}</Text>
      </View>

      {/* ── Stats Cards ───────────────────────────── */}
      <View style={s.statsWrapper}>
        <View style={s.statsRow}>
          <View style={[s.statCard, { borderTopColor: '#6C63FF' }]}>
            {loading
              ? <ActivityIndicator color="#6C63FF" />
              : <Text style={[s.statNumber, { color: '#6C63FF' }]}>{stats.total}</Text>
            }
            <Text style={s.statLabel}>📄 Total</Text>
          </View>
          <View style={[s.statCard, { borderTopColor: '#2e7d32' }]}>
            {loading
              ? <ActivityIndicator color="#2e7d32" />
              : <Text style={[s.statNumber, { color: colors.success }]}>{stats.published}</Text>
            }
            <Text style={s.statLabel}>🌐 Published</Text>
          </View>
          <View style={[s.statCard, { borderTopColor: '#e65100' }]}>
            {loading
              ? <ActivityIndicator color="#e65100" />
              : <Text style={[s.statNumber, { color: '#e65100' }]}>{stats.drafts}</Text>
            }
            <Text style={s.statLabel}>✏️ Drafts</Text>
          </View>
        </View>
      </View>

      {/* ── Chart Section ─────────────────────────── */}
      <View style={s.section}>

        {/* Tab Switcher */}
        <View style={s.chartTabRow}>
          {['📈 Over Time', '🍩 Ratio'].map((label, index) => (
            <TouchableOpacity
              key={index}
              style={[s.chartTab, activeChart === index && s.chartTabActive]}
              onPress={() => switchChart(index)}
            >
              <Text style={[s.chartTabText, activeChart === index && s.chartTabTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Swipeable Slider */}
        {loading ? (
          <View style={s.chartPlaceholder}>
            <ActivityIndicator size="large" color="#6C63FF" />
          </View>
        ) : (
          <View style={s.sliderWrapper}>
            <RNScrollView
              ref={sliderRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onSliderScroll}
              scrollEventThrottle={16}
              style={{ width: CHART_WIDTH }}
            >

              {/* ── Chart 1: Line Chart ──────────────── */}
              <View style={[s.chartSlide, { width: CHART_WIDTH }]}>
                <Text style={s.chartTitle}>Posts Over Time</Text>
                <Text style={s.chartSub}>Last 6 months</Text>

                <View style={s.chartWrapper}>
                  <LineChart
                    data={buildLineData()}
                    width={CHART_WIDTH}
                    height={200}
                    chartConfig={chartConfig}
                    bezier
                    style={s.chart}
                    withInnerLines
                    withOuterLines={false}
                    fromZero
                  />
                </View>

                {/* ✅ Info Row below Line Chart */}
                <View style={s.chartInfoRow}>
                  <View style={s.chartInfoCard}>
                    <Text style={s.chartInfoEmoji}>📅</Text>
                    <Text style={s.chartInfoValue}>{getLatestMonth()}</Text>
                    <Text style={s.chartInfoLabel}>Latest Month</Text>
                  </View>
                  <View style={s.chartInfoDivider} />
                  <View style={s.chartInfoCard}>
                    <Text style={s.chartInfoEmoji}>📈</Text>
                    <Text style={s.chartInfoValue}>{getBestMonth()}</Text>
                    <Text style={s.chartInfoLabel}>Best Month</Text>
                  </View>
                  <View style={s.chartInfoDivider} />
                  <View style={s.chartInfoCard}>
                    <Text style={s.chartInfoEmoji}>✍️</Text>
                    <Text style={s.chartInfoValue}>{getAvgMonth()}</Text>
                    <Text style={s.chartInfoLabel}>Avg / Month</Text>
                  </View>
                </View>
              </View>

              {/* ── Chart 2: Pie Chart ───────────────── */}
              <View style={[s.chartSlide, { width: CHART_WIDTH }]}>
                <Text style={s.chartTitle}>Published vs Drafts</Text>
                <Text style={s.chartSub}>All time ratio</Text>

                {stats.total === 0 ? (
                  <View style={s.chartPlaceholder}>
                    <Text style={s.noDataText}>No posts yet</Text>
                  </View>
                ) : (
                  <>
                    <PieChart
                      data={buildPieData()}
                      width={CHART_WIDTH}
                      height={200}
                      chartConfig={chartConfig}
                      accessor="count"
                      backgroundColor="transparent"
                      paddingLeft="15"
                      absolute
                    />

                    {/* Custom Legend */}
                    <View style={s.legendRow}>
                      <View style={s.legendItem}>
                        <View style={[s.legendDot, { backgroundColor: '#4CAF50' }]} />
                        <Text style={s.legendLabel}>Published</Text>
                        <Text style={s.legendValue}>{stats.published}</Text>
                      </View>
                      <View style={s.legendDivider} />
                      <View style={s.legendItem}>
                        <View style={[s.legendDot, { backgroundColor: '#FF9800' }]} />
                        <Text style={s.legendLabel}>Drafts</Text>
                        <Text style={s.legendValue}>{stats.drafts}</Text>
                      </View>
                      <View style={s.legendDivider} />
                      <View style={s.legendItem}>
                        <View style={[s.legendDot, { backgroundColor: '#6C63FF' }]} />
                        <Text style={s.legendLabel}>Total</Text>
                        <Text style={s.legendValue}>{stats.total}</Text>
                      </View>
                    </View>
                  </>
                )}
              </View>

            </RNScrollView>

            {/* Dot Indicators */}
            <View style={s.dotRow}>
              {[0, 1].map(i => (
                <TouchableOpacity key={i} onPress={() => switchChart(i)}>
                  <View style={[s.dot, activeChart === i && s.dotActive]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* ── Quick Actions ──────────────────────────── */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Quick Actions</Text>
        <View style={s.actionsGrid}>

          <TouchableOpacity
            style={s.actionCard}
            onPress={() => navigation.navigate('PostsList')}
            activeOpacity={0.8}
          >
            <View style={[s.actionIcon, { backgroundColor: '#ede9ff' }]}>
              <Text style={s.actionEmoji}>📋</Text>
            </View>
            <Text style={s.actionLabel}>All Posts</Text>
            <Text style={s.actionSub}>View & manage</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.actionCard}
            onPress={() => navigation.navigate('CreatePost')}
            activeOpacity={0.8}
          >
            <View style={[s.actionIcon, { backgroundColor: '#e6f4ea' }]}>
              <Text style={s.actionEmoji}>✏️</Text>
            </View>
            <Text style={s.actionLabel}>New Post</Text>
            <Text style={s.actionSub}>Write something</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.actionCard}
            onPress={() => navigation.navigate('PostsList', { filterStatus: 'published' })}
            activeOpacity={0.8}
          >
            <View style={[s.actionIcon, { backgroundColor: '#e3f2fd' }]}>
              <Text style={s.actionEmoji}>🌐</Text>
            </View>
            <Text style={s.actionLabel}>Published</Text>
            <Text style={s.actionSub}>Live posts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.actionCard}
            onPress={() => navigation.navigate('PostsList', { filterStatus: 'draft' })}
            activeOpacity={0.8}
          >
            <View style={[s.actionIcon, { backgroundColor: '#fff3e0' }]}>
              <Text style={s.actionEmoji}>📝</Text>
            </View>
            <Text style={s.actionLabel}>Drafts</Text>
            <Text style={s.actionSub}>Unpublished</Text>
          </TouchableOpacity>

        </View>
      </View>

      {/* ── Settings Section ──────────────────────── */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Settings</Text>
        <View style={s.settingsCard}>

          <View style={s.settingsRow}>
            <View style={s.settingsLeft}>
              <View style={[s.settingsIcon, { backgroundColor: isDark ? '#2a2a4a' : '#ede9ff' }]}>
                <Text>{isDark ? '🌙' : '☀️'}</Text>
              </View>
              <View>
                <Text style={s.settingsLabel}>Dark Mode</Text>
                <Text style={s.settingsSub}>{isDark ? 'On' : 'Off'}</Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#e0e0e0', true: '#8b85ff' }}
              thumbColor={isDark ? '#6C63FF' : '#fff'}
            />
          </View>

          <View style={s.settingsDivider} />

          <TouchableOpacity
            style={s.settingsRow}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={s.settingsLeft}>
              <View style={[s.settingsIcon, { backgroundColor: '#e6f4ea' }]}>
                <Text>👤</Text>
              </View>
              <View>
                <Text style={s.settingsLabel}>Edit Profile</Text>
                <Text style={s.settingsSub}>Name & email</Text>
              </View>
            </View>
            <Text style={s.settingsArrow}></Text>
          </TouchableOpacity>

          <View style={s.settingsDivider} />

          <TouchableOpacity
            style={s.settingsRow}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <View style={s.settingsLeft}>
              <View style={[s.settingsIcon, { backgroundColor: '#fff3e0' }]}>
                <Text>🔒</Text>
              </View>
              <View>
                <Text style={s.settingsLabel}>Change Password</Text>
                <Text style={s.settingsSub}>Security settings</Text>
              </View>
            </View>
            <Text style={s.settingsArrow}></Text>
          </TouchableOpacity>

        </View>
      </View>

      {/* ── Account Section ────────────────────────── */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Account</Text>
        <View style={s.accountCard}>
          <View style={s.accountRow}>
            <Text style={s.accountLabel}>Name</Text>
            <Text style={s.accountValue}>{user?.name}</Text>
          </View>
          <View style={s.divider} />
          <View style={s.accountRow}>
            <Text style={s.accountLabel}>Email</Text>
            <Text style={s.accountValue}>{user?.email}</Text>
          </View>
          <View style={s.divider} />
          <View style={s.accountRow}>
            <Text style={s.accountLabel}>Member Since</Text>
            <Text style={s.accountValue}>
              {new Date(user?.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Logout ─────────────────────────────────── */}
      <View style={s.section}>
        <TouchableOpacity
          style={[s.logoutButton, loggingOut && s.buttonDisabled]}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.logoutText}>Logout</Text>
          }
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

// ── Dynamic Styles ──────────────────────────────────────────────────────
const makeStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ── Header ────────────────────────────────────────
  header: {
    backgroundColor: '#6C63FF',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 30,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  userEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },

  // ── Stats ──────────────────────────────────────────
  statsWrapper: {
    paddingHorizontal: 24,
    marginTop: -20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderTopWidth: 3,
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: colors.subtext,
    fontWeight: '500',
    textAlign: 'center',
  },

  // ── Section ────────────────────────────────────────
  section: {
    paddingHorizontal: 24,
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 14,
  },

  // ── Chart Tabs ─────────────────────────────────────
  chartTabRow: {
    flexDirection: 'row',
    backgroundColor: colors.input,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  chartTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  chartTabActive: {
    backgroundColor: '#6C63FF',
    shadowColor: '#6C63FF',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  chartTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.subtext,
  },
  chartTabTextActive: {
    color: '#fff',
  },

  // ── Slider ─────────────────────────────────────────
  sliderWrapper: {
    alignItems: 'center',
  },
  chartSlide: {
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  chartSub: {
    fontSize: 12,
    color: colors.subtext,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  chartWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6C63FF',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  chart: {
    borderRadius: 20,
  },
  chartPlaceholder: {
    height: 200,
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: colors.subtext,
  },

  // ── Chart Info Row ─────────────────────────────────
  chartInfoRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginTop: 10,
    width: '100%',
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartInfoCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  chartInfoEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  chartInfoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  chartInfoLabel: {
    fontSize: 11,
    color: colors.subtext,
    fontWeight: '500',
  },
  chartInfoDivider: {
    width: 1,
    backgroundColor: colors.divider,
    marginVertical: 4,
  },

  // ── Pie Legend ─────────────────────────────────────
  legendRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginTop: 8,
    width: '100%',
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  legendItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  legendLabel: {
    fontSize: 12,
    color: colors.subtext,
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  legendDivider: {
    width: 1,
    backgroundColor: colors.divider,
    marginVertical: 4,
  },

  // ── Dot Indicators ─────────────────────────────────
  dotRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.divider,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#6C63FF',
  },

  // ── Quick Actions ──────────────────────────────────
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionEmoji: {
    fontSize: 22,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  actionSub: {
    fontSize: 12,
    color: colors.subtext,
  },

  // ── Settings ───────────────────────────────────────
  settingsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  settingsSub: {
    fontSize: 12,
    color: colors.subtext,
  },
  settingsArrow: {
    fontSize: 16,
    color: colors.purple,
    fontWeight: 'bold',
  },
  settingsDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: 16,
  },

  // ── Account ────────────────────────────────────────
  accountCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 4,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  accountLabel: {
    fontSize: 14,
    color: colors.subtext,
  },
  accountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: 16,
  },

  // ── Logout ─────────────────────────────────────────
  logoutButton: {
    backgroundColor: colors.danger,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});