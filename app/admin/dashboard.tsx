import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, ScrollView, TouchableOpacity, 
  ActivityIndicator, RefreshControl, useWindowDimensions,
  Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Users, Briefcase, Calendar, Bell, 
  ChevronRight, TrendingUp, Shield,
  LogOut, PlusCircle, Settings, FileBarChart
} from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/config';

// Helper for Web compatibility
const getToken = async (key: string) => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

const deleteToken = async (key: string) => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

export default function AdminDashboard() {
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [kpis, setKpis] = useState({
    totalStudents: 0,
    pendingApps: 0,
    activeWorkshops: 0,
    totalRevenue: '0'
  });
  const [recentApps, setRecentApps] = useState([]);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const token = await getToken('userToken');
      const userDataStr = await getToken('userData');
      
      if (!token || !userDataStr) {
        router.replace('/login');
        return;
      }

      const userData = JSON.parse(userDataStr);
      setUser(userData);

      // Fetch admin metrics
      const [appsRes, workshopsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/applications/all`, { headers: { Authorization: `Bearer ${token}` } })
          .catch(err => { console.warn('Failed to load applications:', err.message); return { data: [] }; }),
        axios.get(`${API_BASE_URL}/workshops`, { headers: { Authorization: `Bearer ${token}` } })
          .catch(err => { console.warn('Failed to load workshops:', err.message); return { data: [] }; })
      ]);

      const allApps = appsRes.data || [];
      const pending = allApps.filter((a: any) => a.status?.toLowerCase() === 'pending').length;
      
      setKpis({
        totalStudents: [...new Set(allApps.map((a: any) => a.studentId || a.email))].length,
        pendingApps: pending,
        activeWorkshops: workshopsRes.data?.length || 0,
        totalRevenue: '1.2M' // Placeholder or calculated from API
      });

      setRecentApps(allApps.slice(0, 5));
    } catch (error) {
      console.error('Admin Dashboard Load Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await deleteToken('userToken');
    await deleteToken('userData');
    router.replace('/login');
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAdminData(); }} tintColor="#4F46E5" />
        }
      >
        {/* Admin Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.adminTitle}>Control Panel</Text>
            <View style={styles.adminRow}>
              <Shield size={16} color="#4F46E5" />
              <Text style={styles.adminName}>{user?.name || 'Administrator'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut size={22} color="#f87171" />
          </TouchableOpacity>
        </View>

        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
              <Users size={20} color="#4F46E5" />
            </View>
            <Text style={styles.kpiVal}>{kpis.totalStudents}</Text>
            <Text style={styles.kpiLabel}>Students</Text>
          </View>

          <TouchableOpacity 
            style={[styles.kpiCard, { backgroundColor: '#4F46E5' }]} 
            onPress={() => router.push('/admin/registration-dashboard')}
          >
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <TrendingUp size={20} color="#fff" />
            </View>
            <Text style={styles.kpiVal}>{kpis.pendingApps}</Text>
            <Text style={[styles.kpiLabel, { color: 'rgba(255,255,255,0.8)' }]}>New Applications</Text>
            <View style={styles.actionPrompt}>
              <Text style={styles.actionPromptText}>Review Queue</Text>
              <ChevronRight size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.kpiCard}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(6, 182, 212, 0.1)' }]}>
              <Users size={20} color="#06B6D4" />
            </View>
            <Text style={styles.kpiVal}>{kpis.totalStudents}</Text>
            <Text style={styles.kpiLabel}>Total Enrolled</Text>
          </View>
        </View>

        <View style={[styles.kpiGrid, { marginTop: 12 }]}>
          <View style={styles.kpiCard}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <TrendingUp size={20} color="#10b981" />
            </View>
            <Text style={styles.kpiVal}>{kpis.totalRevenue}</Text>
            <Text style={styles.kpiLabel}>Revenue (LKR)</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Calendar size={20} color="#f59e0b" />
            </View>
            <Text style={styles.kpiVal}>{kpis.activeWorkshops}</Text>
            <Text style={styles.kpiLabel}>Workshops</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management Console</Text>
          <View style={styles.actionGrid}>
            {[
              { label: 'Students', icon: Users, color: '#4F46E5', route: '/admin/students' },
              { label: 'Courses', icon: Briefcase, color: '#06B6D4', route: '/admin/courses' },
              { label: 'Workshops', icon: Calendar, color: '#f59e0b', route: '/admin/workshops' },
              { label: 'Reports', icon: FileBarChart, color: '#10b981', route: '/admin/reports' },
            ].map((action, i) => (
              <TouchableOpacity 
                key={i} 
                style={styles.actionBtn}
                onPress={() => action.onPress ? action.onPress() : router.push(action.route)}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  <action.icon size={24} color="#fff" />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Applications Feed */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Registrations</Text>
            <TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
          </View>

          {recentApps.map((app: any, i) => (
            <View key={i} style={styles.appCard}>
              <View style={styles.appInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{(app.fullName || 'U').charAt(0)}</Text>
                </View>
                <View>
                  <Text style={styles.appName}>{app.fullName || app.studentName}</Text>
                  <Text style={styles.appCourse}>{app.courseName || 'Degree Program'}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, app.status === 'Pending' && styles.pendingBadge]}>
                <Text style={[styles.statusText, app.status === 'Pending' && styles.pendingText]}>
                  {app.status?.toUpperCase() || 'NEW'}
                </Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <PlusCircle size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  adminTitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  adminRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  adminName: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '900',
  },
  logoutBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  kpiVal: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '900',
  },
  kpiLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 4,
  },
  actionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
  },
  actionPromptText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
  },
  section: {
    marginTop: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  viewAll: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '700',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionBtn: {
    width: '48%',
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
  appCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },
  appName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  appCourse: {
    fontSize: 12,
    color: '#64748b',
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10b981',
  },
  pendingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  pendingText: {
    color: '#f59e0b',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  }
});
