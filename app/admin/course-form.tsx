import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Switch, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, Save, Plus, X, 
  Calendar, DollarSign, BookOpen, 
  Clock, Info, Layout 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { ENDPOINTS } from '@/constants/config';

export default function AdminCourseForm() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    duration: '',
    credits: '',
    fee: '',
    category: 'IT',
    requirements: '',
    modules: [] as string[],
    nextIntakeDate: '',
    intakeDeadline: '',
    active: true
  });

  const [newModule, setNewModule] = useState('');

  useEffect(() => {
    if (id) fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${ENDPOINTS.COURSES}/${id}`);
      const data = response.data;
      setFormData({
        name: data.name || '',
        code: data.code || '',
        description: data.description || '',
        duration: data.duration || '',
        credits: data.credits?.toString() || '',
        fee: data.fee?.toString() || '',
        category: data.category || 'IT',
        requirements: data.requirements || '',
        modules: data.modules || [],
        nextIntakeDate: data.nextIntakeDate?.split('T')[0] || '',
        intakeDeadline: data.intakeDeadline?.split('T')[0] || '',
        active: data.active !== false
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.code || !formData.fee) {
      Alert.alert('Required Fields', 'Please fill in the course name, code, and fee.');
      return;
    }

    try {
      setSaving(true);
      const token = await SecureStore.getItemAsync('userToken');
      const payload = {
        ...formData,
        credits: parseInt(formData.credits) || 0,
        fee: parseFloat(formData.fee) || 0
      };

      if (id) {
        await axios.put(`${ENDPOINTS.COURSES}/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(ENDPOINTS.COURSES, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      Alert.alert('Success', 'Course saved successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err) {
      Alert.alert('Error', 'Failed to save course. Check your network or permissions.');
    } finally {
      setSaving(false);
    }
  };

  const addModule = () => {
    if (!newModule.trim()) return;
    setFormData(prev => ({ ...prev, modules: [...prev.modules, newModule.trim()] }));
    setNewModule('');
  };

  const removeModule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: id ? 'Edit Course' : 'New Course',
        headerTintColor: '#fff',
        headerStyle: { backgroundColor: '#0f172a' }
      }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Course Name *</Text>
            <TextInput 
              style={styles.input}
              placeholder="e.g. Higher Diploma in IT"
              placeholderTextColor="#475569"
              value={formData.name}
              onChangeText={val => setFormData(p => ({ ...p, name: val }))}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Course Code *</Text>
              <TextInput 
                style={styles.input}
                placeholder="e.g. HDIT-101"
                placeholderTextColor="#475569"
                value={formData.code}
                onChangeText={val => setFormData(p => ({ ...p, code: val }))}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>Category</Text>
              <TextInput 
                style={styles.input}
                placeholder="IT / Biz / Eng"
                placeholderTextColor="#475569"
                value={formData.category}
                onChangeText={val => setFormData(p => ({ ...p, category: val }))}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput 
              style={[styles.input, styles.textArea]}
              placeholder="Tell students what this course is about..."
              placeholderTextColor="#475569"
              multiline
              numberOfLines={4}
              value={formData.description}
              onChangeText={val => setFormData(p => ({ ...p, description: val }))}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details & Fees</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Duration</Text>
              <TextInput 
                style={styles.input}
                placeholder="e.g. 12 Months"
                placeholderTextColor="#475569"
                value={formData.duration}
                onChangeText={val => setFormData(p => ({ ...p, duration: val }))}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>Total Credits</Text>
              <TextInput 
                style={styles.input}
                placeholder="e.g. 60"
                placeholderTextColor="#475569"
                keyboardType="numeric"
                value={formData.credits}
                onChangeText={val => setFormData(p => ({ ...p, credits: val }))}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Course Fee (LKR) *</Text>
            <TextInput 
              style={styles.input}
              placeholder="e.g. 250000"
              placeholderTextColor="#475569"
              keyboardType="numeric"
              value={formData.fee}
              onChangeText={val => setFormData(p => ({ ...p, fee: val }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Entry Requirements</Text>
            <TextInput 
              style={[styles.input, styles.textArea]}
              placeholder="A/L passes, Age limit, etc."
              placeholderTextColor="#475569"
              multiline
              numberOfLines={3}
              value={formData.requirements}
              onChangeText={val => setFormData(p => ({ ...p, requirements: val }))}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Curriculum (Modules)</Text>
          <View style={styles.addModuleRow}>
            <TextInput 
              style={[styles.input, { flex: 1 }]}
              placeholder="Module name"
              placeholderTextColor="#475569"
              value={newModule}
              onChangeText={setNewModule}
            />
            <TouchableOpacity style={styles.addBtn} onPress={addModule}>
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.moduleList}>
            {formData.modules.map((m, i) => (
              <View key={i} style={styles.moduleItem}>
                <Text style={styles.moduleText}>{m}</Text>
                <TouchableOpacity onPress={() => removeModule(i)}>
                  <X size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scheduling</Text>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Next Intake</Text>
              <TextInput 
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#475569"
                value={formData.nextIntakeDate}
                onChangeText={val => setFormData(p => ({ ...p, nextIntakeDate: val }))}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>Deadline</Text>
              <TextInput 
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#475569"
                value={formData.intakeDeadline}
                onChangeText={val => setFormData(p => ({ ...p, intakeDeadline: val }))}
              />
            </View>
          </View>
          
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Active Status</Text>
              <Text style={styles.switchSub}>Visible to students when enabled</Text>
            </View>
            <Switch 
              value={formData.active} 
              onValueChange={val => setFormData(p => ({ ...p, active: val }))}
              trackColor={{ false: '#334155', true: '#4F46E5' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.saveBtn} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Save size={20} color="#fff" />
              <Text style={styles.saveBtnText}>Save Course Configuration</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 24,
  },
  section: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  addModuleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  addBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleList: {
    gap: 8,
  },
  moduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: 12,
  },
  moduleText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  switchLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  switchSub: {
    color: '#64748b',
    fontSize: 12,
  },
  saveBtn: {
    height: 60,
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
