import React, { useState, useMemo, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Image,
  Switch,
  Platform,
  Alert,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; 
import { getToken } from '@/src/lib/auth';
import { getMedicationsRequest, getAllDrugsRequest, OpenFDADrug } from '@/src/lib/api';

const INITIAL_MEDS = [
  { id: '1', name: 'Metformin', type: 'Günlük | 1 Kapsül', startDate: '25 Temmuz\'da başladı', stock: '10 Kapsül kaldı', active: true, image: 'https://cdn-icons-png.flaticon.com/512/883/883356.png' },
  { id: '2', name: 'Captopril', type: 'Günlük | 1 Kapsül', startDate: '25 Temmuz\'da başladı', stock: '10 Kapsül kaldı', active: true, image: 'https://cdn-icons-png.flaticon.com/512/883/883356.png' },
  { id: '3', name: 'Sudafed Burun tıkanıklığı', type: 'Günlük | 2 Damla', startDate: '25 Temmuz\'da başladı', stock: '? Kapsül kaldı', active: false, image: 'https://cdn-icons-png.flaticon.com/512/883/883356.png' },
  { id: '4', name: 'B 12', type: 'Günlük | 1 Kapsül', startDate: '25 Temmuz\'da başladı', stock: '10 Kapsül kaldı', active: true, image: 'https://cdn-icons-png.flaticon.com/512/883/883356.png' },
  { id: '5', name: 'Magaldrate', type: 'Günlük | 1 Kapsül', startDate: '25 Temmuz\'da başladı', stock: '10 Kapsül kaldı', active: false, image: 'https://cdn-icons-png.flaticon.com/512/883/883356.png' },
  { id: '6', name: 'Niacin', type: 'Günlük | 1 Kapsül', startDate: '25 Temmuz\'da başladı', stock: '10 Kapsül kaldı', active: true, image: 'https://cdn-icons-png.flaticon.com/512/883/883356.png' },
  { id: '7', name: 'I-DAMLA MGD', type: 'Günlük | 2 Damla', startDate: '25 Temmuz\'da başladı', stock: '10 Kapsül kaldı', active: true, image: 'https://cdn-icons-png.flaticon.com/512/883/883356.png' },
];

export default function MedicationsScreen() {
  const router = useRouter(); 
  const [activeTab, setActiveTab] = useState('Hepsi');
  const [medications, setMedications] = useState(INITIAL_MEDS);

  useFocusEffect(
    useCallback(() => {
      const loadMedications = async () => {
        try {
          const token = await getToken();
          if (!token) return;

          const apiMedications = await getMedicationsRequest(token);
          const mapped = apiMedications.map((med) => {
            const rawDate = med.start_date ? String(med.start_date).split('T')[0].split(' ')[0] : '';
            const formattedDate = (() => {
              if (!rawDate) return 'Başlangıç tarihi yok';
              const trMonths = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
              const parts = rawDate.split('-');
              if (parts.length !== 3) return rawDate;
              return `${parseInt(parts[2])} ${trMonths[parseInt(parts[1]) - 1]} ${parts[0]}'da başladı`;
            })();
            return {
            id: String(med.id),
            name: med.name,
            type: `${med.frequency || 'Belirtilmedi'} | ${med.dosage || '-'}`,
            startDate: formattedDate,
            rawDosage: med.dosage || '',
            rawFrequency: med.frequency || '',
            scheduleTime: med.schedule_time || '',
            rawStartDate: rawDate,
            note: med.note || '',
            stock: 'Stok bilgisi yok',
            active: true,
            image: 'https://cdn-icons-png.flaticon.com/512/883/883356.png'
          };
          });

          setMedications(mapped);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'İlaçlar yüklenemedi.';
          Alert.alert('Uyarı', message);
        }
      };

      loadMedications();
    }, [])
  );

  const toggleSwitch = (id: string) => {
    const target = medications.find((item) => item.id === id);
    setMedications(prev => prev.map(m => m.id === id ? { ...m, active: !m.active } : m));

    if (target) {
      const nextValue = !target.active;
      Alert.alert('Bilgi', `${target.name} ${nextValue ? 'aktif' : 'inaktif'} duruma alındı.`);
    }
  };

  const counts = useMemo(() => ({
    all: medications.length,
    active: medications.filter(m => m.active).length,
    inactive: medications.filter(m => !m.active).length,
  }), [medications]);

  const filteredMeds = useMemo(() => {
    if (activeTab === 'Aktif') return medications.filter(m => m.active);
    if (activeTab === 'İnaktif') return medications.filter(m => !m.active);
    return medications;
  }, [activeTab, medications]);

  const renderMedItem = ({ item }: { item: typeof INITIAL_MEDS[0] }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      style={[styles.medCard, !item.active && styles.medCardInactive]}
      onPress={() => {
        
        router.push({
          pathname: '/medication-details',
          params: {
            id: item.id,
            name: item.name,
            image: item.image,
            dosage: item.rawDosage,
            frequency: item.rawFrequency,
            scheduleTime: item.scheduleTime,
            startDate: item.rawStartDate,
            note: item.note,
          }
        });
      }}
    >
      <Image source={{ uri: item.image }} style={[styles.medIcon, !item.active && { opacity: 0.5 }]} />
      <View style={styles.medInfo}>
        <Text style={[styles.medName, !item.active && styles.inactiveText]}>{item.name}</Text>
        <Text style={styles.medDetails}>{item.type}</Text>
        <Text style={styles.medSubDetails}>{item.startDate} | {item.stock}</Text>
      </View>
      <Switch
        value={item.active}
        onValueChange={() => toggleSwitch(item.id)}
        trackColor={{ false: "#E5E5EA", true: "#005CEE" }}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>İlaçlarım</Text>
        <TouchableOpacity 
          style={styles.interactionsButton}
          onPress={() => router.push('/drug-interactions')}
        >
          <Ionicons name="warning" size={18} color="#FF9500" />
          <Text style={styles.interactionsButtonText}>Etkileşimler</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {[
          { label: 'Hepsi', key: 'Hepsi', count: counts.all },
          { label: 'Aktif', key: 'Aktif', count: counts.active },
          { label: 'İnaktif', key: 'İnaktif', count: counts.inactive }
        ].map((tab) => (
          <TouchableOpacity 
            key={tab.key} 
            style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label} <Text style={styles.tabCount}>{tab.count}</Text>
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredMeds}
        keyExtractor={(item) => item.id}
        renderItem={renderMedItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* alt bar */}
      <View style={styles.bottomTab}>
        <TouchableOpacity onPress={() => router.push('/home')} style={styles.navItem}>
          <Ionicons name="home-outline" size={24} color="#999" />
          <Text style={styles.navText}>Bugün</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="pill" size={24} color="#005CEE" style={{ transform: [{ rotate: '45deg' }] }} />
          <Text style={[styles.navText, { color: '#005CEE' }]}>İlaçlarım</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/add')} style={styles.navItem}>
          <View style={styles.addIconBorder}><Ionicons name="add" size={20} color="#999" /></View>
          <Text style={styles.navText}>İlaç Ekle</Text>
        </TouchableOpacity>
        <TouchableOpacity
                  style={styles.navItem}
                  onPress={() => {
                    router.push("/settings");
                  }}
                >
                  <Ionicons name="settings-outline" size={26} color="#9E9E9E" />
                  <Text style={styles.navText}>Ayarlar</Text>
                </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { padding: 20, alignItems: 'center', backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#333', flex: 1 },
  interactionsButton: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF3E0', 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 8, 
    alignItems: 'center',
    gap: 5
  },
  interactionsButtonText: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: '#FF9500' 
  },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 15 },
  tabButton: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 12, backgroundColor: 'white', minWidth: '30%', alignItems: 'center', elevation: 1 },
  tabButtonActive: { backgroundColor: '#005CEE' },
  tabText: { fontSize: 13, color: '#999', fontWeight: '600' },
  tabTextActive: { color: 'white' },
  tabCount: { fontSize: 11, opacity: 0.7 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  medCard: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 20, alignItems: 'center', marginBottom: 12, elevation: 2 },
  medCardInactive: { backgroundColor: '#F2F2F7' },
  medIcon: { width: 45, height: 45, borderRadius: 10, marginRight: 15 },
  medInfo: { flex: 1 },
  medName: { fontSize: 16, fontWeight: '700', color: '#333' },
  inactiveText: { color: '#8E8E93' },
  medDetails: { fontSize: 13, color: '#666', marginTop: 2 },
  medSubDetails: { fontSize: 11, color: '#999', marginTop: 2 },
  bottomTab: { position: 'absolute', bottom: 0, width: '100%', height: 80, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F2F2F2' },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 11, color: '#999', marginTop: 4 },
  addIconBorder: { borderWidth: 1.5, borderColor: '#999', borderRadius: 6, padding: 1 },
});