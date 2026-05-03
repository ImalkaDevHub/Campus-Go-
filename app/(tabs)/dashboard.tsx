import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, BookOpen, GraduationCap, CreditCard, Bell, Settings, ArrowUpRight, Clock } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import axios from 'axios';
import { ENDPOINTS } from '@/constants/config';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

const ProgressItem = ({ title, progress, color }: any) => (
  <View style={styles.progressItem}>
    <View style={styles.progressTextRow}>
      <Text style={styles.progressTitle}>{title}</Text>
      <Text style={[styles.progressPercent, { color }]}>{progress}%</Text>
    </View>
    <View style={styles.progressBarBg}>
      <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: color }]} />
    </View>
  </View>
);

const ActionButton = ({ icon: Icon, label, color }: any) => (
  <TouchableOpacity style={[styles.actionButton, { backgroundColor: 'rgba(255,255,255,0.03)' }]} activeOpacity={0.7}>
    <View style={[styles.actionIcon, { backgroundColor: `${color}15` }]}>
      <Icon size={20} color={color} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [user, setUser] = React.useState<any>(null);
  const [application, setApplication] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const userRes = await axios.get(ENDPOINTS.USER).catch(() => null);
      const appRes = await axios.get(`${ENDPOINTS.APPLICATIONS}/my-application`).catch(() => null);
      if (userRes) setUser(userRes.data);
      if (appRes) setApplication(appRes.data);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayUser = user || {
    name: 'Imalka Madushan',
    gpa: 3.85,
    credits: 12,
    coursesCount: 4,
  };

  const displayApp = application || {
    status: 'UNDER REVIEW',
    message: 'Your application for the Fall 2026 intake is currently being reviewed by the admissions team.'
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.headerTop}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{displayUser.name.split(' ').map((n:any)=>n[0]).join('')}</Text>
            </View>
            <View>
              <Text style={styles.userName}>{displayUser.name}</Text>
              <Text style={styles.userType}>BSc Computer Science • Level 5</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={20} color="#fff" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{displayUser.gpa}</Text>
            <Text style={styles.statLabel}>Current GPA</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{displayUser.credits}</Text>
            <Text style={styles.statLabel}>Credits</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{displayUser.coursesCount}</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.content}>
        
        {/* Application Status Card */}
        <View style={[styles.card, { backgroundColor: themeColors.card }]}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Application Status</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: displayApp.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(234, 179, 8, 0.1)' }]}>
              <View style={[styles.statusDot, { backgroundColor: displayApp.status === 'APPROVED' ? '#10b981' : '#eab308' }]} />
              <Text style={[styles.statusText, { color: displayApp.status === 'APPROVED' ? '#10b981' : '#eab308' }]}>{displayApp.status}</Text>
            </View>
          </View>
          <ThemedText style={styles.cardDesc}>
            {displayApp.message || displayApp.reason || 'Your application is being processed.'}
          </ThemedText>
          <TouchableOpacity style={styles.trackButton}>
            <Text style={styles.trackButtonText}>Track Progress</Text>
            <ArrowUpRight size={16} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* Academic Progress */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Course Progress</ThemedText>
          <View style={[styles.card, { backgroundColor: themeColors.card }]}>
            <ProgressItem title="Software Engineering" progress={75} color="#3b82f6" />
            <ProgressItem title="Database Systems" progress={45} color="#8b5cf6" />
            <ProgressItem title="UI/UX Design" progress={90} color="#10b981" />
            <ProgressItem title="Cloud Computing" progress={20} color="#f59e0b" />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
          <View style={styles.actionGrid}>
            <Link href="/payments" asChild>
              <TouchableOpacity>
                <ActionButton icon={CreditCard} label="Payments" color="#3b82f6" />
              </TouchableOpacity>
            </Link>
            <Link href="/workshops" asChild>
              <TouchableOpacity>
                <ActionButton icon={BookOpen} label="Workshops" color="#8b5cf6" />
              </TouchableOpacity>
            </Link>
            <ActionButton icon={GraduationCap} label="Scholarships" color="#10b981" />
            <Link href="/profile" asChild>
              <TouchableOpacity>
                <ActionButton icon={Settings} label="Settings" color="#94a3b8" />
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Upcoming Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <ThemedText style={styles.sectionTitle}>Today's Schedule</ThemedText>
            <Text style={styles.viewAll}>View All</Text>
          </View>
          <View style={[styles.scheduleItem, { backgroundColor: themeColors.card }]}>
            <View style={styles.timeContainer}>
              <Clock size={16} color="#94a3b8" />
              <Text style={styles.timeText}>09:00 AM</Text>
            </View>
            <View style={styles.scheduleDivider} />
            <View style={styles.classInfo}>
              <Text style={styles.classTitle}>Advanced Web Dev</Text>
              <Text style={styles.classRoom}>Lab 04 • Dr. Aruna</Text>
            </View>
          </View>
        </View>

      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  userName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  userType: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 16,
    borderRadius: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 24,
  },
  card: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#eab308',
  },
  statusText: {
    color: '#eab308',
    fontSize: 9,
    fontWeight: '800',
  },
  cardDesc: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 16,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trackButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAll: {
    color: '#3b82f6',
    fontSize: 13,
    fontWeight: '600',
  },
  progressItem: {
    marginBottom: 16,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: (width - 60) / 2,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  scheduleItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  timeContainer: {
    width: 80,
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  scheduleDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16,
  },
  classInfo: {
    flex: 1,
  },
  classTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  classRoom: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
});
