import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, Share2, Clock, Calendar, 
  DollarSign, GraduationCap, CheckCircle, 
  BookOpen, Info, ChevronRight, AlertCircle 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { ENDPOINTS } from '@/constants/config';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const response = await axios.get(`${ENDPOINTS.COURSES}/${id}`);
      setCourse(response.data);
    } catch (error) {
      console.error('Failed to fetch course details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out the ${course.name} program at CSBM University!`,
        url: `https://csbm.lk/courses/${id}`,
      });
    } catch (error) {
      console.error(error);
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

  if (!course) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#fff' }}>Course not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
          <Share2 size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>{course.code}</Text>
          </View>
          <Text style={styles.title}>{course.name}</Text>
          <Text style={styles.category}>{course.category || 'Professional Program'}</Text>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Clock size={20} color="#4F46E5" />
            <Text style={styles.statVal}>{course.duration}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statBox}>
            <GraduationCap size={20} color="#4F46E5" />
            <Text style={styles.statVal}>{course.credits}</Text>
            <Text style={styles.statLabel}>Credits</Text>
          </View>
          <View style={styles.statBox}>
            <Calendar size={20} color="#4F46E5" />
            <Text style={styles.statVal}>Part-Time</Text>
            <Text style={styles.statLabel}>Learning</Text>
          </View>
        </View>

        {/* Intake Alert Card */}
        <LinearGradient colors={['rgba(79, 70, 229, 0.15)', 'rgba(79, 70, 229, 0.05)']} style={styles.intakeCard}>
          <View style={styles.intakeInfo}>
            <Calendar size={24} color="#4F46E5" />
            <View>
              <Text style={styles.intakeLabel}>Next Intake Begins</Text>
              <Text style={styles.intakeValue}>
                {course.nextIntakeDate ? new Date(course.nextIntakeDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'To Be Announced'}
              </Text>
            </View>
          </View>
          <View style={styles.deadlineRow}>
            <AlertCircle size={14} color="#f97316" />
            <Text style={styles.deadlineText}>Deadline: {course.intakeDeadline ? new Date(course.intakeDeadline).toLocaleDateString() : 'Rolling Admission'}</Text>
          </View>
        </LinearGradient>

        {/* Description Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={20} color="#3b82f6" />
            <Text style={styles.sectionTitle}>Overview</Text>
          </View>
          <Text style={styles.description}>{course.description}</Text>
        </View>

        {/* Entry Requirements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CheckCircle size={20} color="#10b981" />
            <Text style={styles.sectionTitle}>Entry Requirements</Text>
          </View>
          {course.requirements ? (
            <View style={styles.reqList}>
              {course.requirements.split('\n').map((req: string, i: number) => (
                <View key={i} style={styles.reqItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.reqText}>{req.trim()}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noData}>Contact admissions for detailed requirements.</Text>
          )}
        </View>

        {/* Modules List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BookOpen size={20} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Course Content (Modules)</Text>
          </View>
          {course.modules && course.modules.length > 0 ? (
            <View style={styles.moduleList}>
              {course.modules.map((module: string, i: number) => (
                <View key={i} style={styles.moduleItem}>
                  <Text style={styles.moduleNum}>{String(i + 1).padStart(2, '0')}</Text>
                  <Text style={styles.moduleName}>{module}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noData}>Curriculum details available upon request.</Text>
          )}
        </View>

        {/* Fee Section */}
        <View style={styles.feeSection}>
          <View style={styles.sectionHeader}>
            <DollarSign size={20} color="#10b981" />
            <Text style={styles.sectionTitle}>Investment</Text>
          </View>
          <View style={styles.feeCard}>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Total Program Fee</Text>
              <Text style={styles.feeValue}>LKR {course.fee?.toLocaleString()}</Text>
            </View>
            <Text style={styles.feeNote}>* Flexible installment plans available through our partner banks.</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Action Bar */}
      <View style={[styles.actionBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity 
          style={styles.actionEligible}
          onPress={() => router.push({ pathname: '/eligibility-check', params: { courseId: id } })}
        >
          <Text style={styles.actionEligibleText}>Check My Eligibility</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionApply}
          onPress={() => router.push('/new-application')}
        >
          <LinearGradient colors={['#4F46E5', '#3730A3']} style={styles.applyBtnGradient}>
            <Text style={styles.actionApplyText}>Apply Now</Text>
            <ChevronRight size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
    position: 'absolute',
    left: 0,
    right: 0,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  scrollContent: {
    paddingTop: 110,
    paddingHorizontal: 24,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  codeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    marginBottom: 16,
  },
  codeText: {
    color: '#818cf8',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 36,
  },
  category: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingVertical: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  statVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  intakeCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.3)',
  },
  intakeInfo: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  intakeLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  intakeValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  deadlineText: {
    color: '#f97316',
    fontSize: 13,
    fontWeight: '700',
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
  description: {
    fontSize: 15,
    color: '#94a3b8',
    lineHeight: 24,
  },
  reqList: {
    gap: 12,
  },
  reqItem: {
    flexDirection: 'row',
    gap: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginTop: 8,
  },
  reqText: {
    flex: 1,
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 22,
  },
  moduleList: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 16,
  },
  moduleItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    gap: 16,
  },
  moduleNum: {
    fontSize: 12,
    fontWeight: '900',
    color: '#475569',
  },
  moduleName: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  feeSection: {
    marginBottom: 32,
  },
  feeCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  feeLabel: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  feeValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10b981',
  },
  feeNote: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
  },
  noData: {
    color: '#475569',
    fontStyle: 'italic',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingTop: 16,
    paddingHorizontal: 20,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  actionEligible: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  actionEligibleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  actionApply: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
  },
  applyBtnGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionApplyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
