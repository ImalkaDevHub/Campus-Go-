import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Share, Platform } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Calendar, Clock, MapPin, 
  Users, User, ChevronLeft, 
  Share2, CheckCircle, Info, 
  ArrowRight, QrCode 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/config';

// Helper for Web compatibility
const getToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('userToken');
  }
  return await SecureStore.getItemAsync('userToken');
};

export default function WorkshopDetails() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [workshop, setWorkshop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [regDetails, setRegDetails] = useState<any>(null);

  useEffect(() => {
    fetchDetails();
    checkRegistration();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/workshops/${id}`);
      setWorkshop(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load workshop details');
    } finally {
      setLoading(false);
    }
  };

  const checkRegistration = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const response = await axios.get(`${API_BASE_URL}/workshops/my-registrations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data?.data || response.data?.registrations || (Array.isArray(response.data) ? response.data : []);
      const reg = data.find((r: any) => (r.workshopId === id || r.workshop?._id === id || r.workshop === id));
      if (reg) {
        setIsRegistered(true);
        setRegDetails(reg);
      }
    } catch (error) {
      console.error('Reg check failed:', error);
    }
  };

  const handleRegister = async () => {
    try {
      setRegistering(true);
      const token = await getToken();
      if (!token) {
        Alert.alert('Login Required', 'Please login to register for workshops.', [
          { text: 'Login', onPress: () => router.push('/login') }
        ]);
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/workshops/register`, {
        workshopId: id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setIsRegistered(true);
      setRegDetails(response.data?.registration || response.data);
      Alert.alert('Success!', 'You have successfully registered for this workshop.');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setRegistering(false);
    }
  };

  const handleShare = async () => {
    if (!workshop) return;
    try {
      await Share.share({
        message: `Check out this workshop: ${workshop.title} at CampusGo!`,
        url: 'https://campusgo.edu/workshops/' + id
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

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Banner Section */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: workshop.bannerImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87' }} style={styles.banner} />
          <TouchableOpacity style={[styles.backBtn, { top: insets.top + 10 }]} onPress={() => router.back()}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.shareBtn, { top: insets.top + 10 }]} onPress={handleShare}>
            <Share2 size={20} color="#fff" />
          </TouchableOpacity>
          <LinearGradient colors={['transparent', 'rgba(15, 23, 42, 0.9)']} style={styles.bannerOverlay} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{workshop.title}</Text>
          
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
                <Calendar size={18} color="#4F46E5" />
              </View>
              <View>
                <Text style={styles.metaLabel}>Date</Text>
                <Text style={styles.metaVal}>{new Date(workshop.date).toLocaleDateString()}</Text>
              </View>
            </View>
            <View style={styles.metaItem}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(6, 182, 212, 0.1)' }]}>
                <Clock size={18} color="#06B6D4" />
              </View>
              <View>
                <Text style={styles.metaLabel}>Time</Text>
                <Text style={styles.metaVal}>{workshop.startTime} - {workshop.endTime}</Text>
              </View>
            </View>
          </View>

          <View style={styles.metaItemFull}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <MapPin size={18} color="#10b981" />
            </View>
            <View>
              <Text style={styles.metaLabel}>Venue / Location</Text>
              <Text style={styles.metaVal}>{workshop.location}</Text>
            </View>
          </View>

          {/* Speaker Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Keynote Speaker</Text>
            <View style={styles.speakerCard}>
              <View style={styles.speakerHeader}>
                <Image source={{ uri: workshop.speakerPhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e' }} style={styles.speakerImg} />
                <View>
                  <Text style={styles.speakerName}>{workshop.speakerName}</Text>
                  <Text style={styles.speakerTitle}>Industry Expert</Text>
                </View>
              </View>
              <Text style={styles.speakerBio}>{workshop.speakerBio}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Workshop</Text>
            <Text style={styles.description}>{workshop.description}</Text>
          </View>

          {/* Agenda */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Agenda / Schedule</Text>
            {(workshop.agenda || []).map((item: any, index: number) => (
              <View key={index} style={styles.agendaRow}>
                <View style={styles.agendaDot} />
                <View style={styles.agendaLine} />
                <View style={styles.agendaContent}>
                  <Text style={styles.agendaTime}>{item.time || '09:00 AM'}</Text>
                  <Text style={styles.agendaTitle}>{item.title || 'Session Introduction'}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* QR Code Section - Only if registered */}
          {isRegistered && (
            <View style={[styles.section, styles.qrSection]}>
              <Text style={styles.sectionTitle}>Registration QR Code</Text>
              <View style={styles.qrCard}>
                <QRCode
                  value={regDetails?.referenceId || id}
                  size={160}
                  backgroundColor="transparent"
                  color="#fff"
                />
                <Text style={styles.qrRef}>REF: {regDetails?.referenceId?.toUpperCase() || 'REG-10023'}</Text>
                <Text style={styles.qrHint}>Present this at the venue for check-in</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer / Floating Button */}
      {!isRegistered && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.footerPrice}>
            <Text style={styles.priceLabel}>Registration Fee</Text>
            <Text style={styles.priceValue}>{workshop.price === 0 ? 'FREE' : `LKR ${workshop.price}`}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.mainBtn, workshop.totalSeats <= workshop.registeredCount && styles.disabledBtn]}
            onPress={handleRegister}
            disabled={registering || workshop.totalSeats <= workshop.registeredCount}
          >
            {registering ? <ActivityIndicator color="#fff" /> : (
              <>
                <Text style={styles.mainBtnText}>
                  {workshop.totalSeats <= workshop.registeredCount ? 'FULLY BOOKED' : 'Register Now'}
                </Text>
                {workshop.totalSeats > workshop.registeredCount && <ArrowRight size={18} color="#fff" />}
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
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
  bannerContainer: {
    height: 300,
    width: '100%',
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtn: {
    position: 'absolute',
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    marginTop: -20,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 24,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  metaItemFull: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 32,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metaVal: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
  },
  speakerCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  speakerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  speakerImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4F46E5',
  },
  speakerName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  speakerTitle: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '700',
  },
  speakerBio: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 22,
  },
  description: {
    fontSize: 15,
    color: '#94a3b8',
    lineHeight: 24,
  },
  agendaRow: {
    flexDirection: 'row',
    gap: 20,
    paddingBottom: 24,
  },
  agendaDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4F46E5',
    marginTop: 4,
    zIndex: 2,
  },
  agendaLine: {
    position: 'absolute',
    left: 5,
    top: 10,
    bottom: 0,
    width: 2,
    backgroundColor: '#1e293b',
    zIndex: 1,
  },
  agendaContent: {
    flex: 1,
  },
  agendaTime: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '800',
    marginBottom: 4,
  },
  agendaTitle: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '700',
  },
  qrSection: {
    alignItems: 'center',
  },
  qrCard: {
    backgroundColor: '#1e293b',
    borderRadius: 28,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  qrRef: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 20,
    letterSpacing: 2,
  },
  qrHint: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0f172a',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  footerPrice: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
  },
  mainBtn: {
    flex: 2,
    height: 60,
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  disabledBtn: {
    backgroundColor: '#1e293b',
    opacity: 0.8,
  },
  mainBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
