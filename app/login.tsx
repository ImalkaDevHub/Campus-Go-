import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Dimensions, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Modal, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff, GraduationCap, ChevronRight } from 'lucide-react-native';
import { router, Link } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { ENDPOINTS, API_BASE_URL } from '@/constants/config';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Helper for Web compatibility
const saveToken = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

export default function LoginScreen() {
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'Please contact university administration at admin@csbm.lk to reset your student portal password.',
      [{ text: 'OK' }]
    );
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { 
          email: email.trim().toLowerCase(), 
          password: password.trim() 
        },
        { 
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const { token, user } = response.data;
      await saveToken('userToken', token);
      await saveToken('userData', JSON.stringify(user));

      const staffRoles = ['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'];

      if (staffRoles.includes(user.role)) {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/student/dashboard');
      }

    } catch (err: any) {
      console.log('DEBUG:', err.code, err.message);
      let msg = 'An unexpected error occurred';
      if (err.code === 'ERR_NETWORK') {
        msg = `Cannot connect to server at ${API_BASE_URL}. Make sure you are on the same WiFi network.`;
      }
      else if (err.response?.status === 401 || err.code === 'ERR_BAD_REQUEST' && err.response?.status === 401) {
        msg = 'Invalid email or password. Please check your credentials.';
      }
      else if (err.response?.status === 404) {
        msg = 'Account not found. Please register first.';
      }
      
      setError(msg);
      const serverDetails = err.response?.data?.details || err.response?.data?.error || '';
      Alert.alert('Login Failed', `${msg}${serverDetails ? '\n\nServer Details: ' + serverDetails : ''}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    if (provider === 'Google') {
      try {
        setLoading(true);
        // This is a placeholder for the real Google Auth Session flow
        // In a real app, you'd use expo-auth-session/providers/google
        
        console.log('[AUTH] Initiating Google Sign-In...');
        
        // Mocking a successful Google response for demonstration
        // Replace this with actual Google Auth result handling
        const mockGoogleUser = {
          email: 'student.google@gmail.com',
          name: 'Google Student',
          photoURL: 'https://lh3.googleusercontent.com/a/ACg8ocL...',
          uid: 'google_uid_12345'
        };

        const response = await axios.post(`${API_BASE_URL}/auth/google`, mockGoogleUser);
        
        const { token, user } = response.data;
        await saveToken('userToken', token);
        await saveToken('userData', JSON.stringify(user));

        router.replace('/student/dashboard');
        
      } catch (err: any) {
        console.error('Google Login Error:', err);
        Alert.alert('Google Login Failed', 'Could not authenticate with Google.');
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert(`${provider} Login`, `${provider} Sign In coming soon!`);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          
          {/* HEADER SECTION (Reduced height) */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <GraduationCap size={32} color="#fff" strokeWidth={2.5} />
            </View>
            <Text style={styles.appName}>CampusGo</Text>
            <Text style={styles.portalSub}>CSBM University Portal</Text>
          </View>

          {/* LOGIN FORM CARD */}
          <View style={styles.formCard}>
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.signSub}>Sign in to continue</Text>

            {/* Role Segmented Toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[styles.toggleTab, role === 'student' && styles.activeTab]} 
                onPress={() => setRole('student')}
              >
                <Text style={[styles.toggleText, role === 'student' && styles.activeTabText]}>Student</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleTab, role === 'admin' && styles.activeTab]} 
                onPress={() => setRole('admin')}
              >
                <Text style={[styles.toggleText, role === 'admin' && styles.activeTabText]}>Staff / Admin</Text>
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <Mail size={16} color="#475569" />
                <TextInput 
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#64748b"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <Lock size={16} color="#475569" />
                <TextInput 
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#64748b"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} color="#64748b" /> : <Eye size={16} color="#64748b" />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPass} onPress={handleForgotPassword}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginBtnWrapper} onPress={handleLogin} disabled={loading}>
              <LinearGradient
                colors={['#4F46E5', '#06B6D4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginBtn}
              >
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Text style={styles.loginBtnText}>
                      Login as {role === 'admin' ? 'Staff' : 'Student'}
                    </Text>
                    <ChevronRight size={18} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* OR Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('Google')}>
                <Text style={[styles.socialIcon, { color: '#EA4335' }]}>G</Text>
                <Text style={styles.socialBtnText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('Facebook')}>
                <Text style={[styles.socialIcon, { color: '#1877F2' }]}>F</Text>
                <Text style={styles.socialBtnText}>Facebook</Text>
              </TouchableOpacity>
            </View>
            
            <Link href="/register" asChild>
              <TouchableOpacity style={styles.loginLink}>
                <Text style={styles.loginLinkText}>
                  Don't have an account? <Text style={{ color: '#4F46E5' }}>Register</Text>
                </Text>
              </TouchableOpacity>
            </Link>
            
            <View style={{ height: 20 }} />
          </View>
        </KeyboardAvoidingView>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    height: SCREEN_HEIGHT * 0.28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.3)',
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  portalSub: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 2,
  },
  formCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 28,
    paddingTop: 30,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  signSub: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 5,
    marginBottom: 20,
  },
  toggleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#4F46E5',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  activeTabText: {
    color: '#fff',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    paddingHorizontal: 10,
  },
  forgotPass: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: '#4F46E5',
    fontWeight: '700',
    fontSize: 13,
  },
  loginBtnWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  loginBtn: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 10,
  },
  socialIcon: {
    fontSize: 18,
    fontWeight: '900',
  },
  socialBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    gap: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '700',
  },
  resetBtn: {
    flex: 2,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    color: '#fff',
    fontSize: 15,
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
  },
});
