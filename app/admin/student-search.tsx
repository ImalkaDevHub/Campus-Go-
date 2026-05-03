import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Search, Filter, ChevronRight, 
  Download, User, BookOpen, 
  Calendar, X 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { ENDPOINTS } from '@/constants/config';

export default function StudentSearch() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  useEffect(() => {
    fetchCourses();
    handleSearch(); // Initial load
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(ENDPOINTS.COURSES);
      setCourses(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('userToken');
      const response = await axios.get(`${ENDPOINTS.APPLICATIONS}?search=${search}&course=${selectedCourse}&status=${selectedStatus}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderStudentCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.studentCard}
      onPress={() => router.push(`/admin/workflow-review/${item._id || item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.fullName?.charAt(0)}</Text>
        </View>
        <View style={styles.mainInfo}>
          <Text style={styles.studentName}>{item.fullName}</Text>
          <Text style={styles.studentId}>NIC: {item.nic}</Text>
        </View>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <BookOpen size={14} color="#64748b" />
          <Text style={styles.detailText}>{item.courseName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Calendar size={14} color="#64748b" />
          <Text style={styles.detailText}>Intake: {item.intake || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.viewProfile}>View Full Application</Text>
        <ChevronRight size={14} color="#4F46E5" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Global Student Search', headerTintColor: '#fff', headerStyle: { backgroundColor: '#0f172a' } }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      <View style={styles.searchHeader}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={20} color="#64748b" />
            <TextInput 
              style={styles.searchInput}
              placeholder="Name, NIC, or Student ID..."
              placeholderTextColor="#475569"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={[styles.filterBtn, showFilters && styles.activeFilterBtn]} 
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color={showFilters ? '#fff' : '#64748b'} />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filterPanel}>
            <Text style={styles.filterLabel}>Filter by Program</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {['All', ...courses.map((c:any) => c.name)].map(c => (
                <TouchableOpacity 
                  key={c} 
                  style={[styles.filterTab, selectedCourse === c && styles.activeTab]}
                  onPress={() => setSelectedCourse(c)}
                >
                  <Text style={[styles.tabText, selectedCourse === c && styles.activeTabText]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.filterLabel, { marginTop: 16 }]}>Filter by Status</Text>
            <View style={styles.statusRow}>
              {['All', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
                <TouchableOpacity 
                  key={s} 
                  style={[styles.statusTab, selectedStatus === s && styles.activeTab]}
                  onPress={() => setSelectedStatus(s)}
                >
                  <Text style={[styles.tabText, selectedStatus === s && styles.activeTabText]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.applyBtn} onPress={() => { setShowFilters(false); handleSearch(); }}>
              <Text style={styles.applyBtnText}>Apply Advanced Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>{results.length} Students Found</Text>
        <TouchableOpacity style={styles.exportBtn} onPress={() => Alert.alert('Coming Soon', 'Export to Excel/PDF will be available in the next update.')}>
          <Download size={16} color="#4F46E5" />
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={results}
          renderItem={renderStudentCard}
          keyExtractor={(item) => (item._id || item.id).toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return '#F59E0B';
    case 'APPROVED': return '#10B981';
    case 'REJECTED': return '#EF4444';
    default: return '#64748b';
  }
};

const getStatusStyle = (status: string) => ({
  backgroundColor: `${getStatusColor(status)}15`,
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    marginLeft: 12,
  },
  filterBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activeFilterBtn: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  filterPanel: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    marginRight: 8,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#0f172a',
  },
  activeTab: {
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  tabText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  activeTabText: {
    color: '#fff',
  },
  applyBtn: {
    height: 50,
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  resultsCount: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '700',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exportText: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  studentCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  mainInfo: {
    flex: 1,
    marginLeft: 16,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  studentId: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  cardBody: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  viewProfile: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '700',
  },
});
