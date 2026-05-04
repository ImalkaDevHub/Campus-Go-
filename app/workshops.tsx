import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, Image, FlatList, ActivityIndicator, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, MapPin, User, ChevronRight, Filter, CheckCircle, Lock, Info, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { ENDPOINTS } from '@/constants/config';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_BASE_URL } from '@/constants/config';

const { width } = Dimensions.get('window');

// Helper for Web compatibility
const getToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('userToken');
  }
  return await SecureStore.getItemAsync('userToken');
};

const CATEGORIES = ['All', 'Workshops', 'Seminars', 'Technology', 'Leadership'];

export default function WorkshopsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [activeTab, setActiveTab] = useState('All');
  const [workshops, setWorkshops] = useState([]);
  const [registeredIds, setRegisteredIds] = useState([]);
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  
  // Modal state for Ticket
  const [ticketModalVisible, setTicketModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      // 1. Fetch workshops
      const wsRes = await axios.get(`${API_BASE_URL}/workshops`).catch(err => {
        console.warn('Workshops fetch failed:', err.message);
        return { data: [] };
      });
      
      const workshopsData = wsRes.data?.data || wsRes.data?.workshops || (Array.isArray(wsRes.data) ? wsRes.data : []);
      setWorkshops(workshopsData);

      // 2. Fetch my registrations
      const regRes = await axios.get(`${API_BASE_URL}/workshopregistrations/my`, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => ({ data: [] }));
      
      const regs = regRes.data?.data || regRes.data?.registrations || (Array.isArray(regRes.data) ? regRes.data : []);
      const ids = regs.map((r: any) => r.workshopId || r.workshop?._id || r._id).filter(Boolean);
      setRegisteredIds(ids);

      // 3. Check application status
      const appRes = await axios.get(`${API_BASE_URL}/applications/my-application`, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => ({ data: null }));
      if (appRes.data) {
        const status = appRes.data.status?.toUpperCase();
        setIsApproved(status === 'APPROVED');
      }

    } catch (error) {
      console.error('Failed to fetch workshops data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (workshop: any) => {
    const wsId = workshop._id || workshop.id;
    if (!isApproved || registering) return;

    try {
      setRegistering(wsId);
      const token = await getToken();
      // Use the confirmed endpoint from admin side
      const res = await axios.post(`${API_BASE_URL}/workshopregistrations`, { 
        workshopId: wsId 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.status === 200 || res.status === 201) {
        setRegisteredIds(prev => [...prev, wsId]);
        setSelectedTicket({ ...workshop, ...res.data });
        setTicketModalVisible(true);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setRegistering(null);
    }
  };

  const filteredWorkshops = workshops.filter((w: any) => {
    if (activeTab === 'All') return true;
    const type = (w.type || w.category || '').toLowerCase();
    return type.includes(activeTab.toLowerCase());
  });

  const renderWorkshopItem = ({ item, index }: { item: any, index: number }) => {
    const wsId = item._id || item.id;
    const isRegistered = registeredIds.includes(wsId);
    const capacityPercent = 65 + (index * 7) % 30; // Mock capacity for visual

    return (
      <View style={[styles.workshopCard, { backgroundColor: themeColors.card }]}>
        <Image 
          source={{ uri: item.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop' }} 
          style={styles.cardBanner}
        />
        <LinearGradient
          colors={['transparent', 'rgba(15, 23, 42, 0.8)']}
          style={styles.bannerOverlay}
        />
        
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{item.type || 'WORKSHOP'}</Text>
            </View>
            {isRegistered && (
              <View style={styles.joinedBadge}>
                <CheckCircle size={12} color="#fff" />
                <Text style={styles.joinedBadgeText}>JOINED</Text>
              </View>
            )}
          </View>

          <Text style={styles.workshopTitle}>{item.title || item.topic}</Text>

          <View style={styles.wsInfoGrid}>
            <View style={styles.wsInfoItem}>
              <Calendar size={14} color="#94a3b8" />
              <Text style={styles.wsInfoText}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <View style={styles.wsInfoItem}>
              <Clock size={14} color="#94a3b8" />
              <Text style={styles.wsInfoText}>{item.time || '10:00 AM'}</Text>
            </View>
            <View style={styles.wsInfoItem}>
              <MapPin size={14} color="#94a3b8" />
              <Text style={styles.wsInfoText} numberOfLines={1}>{item.location || 'Main Hall'}</Text>
            </View>
          </View>

          <View style={styles.capacityContainer}>
            <View style={styles.capacityHeader}>
              <Text style={styles.capacityLabel}>Availability</Text>
              <Text style={[styles.capacityValue, capacityPercent > 90 && { color: '#ef4444' }]}>
                {capacityPercent}% Full
              </Text>
            </View>
            <View style={styles.capacityBarBg}>
              <View style={[styles.capacityBarFill, { width: `${capacityPercent}%`, backgroundColor: capacityPercent > 90 ? '#ef4444' : '#3b82f6' }]} />
            </View>
          </View>

          {isRegistered ? (
            <TouchableOpacity 
              style={styles.registeredBtn}
              onPress={() => { setSelectedTicket(item); setTicketModalVisible(true); }}
            >
              <CheckCircle size={18} color="#10b981" />
              <Text style={styles.registeredBtnText}>Registered</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.registerBtn, registering === wsId && styles.disabledBtn]}
              onPress={() => handleRegister(item)}
              disabled={!!registering}
            >
              {registering === wsId ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.registerBtnText}>Register Now</Text>
                  <ChevronRight size={18} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />
      
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <ThemedText style={styles.title}>Events & Workshops</ThemedText>
        <ThemedText style={styles.subtitle}>Professional growth opportunities for our elite community.</ThemedText>
      </View>

      {!isApproved && (
        <View style={styles.warningBanner}>
          <Info size={20} color="#eab308" />
          <Text style={styles.warningText}>
            You need an approved application to register for workshops.
          </Text>
        </View>
      )}

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.filterTab, activeTab === cat && styles.activeFilterTab]}
              onPress={() => setActiveTab(cat)}
            >
              <Text style={[styles.filterTabText, activeTab === cat && styles.activeFilterTabText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Fetching events...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredWorkshops}
          renderItem={renderWorkshopItem}
          keyExtractor={(item) => (item._id || item.id).toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Calendar size={64} color="#334155" />
              <Text style={styles.emptyText}>No workshops found</Text>
            </View>
          }
        />
      )}

      {/* Ticket Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={ticketModalVisible}
        onRequestClose={() => setTicketModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.ticketContainer}>
            <TouchableOpacity style={styles.closeModal} onPress={() => setTicketModalVisible(false)}>
              <X size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.ticket}>
              <LinearGradient colors={['#2563eb', '#7c3aed']} style={styles.ticketHeader}>
                <CheckCircle size={32} color="#fff" />
                <Text style={styles.ticketHeaderTitle}>Registration Confirmed</Text>
              </LinearGradient>

              <View style={styles.ticketBody}>
                <Text style={styles.ticketLabel}>EVENT TICKET</Text>
                <Text style={styles.ticketTitle}>{selectedTicket?.title || selectedTicket?.topic}</Text>
                
                <View style={styles.ticketInfoRow}>
                  <View>
                    <Text style={styles.ticketSubLabel}>DATE</Text>
                    <Text style={styles.ticketValue}>{selectedTicket?.date ? new Date(selectedTicket.date).toLocaleDateString() : 'TBD'}</Text>
                  </View>
                  <View>
                    <Text style={styles.ticketSubLabel}>TIME</Text>
                    <Text style={styles.ticketValue}>{selectedTicket?.time || '10:00 AM'}</Text>
                  </View>
                </View>

                <View style={styles.qrPlaceholder}>
                  <Text style={styles.qrText}>[ QR CODE ]</Text>
                  <Text style={styles.refId}>REF: {selectedTicket?._id?.substring(0, 8).toUpperCase() || 'WKS-4821'}</Text>
                </View>

                <View style={styles.perforatedLine} />
                
                <View style={styles.ticketFooter}>
                  <Info size={14} color="#64748b" />
                  <Text style={styles.footerNote}>Show this ticket at the entrance</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.doneBtn} onPress={() => setTicketModalVisible(false)}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ height: 20 }} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    lineHeight: 22,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.2)',
  },
  warningText: {
    color: '#eab308',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterScroll: {
    paddingHorizontal: 24,
    gap: 12,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  activeFilterTab: {
    backgroundColor: '#2563eb',
    borderColor: '#3b82f6',
  },
  filterTabText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '700',
  },
  activeFilterTabText: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 24,
    gap: 20,
    paddingBottom: 40,
  },
  workshopCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  cardBanner: {
    width: '100%',
    height: 180,
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  typeBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  typeBadgeText: {
    color: '#3b82f6',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  joinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  joinedBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  workshopTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
    lineHeight: 26,
  },
  wsInfoGrid: {
    gap: 10,
    marginBottom: 20,
  },
  wsInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wsInfoText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  capacityContainer: {
    marginBottom: 20,
  },
  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  capacityLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  capacityValue: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '700',
  },
  capacityBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 3,
  },
  capacityBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  registerBtn: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  registerBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registeredBtn: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  registeredBtnText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#475569',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 24,
  },
  ticketContainer: {
    alignItems: 'center',
  },
  closeModal: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  ticket: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
  },
  ticketHeader: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  ticketHeaderTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  ticketBody: {
    padding: 24,
  },
  ticketLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#3b82f6',
    letterSpacing: 2,
    marginBottom: 8,
  },
  ticketTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 24,
  },
  ticketInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  ticketSubLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 4,
  },
  ticketValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
  },
  qrPlaceholder: {
    height: 160,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  qrText: {
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  refId: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 8,
  },
  perforatedLine: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 16,
  },
  ticketFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerNote: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  doneBtn: {
    marginTop: 32,
    backgroundColor: '#fff',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
  },
  doneBtnText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '900',
  },
});
