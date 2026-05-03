import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  UserPlus, Mail, Phone, 
  CreditCard, BookOpen, DollarSign, 
  Save, Printer, X 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, ENDPOINTS } from '@/constants/config';

const PAYMENT_METHODS = ['Cash', 'Card', 'Bank Transfer', 'Online'];

export default function ManualRegistration() {
  const insets = useSafeAreaInsets();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    nic: '',
    dateOfBirth: '',
    courseId: '',
    intake: '',
    paymentMethod: 'Cash',
    amountPaid: '',
    receiptNumber: '',
    notes: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(ENDPOINTS.COURSES);
      setCourses(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRegister = async () => {
    if (!formData.fullName || !formData.email || !formData.courseId || !formData.amountPaid) {
      Alert.alert('Required Fields', 'Please fill in student name, email, course, and payment amount.');
      return;
    }

    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('userToken');
      await axios.post(`${API_BASE_URL}/applications/manual`, {
        ...formData,
        status: 'APPROVED',
        source: 'walk-in'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Success', 'Walk-in student registered successfully!', [
        { text: 'Print Receipt', onPress: () => console.log('Printing...') },
        { text: 'Done', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save manual registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Manual Enrollment', headerTintColor: '#fff', headerStyle: { backgroundColor: '#0f172a' } }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Student Personal Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color="#64748b" />
              <TextInput 
                style={styles.input}
                placeholder="e.g. John Silva"
                placeholderTextColor="#475569"
                value={formData.fullName}
                onChangeText={v => setFormData({...formData, fullName: v})}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>NIC Number</Text>
              <TextInput 
                style={styles.inputSimple}
                placeholder="123456789V"
                placeholderTextColor="#475569"
                value={formData.nic}
                onChangeText={v => setFormData({...formData, nic: v})}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput 
                style={styles.inputSimple}
                placeholder="john@example.com"
                placeholderTextColor="#475569"
                value={formData.email}
                onChangeText={v => setFormData({...formData, email: v})}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Selection</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Course</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.courseScroll}>
              {courses.map((c: any) => (
                <TouchableOpacity 
                  key={c._id || c.id}
                  style={[styles.courseTab, formData.courseId === (c._id || c.id) && styles.activeTab]}
                  onPress={() => setFormData({...formData, courseId: (c._id || c.id)})}
                >
                  <Text style={[styles.tabText, formData.courseId === (c._id || c.id) && styles.activeTabText]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Intake Batch</Text>
            <TextInput 
              style={styles.inputSimple}
              placeholder="e.g. June 2024"
              placeholderTextColor="#475569"
              value={formData.intake}
              onChangeText={v => setFormData({...formData, intake: v})}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Payment Method</Text>
            <View style={styles.methodRow}>
              {PAYMENT_METHODS.map(m => (
                <TouchableOpacity 
                  key={m} 
                  style={[styles.methodBtn, formData.paymentMethod === m && styles.activeMethod]}
                  onPress={() => setFormData({...formData, paymentMethod: m})}
                >
                  <Text style={[styles.methodText, formData.paymentMethod === m && styles.activeMethodText]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Amount Paid (LKR)</Text>
              <TextInput 
                style={styles.inputSimple}
                placeholder="50,000"
                placeholderTextColor="#475569"
                keyboardType="numeric"
                value={formData.amountPaid}
                onChangeText={v => setFormData({...formData, amountPaid: v})}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>Receipt Number</Text>
              <TextInput 
                style={styles.inputSimple}
                placeholder="RE-10023"
                placeholderTextColor="#475569"
                value={formData.receiptNumber}
                onChangeText={v => setFormData({...formData, receiptNumber: v})}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.submitBtn}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Save size={20} color="#fff" />
              <Text style={styles.submitBtnText}>Complete Manual Registration</Text>
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
  section: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
  courseScroll: {
    flexDirection: 'row',
  },
  courseTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginRight: 10,
  },
  activeTab: {
    backgroundColor: '#4F46E5',
  },
  tabText: {
    color: '#64748b',
    fontWeight: '700',
    fontSize: 13,
  },
  activeTabText: {
    color: '#fff',
  },
  methodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  methodBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  activeMethod: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  methodText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  activeMethodText: {
    color: '#10b981',
  },
  submitBtn: {
    height: 60,
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
