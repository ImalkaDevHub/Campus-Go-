import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, FlatList, TouchableOpacity, 
  TextInput, ActivityIndicator, useWindowDimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Search, ChevronLeft, Book, Clock, 
  DollarSign, Calendar, ChevronRight, GraduationCap, Filter
} from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import axios from 'axios';
import { API_BASE_URL } from '@/constants/config';

export default function StudentPrograms() {
  const { width } = useWindowDimensions();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/courses`);
      setCourses(res.data);
    } catch (err) {
      console.error('Fetch Programs Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'OPEN': return '#10b981';
      case 'CLOSED': return '#ef4444';
      case 'UPCOMING': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.code.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'All') return matchesSearch;
    return matchesSearch && c.intakeStatus === activeTab.toUpperCase();
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
                  <Text style={styles.courseTitle}>{item.title}</Text>
                  <Text style={styles.courseCode}>{item.code}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.intakeStatus)}20` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.intakeStatus) }]}>{item.intakeStatus}</Text>
                </View>
              </View>

              <View style={styles.metaGrid}>
                <View style={styles.metaItem}>
                  <Clock size={14} color="#64748b" />
                  <Text style={styles.metaText}>{item.duration}</Text>
                </View>
                <View style={styles.metaItem}>
                  <DollarSign size={14} color="#64748b" />
                  <Text style={styles.metaText}>LKR {item.fees?.toLocaleString()}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Calendar size={14} color="#64748b" />
                  <Text style={styles.metaText}>{item.nextIntakeDate || 'TBA'}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.detailsBtn}>View Program Details</Text>
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
  listContent: { padding: 20, paddingBottom: 60 },
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
  emptySub: { color: '#64748b', fontSize: 14, marginTop: 8, textAlign: 'center' }
});
