import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, ScrollView, TouchableOpacity, 
  ActivityIndicator, useWindowDimensions, Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ChevronLeft, Clock, DollarSign, Calendar, 
  CheckCircle, FileText, List, ArrowRight, X, BookOpen, AlertCircle
} from 'lucide-react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/config';

export default function ProgramDetail() {
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Eligibility Checker States
  const [modalVisible, setModalVisible] = useState(false);
  const [checkedRequirements, setCheckedRequirements] = useState<Record<number, boolean>>({});
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  // Enrollment States
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);

  const getAuthHeaders = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    if (id) fetchCourseDetail();
  }, [id]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/courses/${id}`);
      setCourse(res.data);
    } catch (err) {
      console.error('Fetch Program Detail Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status?.toUpperCase()) {
      case 'OPEN': return '#10b981';
      case 'CLOSED': return '#ef4444';
      case 'UPCOMING': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getCountdown = (dateString: string) => {
    if (!dateString) return { text: 'TBA', days: null };
    const target = new Date(dateString).getTime();
    const now = new Date().getTime();
    const diff = target - now;
    
    if (diff <= 0) return { text: 'Started / Passed', days: 0 };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return { text: 'Starts Tomorrow', days };
    return { text: `Starts in ${days} days`, days };
  };

  const handleCheckEligibility = async () => {
    try {
      setChecking(true);
      const headers = await getAuthHeaders();
      const answers = reqList.map((_, index) => !!checkedRequirements[index]);

      const res = await axios.post(`${API_BASE_URL}/courses/${id}/check-eligibility`, {
        answers
      }, { headers });

      setEligibilityResult(res.data);
    } catch (err) {
      console.error('Eligibility Check Error:', err);
    } finally {
      setChecking(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      const headers = await getAuthHeaders();
      const res = await axios.post(`${API_BASE_URL}/courses/${id}/enroll`, {}, { headers });
      
      if (res.data.success) {
        setEnrolled(true);
        setEnrollmentId(res.data.enrollmentId);
      }
    } catch (err) {
      console.error('Enroll Error:', err);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading || !course) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const countdown = getCountdown(course.nextIntakeDate);
  const reqList = course.eligibilityRequirements 
    ? course.eligibilityRequirements.split('\n').filter((r: string) => r.trim()) 
    : [];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true, 
        headerTitle: '',
        headerTransparent: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
        )
      }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 1. Hero Header */}
        <LinearGradient colors={['rgba(79, 70, 229, 0.2)', 'transparent']} style={styles.heroGradient}>
          <View style={styles.heroContent}>
            <View style={[styles.statusChip, { backgroundColor: `${getStatusColor(course.intakeStatus)}20`, borderColor: getStatusColor(course.intakeStatus) }]}>
              <Text style={[styles.statusText, { color: getStatusColor(course.intakeStatus) }]}>{course.intakeStatus}</Text>
            </View>
            <Text style={styles.heroTitle}>{course.title || course.name}</Text>
            <Text style={styles.heroCode}>{course.code}</Text>
          </View>
        </LinearGradient>

        <View style={styles.contentPadding}>
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Clock size={20} color="#4F46E5" />
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{course.duration || 'N/A'}</Text>
            </View>
            <View style={styles.infoBox}>
              <Calendar size={20} color="#f59e0b" />
              <Text style={styles.infoLabel}>Next Intake</Text>
              <Text style={styles.infoValue}>
                {course.nextIntakeDate ? new Date(course.nextIntakeDate).toLocaleDateString() : 'TBA'}
              </Text>
            </View>
          </View>

          {/* 6. Course Fees Display */}
          <View style={styles.feesCard}>
            <View style={styles.feesHeader}>
              <DollarSign size={20} color="#10b981" />
              <Text style={styles.feesTitle}>Fees Breakdown</Text>
              <View style={styles.paymentChip}>
                <Text style={styles.paymentChipText}>Payment Plan Available</Text>
              </View>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Application Fee</Text>
              <Text style={styles.feeValue}>LKR 5,000</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Course Fee</Text>
              <Text style={styles.feeValue}>LKR {course.fees?.toLocaleString() || course.courseFee?.toLocaleString() || '0'} / year</Text>
            </View>
            <View style={[styles.feeRow, styles.feeTotalRow]}>
              <Text style={styles.feeTotalLabel}>Total Investment</Text>
              <Text style={styles.feeTotalValue}>
                LKR {((course.fees || course.courseFee || 0) * (parseInt(course.duration) || 1)).toLocaleString()}
              </Text>
            </View>
          </View>
          <View style={styles.countdownCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Calendar size={20} color="#f59e0b" />
              <Text style={styles.countdownTitle}>Next Intake</Text>
            </View>
            <Text style={styles.countdownDate}>
              {course.nextIntakeDate ? new Date(course.nextIntakeDate).toLocaleDateString() : 'To Be Announced'}
            </Text>
            {countdown.days !== null && (
              <Text style={styles.countdownDays}>{countdown.text}</Text>
            )}
          </View>

          {/* 3. About Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FileText size={20} color="#fff" />
              <Text style={styles.sectionTitle}>About the Program</Text>
            </View>
            <Text style={styles.description}>{course.description || 'No description available for this program.'}</Text>
          </View>

          {/* 4. Eligibility Requirements */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CheckCircle size={20} color="#fff" />
              <Text style={styles.sectionTitle}>Eligibility Requirements</Text>
            </View>
            {reqList.length > 0 ? reqList.map((req: string, idx: number) => (
              <View key={idx} style={styles.reqItem}>
                <View style={styles.reqDot} />
                <Text style={styles.reqText}>{req.trim()}</Text>
              </View>
            )) : (
              <Text style={styles.description}>Open to all interested students.</Text>
            )}
          </View>

          {/* 5. Curriculum / Modules */}
          {course.modules && course.modules.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <BookOpen size={20} color="#fff" />
                <Text style={styles.sectionTitle}>Curriculum Overview</Text>
              </View>
              {course.modules.map((mod: string, idx: number) => (
                <View key={idx} style={styles.moduleItem}>
                  <View style={styles.moduleNumber}><Text style={styles.moduleNumberText}>{idx + 1}</Text></View>
                  <Text style={styles.moduleText}>{mod}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 7. Eligibility Checker Card */}
          <View style={styles.eligibilityCard}>
            <View style={styles.eligibilityCardHeader}>
              <View style={styles.eligibilityIconBox}>
                <CheckCircle size={24} color="#10b981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.eligibilityCardTitle}>Check Your Eligibility</Text>
                <Text style={styles.eligibilityCardSub}>Find out if you qualify for this program</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.eligibilityCheckBtn}
              onPress={() => {
                setEligibilityResult(null);
                const defaultReqs: Record<number, boolean> = {};
                reqList.forEach((_: any, i: number) => defaultReqs[i] = false);
                setCheckedRequirements(defaultReqs);
                setModalVisible(true);
              }}
            >
              <LinearGradient colors={['#4F46E5', '#06B6D4']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.eligibilityCheckGradient}>
                <Text style={styles.eligibilityCheckBtnText}>Check Eligibility</Text>
                <ArrowRight size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* 8. Enrollment Section */}
          {course.intakeStatus === 'OPEN' && (
            <View style={styles.enrollSection}>
              <View style={styles.enrollHeader}>
                <Text style={styles.enrollTitle}>Ready to join?</Text>
                <Text style={styles.enrollPrice}>LKR {course.price?.toLocaleString() || course.fees?.toLocaleString()}</Text>
              </View>
              {enrolled ? (
                <View style={styles.enrolledBadge}>
                  <CheckCircle size={20} color="#10b981" />
                  <Text style={styles.enrolledText}>Already Enrolled (ID: {enrollmentId})</Text>
                </View>
              ) : (
                <TouchableOpacity onPress={handleEnroll} disabled={enrolling} style={styles.enrollBtn}>
                  <LinearGradient colors={['#4F46E5', '#06B6D4']} style={styles.enrollBtnGradient}>
                    {enrolling ? <ActivityIndicator color="#fff" /> : <Text style={styles.enrollBtnText}>Enroll Now</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          )}

        </View>
      </ScrollView>

      {/* ELIGIBILITY CHECKER MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Eligibility Check</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X size={24} color="#94a3b8" /></TouchableOpacity>
            </View>
            <Text style={styles.modalCourseTitle}>{course.title || course.name}</Text>

            {!eligibilityResult ? (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                <Text style={styles.modalSub}>Do you have the following qualifications?</Text>
                
                {reqList.length > 0 ? reqList.map((req: string, idx: number) => (
                  <View key={idx} style={styles.checkboxRow}>
                    <Text style={styles.checkboxLabel}>{req}</Text>
                    <View style={styles.toggleGroup}>
                      <TouchableOpacity 
                        style={[styles.toggleBtn, checkedRequirements[idx] === true && styles.toggleBtnActiveYes]}
                        onPress={() => setCheckedRequirements(prev => ({ ...prev, [idx]: true }))}
                      >
                        <Text style={[styles.toggleText, checkedRequirements[idx] === true && styles.toggleTextActive]}>YES</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.toggleBtn, checkedRequirements[idx] === false && styles.toggleBtnActiveNo]}
                        onPress={() => setCheckedRequirements(prev => ({ ...prev, [idx]: false }))}
                      >
                        <Text style={[styles.toggleText, checkedRequirements[idx] === false && styles.toggleTextActive]}>NO</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )) : (
                  <Text style={styles.description}>No specific qualifications required.</Text>
                )}

                <TouchableOpacity 
                  style={styles.verifyBtnContainer} 
                  onPress={handleCheckEligibility}
                  disabled={checking}
                >
                  <LinearGradient colors={['#4F46E5', '#06B6D4']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.verifyBtnGradient}>
                    {checking ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyBtnText}>Check My Eligibility</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <View style={styles.resultContainer}>
                <View style={[styles.resultCard, eligibilityResult.eligible ? styles.resultCardSuccess : styles.resultCardWarning]}>
                  <View style={styles.resultIconBox}>
                    {eligibilityResult.eligible ? (
                      <CheckCircle size={48} color="#10b981" />
                    ) : (
                      <AlertCircle size={48} color="#ef4444" />
                    )}
                  </View>
                  <Text style={styles.resultTitle}>
                    {eligibilityResult.eligible ? "You are Eligible!" : "You May Not Qualify"}
                  </Text>
                  <Text style={styles.resultMessage}>
                    {eligibilityResult.eligible 
                      ? "You meet all requirements for this program." 
                      : "You do not meet some requirements."}
                  </Text>
                  
                  {eligibilityResult.missingRequirements?.length > 0 && (
                    <View style={styles.missingBox}>
                      <Text style={styles.missingTitle}>Missing Requirements:</Text>
                      {eligibilityResult.missingRequirements.map((m: string, i: number) => (
                        <Text key={i} style={styles.missingItem}>- {m}</Text>
                      ))}
                    </View>
                  )}

                  {eligibilityResult.eligible ? (
                    <TouchableOpacity 
                      style={styles.applyBtnContainer} 
                      onPress={() => {
                        setModalVisible(false);
                        router.push(`/student/apply?courseId=${id}`);
                      }}
                    >
                      <LinearGradient colors={['#4F46E5', '#06B6D4']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.applyBtnGradient}>
                        <Text style={styles.applyBtnText}>Apply Now</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={styles.viewReqBtn} 
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.viewReqBtnText}>View Requirements</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  scrollContent: { paddingBottom: 100 },
  heroGradient: { paddingTop: 100, paddingBottom: 30, paddingHorizontal: 20 },
  heroContent: { alignItems: 'flex-start' },
  statusChip: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 16 },
  statusText: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 8, lineHeight: 34 },
  heroCode: { color: '#94a3b8', fontSize: 16, fontWeight: '700', letterSpacing: 2 },
  contentPadding: { padding: 20 },
  infoRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  infoBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'flex-start' },
  infoLabel: { color: '#94a3b8', fontSize: 12, marginTop: 12, marginBottom: 4 },
  infoValue: { color: '#fff', fontSize: 16, fontWeight: '800' },
  countdownCard: { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)', padding: 20, borderRadius: 16, marginBottom: 30 },
  countdownTitle: { color: '#f59e0b', fontSize: 14, fontWeight: '800', textTransform: 'uppercase' },
  countdownDate: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 4 },
  countdownDays: { color: '#fbbf24', fontSize: 14, fontWeight: '700' },
  section: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  description: { color: '#cbd5e1', fontSize: 15, lineHeight: 24 },
  reqItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  reqDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4F46E5', marginTop: 8 },
  reqText: { color: '#cbd5e1', fontSize: 15, flex: 1, lineHeight: 22 },
  moduleItem: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 12, marginBottom: 10 },
  moduleNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  moduleNumberText: { color: '#94a3b8', fontSize: 12, fontWeight: '800' },
  moduleText: { color: '#e2e8f0', fontSize: 15, flex: 1, fontWeight: '500' },
  feesCard: { backgroundColor: '#1e293b', borderRadius: 20, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  feesHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  feesTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginLeft: 10, flex: 1 },
  paymentChip: { backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  paymentChipText: { color: '#10b981', fontSize: 10, fontWeight: '800' },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  feeLabel: { color: '#cbd5e1', fontSize: 15 },
  feeValue: { color: '#fff', fontSize: 15, fontWeight: '700' },
  feeTotalRow: { borderBottomWidth: 0, paddingTop: 16, marginTop: 4 },
  feeTotalLabel: { color: '#fff', fontSize: 16, fontWeight: '800' },
  feeTotalValue: { color: '#10b981', fontSize: 18, fontWeight: '900' },
  eligibilityCard: { backgroundColor: 'rgba(79, 70, 229, 0.1)', borderRadius: 20, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: 'rgba(79, 70, 229, 0.3)' },
  eligibilityCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  eligibilityIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(16, 185, 129, 0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  eligibilityCardTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 2 },
  eligibilityCardSub: { color: '#94a3b8', fontSize: 14 },
  eligibilityCheckBtn: { borderRadius: 14, overflow: 'hidden' },
  eligibilityCheckGradient: { flexDirection: 'row', paddingVertical: 16, alignItems: 'center', justifyContent: 'center', gap: 8 },
  eligibilityCheckBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.95)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1e293b', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
  modalCourseTitle: { color: '#4F46E5', fontSize: 16, fontWeight: '700', marginBottom: 20 },
  modalSub: { color: '#94a3b8', fontSize: 15, marginBottom: 20 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 14, marginBottom: 12 },
  checkboxLabel: { color: '#e2e8f0', fontSize: 14, flex: 1, lineHeight: 20 },
  toggleGroup: { flexDirection: 'row', backgroundColor: '#0f172a', borderRadius: 8, padding: 4 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  toggleBtnActiveYes: { backgroundColor: '#10b981' },
  toggleBtnActiveNo: { backgroundColor: '#ef4444' },
  toggleText: { color: '#64748b', fontSize: 12, fontWeight: '800' },
  toggleTextActive: { color: '#fff' },
  verifyBtnContainer: { marginTop: 20, borderRadius: 14, overflow: 'hidden' },
  verifyBtnGradient: { height: 56, alignItems: 'center', justifyContent: 'center' },
  verifyBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  resultContainer: { alignItems: 'center', paddingVertical: 10 },
  resultCard: { width: '100%', padding: 24, borderRadius: 24, alignItems: 'center', borderWidth: 1 },
  resultCardSuccess: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' },
  resultCardWarning: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' },
  resultIconBox: { marginBottom: 16, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  resultTitle: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  resultMessage: { color: '#cbd5e1', fontSize: 15, textAlign: 'center', marginBottom: 24 },
  missingBox: { backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: 16, borderRadius: 12, width: '100%', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
  missingTitle: { color: '#ef4444', fontSize: 14, fontWeight: '800', marginBottom: 8 },
  missingItem: { color: '#fca5a5', fontSize: 14, marginBottom: 4, lineHeight: 20 },
  applyBtnContainer: { width: '100%', borderRadius: 14, overflow: 'hidden' },
  applyBtnGradient: { height: 56, alignItems: 'center', justifyContent: 'center' },
  applyBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  viewReqBtn: { width: '100%', height: 56, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  viewReqBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  enrollSection: { marginTop: 10, padding: 20, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  enrollHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  enrollTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  enrollPrice: { color: '#10b981', fontSize: 20, fontWeight: '900' },
  enrollBtn: { borderRadius: 14, overflow: 'hidden' },
  enrollBtnGradient: { height: 56, alignItems: 'center', justifyContent: 'center' },
  enrollBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  enrolledBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingVertical: 16, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
  enrolledText: { color: '#10b981', fontSize: 16, fontWeight: '800' }
});
