import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, FlatList, TouchableOpacity, 
  TextInput, Modal, ScrollView, ActivityIndicator, 
  Alert, Platform, useWindowDimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Plus, Search, Edit3, Trash2, 
  ChevronLeft, X, Book, Clock, 
  DollarSign, Calendar, RefreshCw, BookOpen
} from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/config';

const getAuthHeaders = async () => {
  const token = Platform.OS === 'web' 
    ? localStorage.getItem('userToken') 
    : await SecureStore.getItemAsync('userToken');
  return { Authorization: `Bearer ${token}` };
};

export default function AdminCourses() {
  const { width } = useWindowDimensions();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    duration: '',
    fees: '',
    eligibilityRequirements: '',
    intakeStatus: 'OPEN',
    nextIntakeDate: '',
    modules: [] as string[]
  });

  const [newModule, setNewModule] = useState('');

  // Inline Intake Management States
  const [updatingIntake, setUpdatingIntake] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/courses/all`);
      setCourses(res.data);
    } catch (err) {
      console.error('Fetch Courses Error:', err);
      Alert.alert('Error', 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.code || !formData.fees) {
      Alert.alert('Validation Error', 'Title, Code, and Fees are required.');
      return;
    }

    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      
      const payload = {
        ...formData,
        fees: parseFloat(formData.fees) || 0,
        nextIntakeDate: formData.nextIntakeDate ? new Date(formData.nextIntakeDate).toISOString() : undefined,
      };

      if (isEditing) {
        await axios.put(`${API_BASE_URL}/courses/${currentId}`, payload, { headers });
      } else {
        await axios.post(`${API_BASE_URL}/courses`, payload, { headers });
      }
      
      setModalVisible(false);
      fetchCourses();
      resetForm();
    } catch (err) {
      console.error('Save Error:', err);
      Alert.alert('Error', 'Failed to save course.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to remove this course?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          setLoading(true);
          const headers = await getAuthHeaders();
          await axios.delete(`${API_BASE_URL}/courses/${id}`, { headers });
          fetchCourses();
        } catch (err) {
          Alert.alert('Error', 'Failed to delete course.');
        } finally {
          setLoading(false);
        }
      }}
    ]);
  };

  const handleInlineIntakeUpdate = async (id: string, status: string, date: string) => {
    try {
      setUpdatingIntake(id);
      const headers = await getAuthHeaders();
      await axios.put(`${API_BASE_URL}/courses/${id}/intake`, {
        intakeStatus: status,
        nextIntakeDate: date ? new Date(date).toISOString() : undefined
      }, { headers });
      fetchCourses();
    } catch (err) {
      Alert.alert('Error', 'Failed to update intake status.');
    } finally {
      setUpdatingIntake(null);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      code: '',
      description: '',
      duration: '',
      fees: '',
      eligibilityRequirements: '',
      intakeStatus: 'OPEN',
      nextIntakeDate: '',
      modules: []
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  const openEdit = (course: any) => {
    setFormData({
      title: course.title || course.name || '',
      code: course.code || '',
      description: course.description || '',
      duration: course.duration || '',
      fees: course.fees?.toString() || course.courseFee?.toString() || '',
      eligibilityRequirements: course.eligibilityRequirements || '',
      intakeStatus: course.intakeStatus || 'OPEN',
      nextIntakeDate: course.nextIntakeDate ? new Date(course.nextIntakeDate).toISOString().split('T')[0] : (course.intakeDate ? new Date(course.intakeDate).toISOString().split('T')[0] : ''),
      modules: course.modules || []
    });
    setCurrentId(course._id || course.id);
    setIsEditing(true);
    setModalVisible(true);
  };

  const addModule = () => {
    if (newModule.trim()) {
      setFormData({ ...formData, modules: [...formData.modules, newModule.trim()] });
      setNewModule('');
    }
  };

  const removeModule = (index: number) => {
    const updated = [...formData.modules];
    updated.splice(index, 1);
    setFormData({ ...formData, modules: updated });
  };

  const filteredCourses = courses.filter((c: any) => {
    const titleStr = (c.title || c.name || '').toLowerCase();
    const codeStr = (c.code || '').toLowerCase();
    const queryStr = searchQuery.toLowerCase();
    
    const matchesSearch = titleStr.includes(queryStr) || codeStr.includes(queryStr);
    if (activeTab === 'All') return matchesSearch;
    return matchesSearch && (c.intakeStatus || 'OPEN') === activeTab.toUpperCase();
  });

  const getStatusColor = (status: string) => {
    switch(status?.toUpperCase()) {
      case 'OPEN': return '#10b981';
      case 'CLOSED': return '#ef4444';
      case 'UPCOMING': return '#f59e0b';
      default: return '#64748b';
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true, 
        headerTitle: 'Course Management',
        headerTintColor: '#fff',
        headerStyle: { backgroundColor: '#0f172a' },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
        )
      }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Search size={18} color="#64748b" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search by title or code..."
            placeholderTextColor="#475569"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterRow}>
          {['All', 'Open', 'Closed', 'Upcoming'].map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.filterTab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.filterText, activeTab === tab && styles.activeFilterText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading && courses.length === 0 ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredCourses}
          keyExtractor={(item) => (item._id || item.id).toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.courseTitle}>{item.title || item.name}</Text>
                  <Text style={styles.courseCode}>{item.code}</Text>
                </View>
                <View style={[styles.statusChip, { borderColor: getStatusColor(item.intakeStatus) }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.intakeStatus) }]}>{item.intakeStatus}</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.metaItem}>
                  <Clock size={14} color="#94a3b8" />
                  <Text style={styles.metaText}>{item.duration || 'N/A'}</Text>
                </View>
                <View style={styles.metaItem}>
                  <DollarSign size={14} color="#94a3b8" />
                  <Text style={styles.metaText}>LKR {item.fees?.toLocaleString() || item.courseFee?.toLocaleString() || '0'}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Calendar size={14} color="#94a3b8" />
                  <Text style={styles.metaText}>{item.nextIntakeDate ? new Date(item.nextIntakeDate).toLocaleDateString() : 'TBA'}</Text>
                </View>
                <View style={[styles.metaItem, { width: '100%', marginTop: 4 }]}>
                  <BookOpen size={14} color="#94a3b8" />
                  <Text style={styles.metaText}>{item.modules?.length || 0} Modules</Text>
                </View>
              </View>

              {/* INTAKE MANAGEMENT INLINE */}
              <View style={styles.intakeSection}>
                <Text style={styles.intakeLabel}>Intake Management</Text>
                <View style={styles.intakeRow}>
                  {['OPEN', 'CLOSED', 'UPCOMING'].map(status => (
                    <TouchableOpacity 
                      key={status}
                      style={[
                        styles.intakeBtn, 
                        item.intakeStatus === status && { backgroundColor: getStatusColor(status) }
                      ]}
                      onPress={() => handleInlineIntakeUpdate(item._id || item.id, status, item.nextIntakeDate)}
                      disabled={updatingIntake === (item._id || item.id)}
                    >
                      <Text style={[styles.intakeBtnText, item.intakeStatus === status && { color: '#fff' }]}>{status}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {updatingIntake === (item._id || item.id) && <ActivityIndicator size="small" color="#4F46E5" style={{ marginTop: 10 }} />}
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}>
                  <Edit3 size={18} color="#4F46E5" />
                  <Text style={[styles.actionText, { color: '#4F46E5' }]}>Edit Details</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item._id || item.id)}>
                  <Trash2 size={18} color="#ef4444" />
                  <Text style={[styles.actionText, { color: '#ef4444' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Book size={64} color="#1e293b" />
              <Text style={styles.emptyTitle}>No courses found</Text>
              <Text style={styles.emptySub}>Try adjusting your search or add a new program.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => { resetForm(); setModalVisible(true); }}>
        <Plus size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add/Edit Modal (Bottom Sheet Style) */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditing ? 'Edit Course' : 'New Course'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X size={24} color="#94a3b8" /></TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
              <Text style={styles.label}>Course Title *</Text>
              <TextInput style={styles.input} value={formData.title} onChangeText={(v) => setFormData({...formData, title: v})} placeholder="e.g. BBA in Management" placeholderTextColor="#475569" />
              
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Course Code *</Text>
                  <TextInput style={styles.input} value={formData.code} onChangeText={(v) => setFormData({...formData, code: v})} placeholder="MGT101" placeholderTextColor="#475569" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.label}>Duration</Text>
                  <TextInput style={styles.input} value={formData.duration} onChangeText={(v) => setFormData({...formData, duration: v})} placeholder="2 Years" placeholderTextColor="#475569" />
                </View>
              </View>

              <Text style={styles.label}>Description</Text>
              <TextInput style={[styles.input, { height: 100 }]} multiline value={formData.description} onChangeText={(v) => setFormData({...formData, description: v})} placeholder="Course details..." placeholderTextColor="#475569" />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Fees (LKR) *</Text>
                  <TextInput style={styles.input} keyboardType="numeric" value={formData.fees} onChangeText={(v) => setFormData({...formData, fees: v})} placeholder="450000" placeholderTextColor="#475569" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.label}>Next Intake Date</Text>
                  <TextInput style={styles.input} value={formData.nextIntakeDate} onChangeText={(v) => setFormData({...formData, nextIntakeDate: v})} placeholder="YYYY-MM-DD" placeholderTextColor="#475569" />
                </View>
              </View>

              <Text style={styles.label}>Eligibility Requirements</Text>
              <TextInput style={[styles.input, { height: 80 }]} multiline value={formData.eligibilityRequirements} onChangeText={(v) => setFormData({...formData, eligibilityRequirements: v})} placeholder="e.g. 3 A/L passes in any stream..." placeholderTextColor="#475569" />

              <Text style={styles.label}>Intake Status</Text>
              <View style={styles.statusPicker}>
                {['OPEN', 'CLOSED', 'UPCOMING'].map(s => (
                  <TouchableOpacity 
                    key={s} 
                    style={[styles.statusOption, formData.intakeStatus === s && { backgroundColor: getStatusColor(s), borderColor: getStatusColor(s) }]}
                    onPress={() => setFormData({...formData, intakeStatus: s})}
                  >
                    <Text style={[styles.statusOptionText, formData.intakeStatus === s && { color: '#fff' }]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Course Modules</Text>
              <View style={styles.moduleInputRow}>
                <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} value={newModule} onChangeText={setNewModule} placeholder="Add module name" placeholderTextColor="#475569" />
                <TouchableOpacity style={styles.addModBtn} onPress={addModule}><Plus size={20} color="#fff" /></TouchableOpacity>
              </View>
              <View style={styles.moduleList}>
                {formData.modules.map((m, i) => (
                  <View key={i} style={styles.moduleChip}>
                    <Text style={styles.moduleText}>{m}</Text>
                    <TouchableOpacity onPress={() => removeModule(i)}><X size={14} color="#94a3b8" /></TouchableOpacity>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <LinearGradient colors={['#4F46E5', '#06B6D4']} style={styles.btnGradient}>
                  <Text style={styles.saveBtnText}>{isEditing ? 'Update Program' : 'Create Program'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 10 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 16,
  },
  searchInput: { flex: 1, color: '#fff', marginLeft: 12, fontSize: 14 },
  filterRow: { flexDirection: 'row', gap: 10 },
  filterTab: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 10, 
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  activeTab: { backgroundColor: 'rgba(79, 70, 229, 0.2)', borderColor: '#4F46E5' },
  filterText: { color: '#64748b', fontSize: 12, fontWeight: '700' },
  activeFilterText: { color: '#fff' },
  listContent: { padding: 20, paddingBottom: 100 },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  courseTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  courseCode: { color: '#64748b', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  statusChip: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, height: 26 },
  statusText: { fontSize: 10, fontWeight: '800' },
  cardBody: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 20 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  intakeSection: { backgroundColor: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 16, marginBottom: 20 },
  intakeLabel: { color: '#64748b', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 10 },
  intakeRow: { flexDirection: 'row', gap: 8 },
  intakeBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: '#0f172a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  intakeBtnText: { color: '#64748b', fontSize: 11, fontWeight: '800' },
  cardActions: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.03)', paddingTop: 16 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.02)', paddingVertical: 12, borderRadius: 12 },
  actionText: { fontSize: 13, fontWeight: '700' },
  fab: { position: 'absolute', right: 20, bottom: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#4F46E5', alignItems: 'center', justifyContent: 'center', elevation: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 20 },
  emptySub: { color: '#64748b', fontSize: 14, marginTop: 8, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1e293b', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '90%', padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  formScroll: { paddingBottom: 40 },
  label: { color: '#94a3b8', fontSize: 13, fontWeight: '700', marginBottom: 10, marginTop: 4 },
  input: { backgroundColor: '#0f172a', borderRadius: 14, padding: 16, color: '#fff', fontSize: 14, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  row: { flexDirection: 'row' },
  statusPicker: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statusOption: { flex: 1, height: 40, backgroundColor: '#0f172a', borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statusOptionText: { color: '#64748b', fontSize: 11, fontWeight: '800' },
  moduleInputRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  addModBtn: { width: 50, height: 50, backgroundColor: '#4F46E5', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  moduleList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  moduleChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.03)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  moduleText: { color: '#fff', fontSize: 13 },
  saveBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 10 },
  btnGradient: { height: 56, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});
