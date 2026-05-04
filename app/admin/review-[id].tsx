import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert, Modal, Dimensions } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, CheckCircle, XCircle, 
  Clock, RefreshCw, FileText, 
  User, Book, GraduationCap, 
  MapPin, MessageSquare, Save, X, Eye, Info
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, ENDPOINTS } from '@/constants/config';

const { width, height } = Dimensions.get('window');

const STATUS_OPTIONS = ['PENDING', 'UNDER REVIEW', 'APPROVED', 'REJECTED', 'UPDATES REQUESTED'];

export default function AdminApplicationReview() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [comments, setComments] = useState('');
  const [newStatus, setNewStatus] = useState('');
  
  // Modal for Image View
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [docStatuses, setDocStatuses] = useState<any>({
    nicFront: true,
    birthCert: true,
    photo: true,
    academicCert: true
  });

  useEffect(() => {
    if (id) fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await axios.get(`${API_BASE_URL}/applications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplication(response.data);
      setNewStatus(response.data.status);
      setComments(response.data.adminComments || '');
    } catch (error) {
      console.error('Fetch Details Error:', error);
      Alert.alert('Error', 'Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setUpdating(true);
      const token = await SecureStore.getItemAsync('userToken');
      
      await axios.put(`${API_BASE_URL}/applications/${id}/status`, {
        status: newStatus,
        comment: comments
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      Alert.alert('Success', `Application updated to ${newStatus}`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Update Error:', error.response?.data || error.message);
      Alert.alert('Update Failed', error.response?.data?.error || 'Failed to update application');
    } finally {
      setUpdating(false);
    }
  };

  const getDocUrl = (key: string) => {
    if (!application) return null;
    if (key === 'nicFront') return application.nicFileName;
    if (key === 'birthCert') return application.birthCertFileName;
    if (key === 'photo') return application.passportPhotoFileName;
    if (key === 'academicCert') return application.transcriptFileName;
    return null;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!application) return null;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Review Application', headerTintColor: '#fff', headerStyle: { backgroundColor: '#0f172a' } }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.reviewCard}>
          <Text style={styles.sectionLabel}>Approval Workflow</Text>
          <View style={styles.statusGrid}>
            {STATUS_OPTIONS.map(s => (
              <TouchableOpacity 
                key={s}
                style={[styles.statusBtn, newStatus === s && { borderColor: getStatusColor(s), backgroundColor: `${getStatusColor(s)}20` }]}
                onPress={() => setNewStatus(s)}
              >
                <Text style={[styles.statusBtnText, newStatus === s && { color: getStatusColor(s) }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.commentGroup}>
            <Text style={styles.label}>Admin Feedback / Feedback to Student</Text>
            <TextInput 
              style={styles.commentInput}
              multiline
              placeholder="e.g. Please re-upload your NIC back. It is blurry."
              placeholderTextColor="#475569"
              value={comments}
              onChangeText={setComments}
            />
          </View>

          <TouchableOpacity 
            style={[styles.updateBtn, { backgroundColor: getStatusColor(newStatus) }]}
            onPress={handleUpdateStatus}
            disabled={updating}
          >
            {updating ? <ActivityIndicator color="#fff" /> : (
              <>
                <Save size={18} color="#fff" />
                <Text style={styles.updateBtnText}>Save Decision</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color="#3b82f6" />
            <Text style={styles.sectionTitle}>Student Details</Text>
          </View>
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Full Name</Text><Text style={styles.infoVal}>{application.fullName}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>NIC / Passport</Text><Text style={styles.infoVal}>{application.nicPassportNumber}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Email</Text><Text style={styles.infoVal}>{application.email}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Mobile</Text><Text style={styles.infoVal}>{application.mobileNumber}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Address</Text><Text style={styles.infoVal}>{application.address}</Text></View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <GraduationCap size={20} color="#10b981" />
            <Text style={styles.sectionTitle}>Academic & Program</Text>
          </View>
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Program</Text><Text style={styles.infoValBold}>{application.courseName}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Intake</Text><Text style={styles.infoVal}>{application.intakeYear}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Qualification</Text><Text style={styles.infoVal}>{application.qualification}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Results</Text><Text style={styles.infoVal}>{application.gpa}</Text></View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Document Inspection</Text>
          </View>
          <Text style={styles.helperText}>Tap on a document to view full screen.</Text>
          <View style={styles.docGrid}>
            {[
              { id: 'nicFront', label: 'NIC Front' },
              { id: 'birthCert', label: 'Birth Cert' },
              { id: 'photo', label: 'Passport Photo' },
              { id: 'academicCert', label: 'Certificates' },
            ].map(doc => {
              const url = getDocUrl(doc.id);
              const isValid = docStatuses[doc.id];
              
              return (
                <View key={doc.id} style={styles.docWrapper}>
                  <TouchableOpacity 
                    style={[styles.docCard, !isValid && styles.invalidCard]}
                    onPress={() => url && setSelectedImage(url)}
                    disabled={!url}
                  >
                    {url ? (
                      <Image source={{ uri: url }} style={styles.docImg} />
                    ) : (
                      <View style={styles.missingDoc}>
                        <Info size={20} color="#EF4444" />
                        <Text style={styles.missingText}>Missing</Text>
                      </View>
                    )}
                    <View style={styles.eyeOverlay}><Eye size={16} color="#fff" /></View>
                  </TouchableOpacity>
                  <View style={styles.docActions}>
                    <Text style={styles.docLabel}>{doc.label}</Text>
                    <TouchableOpacity 
                      style={[styles.statusToggle, isValid ? styles.validToggle : styles.invalidToggle]}
                      onPress={() => {
                        const newStatus = !isValid;
                        setDocStatuses({...docStatuses, [doc.id]: newStatus});
                        if (!newStatus) {
                          setComments(prev => prev + (prev ? "\n" : "") + `Invalid ${doc.label}: Please re-upload.`);
                        }
                      }}
                    >
                      {isValid ? <CheckCircle size={14} color="#10b981" /> : <XCircle size={14} color="#ef4444" />}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color="#4F46E5" />
            <Text style={styles.sectionTitle}>Legal Confirmation</Text>
          </View>
          <View style={styles.signatureDisplay}>
            <Image 
              source={{ uri: application.digitalSignature }} 
              style={styles.sigImage} 
              resizeMode="contain" 
            />
            <Text style={styles.sigLabel}>Digital Signature Captured on {new Date(application.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      <Modal visible={!!selectedImage} transparent animationType="fade">
        <View style={styles.modalBg}>
          <TouchableOpacity style={styles.closeModal} onPress={() => setSelectedImage(null)}>
            <X size={30} color="#fff" />
          </TouchableOpacity>
          {selectedImage && <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />}
        </View>
      </Modal>
    </View>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return '#F59E0B';
    case 'UNDER REVIEW': return '#3B82F6';
    case 'APPROVED': return '#10B981';
    case 'REJECTED': return '#EF4444';
    case 'UPDATES REQUESTED': return '#8B5CF6';
    default: return '#64748b';
  }
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 24 },
  reviewCard: { backgroundColor: '#1e293b', borderRadius: 28, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  statusBtn: { paddingHorizontal: 10, paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.2)', borderWidth: 1, borderColor: 'transparent' },
  statusBtnText: { fontSize: 10, fontWeight: '800', color: '#475569' },
  commentGroup: { gap: 8, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#94a3b8' },
  commentInput: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16, height: 100, padding: 15, color: '#fff', fontSize: 14, textAlignVertical: 'top', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  updateBtn: { height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  updateBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#fff' },
  infoGrid: { backgroundColor: '#1e293b', borderRadius: 24, padding: 20, gap: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  infoLabel: { color: '#64748b', fontSize: 13, flex: 1 },
  infoVal: { color: '#fff', fontSize: 13, fontWeight: '600', flex: 2, textAlign: 'right' },
  infoValBold: { color: '#4F46E5', fontSize: 14, fontWeight: '900', flex: 2, textAlign: 'right' },
  helperText: { color: '#475569', fontSize: 12, marginBottom: 12, fontStyle: 'italic' },
  docGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  docWrapper: { width: (width - 60) / 2, gap: 8 },
  docCard: { height: 160, borderRadius: 20, backgroundColor: '#1e293b', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden', position: 'relative' },
  docImg: { width: '100%', height: '100%' },
  missingDoc: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  missingText: { color: '#EF4444', fontSize: 10, fontWeight: '800' },
  eyeOverlay: { position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  docLabel: { color: '#64748b', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  docActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  statusToggle: { padding: 4, borderRadius: 6 },
  validToggle: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  invalidToggle: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  invalidCard: { borderColor: '#ef4444', borderWidth: 2 },
  signatureDisplay: { backgroundColor: '#fff', borderRadius: 20, padding: 15, alignItems: 'center', gap: 10 },
  sigImage: { width: '100%', height: 120 },
  sigLabel: { color: '#64748b', fontSize: 10, fontWeight: '600' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  closeModal: { position: 'absolute', top: 60, right: 20, zIndex: 10 },
  fullImage: { width: width, height: height * 0.8 }
});
