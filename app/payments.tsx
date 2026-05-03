import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CreditCard, Receipt, Clock, ChevronRight, DollarSign, ArrowLeft, Download, Info } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import axios from 'axios';
import { ENDPOINTS } from '@/constants/config';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

const StatCard = ({ title, value, color, icon: Icon }: any) => (
  <View style={[styles.statCard, { borderBottomColor: color }]}>
    <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
      <Icon size={18} color={color} />
    </View>
    <Text style={styles.statLabel}>{title}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

export default function PaymentsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(ENDPOINTS.COURSES.replace('/courses', '/payments/my-payments')).catch(() => ({ data: [] }));
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Payments fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPaid = payments
    .filter((p: any) => p.status === 'completed' || p.status === 'success')
    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

  const pendingCount = payments.filter((p: any) => p.status === 'pending').length;

  const renderPaymentItem = ({ item }: { item: any }) => {
    const isCompleted = item.status === 'completed' || item.status === 'success';
    const statusColor = isCompleted ? '#10b981' : item.status === 'pending' ? '#f59e0b' : '#ef4444';
    
    return (
      <TouchableOpacity style={[styles.paymentCard, { backgroundColor: themeColors.card }]} activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <View style={styles.orderInfo}>
            <View style={styles.receiptIcon}>
              <Receipt size={20} color="#94a3b8" />
            </View>
            <View>
              <Text style={styles.orderId}>ID: {item.orderId?.substring(0, 12) || 'REF-8821'}</Text>
              <Text style={styles.dateText}>{new Date(item.createdAt || Date.now()).toLocaleDateString()}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status?.toUpperCase() || 'PENDING'}</Text>
          </View>
        </View>

        <Text style={styles.itemName} numberOfLines={1}>{item.itemName || 'Course Fee Payment'}</Text>
        
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.amountLabel}>AMOUNT</Text>
            <Text style={styles.amountValue}>LKR {item.amount?.toLocaleString()}</Text>
          </View>
          <TouchableOpacity style={styles.downloadBtn}>
            <Download size={18} color="#3b82f6" />
            <Text style={styles.downloadText}>Receipt</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />
      
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Financial History</ThemedText>
        <ThemedText style={styles.subtitle}>Track your transactions and tuition fee payments.</ThemedText>
      </View>

      <View style={styles.statsContainer}>
        <StatCard title="Total Paid" value={`LKR ${totalPaid.toLocaleString()}`} color="#10b981" icon={DollarSign} />
        <StatCard title="Pending" value={pendingCount.toString()} color="#f59e0b" icon={Clock} />
        <StatCard title="Total Trans." value={payments.length.toString()} color="#3b82f6" icon={Receipt} />
      </View>

      <View style={styles.listSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <Info size={16} color="#64748b" />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : (
          <FlatList
            data={payments}
            renderItem={renderPaymentItem}
            keyExtractor={(item, index) => (item._id || index).toString()}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <CreditCard size={48} color="#334155" />
                <Text style={styles.emptyText}>No payment history found</Text>
              </View>
            }
          />
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 16,
    borderRadius: 20,
    borderBottomWidth: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  listSection: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 24,
    gap: 16,
    paddingBottom: 40,
  },
  paymentCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  receiptIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderId: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  dateText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 16,
  },
  amountLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  amountValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  downloadText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '700',
  },
  loadingContainer: {
    paddingTop: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#475569',
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
  },
});
