import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Phone, Lock, ChevronRight, Calendar, CreditCard, CheckCircle } from 'lucide-react-native';
import { router, Link } from 'expo-router';
import axios from 'axios';
import { API_BASE_URL } from '@/constants/config';

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    nic: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: ''
  });
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleRegister = async () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      Alert.alert('Error', 'You must agree to the Terms & Conditions');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/auth/register`, {
        ...formData,
        role: 'STUDENT'
      });
      
      Alert.alert('Success', 'Account created successfully! Please sign in.', [
        { text: 'Login Now', onPress: () => router.replace('/login') }
      ]);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!formData.password) return 0;
    if (formData.password.length < 6) return 1;
    if (formData.password.length < 10) return 2;
    return 3;
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Join CampusGo</Text>
            <Text style={styles.subtitle}>Create your student account to start your university journey.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <User size={18} color="#4F46E5" />
                <TextInput 
                  style={styles.input}
                  placeholder="e.g. John Doe"
                  placeholderTextColor="#475569"
                  value={formData.fullName}
                  onChangeText={(val) => setFormData({...formData, fullName: val})}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Mail size={18} color="#4F46E5" />
                <TextInput 
                  style={styles.input}
                  placeholder="john@example.com"
                  placeholderTextColor="#475569"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={formData.email}
                  onChangeText={(val) => setFormData({...formData, email: val})}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputWrapper}>
                  <Phone size={18} color="#4F46E5" />
                  <TextInput 
                    style={styles.input}
                    placeholder="07x xxxxxxx"
                    placeholderTextColor="#475569"
                    keyboardType="phone-pad"
                    value={formData.mobileNumber}
                    onChangeText={(val) => setFormData({...formData, mobileNumber: val})}
                  />
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>NIC Number</Text>
                <View style={styles.inputWrapper}>
                  <CreditCard size={18} color="#4F46E5" />
                  <TextInput 
                    style={styles.input}
                    placeholder="123456789V"
                    placeholderTextColor="#475569"
                    value={formData.nic}
                    onChangeText={(val) => setFormData({...formData, nic: val})}
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.label}>Birth Date</Text>
                <View style={styles.inputWrapper}>
                  <Calendar size={18} color="#4F46E5" />
                  <TextInput 
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#475569"
                    value={formData.dateOfBirth}
                    onChangeText={(val) => setFormData({...formData, dateOfBirth: val})}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color="#4F46E5" />
                <TextInput 
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#475569"
                  secureTextEntry
                  value={formData.password}
                  onChangeText={(val) => setFormData({...formData, password: val})}
                />
              </View>
              {/* Strength Indicator */}
              <View style={styles.strengthBar}>
                <View style={[styles.strengthSegment, getPasswordStrength() >= 1 && { backgroundColor: '#ef4444' }]} />
                <View style={[styles.strengthSegment, getPasswordStrength() >= 2 && { backgroundColor: '#f59e0b' }]} />
                <View style={[styles.strengthSegment, getPasswordStrength() >= 3 && { backgroundColor: '#10b981' }]} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color="#4F46E5" />
                <TextInput 
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#475569"
                  secureTextEntry
                  value={formData.confirmPassword}
                  onChangeText={(val) => setFormData({...formData, confirmPassword: val})}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.termsRow}
              onPress={() => setAgreeTerms(!agreeTerms)}
            >
              <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
                {agreeTerms && <CheckCircle size={14} color="#fff" />}
              </View>
              <Text style={styles.termsText}>I agree to the University Terms & Conditions and Privacy Policy.</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.registerBtn} 
              onPress={handleRegister}
              disabled={loading}
            >
              <LinearGradient colors={['#4F46E5', '#06B6D4']} style={styles.btnGradient}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.btnText}>Create Account</Text>
                    <ChevronRight size={18} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Link href="/login" asChild>
              <TouchableOpacity style={styles.loginLink}>
                <Text style={styles.loginLinkText}>
                  Already have an account? <Text style={{ color: '#4F46E5' }}>Login</Text>
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
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
    lineHeight: 24,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    marginLeft: 12,
  },
  row: {
    flexDirection: 'row',
  },
  strengthBar: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(79, 70, 229, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  termsText: {
    flex: 1,
    color: '#64748b',
    fontSize: 13,
    lineHeight: 18,
  },
  registerBtn: {
    height: 60,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  btnGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  btnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loginLinkText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  }
});
