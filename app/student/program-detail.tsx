import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, ScrollView, TouchableOpacity, 
  ActivityIndicator, Modal, useWindowDimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ChevronLeft, Clock, DollarSign, Calendar, 
  CheckCircle, ShieldCheck, BookOpen, AlertCircle, 
  X, ChevronRight, GraduationCap
} from 'lucide-react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { API_BASE_URL } from '@/constants/config';

export default function ProgramDetail() {
  const { id } = useLocalSearchParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkerVisible, setCheckerVisible] = useState(false);
  const [checklist, setChecklist] = useState<boolean[]>([]);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/courses/${id}`);
      setCourse(res.data);
      // Mock checklist for eligibility (split requirements by line or bullet)
      const reqs = res.data.eligibilityRequirements?.split('\n') || [];
      setChecklist(new Array(reqs.length).fill(false));
    } catch (err) {
      console.error('Fetch Detail Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (dateStr: string) => {
    if (!dateStr) return null;
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const isEligible = checklist.length > 0 && checklist.every(val => val === true);
  const requirements = course?.eligibilityRequirements?.split('\n').filter((r: string) => r.trim()) || [];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true, 
        headerTitle: 'Program Details',
        headerTintColor: '#fff',
        headerStyle: { backgroundColor: '#0f172a' },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
        )
      }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <GraduationCap size={40} color="#fff" />
          </View>
          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.code}>{course.code}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{course.intakeStatus}</Text>
            </View>
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{course.duration}</Text>
            </View>
          </View>
        </View>

        {getDaysRemaining(course.nextIntakeDate) !== null && (
          <View style={styles.countdownCard}>
            <Clock size={20} color="#f59e0b" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.countdownTitle}>Next Intake Countdown</Text>
              <Text style={styles.countdownVal}>{getDaysRemaining(course.nextIntakeDate)} Days Remaining</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.description}>{course.description}</Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <DollarSign size={20} color="#06B6D4" />
            <Text style={styles.infoLabel}>Total Fees</Text>
            <Text style={styles.infoVal}>LKR {course.fees?.toLocaleString()}</Text>
          </View>
          <View style={styles.infoCard}>
            <Calendar size={20} color="#4F46E5" />
            <Text style={styles.infoLabel}>Intake Date</Text>
            <Text style={styles.infoVal}>{course.nextIntakeDate || 'TBA'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Curriculum Modules</Text>
          {course.modules?.map((m: string, i: number) => (
            <View key={i} style={styles.moduleItem}>
              <View style={styles.moduleNumber}>
                <Text style={styles.moduleNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.moduleName}>{m}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Eligibility Requirements</Text>
            <TouchableOpacity onPress={() => setCheckerVisible(true)} style={styles.checkBtn}>
              <ShieldCheck size={16} color="#4F46E5" />
              <Text style={styles.checkBtnText}>Check My Eligibility</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.reqCard}>
            <Text style={styles.reqText}>{course.eligibilityRequirements}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Footer Action */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyBtn} onPress={() => router.push(`/apply?course=${course._id || course.id}`)}>
          <LinearGradient colors={['#4F46E5', '#06B6D4']} style={styles.applyGradient}>
            <Text style={styles.applyBtnText}>Apply for this Program</Text>
            <ChevronRight size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Eligibility Checker Modal */}
      <Modal visible={checkerVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Eligibility Checklist</Text>
              <TouchableOpacity onPress={() => setCheckerVisible(false)}><X size={24} color="#94a3b8" /></TouchableOpacity>
            </View>
            
            <Text style={styles.modalSub}>Tick each requirement you meet to verify your eligibility.</Text>

            <ScrollView style={{ maxHeight: 400 }}>
              {requirements.map((req, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={styles.checkItem}
                  onPress={() => {
                    const next = [...checklist];
                    next[i] = !next[i];
                    setChecklist(next);
                  }}
                >
                  <View style={[styles.checkbox, checklist[i] && styles.checkboxActive]}>
                    {checklist[i] && <CheckCircle size={14} color="#fff" />}
                  </View>
                  <Text style={styles.checkText}>{req}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={[styles.resultBox, isEligible ? styles.successBox : styles.warningBox]}>
              {isEligible ? (
                <>
                  <CheckCircle size={24} color="#10b981" />
                  <Text style={styles.successText}>You are Eligible! ✓</Text>
                </>
              ) : (
                <>
                  <AlertCircle size={24} color="#f59e0b" />
                  <Text style={styles.warningText}>You may not qualify yet</Text>
                </>
              )}
            </View>

            {isEligible && (
              <TouchableOpacity style={styles.proceedBtn} onPress={() => { setCheckerVisible(false); router.push(`/apply?course=${course._id}`); }}>
                <Text style={styles.proceedText}>Proceed to Application</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 24 },
  header: { alignItems: 'center', marginBottom: 30 },
  iconBox: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#4F46E5', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { color: '#fff', fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  code: { color: '#64748b', fontSize: 14, fontWeight: '700', letterSpacing: 2 },
  badgeRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  statusBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { color: '#10b981', fontSize: 11, fontWeight: '800' },
  durationBadge: { backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  durationText: { color: '#94a3b8', fontSize: 11, fontWeight: '800' },
  countdownCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 20, padding: 16, marginBottom: 32, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.2)' },
  countdownTitle: { color: '#f59e0b', fontSize: 12, fontWeight: '700' },
  countdownVal: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 2 },
  section: { marginBottom: 32 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 16 },
  description: { color: '#94a3b8', fontSize: 15, lineHeight: 24 },
  infoGrid: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  infoCard: { flex: 1, backgroundColor: '#1e293b', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  infoLabel: { color: '#64748b', fontSize: 11, fontWeight: '700', marginTop: 10, marginBottom: 4 },
  infoVal: { color: '#fff', fontSize: 14, fontWeight: '800' },
  moduleItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', padding: 14, borderRadius: 16, marginBottom: 12 },
  moduleNumber: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(79, 70, 229, 0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  moduleNumberText: { color: '#4F46E5', fontSize: 14, fontWeight: '800' },
  moduleName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  checkBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkBtnText: { color: '#4F46E5', fontSize: 13, fontWeight: '700' },
  reqCard: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 20, padding: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: '#334155' },
  reqText: { color: '#94a3b8', fontSize: 14, lineHeight: 22 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: 'rgba(15, 23, 42, 0.95)' },
  applyBtn: { borderRadius: 18, overflow: 'hidden' },
  applyGradient: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  applyBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.9)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#1e293b', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  modalSub: { color: '#94a3b8', fontSize: 13, marginBottom: 24 },
  checkItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 14 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#334155', alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  checkText: { color: '#fff', fontSize: 14, flex: 1 },
  resultBox: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, borderRadius: 16, marginTop: 10 },
  successBox: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  warningBox: { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
  successText: { color: '#10b981', fontSize: 16, fontWeight: '800' },
  warningText: { color: '#f59e0b', fontSize: 16, fontWeight: '800' },
  proceedBtn: { backgroundColor: '#10b981', height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  proceedText: { color: '#fff', fontSize: 15, fontWeight: '800' }
});
