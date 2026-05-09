import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

const DOSE_VALUES = [
  '0.25', '0.5', '0.75',
  '1', '1.25', '1.5', '1.75',
  '2', '2.5', '3', '3.5',
  '4', '5', '6', '7', '8', '9', '10',
];

const FORMS = [
  { id: 'kapsul', label: 'Kapsül', icon: 'pill', type: 'material' },
  { id: 'hap', label: 'Hap', icon: 'capsules', type: 'font-awesome' },
  { id: 'enjeksiyon', label: 'Enjeksiyon', icon: 'syringe', type: 'font-awesome' },
  { id: 'sprey', label: 'Sprey', icon: 'spray-can', type: 'font-awesome' },
  { id: 'damla', label: 'Damla', icon: 'eye-dropper', type: 'font-awesome' },
  { id: 'surup', label: 'Şurup', icon: 'prescription-bottle', type: 'font-awesome' },
  { id: 'digerleri', label: 'Diğerleri', icon: 'ellipsis-h', type: 'font-awesome' },
];

export default function DosageScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string | string[] }>();
  const [selectedDose, setSelectedDose] = useState('1');
  const [selectedForm, setSelectedForm] = useState('kapsul');
  const medicationName = Array.isArray(params.name) ? params.name[0] : params.name || '';

  const currentIndex = DOSE_VALUES.indexOf(selectedDose);

  const decrease = () => {
    if (currentIndex > 0) setSelectedDose(DOSE_VALUES[currentIndex - 1]);
  };
  const increase = () => {
    if (currentIndex < DOSE_VALUES.length - 1) setSelectedDose(DOSE_VALUES[currentIndex + 1]);
  };

  const selectedFormLabel = FORMS.find(f => f.id === selectedForm)?.label || 'Kapsül';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.progressWrapper}>
          <View style={[styles.progressStep, styles.completedStep]} />
          <View style={[styles.progressStep, styles.activeStep]} />
          <View style={styles.progressStep} />
          <View style={styles.progressStep} />
          <View style={styles.progressStep} />
        </View>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Form & Doz Seçin</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <View style={styles.content}>
        {/* +/− stepper */}
        <View style={styles.stepperContainer}>
          <TouchableOpacity
            onPress={decrease}
            style={[styles.stepBtn, currentIndex === 0 && styles.stepBtnDisabled]}
            disabled={currentIndex === 0}
          >
            <Text style={styles.stepBtnText}>−</Text>
          </TouchableOpacity>

          <View style={styles.doseDisplay}>
            <Text style={styles.doseValue}>{selectedDose}</Text>
            <Text style={styles.doseUnit}>{selectedFormLabel}</Text>
          </View>

          <TouchableOpacity
            onPress={increase}
            style={[styles.stepBtn, currentIndex === DOSE_VALUES.length - 1 && styles.stepBtnDisabled]}
            disabled={currentIndex === DOSE_VALUES.length - 1}
          >
            <Text style={styles.stepBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Form seçimi */}
        <View style={styles.gridContainer}>
          {FORMS.map((form) => {
            const isActive = selectedForm === form.id;
            return (
              <TouchableOpacity
                key={form.id}
                onPress={() => setSelectedForm(form.id)}
                style={styles.gridItem}
              >
                <View style={[styles.iconBox, isActive && styles.activeIconBox]}>
                  {form.type === 'material' ? (
                    <MaterialCommunityIcons name={form.icon as any} size={30} color={isActive ? '#005CEE' : '#333'} />
                  ) : (
                    <FontAwesome5 name={form.icon} size={24} color={isActive ? '#005CEE' : '#333'} />
                  )}
                </View>
                <Text style={[styles.formLabel, isActive && styles.activeFormLabel]}>{form.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={() => router.push({
            pathname: '/frequency',
            params: { name: medicationName, dosage: `${selectedDose} ${selectedFormLabel}` }
          })}
        >
          <Text style={styles.nextBtnText}>Sonraki</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { paddingHorizontal: 20, paddingTop: 10 },
  progressWrapper: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  progressStep: { height: 3, flex: 1, backgroundColor: '#E5E5EA', marginHorizontal: 2, borderRadius: 2 },
  completedStep: { backgroundColor: '#005CEE', opacity: 0.4 },
  activeStep: { backgroundColor: '#005CEE' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  content: { flex: 1, paddingHorizontal: 20 },

  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    marginBottom: 8,
  },
  stepBtn: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: '#EEF3FF',
    justifyContent: 'center', alignItems: 'center',
  },
  stepBtnDisabled: { opacity: 0.3 },
  stepBtnText: { fontSize: 30, color: '#005CEE', fontWeight: '300', lineHeight: 36 },
  doseDisplay: { alignItems: 'center', marginHorizontal: 32, minWidth: 90 },
  doseValue: { fontSize: 52, fontWeight: '700', color: '#005CEE' },
  doseUnit: { fontSize: 14, color: '#999', marginTop: 2 },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', width: '100%' },
  gridItem: { width: '25%', alignItems: 'center', marginBottom: 20 },
  iconBox: {
    width: 65, height: 65, borderRadius: 15,
    borderWidth: 1, borderColor: '#F2F2F2',
    backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 3,
  },
  activeIconBox: { borderColor: '#005CEE', backgroundColor: '#F5F9FF' },
  formLabel: { fontSize: 12, color: '#9E9E9E' },
  activeFormLabel: { color: '#005CEE', fontWeight: '600' },

  footer: { padding: 20, paddingBottom: Platform.OS === 'ios' ? 30 : 20 },
  nextBtn: { backgroundColor: '#005CEE', height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  nextBtnText: { color: 'white', fontSize: 18, fontWeight: '600' },
});
