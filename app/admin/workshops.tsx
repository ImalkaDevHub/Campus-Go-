import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Platform, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Plus, Edit, Trash2, 
  Users, Calendar, Clock, 
  ChevronRight, TrendingUp,
  LayoutDashboard, MoreVertical
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/config';

const getToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('userToken');
  }
  return await SecureStore.getItemAsync('userToken');
};

export default function AdminWorkshopsDashboard() {
  const insets = useSafeAreaInsets();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    registrations: 0,
    today: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const deleteWorkshop = async (workshopId: string) => {
    Alert.alert(
      'Delete Workshop',
      'Are you sure you want to permanently remove this workshop and all its registrations?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const token = await getToken();
              await axios.delete(`${API_BASE_URL}/workshops/${workshopId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              Alert.alert('Deleted', 'Workshop has been removed successfully.');
              fetchData(); // Refresh list
            } catch (error: any) {
              console.error(error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete workshop');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const fetchData = async () => {
    try {
      const token = await getToken();
      let responseData = [];
      try {
        const response = await axios.get(`${API_BASE_URL}/workshops`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        responseData = response.data || [];
      } catch (err: any) {
        console.warn('Failed to fetch workshops:', err.message);
      }
      setWorkshops(responseData);
      
      // Calculate stats
      setStats({
        total: responseData.length,
        upcoming: responseData.filter((w: any) => new Date(w.date) >= new Date()).length,
        registrations: responseData.reduce((acc: number, w: any) => acc + (w.registeredCount || w.registrations?.length || 0), 0),
        today: responseData.filter((w: any) => new Date(w.date).toDateString() === new Date().toDateString()).length
      });
      
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderStatCard = (title: string, value: number, color: string, icon: any) => {
    const Icon = icon;
    return (
      <View style={[styles.statCard, { borderLeftColor: color }]}>
        <View style={styles.statHeader}>
          <Text style={styles.statLabel}>{title}</Text>
          <Icon size={16} color={color} />
        </View>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
    );
  };

  const renderWorkshopItem = ({ item }: { item: any }) => {
    const status = new Date(item.date) < new Date() ? 'Completed' : 'Upcoming';
    
    return (
      <TouchableOpacity 
        style={styles.workshopCard}
        onPress={() => router.push(`/admin/workshop-registrations/${item._id || item.id}`)}
      >
        <View style={styles.workshopHeader}>
          <View>
            <Text style={styles.workshopTitle}>{item.title || item.workshopName}</Text>
            <Text style={styles.workshopDate}>{new Date(item.date).toLocaleDateString()} • {item.startTime}</Text>
          </View>
          <View style={[styles.statusBadge, status === 'Upcoming' ? styles.upcomingBadge : styles.completedBadge]}>
            <Text style={[styles.statusText, status === 'Upcoming' ? styles.upcomingText : styles.completedText]}>{status}</Text>
          </View>
        </View>

        <View style={styles.workshopMeta}>
          <View style={styles.metaBox}>
            <Users size={14} color="#64748b" />
            <Text style={styles.metaText}>{item.registeredCount || item.registrations?.length || 0} Registered</Text>
          </View>
          <View style={styles.metaBox}>
            <TrendingUp size={14} color="#64748b" />
            <Text style={styles.metaText}>{Math.round((((item.registeredCount || item.registrations?.length || 0) / (item.totalSeats || 100)) * 100))}% Fill</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => router.push(`/admin/workshop-form?id=${item._id || item.id}`)}
          >
            <Edit size={16} color="#4F46E5" />
            <Text style={[styles.actionBtnText, { color: '#4F46E5' }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => router.push({ pathname: '/admin/workshop-registrations/attendance', params: { id: item._id || item.id } })}
          >
            <Users size={16} color="#06B6D4" />
            <Text style={[styles.actionBtnText, { color: '#06B6D4' }]}>Registrations</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => deleteWorkshop(item._id || item.id)}
          >
            <Trash2 size={16} color="#ef4444" />
            <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      <View style={[styles.statsContainer, { paddingTop: insets.top + 20 }]}>
        <View style={styles.statsRow}>
          {renderStatCard('Workshops', stats.total, '#4F46E5', Calendar)}
          {renderStatCard('Upcoming', stats.upcoming, '#10b981', Clock)}
        </View>
        <View style={[styles.statsRow, { marginTop: 12 }]}>
          {renderStatCard('Global Regs', stats.registrations, '#8b5cf6', Users)}
          {renderStatCard('Today', stats.today, '#f59e0b', TrendingUp)}
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Event Inventory</Text>
        <TouchableOpacity style={styles.onSpotBtn} onPress={() => router.push('/admin/on-spot-registration')}>
          <Users size={16} color="#fff" />
          <Text style={styles.onSpotText}>On-spot Reg</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={workshops}
          renderItem={renderWorkshopItem}
          keyExtractor={(item) => (item._id || item.id).toString()}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#4F46E5" />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity 
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        onPress={() => router.push('/admin/workshop-form')}
      >
        <Plus size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  onSpotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#06B6D4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  onSpotText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: 20,
  },
  workshopCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  workshopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  workshopTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  workshopDate: {
    fontSize: 12,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  upcomingBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  completedBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  upcomingText: {
    color: '#10b981',
  },
  completedText: {
    color: '#64748b',
  },
  workshopMeta: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  metaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
});
