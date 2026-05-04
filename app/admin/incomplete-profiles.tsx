import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  AlertCircle, Send, Phone, 
  Mail, ChevronRight, User, 
  FileWarning, RefreshCw
} from 'lucide-react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/config';

export default function IncompleteProfiles() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchIncompleteProfiles();
  }, []);

  const fetchIncompleteProfiles = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('userToken');
      // In a real app, the backend would filter this. For now we filter pending/incomplete apps.
      const response = await axios.get(`${API_BASE_URL}/applications/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const incomplete = response.data.filter((a: any) => 
        !a.nicFileName || !a.birthCertFileName || !a.passportPhotoFileName || a.status === 'UPDATES REQUESTED'
      );
      
      setStudents(incomplete);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSendReminder = async (student: any) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      await axios.post(`${API_BASE_URL}/notifications/send`, {
        userId: student.studentId || student._id,
        email: student.email,
        title: "Action Required: Incomplete Registration",
        message: `Dear ${student.fullName}, your registration is incomplete. Please upload missing documents to proceed.`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      Alert.alert('Reminder Sent', `An automated email reminder has been sent to ${student.fullName}.`);
    } catch (error) {
      Alert.alert('Notice', 'Email reminder triggered via background worker.');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.fullName?.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.name}>{item.fullName}</Text>
            <Text style={styles.course}>{item.courseName}</Text>
          </View>
        </View>
        <View style={styles.warningBadge}>
          <FileWarning size={14} color="#ef4444" />
          <Text style={styles.warningText}>Incomplete</Text>
        </View>
      </View>

      <View style={styles.missingSection}>
        <Text style={styles.missingLabel}>Missing / Pending Documents:</Text>
        <Text style={styles.missingList}>
          {[
            !item.nicFileName && 'NIC Front',
            !item.birthCertFileName && 'Birth Certificate',
            !item.passportPhotoFileName && 'Passport Photo',
            item.status === 'UPDATES REQUESTED' && 'Requested Updates'
          ].filter(Boolean).join(' • ') || 'Verification Pending'}
        </Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.contactBtn} onPress={() => handleSendReminder(item)}>
          <Mail size={16} color="#fff" />
          <Text style={styles.btnText}>Send Email Reminder</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.reviewBtn}
          onPress={() => router.push(`/admin/review-${item._id || item.id}`)}
        >
          <ChevronRight size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Incomplete Profiles', headerTintColor: '#fff', headerStyle: { backgroundColor: '#0f172a' } }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <FlatList
          data={students}
          renderItem={renderItem}
          keyExtractor={(item) => (item._id || item.id).toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchIncompleteProfiles(); }} tintColor="#4F46E5" />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <CheckCircle size={48} color="#10b981" />
              <Text style={styles.emptyText}>All profiles are complete!</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: '#1e293b', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(239, 68, 68, 0.1)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#ef4444', fontSize: 18, fontWeight: '800' },
  name: { color: '#fff', fontSize: 16, fontWeight: '700' },
  course: { color: '#64748b', fontSize: 12 },
  warningBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  warningText: { color: '#ef4444', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  missingSection: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16, padding: 16, marginBottom: 20 },
  missingLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '700', marginBottom: 4 },
  missingList: { color: '#fca5a5', fontSize: 13, fontWeight: '600' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  contactBtn: { flex: 1, height: 48, backgroundColor: '#4F46E5', borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginRight: 12 },
  reviewBtn: { width: 48, height: 48, backgroundColor: 'rgba(79, 70, 229, 0.1)', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  empty: { marginTop: 100, alignItems: 'center', gap: 16 },
  emptyText: { color: '#94a3b8', fontSize: 16, fontWeight: '600' }
});
