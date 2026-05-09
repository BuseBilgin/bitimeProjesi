import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
const QUICK_TIMES = ['08:00', '12:00', '18:00', '00:00'];

export default function ScheduleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name?: string | string[];
    dosage?: string | string[];
    frequency?: string | string[];
    startDate?: string | string[];
  }>();

  const [selectedHour, setSelectedHour] = useState('08');
  const [selectedMinute, setSelectedMinute] = useState('00');

  const medicationName = Array.isArray(params.name) ? params.name[0] : params.name || '';
  const dosage = Array.isArray(params.dosage) ? params.dosage[0] : params.dosage || '';
  const frequency = Array.isArray(params.frequency) ? params.frequency[0] : params.frequency || '';
  const startDate = Array.isArray(params.startDate) ? params.startDate[0] : params.startDate || '';

  const hourIndex = HOURS.indexOf(selectedHour);
  const minuteIndex = MINUTES.indexOf(selectedMinute);

  const decreaseHour = () => setSelectedHour(HOURS[(hourIndex - 1 + 24) % 24]);
  const increaseHour = () => setSelectedHour(HOURS[(hourIndex + 1) % 24]);
  const decreaseMinute = () => setSelectedMinute(MINUTES[(minuteIndex - 1 + 60) % 60]);
  const increaseMinute = () => setSelectedMinute(MINUTES[(minuteIndex + 1) % 60]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.progressWrapper}>
          <View style={[styles.progressStep, styles.completedStep]} />
          <View style={[styles.progressStep, styles.completedStep]} />
          <View style={[styles.progressStep, styles.completedStep]} />
          <View style={[styles.progressStep, styles.activeStep]} />
          <View style={styles.progressStep} />
        </View>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Zamanınızı ayarlayın</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <View style={styles.content}>
        {/* Saat : Dakika +/− */}
        <View style={styles.timeCard}>
          {/* Saat */}
          <View style={styles.wheelCol}>
            <TouchableOpacity onPress={increaseHour} style={styles.arrowBtn}>
              <Ionicons name="chevron-up" size={28} color="#005CEE" />
            </TouchableOpacity>
            <Text style={styles.timeValue}>{selectedHour}</Text>
            <TouchableOpacity onPress={decreaseHour} style={styles.arrowBtn}>
              <Ionicons name="chevron-down" size={28} color="#005CEE" />
            </TouchableOpacity>
          </View>

          <Text style={styles.colon}>:</Text>

          {/* Dakika */}
          <View style={styles.wheelCol}>
            <TouchableOpacity onPress={increaseMinute} style={styles.arrowBtn}>
              <Ionicons name="chevron-up" size={28} color="#005CEE" />
            </TouchableOpacity>
            <Text style={styles.timeValue}>{selectedMinute}</Text>
            <TouchableOpacity onPress={decreaseMinute} style={styles.arrowBtn}>
              <Ionicons name="chevron-down" size={28} color="#005CEE" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hızlı seçimler */}
        <View style={styles.quickRow}>
          {QUICK_TIMES.map((time) => {
            const isActive = `${selectedHour}:${selectedMinute}` === time;
            return (
              <TouchableOpacity
                key={time}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => {
                  const [h, m] = time.split(':');
                  setSelectedHour(h);
                  setSelectedMinute(m);
                }}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{time}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={() => router.push({
            pathname: '/notes',
            params: {
              name: medicationName,
              dosage,
              frequency,
              startDate,
              scheduleTime: `${selectedHour}:${selectedMinute}`
            }
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
  content: { flex: 1, paddingHorizontal: 20, alignItems: 'center', paddingTop: 30 },

  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 40,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#F0F0F5',
  },
  wheelCol: { alignItems: 'center' },
  arrowBtn: { padding: 8 },
  timeValue: { fontSize: 56, fontWeight: '700', color: '#005CEE', minWidth: 80, textAlign: 'center' },
  colon: { fontSize: 48, fontWeight: '700', color: '#333', marginHorizontal: 12, marginBottom: 4 },

  quickRow: { flexDirection: 'row', gap: 10 },
  chip: {
    paddingVertical: 10, paddingHorizontal: 18,
    borderRadius: 20, backgroundColor: '#F2F2F7',
  },
  chipActive: { backgroundColor: '#005CEE' },
  chipText: { fontSize: 15, fontWeight: '600', color: '#333' },
  chipTextActive: { color: 'white' },

  footer: { padding: 20, paddingBottom: Platform.OS === 'ios' ? 30 : 20 },
  nextBtn: { backgroundColor: '#005CEE', height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  nextBtnText: { color: 'white', fontSize: 18, fontWeight: '600' },
});
