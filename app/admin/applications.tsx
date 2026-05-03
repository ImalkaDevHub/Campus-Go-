import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Search, Filter, Clock, 
  CheckCircle, XCircle, ChevronRight, 
  User, BookOpen 
} from 'lucide-react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { ENDPOINTS } from '@/constants/config';

const STATUS_FILTERS = ['All', 'PENDING', 'UNDER REVIEW', 'APPROVED', 'REJECTED'];

export default function AdminApplicationsList() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await axios.get(ENDPOINTS.APPLICATIONS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getFilteredData = () => {
    let data = applications;
    if (activeFilter !== 'All') {
      data = data.filter((app: any) => app.status === activeFilter);
    }
    if (searchQuery) {
      data = data.filter((app: any) => 
        app.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.courseName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return data;
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/admin/application-review/${item._id || item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.fullName?.charAt(0) || 'S'}</Text>
          </View>
          <View>
            <Text style={styles.studentName}>{item.fullName}</Text>
            <Text style={styles.appDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.courseRow}>
        <BookOpen size={14} color="#64748b" />
        <Text style={styles.courseName}>{item.courseName}</Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.appId}>ID: {item._id?.substring(0, 8).toUpperCase()}</Text>
        <View style={styles.reviewLink}>
          <Text style={styles.reviewText}>Review Application</Text>
          <ChevronRight size={14} color="#4F46E5" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Student Applications', headerTintColor: '#fff', headerStyle: { backgroundColor: '#0f172a' } }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Search size={20} color="#64748b" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search by student or course..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterList}>
          {STATUS_FILTERS.map(f => (
            <TouchableOpacity 
              key={f} 
              style={[styles.filterTab, activeFilter === f && styles.activeFilterTab]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterTabText, activeFilter === f && styles.activeFilterTabText]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={getFilteredData()}
          renderItem={renderItem}
          keyExtractor={(item) => (item._id || item.id).toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchApplications(); }} tintColor="#4F46E5" />
          }
        />
      )}
    </View>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return '#F59E0B';
    case 'UNDER REVIEW': return '#3B82F6';
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
  header: {
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    marginLeft: 12,
    fontSize: 15,
  },
  filterList: {
    flexDirection: 'row',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  activeFilterTab: {
    backgroundColor: '#4F46E5',
  },
  filterTabText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  activeFilterTabText: {
    color: '#fff',
  },
  listContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  appDate: {
    fontSize: 12,
    color: '#64748b',
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
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  courseName: {
    fontSize: 14,
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
  appId: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '700',
  },
  reviewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '700',
  },
});
