import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Save, Camera, Plus, 
  Trash2, Clock, Calendar, 
  MapPin, User, Tag, 
  ArrowLeft, Check 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/config';

// Helper for Web compatibility
const getToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('userToken');
  }
  return await SecureStore.getItemAsync('userToken');
};

const CATEGORIES = ['Seminar', 'Workshop', 'Webinar', 'Career Fair'];

export default function WorkshopForm() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    location: '',
    speakerName: '',
    speakerBio: '',
    speakerPhoto: null,
    bannerImage: null,
    totalSeats: '50',
    price: '0',
    category: 'Workshop',
    status: 'Active',
    agenda: [{ time: '09:00 AM', title: 'Introduction' }]
  });

  useEffect(() => {
    if (id) fetchWorkshop();
  }, [id]);

  const fetchWorkshop = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_BASE_URL}/workshops/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data;
      setFormData({
        ...data,
        totalSeats: data.totalSeats?.toString(),
        price: data.price?.toString(),
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load workshop data');
    } finally {
      setFetching(false);
    }
  };

  const pickImage = async (field: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: field === 'bannerImage' ? [16, 9] : [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData({ ...formData, [field]: result.assets[0].uri });
    }
  };

  const addAgendaItem = () => {
    setFormData({
      ...formData,
      agenda: [...formData.agenda, { time: '', title: '' }]
    });
  };

  const removeAgendaItem = (index: number) => {
    const newAgenda = formData.agenda.filter((_, i) => i !== index);
    setFormData({ ...formData, agenda: newAgenda });
  };

  const updateAgendaItem = (index: number, field: string, value: string) => {
    const newAgenda = [...formData.agenda];
    newAgenda[index] = { ...newAgenda[index], [field]: value };
    setFormData({ ...formData, agenda: newAgenda });
  };

  const handleSave = async (statusOverride?: string) => {
    // 1. Mandatory Text Fields
    if (!formData.title.trim()) {
      Alert.alert('Validation Error', 'Workshop title is required.');
      return;
    }
    if (!formData.description.trim() || formData.description.length < 20) {
      Alert.alert('Validation Error', 'Please provide a more detailed description (min 20 characters).');
      return;
    }
    
    // 2. Date Validation
    if (!formData.date) {
      Alert.alert('Validation Error', 'Workshop date is required.');
      return;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.date)) {
      Alert.alert('Validation Error', 'Invalid date format. Please use YYYY-MM-DD');
      return;
    }

    // 3. Speaker & Location
    if (!formData.speakerName.trim()) {
      Alert.alert('Validation Error', 'Speaker name is required.');
      return;
    }
    if (!formData.location.trim()) {
      Alert.alert('Validation Error', 'Workshop location or venue is required.');
      return;
    }

    // 4. Media Validation
    if (!formData.bannerImage) {
      Alert.alert('Validation Error', 'Please upload a workshop banner image.');
      return;
    }

    // 5. Numerical Validations
    const seats = parseInt(formData.totalSeats);
    if (isNaN(seats) || seats <= 0) {
      Alert.alert('Validation Error', 'Total capacity must be a positive number (at least 1).');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      Alert.alert('Validation Error', 'Price cannot be negative. Enter 0 for Free.');
      return;
    }

    // 6. Agenda Validation
    if (formData.agenda.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one item to the agenda.');
      return;
    }
    const invalidAgenda = formData.agenda.some(item => !item.time.trim() || !item.title.trim());
    if (invalidAgenda) {
      Alert.alert('Validation Error', 'All agenda items must have both time and title.');
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      
      // Clean payload to match backend schema exactly
      const payload = {
        title: formData.title,
        workshopName: formData.title,
        description: formData.description,
        date: new Date(formData.date).toISOString(), // Use full ISO string
        startTime: formData.startTime,
        endTime: formData.endTime,
        time: `${formData.startTime} - ${formData.endTime}`,
        location: formData.location,
        speaker: formData.speakerName, // Add 'speaker' key
        Speaker: formData.speakerName, // Add 'Speaker' key for compatibility
        speakerName: formData.speakerName,
        speakerBio: formData.speakerBio,
        speakerPhoto: formData.speakerPhoto,
        bannerImage: formData.bannerImage,
        banner: formData.bannerImage,
        totalSeats: parseInt(formData.totalSeats) || 0,
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        type: formData.category,
        status: statusOverride || formData.status,
        isPublished: true, // Force published status
        published: true, // Force published status
        isActive: true, // Force active status
        agenda: formData.agenda
      };

      if (id) {
        await axios.put(`${API_BASE_URL}/workshops/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_BASE_URL}/workshops`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      Alert.alert('Success', 'Workshop saved successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Save Error:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || 'Failed to save workshop';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.centered}>
        <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: id ? 'Edit Workshop' : 'Create Workshop', headerTintColor: '#fff', headerStyle: { backgroundColor: '#0f172a' } }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        
        {/* Banner Picker */}
        <TouchableOpacity style={styles.bannerPicker} onPress={() => pickImage('bannerImage')}>
          {formData.bannerImage ? (
            <Image source={{ uri: formData.bannerImage }} style={styles.bannerImg} />
          ) : (
            <View style={styles.pickerPlaceholder}>
              <Camera size={32} color="#64748b" />
              <Text style={styles.pickerText}>Upload Workshop Banner</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Workshop Title</Text>
            <TextInput 
              style={styles.input}
              placeholder="e.g. Masterclass in Digital Marketing"
              placeholderTextColor="#475569"
              value={formData.title}
              onChangeText={v => setFormData({...formData, title: v})}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Description</Text>
            <TextInput 
              style={[styles.input, { height: 120, textAlignVertical: 'top', paddingTop: 12 }]}
              multiline
              placeholder="Provide a detailed description of the event..."
              placeholderTextColor="#475569"
              value={formData.description}
              onChangeText={v => setFormData({...formData, description: v})}
            />
          </View>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Date</Text>
              <TextInput 
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#475569"
                value={formData.date}
                onChangeText={v => setFormData({...formData, date: v})}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                {CATEGORIES.map(c => (
                  <TouchableOpacity 
                    key={c} 
                    style={[styles.catChip, formData.category === c && styles.activeChip]}
                    onPress={() => setFormData({...formData, category: c})}
                  >
                    <Text style={[styles.catText, formData.category === c && styles.activeCatText]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>

        {/* Speaker Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Speaker Profile</Text>
          <View style={styles.speakerUploadRow}>
            <TouchableOpacity style={styles.speakerPhotoPicker} onPress={() => pickImage('speakerPhoto')}>
              {formData.speakerPhoto ? (
                <Image source={{ uri: formData.speakerPhoto }} style={styles.speakerPhoto} />
              ) : (
                <Camera size={20} color="#64748b" />
              )}
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Speaker Full Name</Text>
              <TextInput 
                style={styles.input}
                placeholder="e.g. Dr. Amal Perera"
                placeholderTextColor="#475569"
                value={formData.speakerName}
                onChangeText={v => setFormData({...formData, speakerName: v})}
              />
            </View>
          </View>
          <View style={[styles.inputGroup, { marginTop: 16 }]}>
            <Text style={styles.label}>Speaker Biography</Text>
            <TextInput 
              style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
              multiline
              placeholder="Briefly describe the speaker's background..."
              placeholderTextColor="#475569"
              value={formData.speakerBio}
              onChangeText={v => setFormData({...formData, speakerBio: v})}
            />
          </View>
        </View>

        {/* Logistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logistics & Pricing</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Venue / Location</Text>
            <TextInput 
              style={styles.input}
              placeholder="e.g. Main Auditorium / Zoom Link"
              placeholderTextColor="#475569"
              value={formData.location}
              onChangeText={v => setFormData({...formData, location: v})}
            />
          </View>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Total Capacity</Text>
              <TextInput 
                style={styles.input}
                keyboardType="numeric"
                value={formData.totalSeats}
                onChangeText={v => setFormData({...formData, totalSeats: v})}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>Price (0 = Free)</Text>
              <TextInput 
                style={styles.input}
                keyboardType="numeric"
                value={formData.price}
                onChangeText={v => setFormData({...formData, price: v})}
              />
            </View>
          </View>
        </View>

        {/* Dynamic Agenda */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Event Agenda</Text>
            <TouchableOpacity onPress={addAgendaItem}>
              <Plus size={20} color="#4F46E5" />
            </TouchableOpacity>
          </View>
          
          {formData.agenda.map((item, index) => (
            <View key={index} style={styles.agendaItem}>
              <TextInput 
                style={[styles.input, { flex: 1 }]}
                placeholder="Time"
                placeholderTextColor="#475569"
                value={item.time}
                onChangeText={v => updateAgendaItem(index, 'time', v)}
              />
              <TextInput 
                style={[styles.input, { flex: 3, marginLeft: 8 }]}
                placeholder="Session Title"
                placeholderTextColor="#475569"
                value={item.title}
                onChangeText={v => updateAgendaItem(index, 'title', v)}
              />
              <TouchableOpacity style={styles.removeBtn} onPress={() => removeAgendaItem(index)}>
                <Trash2 size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: '#1e293b' }]}
            onPress={() => handleSave('Draft')}
            disabled={loading}
          >
            <Text style={[styles.saveBtnText, { color: '#64748b' }]}>Save Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.saveBtn}
            onPress={() => handleSave('Active')}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Check size={20} color="#fff" />
                <Text style={styles.saveBtnText}>{id ? 'Update Workshop' : 'Publish Workshop'}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

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
  bannerPicker: {
    height: 180,
    backgroundColor: '#1e293b',
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#475569',
    overflow: 'hidden',
    marginBottom: 24,
  },
  bannerImg: {
    width: '100%',
    height: '100%',
  },
  pickerPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  pickerText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748b',
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
    color: '#94a3b8',
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
  row: {
    flexDirection: 'row',
  },
  catScroll: {
    flexDirection: 'row',
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: '#4F46E5',
  },
  catText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  activeCatText: {
    color: '#fff',
  },
  speakerUploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  speakerPhotoPicker: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  speakerPhoto: {
    width: '100%',
    height: '100%',
  },
  agendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  removeBtn: {
    marginLeft: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  saveBtn: {
    flex: 1,
    height: 56,
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
