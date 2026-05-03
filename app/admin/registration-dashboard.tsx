import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  FileText, Clock, CheckCircle, 
  XCircle, ChevronRight, Search, 
  UserPlus, Users, ArrowUpRight,
  TrendingUp, Calendar
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { ENDPOINTS } from '@/constants/config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RegistrationDashboard() {
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approvedToday: 0,
    rejectedToday: 0
  });
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await axios.get(`${ENDPOINTS.APPLICATIONS}?status=PENDING`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Real-world: these stats would come from a dedicated stats endpoint
      // For now, we calculate them from the response for the demo
      setRecentApps(response.data.slice(0, 10));
      setStats({
        total: response.data.length + 150, // Mocking historical data
        pending: response.data.length,
        approvedToday: 12,
        rejectedToday: 3
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const renderStatCard = (title: string, count: number, color: string, icon: any) => {
    const Icon = icon;
    return (
      <View style={[styles.statCard, { borderLeftColor: color }]}>
        <View style={styles.statHeader}>
          <Text style={styles.statLabel}>{title}</Text>
          <View style={[styles.statIconBox, { backgroundColor: `${color}15` }]}>
            <Icon size={16} color={color} />
          </View>
        </View>
        <Text style={[styles.statValue, { color }]}>{count}</Text>
        <View style={styles.statTrend}>
          <TrendingUp size={12} color="#10b981" />
          <Text style={styles.trendText}>+4% from yesterday</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Registration Dept', headerTintColor: '#fff', headerStyle: { backgroundColor: '#0f172a' } }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />}
      >
        {/* Summary Stats */}
        <View style={styles.statsRow}>
          {renderStatCard('Total Applications', stats.total, '#3b82f6', FileText)}
          {renderStatCard('Pending Review', stats.pending, '#f59e0b', Clock)}
        </View>
        <View style={[styles.statsRow, { marginTop: 12 }]}>
          {renderStatCard('Approved Today', stats.approvedToday, '#10b981', CheckCircle)}
          {renderStatCard('Rejected Today', stats.rejectedToday, '#ef4444', XCircle)}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/admin/applications')}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
                <Clock size={24} color="#4F46E5" />
              </View>
              <Text style={styles.actionText}>Review Pending</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/admin/manual-registration')}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <UserPlus size={24} color="#10b981" />
              </View>
              <Text style={styles.actionText}>Manual Entry</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/admin/student-search')}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Search size={24} color="#3b82f6" />
              </View>
              <Text style={styles.actionText}>Search Student</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Applications */}
        <View style={styles.recentContainer}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent Pending Applications</Text>
            <TouchableOpacity onPress={() => router.push('/admin/applications')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color="#4F46E5" style={{ marginTop: 20 }} />
          ) : (
            recentApps.map((item: any) => (
              <TouchableOpacity 
                key={item._id || item.id} 
                style={styles.appRow}
                onPress={() => router.push(`/admin/workflow-review/${item._id || item.id}`)}
              >
                <View style={styles.appAvatar}>
                  <Text style={styles.avatarText}>{item.fullName?.charAt(0)}</Text>
                </View>
                <View style={styles.appInfo}>
                  <Text style={styles.appName}>{item.fullName}</Text>
                  <Text style={styles.appMeta}>{item.courseName} • {new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
                <ChevronRight size={16} color="#475569" />
              </TouchableOpacity>
            ))
          )}
          
          {!loading && recentApps.length === 0 && (
            <View style={styles.emptyBox}>
              <CheckCircle size={48} color="#1e293b" />
              <Text style={styles.emptyText}>Inbox Zero! No pending applications.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
  },
  actionsContainer: {
    marginTop: 32,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: (SCREEN_WIDTH - 64) / 3,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  recentContainer: {
    marginTop: 32,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAll: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '700',
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  appAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  appInfo: {
    flex: 1,
    marginLeft: 12,
  },
  appName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  appMeta: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  emptyBox: {
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  emptyText: {
    color: '#475569',
    fontSize: 14,
    textAlign: 'center',
  },
});
