import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  UserPlus, Search, User, 
  Mail, Phone, CreditCard, 
  CheckCircle, ArrowRight, Zap,
  BookOpen, Calendar, Users, Trophy
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

export default function OnSpotRegistration() {
  const insets = useSafeAreaInsets();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<any>(null);
  
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    globalRegs: 0,
    today: 0
  });

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    nic: ''
  });

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.get(`${API_BASE_URL}/workshops`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data;
      
      // Calculate stats
      const total = data.length;
      const upcoming = data.filter((w: any) => w.status === 'upcoming' || new Date(w.date) >= new Date()).length;
      const globalRegs = data.reduce((acc: number, w: any) => acc + (w.registeredCount || w.registrations?.length || 0), 0);
      const todayCount = data.filter((w: any) => new Date(w.date).toDateString() === new Date().toDateString()).length;
      
      setStats({
        total,
        upcoming,
        globalRegs,
        today: todayCount
      });
      
      // Only show upcoming/today workshops for registration
      const activeWorkshops = data.filter((w: any) => new Date(w.date) >= new Date() || new Date(w.date).toDateString() === new Date().toDateString());
      setWorkshops(activeWorkshops);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchStudent = async () => {
    if (searchQuery.length < 3) return;
    try {
      setSearching(true);
      const token = await getToken();
      
      const response = await axios.get(`${API_BASE_URL}/users/search?query=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.length > 0) {
        const s = response.data[0];
        setFormData({
          fullName: s.name || s.fullName || '',
          email: s.email || '',
          mobileNumber: s.mobile || s.mobileNumber || '',
          nic: s.nic || ''
        });
        Alert.alert('Student Found', `Details loaded for ${s.name || s.fullName}`);
      } else {
        Alert.alert('Not Found', 'No student found with these details. Please enter manually.');
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Not Found', 'Could not fetch student details.');
    } finally {
      setSearching(false);
    }
  };

  const handleRegister = async () => {
    if (!selectedWorkshop) {
      Alert.alert('Selection Required', 'Please select a workshop first.');
      return;
    }
    if (!formData.fullName || !formData.email) {
      Alert.alert('Required Fields', 'Please enter student name and email.');
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      
      await axios.post(`${API_BASE_URL}/workshopregistrations`, {
        workshopId: selectedWorkshop._id || selectedWorkshop.id,
        studentName: formData.fullName,
        email: formData.email,
        mobile: formData.mobileNumber,
        nic: formData.nic
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Registered Successfully!', `${formData.fullName} has been registered.`, [
        { text: 'Done', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Failed', error.response?.data?.message || 'Failed to complete registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'On-Spot Registration', headerTintColor: '#fff', headerStyle: { backgroundColor: '#0f172a' } }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        
        {/* STATS ROW */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { borderColor: 'rgba(124, 58, 237, 0.3)' }]}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(124, 58, 237, 0.15)' }]}>
              <BookOpen size={20} color="#7C3AED" />
            </View>
            <Text style={styles.statNum}>{stats.total}</Text>
            <Text style={styles.statLabel}>WORKSHOPS</Text>
          </View>
          <View style={[styles.statCard, { borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Calendar size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statNum}>{stats.upcoming}</Text>
            <Text style={styles.statLabel}>UPCOMING</Text>
          </View>
          <View style={[styles.statCard, { borderColor: 'rgba(59, 130, 246, 0.3)' }]}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Users size={20} color="#3B82F6" />
            </View>
            <Text style={styles.statNum}>{stats.globalRegs}</Text>
            <Text style={styles.statLabel}>GLOBAL REGS</Text>
          </View>
          <View style={[styles.statCard, { borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Trophy size={20} color="#10B981" />
            </View>
            <Text style={styles.statNum}>{stats.today}</Text>
            <Text style={styles.statLabel}>TODAY</Text>
          </View>
        </View>

        {/* Workshop Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Active Event</Text>
          {loading && workshops.length === 0 ? (
            <ActivityIndicator color="#06B6D4" />
          ) : workshops.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {workshops.map((w: any) => (
                <TouchableOpacity 
                  key={w._id || w.id} 
                  style={[styles.catChip, selectedWorkshop?._id === (w._id || w.id) && styles.activeChip]}
                  onPress={() => setSelectedWorkshop(w)}
                >
                  <Text style={[styles.catText, selectedWorkshop?._id === (w._id || w.id) && styles.activeCatText]}>
                    {w.title || w.workshopName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={{ color: '#64748b' }}>No active workshops found.</Text>
          )}
        </View>

        {/* Quick Search */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Existing Student Search</Text>
          <View style={styles.searchBar}>
            <Search size={20} color="#64748b" />
            <TextInput 
              style={styles.searchInput}
              placeholder="Email or NIC..."
              placeholderTextColor="#475569"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearchStudent} disabled={searching}>
              {searching ? <ActivityIndicator size="small" color="#fff" /> : <ArrowRight size={20} color="#fff" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Manual Data Entry */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Student Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <User size={18} color="#64748b" />
              <TextInput 
                style={styles.input}
                placeholder="Student Name"
                placeholderTextColor="#475569"
                value={formData.fullName}
                onChangeText={v => setFormData({...formData, fullName: v})}
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color="#64748b" />
              <TextInput 
                style={styles.input}
                placeholder="email@example.com"
                placeholderTextColor="#475569"
                value={formData.email}
                onChangeText={v => setFormData({...formData, email: v})}
                autoCapitalize="none"
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Mobile</Text>
              <TextInput 
                style={styles.inputSimple}
                placeholder="07xxxxxxxx"
                placeholderTextColor="#475569"
                value={formData.mobileNumber}
                onChangeText={v => setFormData({...formData, mobileNumber: v})}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>NIC</Text>
              <TextInput 
                style={styles.inputSimple}
                placeholder="NIC Number"
                placeholderTextColor="#475569"
                value={formData.nic}
                onChangeText={v => setFormData({...formData, nic: v})}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, !selectedWorkshop && styles.disabledBtn]}
          onPress={handleRegister}
          disabled={loading || !selectedWorkshop}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Zap size={20} color="#fff" />
              <Text style={styles.submitBtnText}>Register & Check-In</Text>
            </>
          )}
        </TouchableOpacity>

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
  statsContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12, 
    marginBottom: 20 
  },
  statCard: { 
    flex: 1, 
    minWidth: '45%', 
    backgroundColor: '#1e293b', 
    padding: 16, 
    borderRadius: 20, 
    borderWidth: 1, 
    alignItems: 'flex-start' 
  },
  iconBox: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 12 
  },
  statNum: { 
    color: '#fff', 
    fontSize: 24, 
    fontWeight: '900', 
    marginBottom: 4 
  },
  statLabel: { 
    color: '#94a3b8', 
    fontSize: 11, 
    fontWeight: '700',
    letterSpacing: 0.5
  },
  section: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  catScroll: {
    flexDirection: 'row',
  },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activeChip: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderColor: '#06B6D4',
  },
  catText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
  },
  activeCatText: {
    color: '#06B6D4',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 14,
    paddingLeft: 16,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    marginLeft: 12,
  },
  searchBtn: {
    width: 52,
    height: 52,
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    marginLeft: 12,
  },
  inputSimple: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  row: {
    flexDirection: 'row',
  },
  submitBtn: {
    height: 60,
    backgroundColor: '#06B6D4',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  disabledBtn: {
    backgroundColor: '#1e293b',
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
