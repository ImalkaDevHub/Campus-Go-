import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions, Dimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  BarChart, LineChart 
} from 'react-native-chart-kit';
import { 
  TrendingUp, Users, BookOpen, 
  Clock, AlertCircle, Send, 
  Download, Filter, ChevronRight 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/config';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AnalyticsDashboard() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [incomplete, setIncomplete] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const [statsRes, trendsRes, incRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/analytics/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/analytics/trends`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/applications?incomplete=true`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStats(statsRes.data);
      setTrends(trendsRes.data);
      setIncomplete(incRes.data.slice(0, 5));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    backgroundColor: '#1e293b',
    backgroundGradientFrom: '#1e293b',
    backgroundGradientTo: '#1e293b',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#4F46E5',
    },
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
      <Stack.Screen options={{ title: 'Analytics & Reports', headerTintColor: '#fff', headerStyle: { backgroundColor: '#0f172a' } }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        
        {/* Stats Summary Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
              <Users size={16} color="#4F46E5" />
            </View>
            <Text style={styles.statVal}>{stats?.totalThisMonth || 42}</Text>
            <Text style={styles.statLabel}>Monthly Regs</Text>
            <View style={styles.trendRow}>
              <TrendingUp size={10} color="#10b981" />
              <Text style={styles.trendVal}>+12%</Text>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <TrendingUp size={16} color="#10b981" />
            </View>
            <Text style={styles.statVal}>{stats?.approvalRate || '84%'}</Text>
            <Text style={styles.statLabel}>Approval Rate</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(6, 182, 212, 0.1)' }]}>
              <BookOpen size={16} color="#06B6D4" />
            </View>
            <Text style={styles.statVal} numberOfLines={1}>{stats?.topCourse || 'BIT'}</Text>
            <Text style={styles.statLabel}>Top Program</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Clock size={16} color="#F59E0B" />
            </View>
            <Text style={styles.statVal}>{stats?.avgProcessTime || '2.4d'}</Text>
            <Text style={styles.statLabel}>Avg Process</Text>
          </View>
        </View>

        {/* Chart Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registration Trends</Text>
          <View style={styles.chartBox}>
            <BarChart
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{ data: trends?.monthlyData || [20, 45, 28, 80, 99, 43] }]
              }}
              width={width - 48}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={chartConfig}
              verticalLabelRotation={0}
              style={styles.chart}
              fromZero
            />
          </View>
        </View>

        {/* Incomplete Profiles Snapshot */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={18} color="#ef4444" />
              <Text style={styles.sectionTitle}>Missing Documents</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/admin/incomplete-profiles')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.incList}>
            {incomplete.map((item: any) => (
              <View key={item._id || item.id} style={styles.incRow}>
                <View style={styles.incInfo}>
                  <Text style={styles.incName}>{item.fullName}</Text>
                  <Text style={styles.incMissing}>Missing: NIC Front, Certs</Text>
                </View>
                <TouchableOpacity style={styles.remindBtn}>
                  <Send size={14} color="#fff" />
                  <Text style={styles.remindText}>Remind</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Export Link */}
        <TouchableOpacity style={styles.exportLink} onPress={() => router.push('/admin/data-export')}>
          <Download size={20} color="#fff" />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.exportTitle}>Advanced Data Export</Text>
            <Text style={styles.exportSub}>Generate CSV/Excel reports for all data.</Text>
          </View>
          <ChevronRight size={20} color="#64748b" />
        </TouchableOpacity>

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
    padding: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    width: (SCREEN_WIDTH - 60) / 2,
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  trendVal: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '800',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
  },
  chartBox: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  chart: {
    borderRadius: 16,
  },
  viewAll: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 16,
  },
  incList: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  incRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  incInfo: {
    flex: 1,
  },
  incName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  incMissing: {
    color: '#ef4444',
    fontSize: 11,
    marginTop: 2,
  },
  remindBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  remindText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  exportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 24,
    padding: 20,
    marginTop: 10,
  },
  exportTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  exportSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 2,
  }
});
