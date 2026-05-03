import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GraduationCap, BookOpen, Users, Trophy, Play, ArrowRight } from 'lucide-react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

const StatCard = ({ end, label, icon: Icon, color }: any) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
      <Icon size={20} color={color} />
    </View>
    <ThemedText style={styles.statNumber}>{end}</ThemedText>
    <ThemedText style={styles.statLabel}>{label}</ThemedText>
  </View>
);

const FeatureCard = ({ title, description, icon: Icon, color }: any) => (
  <TouchableOpacity style={styles.featureCard} activeOpacity={0.7}>
    <View style={[styles.featureIconContainer, { backgroundColor: `${color}15` }]}>
      <Icon size={24} color={color} />
    </View>
    <ThemedText style={styles.featureTitle}>{title}</ThemedText>
    <ThemedText style={styles.featureDescription}>{description}</ThemedText>
    <View style={styles.featureFooter}>
      <ThemedText style={[styles.learnMore, { color }]}>Learn more</ThemedText>
      <ArrowRight size={14} color={color} />
    </View>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Hero Section */}
      <View style={styles.heroContainer}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop' }}
          style={styles.heroImage}
        >
          <LinearGradient
            colors={['rgba(15, 23, 42, 0.7)', 'rgba(15, 23, 42, 0.95)']}
            style={styles.heroOverlay}
          >
            <View style={[styles.heroContent, { paddingTop: insets.top + 10 }]}>
              <View style={styles.headerActionRow}>
                <View style={styles.badge}>
                  <ThemedText style={styles.badgeText}>EMPOWERING LEADERS</ThemedText>
                </View>
                <Link href="/login" asChild>
                  <TouchableOpacity style={styles.loginHeaderButton}>
                    <Text style={styles.loginHeaderText}>Log In</Text>
                  </TouchableOpacity>
                </Link>
              </View>
              
              <Text style={styles.heroTitle}>
                Empowering{'\n'}
                <Text style={styles.heroTitleAccent}>Future Visionaries</Text>
              </Text>
              
              <ThemedText style={styles.heroSubtitle}>
                High-performance academic programs and advanced learning strategies to help your career grow.
              </ThemedText>

              <View style={styles.heroButtons}>
                <Link href="/apply" asChild>
                  <TouchableOpacity style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>Apply Now</Text>
                    <ArrowRight size={18} color="#fff" />
                  </TouchableOpacity>
                </Link>
                
                <TouchableOpacity style={styles.secondaryButton}>
                  <Play size={18} color="#3b82f6" fill="#3b82f6" />
                  <Text style={styles.secondaryButtonText}>Watch Demo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <StatCard end="2,500+" label="Students" icon={Users} color="#3b82f6" />
        <StatCard end="50+" label="Programs" icon={BookOpen} color="#8b5cf6" />
        <StatCard end="15+" label="Years" icon={Trophy} color="#f59e0b" />
        <StatCard end="98%" label="Employ." icon={GraduationCap} color="#10b981" />
      </View>

      {/* Features Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.miniBadge}>
            <Text style={styles.miniBadgeText}>INTEGRATED ECOSYSTEM</Text>
          </View>
          <ThemedText style={styles.sectionTitle}>Everything you need to succeed</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            A seamless educational journey designed for students and faculty.
          </ThemedText>
        </View>

        <View style={styles.featuresGrid}>
          <Link href="/workshops" asChild>
            <FeatureCard 
              title="Workshops & Events" 
              description="Browse and register for upcoming seminars and professional growth sessions."
              icon={BookOpen}
              color="#3b82f6"
            />
          </Link>
          <FeatureCard 
            title="Student Portal" 
            description="Your central hub. Manage your profile and view grades online."
            icon={Users}
            color="#0ea5e9"
          />
          <FeatureCard 
            title="Faculty Dashboard" 
            description="Simplify tasks and focus on delivering quality education."
            icon={Trophy}
            color="#6366f1"
          />
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    height: 520,
    width: '100%',
  },
  heroImage: {
    flex: 1,
  },
  heroOverlay: {
    flex: 1,
    paddingHorizontal: 24,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    marginBottom: 0,
  },
  headerActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  loginHeaderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  loginHeaderText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  badgeText: {
    color: '#3b82f6',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 48,
    marginBottom: 16,
  },
  heroTitleAccent: {
    color: '#3b82f6',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 24,
    marginBottom: 32,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    elevation: 4,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    marginTop: -40,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#1e293b',
    flex: 1,
    minWidth: (width - 64) / 2,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  miniBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  miniBadgeText: {
    color: '#3b82f6',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 22,
    marginBottom: 16,
  },
  featureFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  learnMore: {
    fontSize: 14,
    fontWeight: '700',
  },
});
