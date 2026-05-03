import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, Dimensions, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { Search, Filter, Calendar, Clock, ChevronRight, GraduationCap } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

import axios from 'axios';
import { ENDPOINTS } from '@/constants/config';

const TABS = ['All', 'IT', 'Business', 'Engineering'];

export default function ProgramsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(ENDPOINTS.COURSES);
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const category = course.category || 'Other';
    const title = course.name || course.courseName || course.title || '';
    const matchesTab = activeTab === 'All' || category === activeTab;
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const renderCourseItem = ({ item }: { item: any }) => {
    const title = item.name || item.courseName || item.title;
    const type = item.type || item.courseType || 'PROGRAM';
    const category = item.category || 'Other';
    const color = item.color || (category === 'IT' ? '#3b82f6' : category === 'Business' ? '#10b981' : '#f59e0b');
    
    return (
      <TouchableOpacity style={[styles.courseCard, { backgroundColor: themeColors.card }]} activeOpacity={0.7}>
        <View style={[styles.categoryStrip, { backgroundColor: color }]} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={[styles.typeBadge, { backgroundColor: `${color}20` }]}>
              <Text style={[styles.typeBadgeText, { color: color }]}>{type}</Text>
            </View>
            <ThemedText style={styles.courseCode}>{item.code || category}</ThemedText>
          </View>
          
          <ThemedText style={styles.courseTitle}>{title}</ThemedText>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Calendar size={14} color="#94a3b8" />
              <Text style={styles.infoText}>{item.intake || 'Sep 2026'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Clock size={14} color="#94a3b8" />
              <Text style={styles.infoText}>{item.duration || item.courseDuration || '1 Year'}</Text>
            </View>
          </View>

          <Link href="/apply" asChild>
            <TouchableOpacity style={[styles.applyButton, { backgroundColor: color }]}>
              <Text style={styles.applyButtonText}>Quick Apply</Text>
              <ChevronRight size={16} color="#fff" />
            </TouchableOpacity>
          </Link>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Academic Programs</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Discover your path to excellence</ThemedText>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: themeColors.card }]}>
          <Search size={20} color="#64748b" style={styles.searchIcon} />
          <TextInput
            placeholder="Search programs..."
            placeholderTextColor="#64748b"
            style={[styles.searchInput, { color: themeColors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab,
                activeTab === tab ? { backgroundColor: themeColors.tint } : { backgroundColor: themeColors.card }
              ]}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab ? { color: '#fff' } : { color: themeColors.text }
              ]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={filteredCourses}
        renderItem={renderCourseItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <GraduationCap size={48} color="#94a3b8" />
            <ThemedText style={styles.emptyText}>No programs found matching your search.</ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterScroll: {
    paddingHorizontal: 24,
    gap: 10,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  courseCard: {
    flexDirection: 'row',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryStrip: {
    width: 6,
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  courseCode: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: 'bold',
    marginLeft: 'auto',
  },
  courseTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
