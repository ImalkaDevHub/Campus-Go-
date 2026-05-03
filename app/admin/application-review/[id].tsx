import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, CheckCircle, XCircle, 
  Clock, RefreshCw, FileText, 
  User, Book, GraduationCap, 
  MapPin, MessageSquare, Save 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { ENDPOINTS } from '@/constants/config';

const STATUS_OPTIONS = ['PENDING', 'UNDER REVIEW', 'APPROVED', 'REJECTED'];

export default function AdminApplicationReview() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [comments, setComments] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await axios.get(`${ENDPOINTS.APPLICATIONS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplication(response.data);
      setNewStatus(response.data.status);
      setComments(response.data.adminComments || '');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setUpdating(true);
      const token = await SecureStore.getItemAsync('userToken');
      await axios.put(`${ENDPOINTS.APPLICATIONS}/${id}`, {
        status: newStatus,
        adminComments: comments
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      Alert.alert('Success', `Application updated to ${newStatus}`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update application');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Review Application', headerTintColor: '#fff', headerStyle: { backgroundColor: '#0f172a' } }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Status Update Card */}
        <View style={styles.reviewCard}>
          <Text style={styles.sectionLabel}>Decision Control</Text>
          <View style={styles.statusGrid}>
            {STATUS_OPTIONS.map(s => (
              <TouchableOpacity 
                key={s}
                style={[styles.statusBtn, newStatus === s && { borderColor: getStatusColor(s), backgroundColor: `${getStatusColor(s)}15` }]}
                onPress={() => setNewStatus(s)}
              >
                <Text style={[styles.statusBtnText, newStatus === s && { color: getStatusColor(s) }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.commentGroup}>
            <Text style={styles.label}>Admin Feedback / Comments</Text>
            <TextInput 
              style={styles.commentInput}
              multiline
              placeholder="Provide feedback to the student..."
              placeholderTextColor="#475569"
              value={comments}
              onChangeText={setComments}
            />
          </View>
          <TouchableOpacity 
            style={styles.updateBtn}
            onPress={handleUpdateStatus}
            disabled={updating}
          >
            {updating ? <ActivityIndicator color="#fff" /> : (
              <>
                <Save size={18} color="#fff" />
                <Text style={styles.updateBtnText}>Update Application Status</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Student Profile Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color="#3b82f6" />
            <Text style={styles.sectionTitle}>Student Profile</Text>
          </View>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}><Text style={styles.infoLabel}>Full Name</Text><Text style={styles.infoVal}>{application.fullName}</Text></View>
            <View style={styles.infoItem}><Text style={styles.infoLabel}>NIC</Text><Text style={styles.infoVal}>{application.nic}</Text></View>
            <View style={styles.infoItem}><Text style={styles.infoLabel}>Gender</Text><Text style={styles.infoVal}>{application.gender}</Text></View>
            <View style={styles.infoItem}><Text style={styles.infoLabel}>DOB</Text><Text style={styles.infoVal}>{application.dob}</Text></View>
          </View>
        </View>

        {/* Academic Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <GraduationCap size={20} color="#10b981" />
            <Text style={styles.sectionTitle}>Academic History</Text>
          </View>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}><Text style={styles.infoLabel}>Qualification</Text><Text style={styles.infoVal}>{application.qualification}</Text></View>
            <View style={styles.infoItem}><Text style={styles.infoLabel}>Results</Text><Text style={styles.infoVal}>{application.results}</Text></View>
            <View style={styles.infoItem}><Text style={styles.infoLabel}>School</Text><Text style={styles.infoVal}>{application.school}</Text></View>
          </View>
        </View>

        {/* Documents Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Uploaded Documents</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.docScroll}>
            {Object.entries(application.documents || {}).map(([key, url]: any) => (
              <View key={key} style={styles.docItem}>
                <Image source={{ uri: url }} style={styles.docPreview} />
                <Text style={styles.docLabel}>{key.replace(/([A-Z])/g, ' $1').trim()}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Signature Display */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color="#fff" />
            <Text style={styles.sectionTitle}>Student Signature</Text>
          </View>
          <View style={styles.signatureBox}>
            <Image source={{ uri: application.signature }} style={styles.signatureImg} resizeMode="contain" />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 24,
  },
  reviewCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statusBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  commentGroup: {
    gap: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
  },
  commentInput: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 14,
    height: 100,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  updateBtn: {
    height: 52,
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  updateBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  infoGrid: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: '#64748b',
    fontSize: 13,
  },
  infoVal: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  docScroll: {
    flexDirection: 'row',
  },
  docItem: {
    marginRight: 16,
    alignItems: 'center',
    gap: 8,
  },
  docPreview: {
    width: 120,
    height: 160,
    borderRadius: 12,
    backgroundColor: '#1e293b',
  },
  docLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  signatureBox: {
    height: 140,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  signatureImg: {
    width: '100%',
    height: '100%',
  }
});
