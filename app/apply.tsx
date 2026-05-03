import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { User, BookOpen, GraduationCap, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const STEPS = ['Personal', 'Academic', 'Program'];

export default function ApplyScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [currentStep, setCurrentStep] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    stream: '',
    passes: '',
    program: '',
  });

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      Alert.alert('Success', 'Your application has been submitted successfully!', [
        { text: 'OK', onPress: () => router.replace('/') }
      ]);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const renderProgress = () => (
    <View style={styles.progressContainer}>
      {STEPS.map((step, index) => (
        <View key={step} style={styles.stepItem}>
          <View style={[
            styles.stepCircle,
            index <= currentStep ? { backgroundColor: themeColors.tint } : { backgroundColor: themeColors.card, borderColor: '#334155' }
          ]}>
            {index < currentStep ? (
              <CheckCircle2 size={16} color="#fff" />
            ) : (
              <Text style={[styles.stepNumber, index <= currentStep ? { color: '#fff' } : { color: '#64748b' }]}>{index + 1}</Text>
            )}
          </View>
          <Text style={[styles.stepLabel, index <= currentStep ? { color: themeColors.text } : { color: '#64748b' }]}>{step}</Text>
        </View>
      ))}
      <View style={[styles.progressLine, { backgroundColor: '#334155' }]} />
      <View style={[
        styles.progressLineActive, 
        { backgroundColor: themeColors.tint, width: (width - 80) * (currentStep / (STEPS.length - 1)) }
      ]} />
    </View>
  );

  const renderFormStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.formContainer}>
            <ThemedText style={styles.stepTitle}>Personal Details</ThemedText>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: themeColors.card, color: themeColors.text }]}
                placeholder="John"
                placeholderTextColor="#64748b"
                value={formData.firstName}
                onChangeText={(text) => setFormData({...formData, firstName: text})}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: themeColors.card, color: themeColors.text }]}
                placeholder="Doe"
                placeholderTextColor="#64748b"
                value={formData.lastName}
                onChangeText={(text) => setFormData({...formData, lastName: text})}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: themeColors.card, color: themeColors.text }]}
                placeholder="john@example.com"
                placeholderTextColor="#64748b"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
              />
            </View>
          </View>
        );
      case 1:
        return (
          <View style={styles.formContainer}>
            <ThemedText style={styles.stepTitle}>Academic Info</ThemedText>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>A/L Stream</Text>
              <View style={styles.pickerPlaceholder}>
                <TextInput 
                  style={[styles.input, { backgroundColor: themeColors.card, color: themeColors.text }]}
                  placeholder="e.g. Physical Science"
                  placeholderTextColor="#64748b"
                  value={formData.stream}
                  onChangeText={(text) => setFormData({...formData, stream: text})}
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Number of Passes</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: themeColors.card, color: themeColors.text }]}
                placeholder="e.g. 3"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                value={formData.passes}
                onChangeText={(text) => setFormData({...formData, passes: text})}
              />
            </View>
            <View style={styles.eligibilityBox}>
              <CheckCircle2 size={20} color="#10b981" />
              <Text style={styles.eligibilityText}>You are eligible for most programs based on these results.</Text>
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.formContainer}>
            <ThemedText style={styles.stepTitle}>Program Selection</ThemedText>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Desired Program</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: themeColors.card, color: themeColors.text }]}
                placeholder="Select a program"
                placeholderTextColor="#64748b"
                value={formData.program}
                onChangeText={(text) => setFormData({...formData, program: text})}
              />
            </View>
            <View style={styles.summaryCard}>
              <ThemedText style={styles.summaryTitle}>Application Summary</ThemedText>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Name:</Text>
                <Text style={styles.summaryValue}>{formData.firstName} {formData.lastName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Program:</Text>
                <Text style={styles.summaryValue}>{formData.program || 'Not selected'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Intake:</Text>
                <Text style={styles.summaryValue}>Fall 2026</Text>
              </View>
            </View>
          </View>
        );
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={prevStep} style={styles.backButton}>
          <ChevronLeft size={24} color={themeColors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Application</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      {renderProgress()}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderFormStep()}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={[styles.nextButton, { backgroundColor: themeColors.tint }]} onPress={nextStep}>
          <Text style={styles.nextButtonText}>
            {currentStep === STEPS.length - 1 ? 'Submit Application' : 'Continue'}
          </Text>
          <ChevronRight size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 24,
    position: 'relative',
  },
  progressLine: {
    position: 'absolute',
    top: 40,
    left: 60,
    right: 60,
    height: 2,
    zIndex: -1,
  },
  progressLineActive: {
    position: 'absolute',
    top: 40,
    left: 60,
    height: 2,
    zIndex: -1,
  },
  stepItem: {
    alignItems: 'center',
    gap: 8,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  formContainer: {
    paddingTop: 10,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  eligibilityBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  eligibilityText: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  nextButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
