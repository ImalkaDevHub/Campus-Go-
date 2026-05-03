import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User, Book, FileText, Upload, CheckCircle, 
  ChevronRight, ChevronLeft, Camera, 
  MapPin, GraduationCap, Calendar, 
  Briefcase, Edit3, Trash2 
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Signature from 'react-native-signature-canvas';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, ENDPOINTS } from '@/constants/config';

const { width } = Dimensions.get('window');

const STEPS = [
  { id: 1, title: 'Personal', icon: User },
  { id: 2, title: 'Academic', icon: GraduationCap },
  { id: 3, title: 'Program', icon: Book },
  { id: 4, title: 'Documents', icon: Upload },
  { id: 5, title: 'Review', icon: CheckCircle },
];

export default function NewApplicationScreen() {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({
    // Step 1
    fullName: '',
    email: '',
    mobileNumber: '',
    nic: '',
    dob: '',
    gender: 'Male',
    address: '',
    // Step 2
    qualification: 'A/L',
    school: '',
    results: '',
    gradYear: '',
    // Step 3
    courseId: '',
    intake: '',
    mode: 'Full-time',
    // Step 4
    documents: {
      nicFront: null,
      nicBack: null,
      birthCert: null,
      photo: null,
      academicCert: null,
    },
    // Step 5
    signature: '',
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(ENDPOINTS.COURSES);
      setCourses(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Upload State
  const [uploading, setUploading] = useState<{[key: string]: boolean}>({});
  const [uploadedUrls, setUploadedUrls] = useState<{[key: string]: string}>({});

  const uploadToCloudinary = async (field: string, uri: string) => {
    try {
      setUploading(prev => ({ ...prev, [field]: true }));
      
      const data = new FormData();
      // @ts-ignore
      data.append('file', {
        uri,
        type: 'image/jpeg',
        name: `upload_${field}.jpg`,
      });
      data.append('upload_preset', 'csbm_uploads');

      const response = await fetch('https://api.cloudinary.com/v1_1/dbcs7brme/auto/upload', {
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const json = await response.json();
      if (json.secure_url) {
        setUploadedUrls(prev => ({ ...prev, [field]: json.secure_url }));
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Cloudinary Error:', error);
      Alert.alert('Upload Error', `Failed to upload ${field}. Please try again.`);
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const pickImage = async (field: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setFormData(prev => ({
        ...prev,
        documents: { ...prev.documents, [field]: uri }
      }));
      // Upload to cloud immediately after picking
      uploadToCloudinary(field, uri);
    }
  };

  const handleSignature = (signature: string) => {
    setFormData(prev => ({ ...prev, signature }));
  };

  const handleSubmit = async () => {
    // Check if everything is uploaded
    const requiredDocs = ['nicFront', 'nicBack', 'birthCert', 'photo'];
    const missingDocs = requiredDocs.filter(d => !uploadedUrls[d]);
    
    if (missingDocs.length > 0) {
      Alert.alert('Wait', 'Please wait for all documents to finish uploading to the cloud.');
      return;
    }

    if (!formData.signature) {
      Alert.alert('Signature Required', 'Please provide your digital signature to submit the application.');
      return;
    }

    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('userToken');
      
      // Submit application with cloud URLs
      await axios.post(`${API_BASE_URL}/applications`, {
        ...formData,
        documents: uploadedUrls, // Use the cloud URLs, not local URIs
        status: 'PENDING'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Success', 'Your application has been submitted successfully!', [
        { text: 'View Status', onPress: () => router.replace('/application-status') }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {STEPS.map((step, index) => (
        <React.Fragment key={step.id}>
          <View style={styles.stepItem}>
            <View style={[
              styles.stepCircle, 
              currentStep === step.id && styles.activeStepCircle,
              currentStep > step.id && styles.completedStepCircle
            ]}>
              {currentStep > step.id ? (
                <CheckCircle size={16} color="#fff" />
              ) : (
                <step.icon size={16} color={currentStep === step.id ? '#fff' : '#64748b'} />
              )}
            </View>
            <Text style={[
              styles.stepLabel,
              currentStep === step.id && styles.activeStepLabel
            ]}>{step.title}</Text>
          </View>
          {index < STEPS.length - 1 && (
            <View style={[styles.stepLine, currentStep > step.id && styles.completedStepLine]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Personal Details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput 
              style={styles.input} 
              value={formData.fullName}
              onChangeText={(val) => setFormData({...formData, fullName: val})}
              placeholder="As per NIC"
              placeholderTextColor="#475569"
            />
          </View>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>NIC Number</Text>
              <TextInput 
                style={styles.input}
                value={formData.nic}
                onChangeText={(val) => setFormData({...formData, nic: val})}
                placeholder="123456789V"
                placeholderTextColor="#475569"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderRow}>
                {['Male', 'Female'].map(g => (
                  <TouchableOpacity 
                    key={g} 
                    style={[styles.genderBtn, formData.gender === g && styles.activeGenderBtn]}
                    onPress={() => setFormData({...formData, gender: g})}
                  >
                    <Text style={[styles.genderBtnText, formData.gender === g && styles.activeGenderBtnText]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Permanent Address</Text>
            <TextInput 
              style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
              multiline
              value={formData.address}
              onChangeText={(val) => setFormData({...formData, address: val})}
              placeholder="Your full residential address"
              placeholderTextColor="#475569"
            />
          </View>
        </View>
      );
      case 2: return (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Academic Background</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Highest Qualification</Text>
            <View style={styles.qualRow}>
              {['O/L', 'A/L', 'Diploma', 'Degree'].map(q => (
                <TouchableOpacity 
                  key={q}
                  style={[styles.qualBtn, formData.qualification === q && styles.activeQualBtn]}
                  onPress={() => setFormData({...formData, qualification: q})}
                >
                  <Text style={[styles.qualBtnText, formData.qualification === q && styles.activeQualBtnText]}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>School / Institute Name</Text>
            <TextInput 
              style={styles.input}
              value={formData.school}
              onChangeText={(val) => setFormData({...formData, school: val})}
              placeholder="Name of last institution"
              placeholderTextColor="#475569"
            />
          </View>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>GPA / Results</Text>
              <TextInput 
                style={styles.input}
                value={formData.results}
                onChangeText={(val) => setFormData({...formData, results: val})}
                placeholder="e.g. 3.2"
                placeholderTextColor="#475569"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>Graduation Year</Text>
              <TextInput 
                style={styles.input}
                value={formData.gradYear}
                onChangeText={(val) => setFormData({...formData, gradYear: val})}
                placeholder="2023"
                placeholderTextColor="#475569"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>
      );
      case 3: return (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Program Selection</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Choose Your Course</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.courseScroll}>
              {courses.map((c: any) => (
                <TouchableOpacity 
                  key={c._id || c.id}
                  style={[styles.courseItem, formData.courseId === (c._id || c.id) && styles.activeCourseItem]}
                  onPress={() => setFormData({...formData, courseId: (c._id || c.id)})}
                >
                  <Text style={[styles.courseItemText, formData.courseId === (c._id || c.id) && styles.activeCourseItemText]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preferred Intake</Text>
            <TextInput 
              style={styles.input}
              value={formData.intake}
              onChangeText={(val) => setFormData({...formData, intake: val})}
              placeholder="e.g. June 2024"
              placeholderTextColor="#475569"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Study Mode</Text>
            <View style={styles.modeRow}>
              {['Full-time', 'Part-time'].map(m => (
                <TouchableOpacity 
                  key={m}
                  style={[styles.modeBtn, formData.mode === m && styles.activeModeBtn]}
                  onPress={() => setFormData({...formData, mode: m})}
                >
                  <Text style={[styles.modeBtnText, formData.mode === m && styles.activeModeBtnText]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      );
      case 4: return (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Document Upload</Text>
          <View style={styles.docGrid}>
            {[
              { id: 'nicFront', label: 'NIC Front' },
              { id: 'nicBack', label: 'NIC Back' },
              { id: 'birthCert', label: 'Birth Cert' },
              { id: 'photo', label: 'Passport Photo' },
              { id: 'academicCert', label: 'Certificates' },
            ].map(doc => (
              <TouchableOpacity 
                key={doc.id} 
                style={[styles.docCard, uploadedUrls[doc.id] && styles.uploadedCard]}
                onPress={() => !uploading[doc.id] && pickImage(doc.id)}
              >
                {uploading[doc.id] ? (
                  <View style={styles.uploadPlaceholder}>
                    <ActivityIndicator color="#4F46E5" />
                    <Text style={[styles.uploadText, { color: '#4F46E5' }]}>Uploading...</Text>
                  </View>
                ) : formData.documents[doc.id as keyof typeof formData.documents] ? (
                  <View style={{ flex: 1 }}>
                    <Image source={{ uri: formData.documents[doc.id as keyof typeof formData.documents] as string }} style={styles.docPreview} />
                    {uploadedUrls[doc.id] && (
                      <View style={styles.cloudBadge}>
                        <CheckCircle size={12} color="#fff" />
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Camera size={24} color="#64748b" />
                    <Text style={styles.uploadText}>{doc.label}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
      case 5: return (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Final Review</Text>
          <View style={styles.reviewCard}>
            <Text style={styles.reviewHeading}>Confirm Your Details</Text>
            <View style={styles.reviewRow}><Text style={styles.revLabel}>Name:</Text><Text style={styles.revVal}>{formData.fullName}</Text></View>
            <View style={styles.reviewRow}><Text style={styles.revLabel}>NIC:</Text><Text style={styles.revVal}>{formData.nic}</Text></View>
            <View style={styles.reviewRow}><Text style={styles.revLabel}>Course:</Text><Text style={styles.revVal}>{courses.find((c:any) => (c._id || c.id) === formData.courseId)?.name || 'Not Selected'}</Text></View>
          </View>

          <Text style={styles.label}>Digital Signature</Text>
          <View style={styles.signatureBox}>
            <Signature
              onOK={handleSignature}
              onEmpty={() => console.log('Empty')}
              descriptionText="Sign here"
              clearText="Clear"
              confirmText="Save"
              webStyle={`.m-signature-pad--footer {display: none; margin: 0px;}`}
              autoClear={true}
              imageType="image/png"
            />
          </View>
          <Text style={styles.signatureHint}>Draw your signature inside the box above.</Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'New Application', headerTintColor: '#fff', headerStyle: { backgroundColor: '#0f172a' } }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      {renderStepIndicator()}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.backBtn} onPress={prevStep}>
            <ChevronLeft size={20} color="#fff" />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.nextBtn, currentStep === 1 && { flex: 1 }]} 
          onPress={currentStep === 5 ? handleSubmit : nextStep}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.nextBtnText}>{currentStep === 5 ? 'Submit Application' : 'Continue'}</Text>
              {currentStep < 5 && <ChevronRight size={20} color="#fff" />}
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activeStepCircle: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  completedStepCircle: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  stepLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
  },
  activeStepLabel: {
    color: '#fff',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#1e293b',
    marginHorizontal: 8,
    marginBottom: 12,
  },
  completedStepLine: {
    backgroundColor: '#10b981',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  stepContent: {
    gap: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 10,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  row: {
    flexDirection: 'row',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activeGenderBtn: {
    borderColor: '#4F46E5',
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  genderBtnText: {
    color: '#64748b',
    fontWeight: '700',
  },
  activeGenderBtnText: {
    color: '#fff',
  },
  qualRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  qualBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activeQualBtn: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  qualBtnText: {
    color: '#64748b',
    fontWeight: '700',
  },
  activeQualBtnText: {
    color: '#fff',
  },
  courseScroll: {
    flexDirection: 'row',
  },
  courseItem: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    maxWidth: 200,
  },
  activeCourseItem: {
    borderColor: '#4F46E5',
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  courseItemText: {
    color: '#64748b',
    fontWeight: '700',
  },
  activeCourseItemText: {
    color: '#fff',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modeBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeModeBtn: {
    backgroundColor: '#4F46E5',
  },
  modeBtnText: {
    color: '#64748b',
    fontWeight: '700',
  },
  activeModeBtnText: {
    color: '#fff',
  },
  docGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  docCard: {
    width: (width - 60) / 2,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#475569',
    overflow: 'hidden',
    position: 'relative',
  },
  uploadedCard: {
    borderStyle: 'solid',
    borderColor: '#4F46E5',
    borderWidth: 2,
  },
  cloudBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#10b981',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1e293b',
  },
  docPreview: {
    width: '100%',
    height: '100%',
  },
  uploadPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
  },
  reviewCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  reviewHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  revLabel: {
    color: '#64748b',
    fontSize: 13,
  },
  revVal: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  signatureBox: {
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  signatureHint: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  backBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  nextBtn: {
    flex: 2,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
