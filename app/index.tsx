import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, 
  useWindowDimensions, ScrollView, Alert, Platform, ImageBackground 
} from 'react-native';
import { router, Stack, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Home, BookOpen, LayoutDashboard, Users, Trophy, 
  GraduationCap, Play, ArrowRight 
} from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';

export default function LandingPage() {
  const { width } = useWindowDimensions();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useFocusEffect(
    useCallback(() => {
      checkLoginStatus();
    }, [])
  );

  const checkLoginStatus = async () => {
    try {
      let token = Platform.OS === 'web' ? localStorage.getItem('userToken') : await SecureStore.getItemAsync('userToken');
      if (token) setIsLoggedIn(true);
    } catch(e) {}
  };

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
        router.push('/contact');
      }
    } catch (e) {
      router.push('/contact');
    }
  };

  const isWeb = Platform.OS === 'web';
  const contentWidth = isWeb && width > 800 ? 800 : '100%';

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop' }} 
        style={styles.backgroundImage}
      >
        <LinearGradient 
          colors={['rgba(15, 23, 42, 0.6)', 'rgba(15, 23, 42, 0.95)', '#0f172a']} 
          style={StyleSheet.absoluteFill} 
        />
        
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.innerContent, { width: contentWidth as any, alignSelf: 'center' }]}>
            
            {/* Top Bar */}
            <View style={styles.topBar}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>EMPOWERING LEADERS</Text>
              </View>
              <TouchableOpacity 
                style={styles.loginBtn} 
                onPress={() => isLoggedIn ? handleDashboard() : router.push('/login')}
              >
                <Text style={styles.loginBtnText}>{isLoggedIn ? "Dashboard" : "Log In"}</Text>
              </TouchableOpacity>
            </View>

            {/* Hero Section */}
            <View style={styles.heroSection}>
              <Text style={styles.heroTitleMain}>Empowering</Text>
              <Text style={styles.heroTitleSub}>Future Visionaries</Text>
              
              <Text style={styles.heroSub}>
                Discover world-class programs, connect with expert mentors, and launch your career with CSBM University.
              </Text>
              
              <View style={styles.heroButtons}>
                <TouchableOpacity style={styles.applyBtn} onPress={() => router.push('/register')}>
                  <LinearGradient colors={['#4F46E5', '#06B6D4']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.applyBtnGradient}>
                    <Text style={styles.applyBtnText}>Apply Now</Text>
                    <ArrowRight size={18} color="#fff" style={{marginLeft: 8}} />
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.demoBtn} onPress={() => Alert.alert('Demo', 'Demo video coming soon!')}>
                  <Text style={styles.demoBtnText}>Watch Demo</Text>
                  <Play size={16} color="#fff" style={{marginLeft: 8, fill: '#fff'}} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Stats Grid (2x2) */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(79, 70, 229, 0.15)' }]}>
                  <Users size={24} color="#4F46E5" />
                </View>
                <Text style={styles.statNum}>2,500+</Text>
                <Text style={styles.statLabel}>Students</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(124, 58, 237, 0.15)' }]}>
                  <BookOpen size={24} color="#7C3AED" />
                </View>
                <Text style={styles.statNum}>50+</Text>
                <Text style={styles.statLabel}>Programs</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Trophy size={24} color="#F59E0B" />
                </View>
                <Text style={styles.statNum}>15+</Text>
                <Text style={styles.statLabel}>Years</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <GraduationCap size={24} color="#10B981" />
                </View>
                <Text style={styles.statNum}>98%</Text>
                <Text style={styles.statLabel}>Employment</Text>
              </View>
            </View>

          </View>
        </ScrollView>
      </ImageBackground>

      {/* Custom Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} disabled>
          <Home size={24} color="#4F46E5" />
          <Text style={[styles.tabText, { color: '#4F46E5' }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/student/programs')}>
          <BookOpen size={24} color="#64748b" />
          <Text style={styles.tabText}>Programs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={handleDashboard}>
          <LayoutDashboard size={24} color="#64748b" />
          <Text style={styles.tabText}>Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  backgroundImage: { flex: 1, resizeMode: 'cover' },
  scrollContent: { paddingBottom: 120, minHeight: '100%' },
  innerContent: { flex: 1, paddingHorizontal: 24 },
  
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingBottom: 20 },
  heroBadge: { backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' },
  heroBadgeText: { color: '#10b981', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  loginBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  loginBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  
  heroSection: { paddingTop: 40, paddingBottom: 40 },
  heroTitleMain: { color: '#fff', fontSize: 48, fontWeight: '900', lineHeight: 52 },
  heroTitleSub: { color: '#38bdf8', fontSize: 48, fontWeight: '900', lineHeight: 52, marginBottom: 16 }, // Simulated gradient text with a strong cyan/blue
  heroSub: { color: '#cbd5e1', fontSize: 16, lineHeight: 26, marginBottom: 32, maxWidth: '90%' },
  
  heroButtons: { flexDirection: 'column', gap: 16 },
  applyBtn: { borderRadius: 30, overflow: 'hidden' },
  applyBtnGradient: { paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  applyBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  demoBtn: { flexDirection: 'row', paddingVertical: 18, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  demoBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 10 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'flex-start' },
  iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  statNum: { color: '#fff', fontSize: 26, fontWeight: '900', marginBottom: 4 },
  statLabel: { color: '#94a3b8', fontSize: 13, fontWeight: '700' },
  
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: 'rgba(15,23,42,0.98)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingBottom: Platform.OS === 'ios' ? 30 : 20, paddingTop: 15 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  tabText: { fontSize: 11, fontWeight: '700' }
});
