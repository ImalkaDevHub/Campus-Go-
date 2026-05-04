import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  ScrollView, Alert, Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  MapPin, Phone, Mail, Globe, Send, Facebook, 
  Linkedin, Instagram, Home, BookOpen, LayoutDashboard 
} from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleDashboard = async () => {
    try {
      let token = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('userToken');
      } else {
        token = await SecureStore.getItemAsync('userToken');
      }

      if (token) {
        const userDataStr = Platform.OS === 'web' ? localStorage.getItem('userData') : await SecureStore.getItemAsync('userData');
        const user = userDataStr ? JSON.parse(userDataStr) : null;
        if (user && ['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'].includes(user.role)) {
          router.push('/admin/dashboard');
        } else {
          router.push('/student/dashboard');
        }
      } else {
        // Already on contact page, do nothing
      }
    } catch (e) {
      // Ignore
    }
  };

  const handleSend = () => {
    if (!form.name || !form.email || !form.message) {
      Alert.alert('Error', 'Please fill out all required fields.');
      return;
    }
    Alert.alert('Success', 'Message sent successfully!');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <LinearGradient colors={['rgba(79, 70, 229, 0.2)', 'transparent']} style={styles.headerGradient}>
          <Text style={styles.headerTitle}>Get In Touch</Text>
          <Text style={styles.headerSub}>We'd love to hear from you. Reach out to us for any inquiries.</Text>
        </LinearGradient>

        <View style={styles.contentPadding}>
          {/* Contact Info Cards */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <View style={styles.iconBox}><MapPin size={20} color="#4F46E5" /></View>
              <Text style={styles.infoTitle}>Address</Text>
              <Text style={styles.infoText}>CSBM University, Colombo 07, Sri Lanka</Text>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.iconBox}><Phone size={20} color="#10b981" /></View>
              <Text style={styles.infoTitle}>Phone</Text>
              <Text style={styles.infoText}>+94 11 234 5678</Text>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.iconBox}><Mail size={20} color="#f59e0b" /></View>
              <Text style={styles.infoTitle}>Email</Text>
              <Text style={styles.infoText}>info@csbm.lk</Text>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.iconBox}><Globe size={20} color="#06B6D4" /></View>
              <Text style={styles.infoTitle}>Website</Text>
              <Text style={styles.infoText}>www.csbm.lk</Text>
            </View>
          </View>

          {/* Contact Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Send a Message</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="John Doe" 
                placeholderTextColor="#64748b"
                value={form.name}
                onChangeText={(val) => setForm({...form, name: val})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="john@example.com" 
                placeholderTextColor="#64748b"
                keyboardType="email-address"
                value={form.email}
                onChangeText={(val) => setForm({...form, email: val})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Subject</Text>
              <TextInput 
                style={styles.input} 
                placeholder="How can we help?" 
                placeholderTextColor="#64748b"
                value={form.subject}
                onChangeText={(val) => setForm({...form, subject: val})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Message *</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                placeholder="Write your message here..." 
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={form.message}
                onChangeText={(val) => setForm({...form, message: val})}
              />
            </View>

            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <LinearGradient colors={['#4F46E5', '#06B6D4']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.sendBtnGradient}>
                <Text style={styles.sendBtnText}>Send Message</Text>
                <Send size={16} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Map Placeholder */}
          <View style={styles.mapCard}>
            <View style={styles.mapIconBox}>
              <MapPin size={32} color="#94a3b8" />
            </View>
            <Text style={styles.mapTitle}>CSBM University Campus</Text>
            <Text style={styles.mapSub}>View on Google Maps</Text>
          </View>

          {/* Social Media Row */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn}>
              <Facebook size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Linkedin size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Instagram size={24} color="#fff" />
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      {/* Custom Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/')}>
          <Home size={24} color="#64748b" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/student/programs')}>
          <BookOpen size={24} color="#64748b" />
          <Text style={styles.tabText}>Programs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={handleDashboard}>
          <LayoutDashboard size={24} color="#4F46E5" />
          <Text style={[styles.tabText, { color: '#4F46E5' }]}>Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scrollContent: { paddingBottom: 120 },
  headerGradient: { paddingTop: 80, paddingBottom: 40, paddingHorizontal: 24, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 32, fontWeight: '900', marginBottom: 12, textAlign: 'center' },
  headerSub: { color: '#94a3b8', fontSize: 16, textAlign: 'center', lineHeight: 24, maxWidth: '80%' },
  contentPadding: { paddingHorizontal: 20, marginTop: -20 },
  
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 30 },
  infoCard: { width: '47%', backgroundColor: '#1e293b', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'flex-start' },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  infoTitle: { color: '#94a3b8', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  infoText: { color: '#fff', fontSize: 14, fontWeight: '600', lineHeight: 20 },

  formCard: { backgroundColor: '#1e293b', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 30 },
  formTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { color: '#cbd5e1', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: 'rgba(15, 23, 42, 0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 16, height: 50, color: '#fff', fontSize: 15 },
  textArea: { height: 120, paddingTop: 16 },
  sendBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 10 },
  sendBtnGradient: { flexDirection: 'row', height: 56, alignItems: 'center', justifyContent: 'center', gap: 10 },
  sendBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  mapCard: { backgroundColor: 'rgba(255,255,255,0.02)', height: 180, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  mapIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  mapTitle: { color: '#e2e8f0', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  mapSub: { color: '#4F46E5', fontSize: 14, fontWeight: '600' },

  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 20 },
  socialBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },

  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: 'rgba(15,23,42,0.95)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingBottom: Platform.OS === 'ios' ? 30 : 20, paddingTop: 15 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  tabText: { fontSize: 11, fontWeight: '700', color: '#64748b' }
});
