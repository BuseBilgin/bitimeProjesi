import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StatusBar,
  Dimensions,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 50; 

// dozaj değerleri
const DOSE_VALUES = Array.from({ length: 4 }, (_, i) => ((i + 1) * 0.5).toString());

// ilaç formları
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
  const [selectedDose, setSelectedDose] = useState('1.0');
  const [selectedForm, setSelectedForm] = useState('kapsul');
  const medicationName = Array.isArray(params.name) ? params.name[0] : params.name || '';

  // seçilen doz
  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    if (DOSE_VALUES[index]) {
      setSelectedDose(DOSE_VALUES[index]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* progress bar */}
      <View style={styles.header}>
        <View style={styles.progressWrapper}>
          <View style={[styles.progressStep, styles.completedStep]} />
          <View style={[styles.progressStep, styles.activeStep]} />
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
        {/* Wheel picker */}
        <View style={styles.pickerWrapper}>
          {/* seçim çizgileri */}
          <View style={styles.selectionLinesContainer}>
            <View style={styles.selectionLine} />
            <View style={styles.selectionLine} />
          </View>
          
          <FlatList
            data={DOSE_VALUES}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            onMomentumScrollEnd={onMomentumScrollEnd}
            contentContainerStyle={{
              paddingVertical: ITEM_HEIGHT 
            }}
            renderItem={({ item }) => (
              <View style={[styles.doseItem, { height: ITEM_HEIGHT }]}>
                <Text style={[
                  styles.doseText, 
                  selectedDose === item ? styles.activeDoseText : styles.inactiveDoseText
                ]}>
                  {item}
                </Text>
              </View>
            )}
          />
        </View>

        {/* form seçim */}
        <View style={styles.gridContainer}>
          {FORMS.map((form) => {
            const isActive = selectedForm === form.id;
            return (
              <TouchableOpacity
                key={form.id}
                onPress={() => setSelectedForm(form.id)}
                style={styles.gridItemWrapper}
              >
                <View style={[styles.iconBox, isActive && styles.activeIconBox]}>
                  {form.type === 'material' ? (
                    <MaterialCommunityIcons 
                      name={form.icon as any} 
                      size={30} 
                      color={isActive ? '#005CEE' : '#333'} 
                    />
                  ) : (
                    <FontAwesome5 
                      name={form.icon} 
                      size={24} 
                      color={isActive ? '#005CEE' : '#333'} 
                    />
                  )}
                </View>
                <Text style={[styles.formLabel, isActive && styles.activeFormLabel]}>
                  {form.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* sonraki */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.nextBtn}
          onPress={() => {
            const selectedFormLabel = FORMS.find((form) => form.id === selectedForm)?.label || 'Kapsül';
            router.push({
              pathname: '/frequency',
              params: {
                name: medicationName,
                dosage: `${selectedDose} ${selectedFormLabel}`
              }
            });
          }} 
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
  content: { flex: 1, paddingHorizontal: 20, alignItems: 'center' },
  
  
  pickerWrapper: {
    height: ITEM_HEIGHT * 3,
    width: '100%',
    marginVertical: 30,
    justifyContent: 'center',
  },
  selectionLinesContainer: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    justifyContent: 'space-between',
  },
  selectionLine: {
    height: 1,
    backgroundColor: '#F2F2F2',
    width: '100%',
  },
  doseItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  doseText: {
    fontSize: 22,
    fontWeight: '500',
  },
  activeDoseText: {
    color: '#005CEE',
    fontSize: 26,
    fontWeight: 'bold',
  },
  inactiveDoseText: {
    color: '#E5E5EA',
  },

  
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'flex-start',
  },
  gridItemWrapper: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBox: {
    width: 65,
    height: 65,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#F2F2F2',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  activeIconBox: {
    borderColor: '#005CEE',
    backgroundColor: '#F5F9FF',
  },
  formLabel: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  activeFormLabel: {
    color: '#005CEE',
    fontWeight: '600',
  },

 
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  nextBtn: {
    backgroundColor: '#005CEE',
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});