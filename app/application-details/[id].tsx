import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Trash2, Calendar, Book, User, Info, CheckCircle, Clock, AlertTriangle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { ENDPOINTS } from '@/constants/config';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const InfoSection = ({ title, data }: { title: string, data: { label: string, value: string }[] }) => (
  <View style={styles.infoSection}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.infoCard}>
      {data.map((item, index) => (
        <View key={index} style={[styles.infoItem, index === data.length - 1 && { borderBottomWidth: 0 }]}>
          <Text style={styles.infoLabel}>{item.label}</Text>
          <Text style={styles.infoValue}>{item.value || 'N/A'}</Text>
        </View>
      ))}
    </View>
  </View>
);

export default function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const res = await axios.get(ENDPOINTS.APPLICATION_DETAIL(id as string), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplication(res.data);
    } catch (error) {
      console.error('Detail fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Application',
      'Are you sure you want to cancel this application? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: cancelApplication }
      ]
    );
  };

  const cancelApplication = async () => {
    try {
      setCancelling(true);
      const token = await SecureStore.getItemAsync('userToken');
      await axios.delete(ENDPOINTS.APPLICATION_DETAIL(id as string), {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Cancelled', 'Application has been successfully cancelled.');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to cancel application.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!application) return null;

  const status = application.status?.toLowerCase() || 'pending';
  const canCancel = status === 'pending';

  return (
    <ThemedView style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />
      
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Application Details</ThemedText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Hero Card */}
        <View style={styles.statusHero}>
          <View style={styles.statusIconCircle}>
            {status === 'approved' ? <CheckCircle size={32} color="#10b981" /> : 
             status === 'rejected' ? <AlertTriangle size={32} color="#ef4444" /> :
             <Clock size={32} color="#3b82f6" />}
          </View>
          <Text style={styles.statusMainText}>{application.status?.toUpperCase() || 'PENDING'}</Text>
          <Text style={styles.statusSubText}>Ref: APP-{application._id?.substring(0, 8).toUpperCase()}</Text>
        </View>

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          <Text style={styles.sectionTitle}>Processing Timeline</Text>
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, styles.activeDot]} />
              <View style={styles.timelineLine} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Application Received</Text>
                <Text style={styles.timelineDate}>{new Date(application.createdAt).toLocaleString()}</Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, (status === 'review' || status === 'approved') && styles.activeDot]} />
              <View style={styles.timelineLine} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Academic Review</Text>
                <Text style={styles.timelineDate}>{status === 'pending' ? 'Waiting for review' : 'Verified by Faculty'}</Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, status === 'approved' && styles.activeDot]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Final Decision</Text>
                <Text style={styles.timelineDate}>{status === 'approved' ? 'Enrollment Confirmed' : 'Pending decision'}</Text>
              </View>
            </View>
          </View>
        </View>

        <InfoSection 
          title="Program Information"
          data={[
            { label: 'Selected Program', value: application.programName || application.courseName },
            { label: 'Intake Period', value: 'Fall 2026' },
            { label: 'Campus', value: 'Main Campus, Colombo' }
          ]}
        />

        <InfoSection 
          title="Personal Details"
          data={[
            { label: 'Full Name', value: application.name },
            { label: 'Email', value: application.email },
            { label: 'Phone', value: application.phone },
            { label: 'NIC Number', value: application.nic }
          ]}
        />

        <InfoSection 
          title="Academic Background"
          data={[
            { label: 'School/College', value: application.school },
            { label: 'Overall GPA', value: application.gpa },
            { label: 'Qualifications', value: application.qualifications }
          ]}
        />

        {canCancel && (
          <TouchableOpacity 
            style={styles.cancelBtn} 
            onPress={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator color="#ef4444" />
            ) : (
              <>
                <Trash2 size={20} color="#ef4444" />
                <Text style={styles.cancelBtnText}>Cancel Application</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </ThemedView>
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
    backgroundColor: '#0f172a',
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  content: {
    paddingHorizontal: 24,
  },
  statusHero: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 32,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
    marginBottom: 32,
  },
  statusIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusMainText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  statusSubText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
    marginLeft: 4,
  },
  timelineContainer: {
    marginBottom: 32,
  },
  timeline: {
    paddingLeft: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 20,
    minHeight: 60,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#334155',
    marginTop: 4,
    zIndex: 1,
  },
  activeDot: {
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 16,
    bottom: 0,
    width: 2,
    backgroundColor: '#1e293b',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24,
  },
  timelineTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  timelineDate: {
    color: '#64748b',
    fontSize: 12,
  },
  infoSection: {
    marginBottom: 32,
  },
  infoCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  infoLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  infoValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
    marginLeft: 20,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    marginTop: 10,
  },
  cancelBtnText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '800',
  },
});
