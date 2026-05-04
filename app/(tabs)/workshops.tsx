import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, Image, ActivityIndicator, RefreshControl, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Tag, ChevronRight, User, Bell, Search, Calendar, Clock, Users
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/config';

const FILTERS = ['All', 'Today', 'This Week', 'Free', 'Paid'];

// Helper for Web compatibility
const getToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('userToken');
  }
  return await SecureStore.getItemAsync('userToken');
};

export default function WorkshopsScreen() {
  const insets = useSafeAreaInsets();
  const [workshops, setWorkshops] = useState([]);
  const [filteredWorkshops, setFilteredWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/workshops`);
      
      const data = response.data?.data || response.data?.workshops || (Array.isArray(response.data) ? response.data : []);
      setWorkshops(data);
      setFilteredWorkshops(data);
    } catch (error) {
      console.error('Workshops fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleFilter = (filter: string) => {
    setActiveFilter(filter);
    let data = workshops;
    
    if (filter === 'Free') data = data.filter((w: any) => w.price === 0);
    if (filter === 'Paid') data = data.filter((w: any) => w.price > 0);
    // Add date filters here if needed

    setFilteredWorkshops(data);
  };

  const renderWorkshopCard = ({ item }: { item: any }) => {
    const isFull = item.totalSeats <= (item.registeredCount || 0);
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push(`/workshop-details/${item._id || item.id}`)}
      >
        <Image source={{ uri: item.bannerImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87' }} style={styles.banner} />
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{item.price === 0 ? 'FREE' : `LKR ${item.price}`}</Text>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Calendar size={14} color="#64748b" />
              <Text style={styles.metaText}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={14} color="#64748b" />
              <Text style={styles.metaText}>{item.startTime}</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.speakerBox}>
              <View style={styles.speakerAvatar}>
                {item.speakerPhoto ? (
                  <Image source={{ uri: item.speakerPhoto }} style={styles.fullAvatar} />
                ) : (
                  <User size={14} color="#fff" />
                )}
              </View>
              <Text style={styles.speakerName}>{item.speakerName}</Text>
            </View>
            
            <View style={styles.seatBox}>
              <Users size={14} color={isFull ? '#ef4444' : '#10b981'} />
              <Text style={[styles.seatText, { color: isFull ? '#ef4444' : '#10b981' }]}>
                {item.totalSeats - (item.registeredCount || 0)} left
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.registerBtn, isFull && styles.disabledBtn]}
            onPress={() => router.push(`/workshop-details/${item._id || item.id}`)}
            disabled={isFull}
          >
            <Text style={styles.registerBtnText}>{isFull ? 'FULLY BOOKED' : 'View & Register'}</Text>
            {!isFull && <ChevronRight size={16} color="#fff" />}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />
      
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Upcoming Workshops</Text>
            <Text style={styles.headerSub}>Level up your skills with our expert seminars.</Text>
          </View>
          <TouchableOpacity 
            style={styles.notifBtn} 
            onPress={() => router.push('/notifications')}
          >
            <Bell size={24} color="#fff" />
            <View style={styles.notifBadge} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchBar}>
          <Search size={20} color="#64748b" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search workshops or speakers..."
            placeholderTextColor="#475569"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          {FILTERS.map(f => (
            <TouchableOpacity 
              key={f} 
              style={[styles.filterChip, activeFilter === f && styles.activeChip]}
              onPress={() => handleFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.activeFilterText]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredWorkshops}
          renderItem={renderWorkshopCard}
          keyExtractor={(item) => (item._id || item.id).toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchWorkshops(); }} tintColor="#4F46E5" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Calendar size={64} color="#1e293b" />
              <Text style={styles.emptyTitle}>No workshops found</Text>
              <Text style={styles.emptySub}>Try adjusting your filters or search query.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 6,
  },
  headerSub: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    marginLeft: 12,
  },
  filterList: {
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activeChip: {
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    borderColor: '#4F46E5',
  },
  filterText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
  },
  activeFilterText: {
    color: '#fff',
  },
  listContent: {
    padding: 24,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  banner: {
    width: '100%',
    height: 160,
  },
  priceBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#06B6D4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  priceText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
  },
  cardContent: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    marginBottom: 20,
  },
  speakerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  speakerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fullAvatar: {
    width: '100%',
    height: '100%',
  },
  speakerName: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
  },
  seatBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  seatText: {
    fontSize: 12,
    fontWeight: '800',
  },
  registerBtn: {
    height: 52,
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledBtn: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  registerBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  notifBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4F46E5',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
});
