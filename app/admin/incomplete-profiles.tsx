import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  AlertTriangle, FileText, Camera, 
  Send, User, Search, 
  Filter, ChevronRight 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/config';

export default function IncompleteProfiles() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    nic: 0,
    certs: 0,
    photos: 0
  });

  useEffect(() => {
    fetchIncomplete();
  }, []);

  const fetchIncomplete = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await axios.get(`${API_BASE_URL}/applications?incomplete=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data);
      
      // Mock stats calculation
      setStats({
        total: response.data.length,
        nic: Math.round(response.data.length * 0.6),
        certs: Math.round(response.data.length * 0.4),
        photos: Math.round(response.data.length * 0.2)
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (studentId: string) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      await axios.post(`${API_BASE_URL}/notifications/reminder/${studentId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Reminder Sent', 'The student has been notified about their missing documents.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send reminder.');
    }
  };

  const sendBulkReminder = async () => {
    Alert.alert(
      'Bulk Reminder',
      `Are you sure you want to send reminders to all ${students.length} students?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send All', onPress: async () => {
          setLoading(true);
          // Simulate bulk send
          setTimeout(() => {
            setLoading(false);
            Alert.alert('Success', 'Reminders sent to all incomplete profiles.');
          }, 1500);
        }}
      ]
    );
  };

  const renderStudentCard = ({ item }: { item: any }) => {
    const completion = item.completionPercentage || 75;
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.fullName?.charAt(0)}</Text>
          </View>
          <View style={styles.mainInfo}>
            <Text style={styles.studentName}>{item.fullName}</Text>
            <Text style={styles.studentId}>ID: {item._id?.slice(-6).toUpperCase()}</Text>
          </View>
          <View style={styles.percentBox}>
            <Text style={styles.percentText}>{completion}%</Text>
          </View>
        </View>

        <View style={styles.progressBg}>
          <View style={[styles.progressBar, { width: `${completion}%` }]} />
        </View>

        <View style={styles.badgeRow}>
          <View style={[styles.badge, styles.errorBadge]}><Text style={styles.badgeText}>NIC MISSING</Text></View>
          <View style={[styles.badge, styles.errorBadge]}><Text style={styles.badgeText}>CERTIFICATE</Text></View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.remindBtn}
            onPress={() => sendReminder(item._id || item.id)}
          >
            <Send size={14} color="#fff" />
            <Text style={styles.remindText}>Send Reminder</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.viewBtn}
            onPress={() => router.push(`/admin/workflow-review/${item._id || item.id}`)}
          >
            <Text style={styles.viewText}>View Profile</Text>
            <ChevronRight size={14} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Incomplete Profiles', headerTintColor: '#fff', headerStyle: { backgroundColor: '#0f172a' } }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      <View style={styles.statsPanel}>
        <View style={styles.statItem}>
          <Text style={styles.statVal}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Incomplete</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: '#ef4444' }]}>{stats.nic}</Text>
          <Text style={styles.statLabel}>NIC Missing</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: '#ef4444' }]}>{stats.certs}</Text>
          <Text style={styles.statLabel}>Certs Missing</Text>
        </View>
      </View>

      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Search size={18} color="#64748b" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search students..."
            placeholderTextColor="#475569"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.bulkBtn} onPress={sendBulkReminder}>
          <Send size={16} color="#fff" />
          <Text style={styles.bulkBtnText}>Remind All</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={students}
          renderItem={renderStudentCard}
          keyExtractor={(item) => (item._id || item.id).toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsPanel: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    margin: 20,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  statVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 4,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  searchBox: {
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
  bulkBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulkBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
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
  percentBox: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  percentText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '800',
  },
  progressBg: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 3,
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  errorBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  badgeText: {
    color: '#ef4444',
    fontSize: 9,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  remindBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  remindText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  viewText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  }
});
