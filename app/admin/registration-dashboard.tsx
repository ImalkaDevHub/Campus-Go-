import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  FileText, UserPlus, CheckCircle, 
  Clock, AlertCircle, TrendingUp, 
  Users, ChevronRight, Filter, Search,
  BarChart2, Download, Mail, Activity
} from 'lucide-react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/config';

const { width } = Dimensions.get('window');

export default function RegistrationDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    review: 0,
    approved: 0,
    rejected: 0,
    updates: 0,
  });
  const [recentApps, setRecentApps] = useState([]);

  useEffect(() => {
    fetchRegistrationStats();
  }, []);

  const fetchRegistrationStats = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('userToken');
      const response = await axios.get(`${API_BASE_URL}/applications/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const apps = response.data || [];
      const calculated = {
        total: apps.length,
        pending: apps.filter((a: any) => a.status === 'PENDING').length,
        review: apps.filter((a: any) => a.status === 'UNDER REVIEW').length,
        approved: apps.filter((a: any) => a.status === 'APPROVED').length,
        rejected: apps.filter((a: any) => a.status === 'REJECTED').length,
        updates: apps.filter((a: any) => a.status === 'UPDATES REQUESTED').length,
      };
      
      setStats(calculated);
      setRecentApps(apps.slice(0, 5));
    } catch (error) {
      console.error('Registration Stats Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Registration Console', headerTintColor: '#fff', headerStyle: { backgroundColor: '#0f172a' } }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRegistrationStats(); }} tintColor="#4F46E5" />}
      >
        {/* Workflow Summary Grid */}
        <View style={styles.statGrid}>
          <TouchableOpacity style={styles.mainStat} onPress={() => router.push('/admin/applications')}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
              <Clock size={24} color="#4F46E5" />
            </View>
            <Text style={styles.statVal}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending Review</Text>
            <View style={styles.pulse} />
          </TouchableOpacity>

          <View style={styles.sideStats}>
            <View style={styles.subStat}>
              <Text style={[styles.subVal, { color: '#8b5cf6' }]}>{stats.updates}</Text>
              <Text style={styles.subLabel}>Fixes Needed</Text>
            </View>
            <View style={styles.subStat}>
              <Text style={[styles.subVal, { color: '#10b981' }]}>{stats.approved}</Text>
              <Text style={styles.subLabel}>Approved</Text>
            </View>
          </View>
        </View>

        {/* System Status Banner */}
        <View style={styles.statusBanner}>
          <View style={styles.statusInfo}>
            <Activity size={16} color="#10b981" />
            <Text style={styles.statusTitle}>Automated Communication Engine Active</Text>
          </View>
          <Text style={styles.statusSub}>SMTP Server: Connected & Sending</Text>
        </View>

        {/* Quick Workflow Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workflow Actions</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#4F46E5' }]}
              onPress={() => router.push('/admin/manual-registration')}
            >
              <UserPlus size={22} color="#fff" />
              <Text style={styles.actionText}>Manual Registration</Text>
              <Text style={styles.actionSub}>For Physical Visits</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }]}
              onPress={() => router.push('/admin/applications')}
            >
              <FileText size={22} color="#4F46E5" />
              <Text style={[styles.actionText, { color: '#fff' }]}>Review All</Text>
              <Text style={styles.actionSub}>Incoming Queue</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data & Analytics Engine Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Analytics Engine</Text>
          <View style={styles.analyticsGrid}>
            <TouchableOpacity style={styles.analyticsCard} onPress={() => router.push('/admin/analytics')}>
              <BarChart2 size={24} color="#06b6d4" />
              <Text style={styles.cardTitle}>Live Analytics</Text>
              <Text style={styles.cardSub}>Registration Trends</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.analyticsCard} onPress={() => router.push('/admin/data-export')}>
              <Download size={24} color="#10b981" />
              <Text style={styles.cardTitle}>Data Export</Text>
              <Text style={styles.cardSub}>Excel/CSV Reports</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.analyticsCard} onPress={() => router.push('/admin/incomplete-profiles')}>
              <View style={styles.badgeContainer}>
                <AlertCircle size={24} color="#f87171" />
                <View style={styles.notifBadge}><Text style={styles.notifText}>!</Text></View>
              </View>
              <Text style={styles.cardTitle}>Incomplete</Text>
              <Text style={styles.cardSub}>Missing Documents</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Incoming Applications</Text>
            <TouchableOpacity onPress={() => router.push('/admin/applications')}>
              <Text style={styles.viewAll}>View Queue</Text>
            </TouchableOpacity>
          </View>

          {recentApps.map((app: any, i) => (
            <TouchableOpacity 
              key={i} 
              style={styles.appCard}
              onPress={() => router.push(`/admin/review-${app._id || app.id}`)}
            >
              <View style={styles.appHeader}>
                <View style={styles.appUser}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{app.fullName?.charAt(0)}</Text>
                  </View>
                  <View>
                    <Text style={styles.appName}>{app.fullName}</Text>
                    <Text style={styles.appCourse}>{app.courseName}</Text>
                  </View>
                </View>
                <View style={[styles.statusTag, { backgroundColor: getStatusColor(app.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(app.status) }]}>{app.status}</Text>
                </View>
              </View>
              <View style={styles.appFooter}>
                <Text style={styles.appMeta}>{new Date(app.createdAt).toLocaleDateString()} • Intake {app.intakeYear}</Text>
                <ChevronRight size={16} color="#64748b" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const getStatusColor = (s: string) => {
  switch (s) {
    case 'APPROVED': return '#10b981';
    case 'REJECTED': return '#ef4444';
    case 'PENDING': return '#f59e0b';
    case 'UPDATES REQUESTED': return '#8b5cf6';
    default: return '#3b82f6';
  }
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  statGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  mainStat: { flex: 1.5, backgroundColor: '#1e293b', borderRadius: 28, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' },
  pulse: { position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(79, 70, 229, 0.05)' },
  iconBox: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  statVal: { fontSize: 32, fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: 13, color: '#64748b', fontWeight: '700', marginTop: 4 },
  sideStats: { flex: 1, gap: 12 },
  subStat: { flex: 1, backgroundColor: '#1e293b', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', justifyContent: 'center' },
  subVal: { fontSize: 20, fontWeight: '800' },
  subLabel: { fontSize: 10, color: '#64748b', fontWeight: '700', marginTop: 2 },
  section: { marginTop: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 16 },
  viewAll: { color: '#4F46E5', fontWeight: '700', fontSize: 13 },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, borderRadius: 24, padding: 20, gap: 8 },
  actionText: { color: '#fff', fontSize: 15, fontWeight: '800', marginTop: 4 },
  actionSub: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600' },
  appCard: { backgroundColor: '#1e293b', borderRadius: 24, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  appHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  appUser: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(79, 70, 229, 0.1)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#4F46E5', fontSize: 18, fontWeight: '800' },
  appName: { color: '#fff', fontSize: 15, fontWeight: '700' },
  appCourse: { color: '#64748b', fontSize: 12 },
  statusTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 9, fontWeight: '900' },
  appFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.03)' },
  appMeta: { color: '#475569', fontSize: 11, fontWeight: '600' },
  statusBanner: { backgroundColor: 'rgba(16, 185, 129, 0.05)', borderRadius: 20, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.1)' },
  statusInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  statusTitle: { color: '#10b981', fontSize: 13, fontWeight: '800' },
  statusSub: { color: '#64748b', fontSize: 10, fontWeight: '600', marginLeft: 26 },
  analyticsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  analyticsCard: { width: (width - 64) / 3, backgroundColor: '#1e293b', borderRadius: 24, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  cardTitle: { color: '#fff', fontSize: 12, fontWeight: '800', textAlign: 'center' },
  cardSub: { color: '#64748b', fontSize: 9, fontWeight: '600', textAlign: 'center' },
  badgeContainer: { position: 'relative' },
  notifBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#ef4444', width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  notifText: { color: '#fff', fontSize: 8, fontWeight: '900' }
});
