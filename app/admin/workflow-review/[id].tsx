import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, CheckCircle, XCircle, 
  RefreshCw, FileText, User, 
  Book, GraduationCap, MapPin, 
  MessageSquare, Send, AlertTriangle 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { ENDPOINTS } from '@/constants/config';

export default function WorkflowReview() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [comments, setComments] = useState('');

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await axios.get(`${ENDPOINTS.APPLICATIONS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplication(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (status: string) => {
    if (status !== 'APPROVED' && !comments) {
      Alert.alert('Feedback Required', 'Please provide a comment for the student.');
      return;
    }

    try {
      setActionLoading(true);
      const token = await SecureStore.getItemAsync('userToken');
      await axios.put(`${ENDPOINTS.APPLICATIONS}/${id}/status`, {
        status,
        adminComment: comments
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      Alert.alert('Success', `Application ${status.toLowerCase()} successfully`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setActionLoading(false);
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
      <Stack.Screen options={{ title: 'Workflow Review', headerTintColor: '#fff', headerStyle: { backgroundColor: '#0f172a' } }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Quick Decision Box */}
        <View style={styles.decisionCard}>
          <Text style={styles.cardLabel}>Application Status: <Text style={{ color: '#f59e0b' }}>{application.status}</Text></Text>
          <View style={styles.commentBox}>
            <TextInput 
              style={styles.commentInput}
              multiline
              placeholder="Internal notes or student feedback..."
              placeholderTextColor="#475569"
              value={comments}
              onChangeText={setComments}
            />
          </View>
          
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
              onPress={() => handleAction('REJECTED')}
              disabled={actionLoading}
            >
              <XCircle size={18} color="#fff" />
              <Text style={styles.actionBtnText}>REJECT</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#f59e0b' }]}
              onPress={() => handleAction('PENDING')}
              disabled={actionLoading}
            >
              <RefreshCw size={18} color="#fff" />
              <Text style={styles.actionBtnText}>FIX NEEDED</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
              onPress={() => handleAction('APPROVED')}
              disabled={actionLoading}
            >
              <CheckCircle size={18} color="#fff" />
              <Text style={styles.actionBtnText}>ACCEPT</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Student Details Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={18} color="#3b82f6" />
            <Text style={styles.sectionTitle}>Registration Profile</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Name</Text><Text style={styles.infoVal}>{application.fullName}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>NIC</Text><Text style={styles.infoVal}>{application.nic}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Program</Text><Text style={styles.infoVal}>{application.courseName}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Mode</Text><Text style={styles.infoVal}>{application.mode || 'N/A'}</Text></View>
          </View>
        </View>

        {/* Document Viewer */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={18} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Uploaded Verification Files</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.docScroll}>
            {Object.entries(application.documents || {}).map(([key, url]: any) => (
              <TouchableOpacity key={key} style={styles.docItem} onPress={() => Alert.alert('Preview', 'Opening full document view...')}>
                <Image source={{ uri: url }} style={styles.docPreview} />
                <Text style={styles.docLabel}>{key.replace(/([A-Z])/g, ' $1').trim()}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Edit3 size={18} color="#fff" />
            <Text style={styles.sectionTitle}>Digital Signature Verification</Text>
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
    padding: 20,
  },
  decisionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  commentBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  commentInput: {
    height: 100,
    color: '#fff',
    fontSize: 14,
    textAlignVertical: 'top',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
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
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  infoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  infoRow: {
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
    width: 130,
    height: 170,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
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
    borderRadius: 20,
    padding: 10,
  },
  signatureImg: {
    width: '100%',
    height: '100%',
  }
});
