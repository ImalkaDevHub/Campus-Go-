import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, useWindowDimensions, Dimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window'); // Fallback for styles outside component
import { 
  FileDown, Share2, Calendar, 
  Filter, Check, Clock, 
  ChevronRight, Database 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/config';

const EXPORT_TYPES = [
  { id: 'all', name: 'All Applications', icon: Database },
  { id: 'by_course', name: 'Apps by Course', icon: Filter },
  { id: 'by_intake', name: 'Apps by Intake', icon: Calendar },
  { id: 'workshops', name: 'Workshop Registrations', icon: Clock },
  { id: 'directory', name: 'Student Directory', icon: Database },
];

export default function DataExportScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState('CSV');
  const [selectedType, setSelectedType] = useState('all');

  const handleExport = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('userToken');
      
      // Request report from API
      // Endpoint: /api/analytics/export/applications?type=all&format=csv
      const response = await axios.get(`${API_BASE_URL}/analytics/export/applications?format=${format.toLowerCase()}&type=${selectedType}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const csvData = response.data;
      const filename = `CampusGo_Report_${selectedType}_${new Date().getTime()}.${format.toLowerCase()}`;
      const fileUri = FileSystem.documentDirectory + filename;
      
      // Write the actual data from the backend
      await FileSystem.writeAsStringAsync(fileUri, csvData, { encoding: FileSystem.EncodingType.UTF8 });

      Alert.alert('Report Ready', `The ${selectedType} report has been generated successfully.`, [
        { text: 'Share / Save File', onPress: () => Sharing.shareAsync(fileUri) },
        { text: 'Done' }
      ]);
    } catch (error: any) {
      console.error('Export Error:', error.response?.data || error.message);
      Alert.alert('Export Error', 'Failed to generate real-time report. Ensure the server is reachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Data Export Center', headerTintColor: '#fff', headerStyle: { backgroundColor: '#0f172a' } }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Dataset</Text>
          <View style={styles.typeGrid}>
            {EXPORT_TYPES.map(type => (
              <TouchableOpacity 
                key={type.id} 
                style={[styles.typeCard, selectedType === type.id && styles.activeCard]}
                onPress={() => setSelectedType(type.id)}
              >
                <type.icon size={24} color={selectedType === type.id ? '#fff' : '#64748b'} />
                <Text style={[styles.typeText, selectedType === type.id && styles.activeTypeText]}>{type.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Configuration</Text>
          <View style={styles.configCard}>
            <View style={styles.configRow}>
              <Text style={styles.configLabel}>File Format</Text>
              <View style={styles.formatRow}>
                {['CSV', 'Excel'].map(f => (
                  <TouchableOpacity 
                    key={f} 
                    style={[styles.formatBtn, format === f && styles.activeFormat]}
                    onPress={() => setFormat(f)}
                  >
                    <Text style={[styles.formatText, format === f && styles.activeFormatText]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.configRow, { marginTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 20 }]}>
              <View>
                <Text style={styles.configLabel}>Date Range</Text>
                <Text style={styles.configVal}>All Time (Recommended)</Text>
              </View>
              <Calendar size={20} color="#64748b" />
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.generateBtn}
          onPress={handleExport}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <FileDown size={20} color="#fff" />
              <Text style={styles.generateBtnText}>Process & Download Report</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Exports History</Text>
          <View style={styles.historyList}>
            <View style={styles.historyItem}>
              <Database size={18} color="#4F46E5" />
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.hTitle}>Full_Student_Directory.csv</Text>
                <Text style={styles.hMeta}>Generated Today, 09:15 AM • 142 KB</Text>
              </View>
              <Share2 size={18} color="#64748b" />
            </View>
            <View style={[styles.historyItem, { borderBottomWidth: 0 }]}>
              <Database size={18} color="#10b981" />
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.hTitle}>BIT_Applications_June_Intake.xlsx</Text>
                <Text style={styles.hMeta}>Yesterday • 45 KB</Text>
              </View>
              <Share2 size={18} color="#64748b" />
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: (SCREEN_WIDTH - 60) / 2,
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  activeCard: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  typeText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700',
    textAlign: 'center',
  },
  activeTypeText: {
    color: '#fff',
  },
  configCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  configLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
  configVal: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  formatRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 4,
  },
  formatBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  activeFormat: {
    backgroundColor: '#4F46E5',
  },
  formatText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700',
  },
  activeFormatText: {
    color: '#fff',
  },
  generateBtn: {
    height: 60,
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 40,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  generateBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  historyList: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  hTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  hMeta: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
});
