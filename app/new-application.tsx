import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert, Dimensions, Platform } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User, Book, FileText, Upload, CheckCircle, 
  ChevronRight, ChevronLeft, Camera, 
  MapPin, GraduationCap, Calendar, 
  Briefcase, Edit3, Trash2, X, Info
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

const getToken = async () => {
  if (Platform.OS === 'web') return localStorage.getItem('userToken');
  return await SecureStore.getItemAsync('userToken');
};

export default function ComprehensiveApplication() {
  const insets = useSafeAreaInsets();
  const { courseId: paramCourseId } = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    fullName: '',
    email: '',
    mobileNumber: '',
    nic: '',
    dob: '',
    gender: 'Male',
    address: '',
    // Step 2: Academic
    qualification: 'A/L',
    stream: '',
    school: '',
    results: '',
    gradYear: '',
    // Step 3: Program
    courseId: paramCourseId || '',
    intake: '2026',
    mode: 'Full-time',
    // Step 4: Documents (Internal local URIs)
    documents: {
      nicFront: null,
      nicBack: null,
      birthCert: null,
      photo: null,
      academicCert: null,
    },
    // Step 5: Final
    signature: '',
  });

  // Cloudinary Uploaded URLs
  const [uploadedUrls, setUploadedUrls] = useState<{[key: string]: string}>({});
  const [uploading, setUploading] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    fetchCourses();
    prefillUserData();
  }, []);

  const prefillUserData = async () => {
    try {
      const userDataStr = Platform.OS === 'web' ? localStorage.getItem('userData') : await SecureStore.getItemAsync('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        setFormData(prev => ({
          ...prev,
          fullName: userData.name || '',
          email: userData.email || '',
          mobileNumber: userData.mobile || '',
        }));
      }
    } catch (e) {
      console.warn('Prefill error', e);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(ENDPOINTS.COURSES);
      setCourses(response.data);
    } catch (error) {
      console.error('Fetch courses error', error);
    }
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.fullName || !formData.email || !formData.nic || !formData.mobileNumber) {
        Alert.alert('Missing Info', 'Please fill in all personal details including NIC.');
        return false;
      }
    }
    if (currentStep === 2) {
      if (!formData.school || !formData.results) {
        Alert.alert('Missing Info', 'Please provide your school name and results.');
        return false;
      }
    }
    if (currentStep === 3) {
      if (!formData.courseId) {
        Alert.alert('Selection Required', 'Please select a program to continue.');
        return false;
      }
    }
    if (currentStep === 4) {
      const required = ['nicFront', 'nicBack', 'birthCert', 'photo'];
      const missing = required.filter(d => !uploadedUrls[d]);
      if (missing.length > 0) {
        Alert.alert('Wait', 'Please wait for all required documents to finish uploading.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      if (currentStep < 5) setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const uploadToCloudinary = async (field: string, uri: string) => {
    try {
      setUploading(prev => ({ ...prev, [field]: true }));
      
      const data = new FormData();
      // @ts-ignore
      data.append('file', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        type: 'image/jpeg',
        name: `upload_${field}.jpg`,
      });
      data.append('upload_preset', 'csbm_uploads'); // Use your preset or fallback to unsigned

      const response = await fetch('https://api.cloudinary.com/v1_1/dbcs7brme/image/upload', {
        method: 'POST',
        body: data,
      });

      const json = await response.json();
      if (json.secure_url) {
        setUploadedUrls(prev => ({ ...prev, [field]: json.secure_url }));
      } else {
        throw new Error(json.error?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Cloudinary Error:', error);
      Alert.alert('Upload Error', 'Cloudinary upload failed. Check your network.');
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const pickImage = async (field: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setFormData(prev => ({
        ...prev,
        documents: { ...prev.documents, [field]: uri }
      }));
      uploadToCloudinary(field, uri);
    }
  };

  const handleSignature = (signature: string) => {
    setFormData(prev => ({ ...prev, signature }));
    Alert.alert('Success', 'Signature saved! You can now submit.');
  };

  const handleSubmit = async () => {
    if (!formData.signature) {
      Alert.alert('Signature Required', 'Please provide your digital signature to confirm the application.');
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      const selectedCourse = courses.find((c: any) => (c._id || c.id) === formData.courseId) as any;
      
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        address: formData.address,
        nicPassportNumber: formData.nic,
        gender: formData.gender,
        dob: formData.dob,
        
        // Academic
        qualification: formData.qualification,
        stream: formData.stream,
        institution: formData.school,
        gpa: formData.results,
        
        // Course info
        courseName: selectedCourse?.name || 'Unknown',
        programName: selectedCourse?.name || 'Unknown',
        intakeYear: formData.intake,
        
        // Documents (Cloud URLs)
        nicFileName: uploadedUrls.nicFront, // Map to model
        birthCertFileName: uploadedUrls.birthCert,
        passportPhotoFileName: uploadedUrls.photo,
        transcriptFileName: uploadedUrls.academicCert,
        studentPhotoUrl: uploadedUrls.photo,
        
        // Legal
        digitalSignature: formData.signature,
        status: 'PENDING'
      };

      // Correct Endpoint: /api/applications/submit
      await axios.post(`${API_BASE_URL}/applications/submit`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Success', 'Your application has been submitted! Our team will review it and notify you via email.', [
        { text: 'View Dashboard', onPress: () => router.replace('/student/dashboard') }
      ]);
    } catch (error: any) {
      console.error('Submit Error:', error.response?.data || error.message);
      Alert.alert('Submission Failed', error.response?.data?.message || 'Server error. Please try again later.');
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
                <CheckCircle size={14} color="#fff" />
              ) : (
                <step.icon size={14} color={currentStep === step.id ? '#fff' : '#64748b'} />
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

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Digital Application', headerTintColor: '#fff', headerStyle: { backgroundColor: '#0f172a' } }} />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

      {renderStepIndicator()}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Personal Details</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name (as per NIC)</Text>
              <TextInput style={styles.input} value={formData.fullName} onChangeText={v => setFormData({...formData, fullName: v})} placeholder="Enter full name" placeholderTextColor="#475569" />
            </View>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>NIC / Passport</Text>
                <TextInput style={styles.input} value={formData.nic} onChangeText={v => setFormData({...formData, nic: v})} placeholder="123456789V" placeholderTextColor="#475569" />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.label}>Mobile</Text>
                <TextInput style={styles.input} value={formData.mobileNumber} onChangeText={v => setFormData({...formData, mobileNumber: v})} placeholder="077xxxxxxx" placeholderTextColor="#475569" keyboardType="phone-pad" />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput style={styles.input} value={formData.email} editable={false} placeholder="email@example.com" placeholderTextColor="#475569" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Residential Address</Text>
              <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]} multiline value={formData.address} onChangeText={v => setFormData({...formData, address: v})} placeholder="Full address" placeholderTextColor="#475569" />
            </View>
          </View>
        )}

        {currentStep === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Academic Profile</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Highest Qualification</Text>
              <View style={styles.pillRow}>
                {['O/L', 'A/L', 'Diploma', 'Degree'].map(q => (
                  <TouchableOpacity key={q} style={[styles.pill, formData.qualification === q && styles.activePill]} onPress={() => setFormData({...formData, qualification: q})}>
                    <Text style={[styles.pillText, formData.qualification === q && styles.activePillText]}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Institution / School</Text>
              <TextInput style={styles.input} value={formData.school} onChangeText={v => setFormData({...formData, school: v})} placeholder="Last attended institution" placeholderTextColor="#475569" />
            </View>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Results / GPA</Text>
                <TextInput style={styles.input} value={formData.results} onChangeText={v => setFormData({...formData, results: v})} placeholder="e.g. 3 Passes" placeholderTextColor="#475569" />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.label}>Completion Year</Text>
                <TextInput style={styles.input} value={formData.gradYear} onChangeText={v => setFormData({...formData, gradYear: v})} placeholder="2024" placeholderTextColor="#475569" keyboardType="numeric" />
              </View>
            </View>
          </View>
        )}

        {currentStep === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Program Choice</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Diploma / Degree</Text>
              {courses.map((c: any) => (
                <TouchableOpacity 
                  key={c._id || c.id} 
                  style={[styles.choiceCard, formData.courseId === (c._id || c.id) && styles.activeChoiceCard]} 
                  onPress={() => setFormData({...formData, courseId: (c._id || c.id)})}
                >
                  <View style={styles.choiceIcon}>
                    <BookOpen size={18} color={formData.courseId === (c._id || c.id) ? '#fff' : '#4F46E5'} />
                  </View>
                  <Text style={[styles.choiceText, formData.courseId === (c._id || c.id) && styles.activeChoiceText]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Preferred Intake Year</Text>
              <View style={styles.pillRow}>
                {['2024', '2025', '2026'].map(y => (
                  <TouchableOpacity key={y} style={[styles.pill, formData.intake === y && styles.activePill]} onPress={() => setFormData({...formData, intake: y})}>
                    <Text style={[styles.pillText, formData.intake === y && styles.activePillText]}>{y}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {currentStep === 4 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Documents</Text>
            <Text style={styles.stepSub}>Upload clear photos of the following documents.</Text>
            <View style={styles.docGrid}>
              {[
                { id: 'nicFront', label: 'NIC Front' },
                { id: 'nicBack', label: 'NIC Back' },
                { id: 'birthCert', label: 'Birth Cert' },
                { id: 'photo', label: 'Passport Photo' },
                { id: 'academicCert', label: 'Academic Cert' },
              ].map(doc => (
                <TouchableOpacity 
                  key={doc.id} 
                  style={[styles.docCard, uploadedUrls[doc.id] && styles.uploadedCard]} 
                  onPress={() => pickImage(doc.id)}
                  disabled={uploading[doc.id]}
                >
                  {uploading[doc.id] ? (
                    <ActivityIndicator color="#4F46E5" />
                  ) : uploadedUrls[doc.id] ? (
                    <View style={{ flex: 1 }}>
                      <Image source={{ uri: uploadedUrls[doc.id] }} style={styles.docPreview} />
                      <View style={styles.checkOverlay}><CheckCircle size={16} color="#fff" /></View>
                    </View>
                  ) : (
                    <View style={styles.uploadBtn}>
                      <Camera size={24} color="#64748b" />
                      <Text style={styles.uploadLabel}>{doc.label}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {currentStep === 5 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Review & Sign</Text>
            <View style={styles.reviewSummary}>
              <Text style={styles.revText}><Text style={styles.revBold}>Applying for:</Text> {courses.find((c:any) => (c._id || c.id) === formData.courseId)?.name}</Text>
              <Text style={styles.revText}><Text style={styles.revBold}>Intake:</Text> {formData.intake}</Text>
            </View>
            
            <View style={styles.warningBox}>
              <Info size={16} color="#f59e0b" />
              <Text style={styles.warningText}>I hereby declare that all information provided is accurate and true.</Text>
            </View>

            <Text style={styles.label}>Student Digital Signature</Text>
            <View style={styles.sigWrapper}>
              <Signature
                onOK={handleSignature}
                onEmpty={() => console.log('Empty')}
                descriptionText="Sign your name inside the box"
                clearText="Clear"
                confirmText="Save Signature"
                webStyle={`.m-signature-pad--footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; } .m-signature-pad--body { border: none; }`}
                autoClear={false}
                imageType="image/png"
              />
            </View>
            
            {formData.signature ? (
              <View style={styles.sigConfirmed}>
                <CheckCircle size={16} color="#10b981" />
                <Text style={styles.sigConfirmedText}>Signature Captured Successfully</Text>
              </View>
            ) : (
              <Text style={styles.sigHint}>You must Save Signature before submitting.</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Footer Navigation */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
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
  container: { flex: 1 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: 'rgba(15, 23, 42, 0.5)' },
  stepItem: { alignItems: 'center', gap: 4 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  activeStepCircle: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  completedStepCircle: { backgroundColor: '#10b981', borderColor: '#10b981' },
  stepLabel: { fontSize: 8, color: '#64748b', fontWeight: '800', textTransform: 'uppercase' },
  activeStepLabel: { color: '#fff' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#1e293b', marginHorizontal: 6, marginBottom: 12 },
  completedStepLine: { backgroundColor: '#10b981' },
  scrollContent: { padding: 24, paddingBottom: 100 },
  stepContent: { gap: 20 },
  stepTitle: { fontSize: 24, fontWeight: '900', color: '#fff' },
  stepSub: { fontSize: 14, color: '#94a3b8', marginTop: -15 },
  inputGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: '700', color: '#94a3b8', marginLeft: 4 },
  input: { backgroundColor: '#1e293b', borderRadius: 16, height: 56, paddingHorizontal: 16, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  row: { flexDirection: 'row' },
  pillRow: { flexDirection: 'row', gap: 10 },
  pill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#1e293b', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  activePill: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  pillText: { color: '#64748b', fontWeight: '700' },
  activePillText: { color: '#fff' },
  choiceCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: '#1e293b', borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  activeChoiceCard: { borderColor: '#4F46E5', backgroundColor: 'rgba(79, 70, 229, 0.1)' },
  choiceIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  choiceText: { color: '#94a3b8', fontSize: 14, fontWeight: '700' },
  activeChoiceText: { color: '#fff' },
  docGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  docCard: { width: (width - 60) / 2, height: 120, borderRadius: 20, backgroundColor: '#1e293b', borderWidth: 1, borderStyle: 'dashed', borderColor: '#475569', overflow: 'hidden' },
  uploadedCard: { borderStyle: 'solid', borderColor: '#10b981' },
  docPreview: { width: '100%', height: '100%' },
  checkOverlay: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center' },
  uploadBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  uploadLabel: { fontSize: 10, fontWeight: '800', color: '#64748b' },
  reviewSummary: { backgroundColor: 'rgba(79, 70, 229, 0.1)', padding: 20, borderRadius: 20, borderLeftWidth: 4, borderLeftColor: '#4F46E5' },
  revText: { color: '#e2e8f0', fontSize: 15, marginBottom: 4 },
  revBold: { fontWeight: '800', color: '#4F46E5' },
  warningBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: 12, borderRadius: 12 },
  warningText: { flex: 1, color: '#f59e0b', fontSize: 12, fontWeight: '600' },
  sigWrapper: { height: 250, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden' },
  sigConfirmed: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, alignSelf: 'center' },
  sigConfirmedText: { color: '#10b981', fontWeight: '800', fontSize: 13 },
  sigHint: { textAlign: 'center', color: '#64748b', fontSize: 11, marginTop: 8, fontStyle: 'italic' },
  footer: { flexDirection: 'row', padding: 20, backgroundColor: '#0f172a', gap: 12 },
  backBtn: { flex: 1, height: 56, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  backBtnText: { color: '#fff', fontWeight: '700' },
  nextBtn: { flex: 2, height: 56, borderRadius: 16, backgroundColor: '#4F46E5', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  nextBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 }
});
