import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  FileText, Clock, CheckCircle, 
  XCircle, ChevronRight, RefreshCw, 
  Search, Filter 
} from 'lucide-react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { ENDPOINTS } from '@/constants/config';

const STATUS_CONFIG = {
  'PENDING': { color: '#F59E0B', icon: Clock, label: 'Pending' },
  'UNDER REVIEW': { color: '#3B82F6', icon: RefreshCw, label: 'Reviewing' },
  'APPROVED': { color: '#10B981', icon: CheckCircle, label: 'Approved' },
  'REJECTED': { color: '#EF4444', icon: XCircle, label: 'Rejected' },
};

export default function ApplicationStatusScreen() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await axios.get(ENDPOINTS.MY_APPLICATIONS, {
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  const renderItem = ({ item }: { item: any }) => {
    const status = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
    const StatusIcon = status.icon;

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push(`/application-details/${item._id || item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.appIdRow}>
            <FileText size={16} color="#64748b" />
            <Text style={styles.appId}>ID: {item._id?.substring(0, 8).toUpperCase() || 'NEW'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${status.color}15` }]}>
            <StatusIcon size={12} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <Text style={styles.courseName}>{item.courseName || 'Select Program'}</Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>Submitted: {new Date(item.createdAt).toLocaleDateString()}</Text>
          <View style={styles.detailsLink}>
            <Text style={styles.detailsText}>View Details</Text>
            <ChevronRight size={14} color="#4F46E5" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'My Applications', headerTintColor: '#fff', headerStyle: { backgroundColor: '#0f172a' } }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={applications}
          renderItem={renderItem}
          keyExtractor={(item) => (item._id || item.id).toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FileText size={64} color="#334155" />
              <Text style={styles.emptyTitle}>No Applications Yet</Text>
              <Text style={styles.emptySub}>Start your journey by applying for a course today.</Text>
              <TouchableOpacity 
                style={styles.applyNowBtn}
                onPress={() => router.push('/courses')}
              >
                <Text style={styles.applyNowText}>Browse Courses</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 24,
    gap: 16,
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
    alignItems: 'center',
    marginBottom: 16,
  },
  appIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appId: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  courseName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  dateText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  detailsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
    marginBottom: 32,
  },
  applyNowBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
  },
  applyNowText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
