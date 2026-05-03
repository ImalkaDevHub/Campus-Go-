import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Calendar, Clock, Users, 
  ChevronRight, Plus, Filter,
  AlertCircle, CheckCircle, XCircle
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { ENDPOINTS } from '@/constants/config';

export default function IntakeScheduler() {
  const insets = useSafeAreaInsets();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchIntakes();
  }, []);

  const fetchIntakes = async () => {
    try {
      const response = await axios.get(ENDPOINTS.COURSES);
      // Filter for courses that have intake data
      const intakes = response.data.filter((c: any) => c.nextIntakeDate);
      // Sort by soonest intake
      intakes.sort((a: any, b: any) => new Date(a.nextIntakeDate).getTime() - new Date(b.nextIntakeDate).getTime());
      setCourses(intakes);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load intake schedules');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchIntakes();
  };

  const getStatusColor = (deadline: string) => {
    const today = new Date();
    const dDate = new Date(deadline);
    const diff = dDate.getTime() - today.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    
    if (days < 0) return '#ef4444'; // Overdue
    if (days < 7) return '#f59e0b'; // Closing soon
    return '#10b981'; // Open
  };

  const renderIntakeItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.intakeCard}
      onPress={() => router.push({ pathname: '/admin/course-form', params: { id: item._id || item.id } })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.courseBadge}>
          <Text style={styles.courseCode}>{item.code}</Text>
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.intakeDeadline) }]}>
          <Text style={styles.statusLabel}>
            {new Date(item.intakeDeadline) < new Date() ? 'CLOSED' : 'OPEN'}
          </Text>
        </View>
      </View>

      <Text style={styles.courseName}>{item.name}</Text>
      
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <Calendar size={16} color="#64748b" />
          <View>
            <Text style={styles.gridLabel}>Start Date</Text>
            <Text style={styles.gridValue}>{new Date(item.nextIntakeDate).toLocaleDateString()}</Text>
          </View>
        </View>
        <View style={styles.gridItem}>
          <Clock size={16} color="#64748b" />
          <View>
            <Text style={styles.gridLabel}>Deadline</Text>
            <Text style={styles.gridValue}>{new Date(item.intakeDeadline).toLocaleDateString()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.enrollStat}>
          <Users size={16} color="#4F46E5" />
          <Text style={styles.enrollText}>
            <Text style={styles.enrollCount}>{Math.floor(Math.random() * 25)}</Text> Enrolled Students
          </Text>
        </View>
        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.editBtnText}>Reschedule</Text>
          <ChevronRight size={14} color="#4F46E5" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Intake Management', headerTintColor: '#fff', headerStyle: { backgroundColor: '#0f172a' } }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNum}>{courses.length}</Text>
          <Text style={styles.summaryLabel}>Active Intakes</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNum, { color: '#f59e0b' }]}>
            {courses.filter((c: any) => {
              const diff = new Date(c.intakeDeadline).getTime() - new Date().getTime();
              return diff > 0 && diff < (7 * 86400000);
            }).length}
          </Text>
          <Text style={styles.summaryLabel}>Closing Soon</Text>
        </View>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={courses}
          renderItem={renderIntakeItem}
          keyExtractor={(item) => (item._id || item.id).toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <AlertCircle size={48} color="#334155" />
              <Text style={styles.emptyText}>No upcoming intakes scheduled</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity 
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        onPress={() => router.push('/admin/courses')}
      >
        <LinearGradient colors={['#4F46E5', '#3730A3']} style={styles.fabGradient}>
          <Plus size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  summaryNum: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  intakeCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseBadge: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  courseCode: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '800',
  },
  statusIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  courseName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  gridItem: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  gridLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  gridValue: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  enrollStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  enrollText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  enrollCount: {
    color: '#fff',
    fontWeight: '800',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editBtnText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  fabGradient: {
    flex: 1,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#475569',
    marginTop: 12,
  }
});
