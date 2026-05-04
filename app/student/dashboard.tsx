import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, ScrollView, TouchableOpacity, 
  ActivityIndicator, RefreshControl, useWindowDimensions,
  Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User, BookOpen, Calendar, Bell, 
  ChevronRight, FileText, LayoutDashboard,
  LogOut, Clock, CheckCircle, AlertCircle
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

export default function StudentDashboard() {
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    applications: [],
    courses: [],
    workshops: [],
    notifications: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
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

      // Fetch dynamic data in parallel
      const [appsRes, coursesRes, workshopsRes, notifsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/applications/my`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/courses`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/workshopregistrations/my`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/notifications`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setStats({
        applications: appsRes.data || [],
        courses: coursesRes.data || [],
        workshops: workshopsRes.data || [],
        notifications: notifsRes.data?.unreadCount || 0
      });
    } catch (error) {
      console.error('Dashboard Load Error:', error);
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

  const getStatusStyle = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'approved': return { bg: '#065f46', text: '#34d399' };
      case 'rejected': return { bg: '#7f1d1d', text: '#f87171' };
      case 'pending': return { bg: '#78350f', text: '#fbbf24' };
      default: return { bg: '#1e293b', text: '#94a3b8' };
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDashboardData(); }} tintColor="#4F46E5" />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>{user?.name || 'Student'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <Bell size={22} color="#fff" />
              {stats.notifications > 0 && <View style={styles.badge} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <LogOut size={22} color="#f87171" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.roleChip}>
          <View style={styles.dot} />
          <Text style={styles.roleText}>CAMPUS GO STUDENT</Text>
        </View>

        {/* Profile Stats Row */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{stats.applications.length}</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{stats.courses.length}</Text>
            <Text style={styles.statLabel}>Enrolled</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{stats.workshops.length}</Text>
            <Text style={styles.statLabel}>Workshops</Text>
          </View>
        </View>

        {/* Section: My Applications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Application Status</Text>
            <TouchableOpacity><Text style={styles.viewAll}>View History</Text></TouchableOpacity>
          </View>
          
          {stats.applications.length > 0 ? stats.applications.map((app: any, idx) => (
            <View key={app._id || idx} style={styles.card}>
              <View style={styles.cardInfo}>
                <FileText size={20} color="#4F46E5" />
                <View style={styles.textGroup}>
                  <Text style={styles.cardTitle}>{app.courseName || 'General Application'}</Text>
                  <Text style={styles.cardSub}>Ref: #{app._id?.substring(0, 8).toUpperCase()}</Text>
                </View>
              </View>
              <View style={[styles.statusChip, { backgroundColor: getStatusStyle(app.status).bg }]}>
                <Text style={[styles.statusText, { color: getStatusStyle(app.status).text }]}>
                  {app.status?.toUpperCase() || 'PENDING'}
                </Text>
              </View>
            </View>
          )) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No active applications</Text>
            </View>
          )}
        </View>

        {/* Section: My Workshops */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Workshops</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {stats.workshops.map((w: any, idx) => (
              <TouchableOpacity key={w._id || idx} style={styles.hCard}>
                <Calendar size={20} color="#06B6D4" />
                <Text style={styles.hCardTitle} numberOfLines={1}>{w.workshopName}</Text>
                <View style={styles.hCardFooter}>
                  <Clock size={12} color="#94a3b8" />
                  <Text style={styles.hCardDate}>{w.date || 'TBA'}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Section: Enrolled Courses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Courses</Text>
            <TouchableOpacity onPress={() => router.push('/student/programs')}>
              <Text style={styles.viewAll}>Browse All</Text>
            </TouchableOpacity>
          </View>
          {stats.courses.map((course: any, idx) => (
            <TouchableOpacity key={course._id || idx} style={styles.courseCard}>
              <View style={styles.courseIcon}>
                <BookOpen size={24} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{course.name}</Text>
                <Text style={styles.cardSub}>Intake: {course.intake || 'Current'}</Text>
              </View>
              <ChevronRight size={20} color="#334155" />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
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
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  nameText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '900',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#06B6D4',
    borderWidth: 2,
    borderColor: '#1e293b',
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4F46E5',
    marginRight: 8,
  },
  roleText: {
    color: '#4F46E5',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  statVal: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
  },
  viewAll: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  textGroup: {
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  cardSub: {
    fontSize: 12,
    color: '#64748b',
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  horizontalScroll: {
    gap: 12,
  },
  hCard: {
    width: 180,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  hCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  hCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hCardDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
  courseCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  courseIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  }
});
