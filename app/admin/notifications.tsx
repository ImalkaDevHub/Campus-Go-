import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Mail, Send, Layout, 
  Clock, Users, ChevronRight, 
  Edit3, CheckCircle, Bell 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/config';

const TEMPLATES = [
  { id: 'app_received', name: 'Application Received', lastUsed: '2 hours ago', icon: Layout },
  { id: 'app_approved', name: 'Application Approved', lastUsed: '1 day ago', icon: CheckCircle },
  { id: 'app_rejected', name: 'Application Rejected', lastUsed: '3 days ago', icon: CheckCircle },
  { id: 'doc_required', name: 'Document Required', lastUsed: '5 hours ago', icon: Bell },
  { id: 'workshop_reg', name: 'Workshop Confirmed', lastUsed: '1 week ago', icon: Layout },
];

export default function CommunicationCenter() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('All Students');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await axios.get(`${API_BASE_URL}/notifications/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleBulkSend = async () => {
    if (!selectedTemplate) {
      Alert.alert('Selection Required', 'Please select a template to send.');
      return;
    }

    Alert.alert(
      'Confirm Bulk Send',
      `Are you sure you want to send this email to ${selectedGroup}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Now', onPress: async () => {
          try {
            setLoading(true);
            const token = await SecureStore.getItemAsync('userToken');
            await axios.post(`${API_BASE_URL}/notifications/send`, {
              group: selectedGroup,
              templateId: selectedTemplate
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            Alert.alert('Success', 'Emails queued for delivery.');
          } catch (error) {
            Alert.alert('Error', 'Failed to send emails.');
          } finally {
            setLoading(false);
          }
        }}
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Communication Center', headerTintColor: '#fff', headerStyle: { backgroundColor: '#0f172a' } }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        
        {/* Bulk Send Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bulk Email Broadcast</Text>
          <View style={styles.broadcastCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Recipient Group</Text>
              <View style={styles.groupRow}>
                {['All Students', 'Pending', 'Approved'].map(g => (
                  <TouchableOpacity 
                    key={g} 
                    style={[styles.groupBtn, selectedGroup === g && styles.activeGroup]}
                    onPress={() => setSelectedGroup(g)}
                  >
                    <Text style={[styles.groupText, selectedGroup === g && styles.activeGroupText]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Choose Template</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateScroll}>
                {TEMPLATES.map(t => (
                  <TouchableOpacity 
                    key={t.id} 
                    style={[styles.templateChip, selectedTemplate === t.id && styles.activeTemplate]}
                    onPress={() => setSelectedTemplate(t.id)}
                  >
                    <Text style={[styles.templateText, selectedTemplate === t.id && styles.activeTemplateText]}>{t.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity 
              style={styles.sendBtn}
              onPress={handleBulkSend}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Send size={18} color="#fff" />
                  <Text style={styles.sendBtnText}>Dispatch Bulk Broadcast</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Templates Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manage Templates</Text>
          {TEMPLATES.map(t => (
            <TouchableOpacity key={t.id} style={styles.templateItem}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
                <t.icon size={20} color="#4F46E5" />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.tName}>{t.name}</Text>
                <Text style={styles.tMeta}>Last used: {t.lastUsed}</Text>
              </View>
              <Edit3 size={18} color="#64748b" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Activity Log */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity Log</Text>
          <View style={styles.logCard}>
            <View style={styles.logRow}>
              <View style={styles.logDot} />
              <View style={styles.logContent}>
                <Text style={styles.logTitle}>Bulk Blast: Approved Students</Text>
                <Text style={styles.logMeta}>Sent to 142 recipients • Today, 10:24 AM</Text>
              </View>
              <CheckCircle size={16} color="#10b981" />
            </View>
            <View style={[styles.logRow, { borderBottomWidth: 0 }]}>
              <View style={styles.logDot} />
              <View style={styles.logContent}>
                <Text style={styles.logTitle}>Individual: Missing NIC Alert</Text>
                <Text style={styles.logMeta}>Sent to amalke@gmail.com • Yesterday</Text>
              </View>
              <CheckCircle size={16} color="#10b981" />
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  broadcastCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 12,
  },
  groupRow: {
    flexDirection: 'row',
    gap: 8,
  },
  groupBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeGroup: {
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  groupText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
  },
  activeGroupText: {
    color: '#fff',
  },
  templateScroll: {
    flexDirection: 'row',
  },
  templateChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginRight: 10,
  },
  activeTemplate: {
    backgroundColor: '#4F46E5',
  },
  templateText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700',
  },
  activeTemplateText: {
    color: '#fff',
  },
  sendBtn: {
    height: 52,
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  tMeta: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  logCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  logDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4F46E5',
    marginRight: 16,
  },
  logContent: {
    flex: 1,
  },
  logTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  logMeta: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  }
});
