import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Dimensions,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 45; 

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
const QUICK_TIMES = ['08:00', '12:00', '18:00', '24:00'];

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

  const onScrollHour = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    if (HOURS[index]) setSelectedHour(HOURS[index]);
  };

  const onScrollMinute = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    if (MINUTES[index]) setSelectedMinute(MINUTES[index]);
  };

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
        <View style={styles.pickerContainer}>
          <View style={styles.selectionLinesIndicator}>
            <View style={styles.line} />
            <View style={styles.line} />
          </View>

          <View style={styles.wheelsWrapper}>
            <View style={styles.wheel}>
              <FlatList
                data={HOURS}
                keyExtractor={(item) => `h-${item}`}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onMomentumScrollEnd={onScrollHour}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
                renderItem={({ item }) => (
                  <View style={styles.itemContainer}>
                    <Text style={[styles.pickerText, selectedHour === item ? styles.activeText : styles.inactiveText]}>
                      {item}
                    </Text>
                  </View>
                )}
              />
            </View>

            <Text style={styles.separator}>:</Text>

            <View style={styles.wheel}>
              <FlatList
                data={MINUTES}
                keyExtractor={(item) => `m-${item}`}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onMomentumScrollEnd={onScrollMinute}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
                renderItem={({ item }) => (
                  <View style={styles.itemContainer}>
                    <Text style={[styles.pickerText, selectedMinute === item ? styles.activeText : styles.inactiveText]}>
                      {item}
                    </Text>
                  </View>
                )}
              />
            </View>
          </View>
        </View>

        <View style={styles.quickTimesContainer}>
          {QUICK_TIMES.map((time) => (
            <TouchableOpacity 
              key={time} 
              style={styles.timeChip}
              onPress={() => {
                const [h, m] = time.split(':');
                setSelectedHour(h);
                setSelectedMinute(m);
              }}
            >
              <Text style={styles.timeChipText}>{time}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.doneBtn} 
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
          <Text style={styles.doneBtnText}>Sonraki</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { paddingHorizontal: 20, paddingTop: 10 },
  progressWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  progressStep: {
    height: 3,
    flex: 1,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  completedStep: { backgroundColor: '#005CEE', opacity: 0.4 },
  activeStep: { backgroundColor: '#005CEE' },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  content: { flex: 1, paddingHorizontal: 20, alignItems: 'center', paddingTop: 30 },
  pickerContainer: {
    height: ITEM_HEIGHT * 5,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 40,
  },
  selectionLinesIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    justifyContent: 'space-between',
    zIndex: -1,
  },
  line: {
    height: 1,
    backgroundColor: '#F2F2F2',
    width: '100%',
  },
  wheelsWrapper: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  wheel: {
    height: ITEM_HEIGHT * 5,
    width: 70,
  },
  separator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 5
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 22,
    fontWeight: '500',
  },
  activeText: {
    color: '#333',
    fontSize: 26,
    fontWeight: 'bold',
  },
  inactiveText: {
    color: '#E5E5EA',
  },
  quickTimesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  timeChip: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    minWidth: 75,
    alignItems: 'center',
  },
  timeChipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  doneBtn: {
    backgroundColor: '#005CEE',
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});