import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Bell, CheckCircle, AlertTriangle, 
  Layout, Info, Clock, 
  Trash2, MailOpen 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/config';

export default function StudentNotifications() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await axios.get(`${API_BASE_URL}/notifications/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      // Update locally
      setNotifications((prev: any) => 
        prev.map((n: any) => n._id === id ? { ...n, isRead: true } : n)
      );
      // Update on server
      await axios.put(`${API_BASE_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'approval': return <CheckCircle size={20} color="#10b981" />;
      case 'warning': return <AlertTriangle size={20} color="#ef4444" />;
      case 'event': return <Layout size={20} color="#06B6D4" />;
      default: return <Info size={20} color="#4F46E5" />;
    }
  };

  const renderNotification = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.notifCard, !item.isRead && styles.unreadCard]}
      onPress={() => markAsRead(item._id || item.id)}
    >
      <View style={styles.iconContainer}>
        {getIcon(item.type)}
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
      
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, !item.isRead && styles.unreadText]}>{item.title}</Text>
          <Text style={styles.time}>{item.time || '2h ago'}</Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Notifications', 
        headerTintColor: '#fff', 
        headerStyle: { backgroundColor: '#0f172a' },
        headerRight: () => (
          <TouchableOpacity style={{ marginRight: 10 }}>
            <MailOpen size={20} color="#64748b" />
          </TouchableOpacity>
        )
      }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => (item._id || item.id).toString()}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 40 }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} tintColor="#4F46E5" />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Bell size={60} color="#1e293b" />
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySub}>No new notifications for you right now.</Text>
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
  listContent: {
    padding: 20,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  unreadCard: {
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
    borderColor: 'rgba(79, 70, 229, 0.2)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4F46E5',
    borderWidth: 2,
    borderColor: '#1e293b',
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94a3b8',
  },
  unreadText: {
    color: '#fff',
    fontWeight: '800',
  },
  time: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
  },
  message: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  emptyBox: {
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginTop: 20,
  },
  emptySub: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  }
});
