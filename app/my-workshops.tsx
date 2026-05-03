import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Calendar, Clock, MapPin, 
  QrCode, ChevronRight, CheckCircle, 
  XCircle, ArrowLeft 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/config';

const TABS = ['Upcoming', 'Past'];

export default function MyWorkshops() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  const fetchMyRegistrations = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await axios.get(`${API_BASE_URL}/workshop-registrations/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistrations(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getFilteredData = () => {
    const now = new Date();
    if (activeTab === 'Upcoming') {
      return registrations.filter((r: any) => new Date(r.workshop?.date || r.date) >= now);
    }
    return registrations.filter((r: any) => new Date(r.workshop?.date || r.date) < now);
  };

  const renderRegistrationCard = ({ item }: { item: any }) => {
    const workshop = item.workshop || {};
    const status = item.status || 'Registered';

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push(`/workshop-details/${workshop._id || workshop.id}`)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.workshopTitle}>{workshop.title || 'Workshop Title'}</Text>
          <View style={[styles.statusBadge, status === 'Attended' ? styles.attendedBadge : styles.regBadge]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.metaRow}>
            <Calendar size={14} color="#64748b" />
            <Text style={styles.metaText}>{new Date(workshop.date).toLocaleDateString()}</Text>
          </View>
          <View style={styles.metaRow}>
            <MapPin size={14} color="#64748b" />
            <Text style={styles.metaText}>{workshop.location}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.refId}>REF: {item.referenceId?.toUpperCase()}</Text>
          <TouchableOpacity 
            style={styles.qrBtn}
            onPress={() => router.push(`/workshop-qr/${item._id || item.id}`)}
          >
            <QrCode size={18} color="#fff" />
            <Text style={styles.qrBtnText}>Show QR</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'My Registrations', headerTintColor: '#fff', headerStyle: { backgroundColor: '#0f172a' } }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      <View style={styles.tabContainer}>
        {TABS.map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={getFilteredData()}
          renderItem={renderRegistrationCard}
          keyExtractor={(item) => (item._id || item.id).toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMyRegistrations(); }} tintColor="#4F46E5" />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Calendar size={60} color="#1e293b" />
              <Text style={styles.emptyText}>No {activeTab.toLowerCase()} workshops found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activeTab: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  tabText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
  },
  activeTabText: {
    color: '#fff',
  },
  listContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  workshopTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  regBadge: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  attendedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4F46E5',
    textTransform: 'uppercase',
  },
  cardBody: {
    gap: 8,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  refId: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '800',
    letterSpacing: 1,
  },
  qrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  qrBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  emptyBox: {
    alignItems: 'center',
    paddingTop: 100,
    gap: 16,
  },
  emptyText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  }
});
