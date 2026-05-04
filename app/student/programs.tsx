import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, FlatList, TouchableOpacity, 
  TextInput, ActivityIndicator, useWindowDimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Search, ChevronLeft, Book, Clock, 
  DollarSign, Calendar, ChevronRight, GraduationCap,
  Home, BookOpen, LayoutDashboard
} from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/config';

export default function StudentPrograms() {
  const { width } = useWindowDimensions();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_BASE_URL}/courses`);
      setCourses(res.data);
    } catch (err) {
      console.error('Fetch Programs Error:', err);
      setError('Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status?.toUpperCase()) {
      case 'OPEN': return '#10b981';
      case 'CLOSED': return '#ef4444';
      case 'UPCOMING': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getCountdown = (dateString: string) => {
    if (!dateString) return 'TBA';
    const target = new Date(dateString).getTime();
    const now = new Date().getTime();
    const diff = target - now;
    
    if (diff <= 0) return 'Started / Passed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Starts Tomorrow';
    return `Starts in ${days} days`;
  };

  const handleDashboard = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        const userStr = await SecureStore.getItemAsync('userData');
        const user = userStr ? JSON.parse(userStr) : null;
        if (user && ['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'].includes(user.role)) {
          router.push('/admin/dashboard');
        } else {
          router.push('/student/dashboard');
        }
      } else {
        router.push('/contact');
      }
    } catch (e) {
      router.push('/contact');
    }
  };

  const filteredCourses = courses.filter((c: any) => {
    const titleStr = (c.title || c.name || '').toLowerCase();
    const codeStr = (c.code || '').toLowerCase();
    const queryStr = searchQuery.toLowerCase();
    
    const matchesSearch = titleStr.includes(queryStr) || codeStr.includes(queryStr);
    if (activeTab === 'All') return matchesSearch;
    return matchesSearch && (c.intakeStatus || 'OPEN') === activeTab.toUpperCase();
  });

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true, 
        headerTitle: 'Available Programs',
        headerTintColor: '#fff',
        headerStyle: { backgroundColor: '#0f172a' },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
        )
      }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.subtitle}>Discover your future at CSBM University</Text>
        
        <View style={styles.searchBar}>
          <Search size={18} color="#64748b" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search programs..."
            placeholderTextColor="#475569"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterRow}>
          {['All', 'Open', 'Upcoming'].map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.filterTab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.filterText, activeTab === tab && styles.activeFilterText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Oops! Something went wrong.</Text>
          <Text style={styles.emptySub}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchCourses}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          keyExtractor={(item) => (item._id || item.id).toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => router.push(`/student/program-detail?id=${item._id || item.id}`)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconBox}>
                  <GraduationCap size={24} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.courseTitle}>{item.title || item.name}</Text>
                  <Text style={styles.courseCode}>{item.code}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.intakeStatus)}20` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.intakeStatus) }]}>{item.intakeStatus}</Text>
                </View>
              </View>

              <View style={styles.metaGrid}>
                <View style={styles.metaItem}>
                  <Clock size={14} color="#64748b" />
                  <Text style={styles.metaText}>{item.duration || 'N/A'}</Text>
                </View>
                <View style={styles.metaItem}>
                  <DollarSign size={14} color="#64748b" />
                  <Text style={styles.metaText}>LKR {item.fees?.toLocaleString() || item.courseFee?.toLocaleString() || '0'} / year</Text>
                </View>
                <View style={[styles.metaItem, { width: '100%', marginTop: 4 }]}>
                  <Calendar size={14} color="#4F46E5" />
                  <Text style={[styles.metaText, { color: '#4F46E5', fontWeight: '700' }]}>
                    {getCountdown(item.nextIntakeDate)}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.detailsBtn}>View Details</Text>
                <ChevronRight size={16} color="#4F46E5" />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Book size={64} color="#1e293b" />
              <Text style={styles.emptyTitle}>No programs found</Text>
              <Text style={styles.emptySub}>Try adjusting your filters or search query.</Text>
            </View>
          }
        />
      )}

      {/* Custom Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/')}>
          <Home size={24} color="#64748b" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} disabled>
          <BookOpen size={24} color="#4F46E5" />
          <Text style={[styles.tabText, { color: '#4F46E5' }]}>Programs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={handleDashboard}>
          <LayoutDashboard size={24} color="#64748b" />
          <Text style={styles.tabText}>Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20 },
  subtitle: { color: '#94a3b8', fontSize: 14, marginBottom: 20 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 16,
  },
  searchInput: { flex: 1, color: '#fff', marginLeft: 12, fontSize: 15 },
  filterRow: { flexDirection: 'row', gap: 10 },
  filterTab: { 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 12, 
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  activeTab: { backgroundColor: 'rgba(79, 70, 229, 0.2)', borderColor: '#4F46E5' },
  filterText: { color: '#64748b', fontSize: 13, fontWeight: '700' },
  activeFilterText: { color: '#fff' },
  listContent: { padding: 20, paddingBottom: 120 },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#4F46E5', alignItems: 'center', justifyContent: 'center' },
  courseTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 2 },
  courseCode: { color: '#64748b', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800' },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 18 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.03)', paddingTop: 14 },
  detailsBtn: { color: '#4F46E5', fontSize: 13, fontWeight: '800' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 20 },
  emptySub: { color: '#64748b', fontSize: 14, marginTop: 8, textAlign: 'center' },
  retryBtn: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#4F46E5', borderRadius: 8 },
  retryBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: 'rgba(15,23,42,0.95)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingBottom: 30, paddingTop: 15 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  tabText: { fontSize: 11, fontWeight: '700', color: '#64748b' }
});
