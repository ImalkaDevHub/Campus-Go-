import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Platform, Alert, Modal } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, MapPin, QrCode, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/config';

const TABS = ['All', 'Upcoming', 'Past'];

const getToken = async () => {
  if (Platform.OS === 'web') return localStorage.getItem('userToken');
  return await SecureStore.getItemAsync('userToken');
};

export default function MyWorkshops() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('All');
  const [allWorkshops, setAllWorkshops] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<any>(null);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    await Promise.all([fetchAllWorkshops(), fetchMyRegistrations()]);
    setLoading(false);
    setRefreshing(false);
  };

  const fetchAllWorkshops = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/workshops`);
      setAllWorkshops(response.data);
    } catch (error) {
      console.error('fetchAllWorkshops error:', error);
    }
  };

  const fetchMyRegistrations = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const response = await axios.get(`${API_BASE_URL}/workshops/registrations/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistrations(response.data);
    } catch (error) {
      console.error('fetchMyRegistrations error:', error);
    }
  };

  const isRegistered = (workshopId: string) => {
    return registrations.some((r: any) => 
      (r.workshop?._id || r.workshop?.id || r.workshopId) === workshopId
    );
  };

  const handleRegister = async () => {
    try {
      setRegistering(true);
      const token = await getToken();
      if (!token) {
        Alert.alert('Login Required', 'Please login to register.');
        router.push('/login');
        return;
      }
      await axios.post(`${API_BASE_URL}/workshops/register`, 
        { workshopId: selectedWorkshop._id || selectedWorkshop.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Registered successfully!');
      setModalVisible(false);
      fetchAll();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const getFilteredData = () => {
    if (activeTab === 'All') return allWorkshops;
    const now = new Date();
    if (activeTab === 'Upcoming') {
      return registrations.filter((r: any) => 
        new Date(r.workshop?.date || r.date) >= now);
    }
    return registrations.filter((r: any) => 
      new Date(r.workshop?.date || r.date) < now);
  };

  const renderAllCard = ({ item }: { item: any }) => {
    const registered = isRegistered(item._id || item.id);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.workshopTitle}>{item.title}</Text>
          {item.category && (
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}
        </View>
        <View style={styles.cardBody}>
          <View style={styles.metaRow}>
            <Calendar size={14} color="#64748b" />
            <Text style={styles.metaText}>
              {new Date(item.date).toLocaleDateString('en-US', { 
                year: 'numeric', month: 'long', day: 'numeric' 
              })}
            </Text>
          </View>
          {item.speaker && (
            <View style={styles.metaRow}>
              <User size={14} color="#64748b" />
              <Text style={styles.metaText}>{item.speaker || item.speakerName}</Text>
            </View>
          )}
          {item.location && (
            <View style={styles.metaRow}>
              <MapPin size={14} color="#64748b" />
              <Text style={styles.metaText}>{item.location}</Text>
            </View>
          )}
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.priceText}>
            {item.price === 0 || !item.price ? 'Free' : `LKR ${item.price}`}
          </Text>
          {registered ? (
            <View style={styles.registeredBadge}>
              <Text style={styles.registeredText}>✓ Registered</Text>
            </View>
          ) : (
            <TouchableOpacity onPress={() => { setSelectedWorkshop(item); setModalVisible(true); }}>
              <LinearGradient colors={['#4F46E5', '#06B6D4']} style={styles.registerBtn}>
                <Text style={styles.registerBtnText}>Register Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderRegistrationCard = ({ item }: { item: any }) => {
    const workshop = item.workshop || {};
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.workshopTitle}>{workshop.title || 'Workshop'}</Text>
          <View style={styles.regBadge}>
            <Text style={styles.statusText}>{item.status || 'Registered'}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.metaRow}>
            <Calendar size={14} color="#64748b" />
            <Text style={styles.metaText}>
              {workshop.date ? new Date(workshop.date).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <MapPin size={14} color="#64748b" />
            <Text style={styles.metaText}>{workshop.location || 'N/A'}</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.refId}>REF: {item.referenceId?.toUpperCase() || 'N/A'}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Workshops & Events', headerTintColor: '#fff', headerStyle: { backgroundColor: '#0f172a' } }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      <View style={[styles.tabContainer, { paddingTop: insets.top + 10 }]}>
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

      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={getFilteredData()}
          renderItem={activeTab === 'All' ? renderAllCard : renderRegistrationCard}
          keyExtractor={(item) => (item._id || item.id || Math.random()).toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} tintColor="#4F46E5" />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Calendar size={60} color="#1e293b" />
              <Text style={styles.emptyText}>No workshops found.</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Registration</Text>
            <Text style={styles.modalWorkshopTitle}>{selectedWorkshop?.title}</Text>
            <Text style={styles.modalMeta}>
              {selectedWorkshop?.date ? new Date(selectedWorkshop.date).toLocaleDateString() : ''}
            </Text>
            <Text style={styles.modalPrice}>
              {selectedWorkshop?.price === 0 || !selectedWorkshop?.price ? 'Free' : `LKR ${selectedWorkshop?.price}`}
            </Text>
            <TouchableOpacity onPress={handleRegister} disabled={registering}>
              <LinearGradient colors={['#4F46E5', '#06B6D4']} style={styles.confirmBtn}>
                {registering ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Confirm Registration</Text>}
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  tab: { flex: 1, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.03)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  activeTab: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  tabText: { color: '#64748b', fontSize: 14, fontWeight: '700' },
  activeTabText: { color: '#fff' },
  listContent: { padding: 20 },
  card: { backgroundColor: '#1e293b', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  workshopTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: '#fff', marginRight: 12 },
  categoryChip: { backgroundColor: 'rgba(79,70,229,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryText: { color: '#4F46E5', fontSize: 10, fontWeight: '800' },
  cardBody: { gap: 8, marginBottom: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  priceText: { color: '#10b981', fontSize: 14, fontWeight: '800' },
  registerBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  registerBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  registeredBadge: { backgroundColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  registeredText: { color: '#10b981', fontSize: 13, fontWeight: '800' },
  regBadge: { backgroundColor: 'rgba(79,70,229,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800', color: '#4F46E5', textTransform: 'uppercase' },
  refId: { fontSize: 12, color: '#475569', fontWeight: '800', letterSpacing: 1 },
  emptyBox: { alignItems: 'center', paddingTop: 100, gap: 16 },
  emptyText: { color: '#475569', fontSize: 15, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#1e293b', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, gap: 16 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  modalWorkshopTitle: { color: '#94a3b8', fontSize: 16, fontWeight: '700' },
  modalMeta: { color: '#64748b', fontSize: 14 },
  modalPrice: { color: '#10b981', fontSize: 18, fontWeight: '800' },
  confirmBtn: { borderRadius: 16, padding: 16, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  cancelBtn: { alignItems: 'center', padding: 12 },
  cancelBtnText: { color: '#64748b', fontSize: 14, fontWeight: '700' },
});
