import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Filter, Book, Clock, Calendar, DollarSign, ChevronRight, GraduationCap } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import axios from 'axios';
import { ENDPOINTS } from '@/constants/config';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const CATEGORIES = ['All', 'IT', 'Business', 'Engineering', 'Nursing'];

export default function CourseCatalogScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(ENDPOINTS.COURSES);
      setCourses(response.data);
      setFilteredCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterData(query, activeCategory);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    filterData(searchQuery, category);
  };

  const filterData = (query: string, category: string) => {
    let data = courses;
    if (category !== 'All') {
      data = data.filter((c: any) => c.category === category);
    }
    if (query) {
      data = data.filter((c: any) => 
        c.name.toLowerCase().includes(query.toLowerCase()) || 
        c.code.toLowerCase().includes(query.toLowerCase())
      );
    }
    setFilteredCourses(data);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  const renderCourseItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.courseCard}
      onPress={() => router.push(`/course-details/${item._id || item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.codeBadge}>
          <Text style={styles.codeText}>{item.code}</Text>
        </View>
        <Text style={styles.categoryText}>{item.category || 'General'}</Text>
      </View>

      <Text style={styles.courseTitle}>{item.name}</Text>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Clock size={14} color="#64748b" />
          <Text style={styles.statText}>{item.duration}</Text>
        </View>
        <View style={styles.statItem}>
          <GraduationCap size={14} color="#64748b" />
          <Text style={styles.statText}>{item.credits} Credits</Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <View style={styles.infoItem}>
          <Calendar size={16} color="#3b82f6" />
          <View>
            <Text style={styles.infoLabel}>Next Intake</Text>
            <Text style={styles.infoValue}>{item.nextIntakeDate ? new Date(item.nextIntakeDate).toLocaleDateString() : 'TBA'}</Text>
          </View>
        </View>
        <View style={styles.infoItem}>
          <DollarSign size={16} color="#10b981" />
          <View>
            <Text style={styles.infoLabel}>Total Fee</Text>
            <Text style={styles.infoValue}>LKR {item.fee?.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.eligibilityBtn}
          onPress={() => router.push({ pathname: '/eligibility-check', params: { courseId: item._id || item.id } })}
        >
          <Text style={styles.eligibilityBtnText}>Check Eligibility</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.applyBtn}
          onPress={() => router.push('/new-application')}
        >
          <Text style={styles.applyBtnText}>Apply Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />
      
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <ThemedText style={styles.title}>Academic Catalog</ThemedText>
        <ThemedText style={styles.subtitle}>Explore our world-class diplomas and degrees.</ThemedText>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Search size={20} color="#64748b" />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search courses or codes..."
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Filter size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.categoryTab, activeCategory === cat && styles.activeCategoryTab]}
              onPress={() => handleCategoryChange(cat)}
            >
              <Text style={[styles.categoryTabText, activeCategory === cat && styles.activeCategoryTabText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => (item._id || item.id).toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Book size={64} color="#334155" />
              <Text style={styles.emptyText}>No courses found matching your criteria.</Text>
            </View>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    marginLeft: 12,
  },
  filterBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryList: {
    gap: 10,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activeCategoryTab: {
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    borderColor: '#4F46E5',
  },
  categoryTabText: {
    color: '#64748b',
    fontWeight: '700',
    fontSize: 13,
  },
  activeCategoryTabText: {
    color: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 24,
    gap: 20,
    paddingBottom: 100,
  },
  courseCard: {
    padding: 24,
    borderRadius: 30,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  codeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.2)',
  },
  codeText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  categoryText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    padding: 16,
    gap: 20,
    marginBottom: 24,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  infoLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  eligibilityBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  eligibilityBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  applyBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    color: '#475569',
    marginTop: 16,
    fontSize: 15,
    textAlign: 'center',
  },
});
