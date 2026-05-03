import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Search, Users, CheckCircle, 
  XCircle, Download, User, 
  Mail, Phone, Clock 
} from 'lucide-react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/config';

export default function WorkshopRegistrations() {
  const { id } = useLocalSearchParams();
  const [registrations, setRegistrations] = useState([]);
  const [workshop, setWorkshop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const [regRes, workshopRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/workshop-registrations?workshop=${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/workshops/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setRegistrations(regRes.data);
      setWorkshop(workshopRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleAttendance = async (regId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Present' ? 'Absent' : 'Present';
      const token = await SecureStore.getItemAsync('userToken');
      
      await axios.put(`${API_BASE_URL}/workshop-registrations/${regId}/attendance`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setRegistrations((prev: any) => 
        prev.map((r: any) => r._id === regId ? { ...r, attendanceStatus: newStatus } : r)
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update attendance');
    }
  };

  const filteredData = registrations.filter((r: any) => 
    r.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.referenceId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStudentRow = ({ item }: { item: any }) => (
    <View style={styles.studentCard}>
      <View style={styles.cardMain}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.studentName?.charAt(0)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.studentName}>{item.studentName}</Text>
          <Text style={styles.metaText}>{item.email}</Text>
          <Text style={styles.refId}>REF: {item.referenceId?.toUpperCase()}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.attendanceToggle, item.attendanceStatus === 'Present' && styles.presentBtn]}
          onPress={() => toggleAttendance(item._id || item.id, item.attendanceStatus)}
        >
          {item.attendanceStatus === 'Present' ? (
            <CheckCircle size={20} color="#fff" />
          ) : (
            <XCircle size={20} color="#64748b" />
          )}
          <Text style={[styles.attendanceText, item.attendanceStatus === 'Present' && { color: '#fff' }]}>
            {item.attendanceStatus || 'Absent'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Attendance Tracker', headerTintColor: '#fff', headerStyle: { backgroundColor: '#0f172a' } }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      {workshop && (
        <View style={styles.header}>
          <Text style={styles.workshopTitle}>{workshop.title}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Registrations</Text>
              <Text style={styles.statVal}>{registrations.length}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Present</Text>
              <Text style={[styles.statVal, { color: '#10b981' }]}>
                {registrations.filter((r: any) => r.attendanceStatus === 'Present').length}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Available</Text>
              <Text style={[styles.statVal, { color: '#4F46E5' }]}>
                {workshop.totalSeats - registrations.length}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#64748b" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search by name or reference ID..."
            placeholderTextColor="#475569"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.exportBtn} onPress={() => Alert.alert('Coming Soon', 'Export functionality is being prepared.')}>
          <Download size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderStudentRow}
          keyExtractor={(item) => (item._id || item.id).toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#4F46E5" />
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
  header: {
    padding: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  workshopTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    marginLeft: 12,
  },
  exportBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  studentCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
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
  info: {
    flex: 1,
    marginLeft: 16,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  refId: {
    fontSize: 11,
    color: '#4F46E5',
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: 1,
  },
  attendanceToggle: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    gap: 4,
    minWidth: 80,
  },
  presentBtn: {
    backgroundColor: '#10b981',
  },
  attendanceText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
  }
});
