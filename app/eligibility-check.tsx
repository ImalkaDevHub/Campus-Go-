import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, CheckCircle, XCircle, 
  ChevronDown, GraduationCap, Award, 
  Calendar, Info, BookOpen 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '@/constants/config';

const ED_LEVELS = ['O/L', 'A/L', 'Diploma', 'Degree', 'Master'];

export default function EligibilityCheckScreen() {
  const { courseId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(courseId || '');
  const [edLevel, setEdLevel] = useState('A/L');
  const [results, setResults] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(ENDPOINTS.COURSES);
      setCourses(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCheck = async () => {
    if (!selectedCourseId || !results || !age) {
      Alert.alert('Missing Info', 'Please fill in all fields to check eligibility.');
      return;
    }

    try {
      setChecking(true);
      const response = await axios.post(`${API_BASE_URL}/courses/check-eligibility`, {
        courseId: selectedCourseId,
        edLevel,
        results,
        age: parseInt(age)
      });
      setResult(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to check eligibility. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Eligibility Checker</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {!result ? (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>See if you qualify</Text>
            <Text style={styles.formSubtitle}>Enter your details below to instantly check your eligibility for the selected course.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Target Course</Text>
              <View style={styles.pickerWrapper}>
                <BookOpen size={18} color="#4F46E5" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft: 12 }}>
                  {courses.map((c: any) => (
                    <TouchableOpacity 
                      key={c._id || c.id}
                      style={[styles.courseTab, selectedCourseId === (c._id || c.id) && styles.activeCourseTab]}
                      onPress={() => setSelectedCourseId(c._id || c.id)}
                    >
                      <Text style={[styles.courseTabText, selectedCourseId === (c._id || c.id) && styles.activeCourseTabText]}>
                        {c.name || c.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Highest Education Level</Text>
              <View style={styles.levelRow}>
                {ED_LEVELS.map(level => (
                  <TouchableOpacity 
                    key={level}
                    style={[styles.levelBtn, edLevel === level && styles.activeLevelBtn]}
                    onPress={() => setEdLevel(level)}
                  >
                    <Text style={[styles.levelBtnText, edLevel === level && styles.activeLevelBtnText]}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>GPA / Results (e.g. 3.2 or 3 'S' passes)</Text>
              <View style={styles.inputWrapper}>
                <Award size={18} color="#4F46E5" />
                <TextInput 
                  style={styles.input}
                  placeholder="Enter your result"
                  placeholderTextColor="#475569"
                  value={results}
                  onChangeText={setResults}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your Age</Text>
              <View style={styles.inputWrapper}>
                <Calendar size={18} color="#4F46E5" />
                <TextInput 
                  style={styles.input}
                  placeholder="e.g. 21"
                  placeholderTextColor="#475569"
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.checkBtn} 
              onPress={handleCheck}
              disabled={checking}
            >
              {checking ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.checkBtnText}>Check Eligibility Now</Text>
                  <CheckCircle size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultContainer}>
            <View style={[styles.resultCard, result.eligible ? styles.eligibleCard : styles.ineligibleCard]}>
              <View style={styles.resultIcon}>
                {result.eligible ? (
                  <CheckCircle size={64} color="#10b981" />
                ) : (
                  <XCircle size={64} color="#ef4444" />
                )}
              </View>
              
              <Text style={[styles.resultStatus, { color: result.eligible ? '#10b981' : '#ef4444' }]}>
                {result.eligible ? 'CONGRATULATIONS!' : 'WE ARE SORRY'}
              </Text>
              
              <Text style={styles.resultTitle}>
                {result.eligible ? 'You are Eligible to Enroll' : 'Minimum Requirements Not Met'}
              </Text>
              
              <Text style={styles.resultMsg}>
                {result.message}
              </Text>

              {result.eligible && result.courseDetails && (
                <View style={styles.courseInfoBox}>
                  <View style={styles.feeItem}>
                    <Text style={styles.feeLabel}>Course Fee</Text>
                    <Text style={styles.feeVal}>LKR {result.courseDetails.fees?.toLocaleString()}</Text>
                  </View>
                  <View style={styles.feeItem}>
                    <Text style={styles.feeLabel}>Duration</Text>
                    <Text style={styles.feeVal}>{result.courseDetails.duration || 'N/A'}</Text>
                  </View>
                </View>
              )}

              {result.eligible ? (
                <TouchableOpacity 
                  style={styles.actionApply}
                  onPress={() => router.push('/new-application')}
                >
                  <Text style={styles.actionApplyText}>Apply Now</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.actionConsult}
                  onPress={() => Alert.alert('Request Consultation', 'Our counselors will call you shortly to discuss other pathways.')}
                >
                  <Text style={styles.actionConsultText}>Speak to a Counselor</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={styles.resetBtn}
                onPress={() => setResult(null)}
              >
                <Text style={styles.resetBtnText}>Check Another Course</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.tipSection}>
          <Info size={18} color="#3b82f6" />
          <Text style={styles.tipText}>
            Eligibility results are based on standard university entry requirements and are subject to final document verification.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#1e293b',
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    padding: 12,
    height: 60,
  },
  courseTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginRight: 10,
  },
  activeCourseTab: {
    backgroundColor: '#4F46E5',
  },
  courseTabText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
  },
  activeCourseTabText: {
    color: '#fff',
  },
  levelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  levelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activeLevelBtn: {
    borderColor: '#4F46E5',
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  levelBtnText: {
    color: '#64748b',
    fontWeight: '700',
    fontSize: 13,
  },
  activeLevelBtnText: {
    color: '#fff',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  input: {
    flex: 1,
    color: '#fff',
    marginLeft: 12,
    fontSize: 15,
  },
  checkBtn: {
    height: 60,
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  checkBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  resultContainer: {
    paddingVertical: 20,
  },
  resultCard: {
    backgroundColor: '#1e293b',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
  },
  eligibleCard: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  ineligibleCard: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  resultIcon: {
    marginBottom: 20,
  },
  resultStatus: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  resultMsg: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  actionApply: {
    width: '100%',
    height: 56,
    backgroundColor: '#10b981',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  actionApplyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  actionConsult: {
    width: '100%',
    height: 56,
    backgroundColor: '#3b82f6',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  actionConsultText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  resetBtn: {
    paddingVertical: 12,
  },
  resetBtnText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
  },
  tipSection: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  courseInfoBox: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 20,
    gap: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  feeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  feeVal: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '800',
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
