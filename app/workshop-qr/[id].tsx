import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Share, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  QrCode as QrIcon, Download, 
  Share2, X, Info, 
  MapPin, Calendar, User 
} from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/config';

export default function WorkshopQRScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistration();
  }, [id]);

  const fetchRegistration = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await axios.get(`${API_BASE_URL}/workshop-registrations/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const reg = response.data.find((r: any) => (r._id === id || r.id === id));
      setRegistration(reg);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `My Registration for ${registration.workshop.title}. Ref: ${registration.referenceId}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator color="#4F46E5" />
      </View>
    );
  }

  const workshop = registration?.workshop || {};

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Digital Entry Ticket</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.qrCard}>
          <View style={styles.workshopInfo}>
            <Text style={styles.workshopTitle}>{workshop.title}</Text>
            <View style={styles.infoRow}>
              <Calendar size={14} color="#64748b" />
              <Text style={styles.infoText}>{new Date(workshop.date).toLocaleDateString()}</Text>
            </View>
          </View>

          <View style={styles.qrWrapper}>
            <QRCode
              value={registration?.referenceId || 'REF-INVALID'}
              size={200}
              backgroundColor="#fff"
              color="#0f172a"
              quietZone={10}
            />
          </View>

          <View style={styles.ticketFooter}>
            <Text style={styles.refLabel}>REFERENCE ID</Text>
            <Text style={styles.refValue}>{registration?.referenceId?.toUpperCase()}</Text>
          </View>

          <View style={styles.dashLine} />
          
          <View style={styles.studentInfo}>
            <View style={styles.studentRow}>
              <User size={14} color="#64748b" />
              <Text style={styles.studentLabel}>STUDENT</Text>
            </View>
            <Text style={styles.studentName}>John Doe</Text>
          </View>
        </View>

        <View style={styles.instructionCard}>
          <Info size={18} color="#06B6D4" />
          <Text style={styles.instructionText}>
            Present this QR code at the registration desk for instant check-in.
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <Download size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Save to Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.shareBtn]} onPress={handleShare}>
            <Share2 size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginRight: 44,
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  content: {
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  qrCard: {
    backgroundColor: '#fff',
    borderRadius: 32,
    width: '100%',
    padding: 24,
    alignItems: 'center',
  },
  workshopInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  workshopTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    marginBottom: 32,
  },
  ticketFooter: {
    alignItems: 'center',
    marginBottom: 24,
  },
  refLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '800',
    letterSpacing: 1,
  },
  refValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 4,
  },
  dashLine: {
    width: '100%',
    height: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  studentInfo: {
    width: '100%',
    paddingHorizontal: 10,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  studentLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '800',
    letterSpacing: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    padding: 16,
    borderRadius: 20,
    marginTop: 32,
    width: '100%',
  },
  instructionText: {
    flex: 1,
    color: '#06B6D4',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  shareBtn: {
    backgroundColor: '#4F46E5',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
