import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Switch,
  ScrollView,
  StatusBar,
  Modal,
  Pressable,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { getToken } from '@/src/lib/auth';
import { deleteMedicationRequest } from '@/src/lib/api';


LocaleConfig.locales['tr'] = {
  monthNames: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
  monthNamesShort: ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],
  dayNames: ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'],
  dayNamesShort: ['Pz','Pt','Sa','Ça','Pe','Cu','Ct'],
  today: 'Bugün'
};
LocaleConfig.defaultLocale = 'tr';

export default function MedicationDetails() {
  const router = useRouter();
  const { id, name, image } = useLocalSearchParams();
  const [isActive, setIsActive] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  

  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [isTimeVisible, setIsTimeVisible] = useState(false);
  const [isFrequencyVisible, setIsFrequencyVisible] = useState(false);
  const [isDosageVisible, setIsDosageVisible] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isNoteVisible, setIsNoteVisible] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);

 
  const [selectedDate, setSelectedDate] = useState('2026-07-25');
  const [note, setNote] = useState('');

  const onDayPress = (day: any) => {
    setSelectedDate(day.dateString);
  };

  const getFormattedDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  const handleToggleActive = (nextValue: boolean) => {
    setIsActive(nextValue);
    Alert.alert('Bilgi', `${name || 'İlaç'} ${nextValue ? 'aktif' : 'inaktif'} duruma alındı.`);
  };

  const handleDeleteMedication = async () => {
    if (!id) {
      Alert.alert('Hata', 'İlaç kimliği bulunamadı.');
      return;
    }

    try {
      setIsDeleting(true);
      const token = await getToken();

      if (!token) {
        Alert.alert('Oturum Hatası', 'Lütfen yeniden giriş yapın.');
        router.replace('/login');
        return;
      }

      await deleteMedicationRequest(token, String(id));
      setIsDeleteVisible(false);
      Alert.alert('Başarılı', 'İlaç silindi.', [
        { text: 'Tamam', onPress: () => router.replace('/medications') }
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'İlaç silinemedi.';
      Alert.alert('Hata', message);
    } finally {
      setIsDeleting(false);
    }
  };


  const PickerWheel = ({ items, activeIndex = 1 }: { items: string[], activeIndex?: number }) => (
    <View style={styles.pickerColumn}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 60 }}>
        {items.map((item, index) => (
          <Text key={index} style={[styles.pickerItem, index === activeIndex && styles.pickerItemActive]}>
            {item}
          </Text>
        ))}
      </ScrollView>
    </View>
  );

  const InfoCard = ({ label, value, icon, onPress }: any) => (
    <TouchableOpacity style={styles.infoCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.infoCardHeader}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Ionicons name="chevron-forward" size={14} color="#C7C7CC" />
      </View>
      <View style={styles.infoContent}>
        <View style={styles.iconContainer}>{icon}</View>
        <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İlaç ayrıntıları</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mainCard}>
          <Image source={{ uri: image as string || 'https://via.placeholder.com/50' }} style={styles.medImage} />
          <Text style={styles.medName}>{name}</Text>
          <Switch 
            value={isActive} 
            onValueChange={handleToggleActive} 
            trackColor={{ false: "#E5E5EA", true: "#005CEE" }} 
          />
        </View>

        <Text style={styles.sectionTitle}>Takvim</Text>
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <InfoCard 
              label="Başlangıç tarihi" 
              value={getFormattedDate(selectedDate)} 
              icon={<Ionicons name="calendar-outline" size={18} color="#666" />}
              onPress={() => setIsCalendarVisible(true)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <InfoCard 
              label="Zaman" 
              value="09:45" 
              icon={<Ionicons name="time-outline" size={18} color="#666" />} 
              onPress={() => setIsTimeVisible(true)}
            />
          </View>
        </View>

        <InfoCard 
          label="Sıklık" 
          value="Her 6 saatte bir, günde 3 defa." 
          icon={<Ionicons name="sync-outline" size={18} color="#666" />} 
          onPress={() => setIsFrequencyVisible(true)}
        />

        <Text style={styles.sectionTitle}>Doz</Text>
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <InfoCard 
              label="Doz miktarı" 
              value="1 Tablet" 
              icon={<MaterialCommunityIcons name="pill" size={18} color="#666" />} 
              onPress={() => setIsDosageVisible(true)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <InfoCard 
              label="İlk stok" 
              value="30 Hap" 
              icon={<Ionicons name="cube-outline" size={18} color="#666" />} 
              onPress={() => setIsFormVisible(true)}
            />
          </View>
        </View>

        <InfoCard 
          label="Not" 
          value={note || "İlaçla ilgili isteğe bağlı not"} 
          icon={<Ionicons name="document-text-outline" size={18} color="#666" />} 
          onPress={() => setIsNoteVisible(true)}
        />

        <View style={styles.summaryBar}>
          <View style={styles.summaryItem}>
            <Ionicons name="checkmark-circle" size={16} color="#005CEE" />
            <Text style={styles.summaryText}> 20 hap alındı</Text>
          </View>
          <View style={styles.summaryDivider} />
          <Text style={styles.summaryText}>23 gün önce başladı</Text>
        </View>

        {/* ilacı sil */}
        <TouchableOpacity 
          style={styles.deleteMainBtn} 
          onPress={() => setIsDeleteVisible(true)}
        >
          <Text style={styles.deleteMainBtnText}>İlacı sil</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* silme onay */}
      <Modal visible={isDeleteVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setIsDeleteVisible(false)}>
          <View style={styles.deleteModalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.deleteTitle}>{name} silinsin mi?</Text>
            <Text style={styles.deleteSubTitle}>Bu ilaca ilişkin tüm veriler kaybolacaktır.</Text>
            
            <View style={styles.deleteActionRow}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setIsDeleteVisible(false)}
              >
                <Text style={styles.cancelBtnText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmDeleteBtn} 
                onPress={handleDeleteMedication}
                disabled={isDeleting}
              >
                {isDeleting ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmDeleteBtnText}>Sil</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* not */}
      <Modal visible={isNoteVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setIsNoteVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Not</Text>
              <TouchableOpacity onPress={() => setIsNoteVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.noteInputContainer}>
              <TextInput
                style={styles.noteInput}
                placeholder="İlaçla ilgili isteğe bağlı not"
                value={note}
                onChangeText={setNote}
                multiline
              />
            </View>
            <TouchableOpacity style={styles.doneBtn} onPress={() => setIsNoteVisible(false)}>
              <Text style={styles.doneBtnText}>Tamamlandı</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* form */}
      <Modal visible={isFormVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setIsFormVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Formu Seçiniz</Text>
              <TouchableOpacity onPress={() => setIsFormVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.pickerContainer}>
              <View style={styles.selectionIndicator} />
              <PickerWheel items={['Kapsül', 'Hap', 'Damla', 'Şurup', 'Enjeksiyon']} activeIndex={2} />
            </View>
            <TouchableOpacity style={styles.doneBtn} onPress={() => setIsFormVisible(false)}>
              <Text style={styles.doneBtnText}>Tamamlandı</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* dozaj */}
      <Modal visible={isDosageVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setIsDosageVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dozaj Seçiniz</Text>
              <TouchableOpacity onPress={() => setIsDosageVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.pickerContainer}>
              <View style={styles.selectionIndicator} />
              <PickerWheel items={['0.5', '1', '2']} />
            </View>
            <TouchableOpacity style={styles.doneBtn} onPress={() => setIsDosageVisible(false)}>
              <Text style={styles.doneBtnText}>Tamamlandı</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* zaman */}
      <Modal visible={isTimeVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setIsTimeVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Zamanı Ayarlayın</Text>
              <TouchableOpacity onPress={() => setIsTimeVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.pickerContainer}>
              <View style={styles.selectionIndicator} />
              <PickerWheel items={['23','24','01']} />
              <PickerWheel items={['58','59','00']} />
            </View>
            <TouchableOpacity style={styles.doneBtn} onPress={() => setIsTimeVisible(false)}>
              <Text style={styles.doneBtnText}>Tamamlandı</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* sıklık */}
      <Modal visible={isFrequencyVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setIsFrequencyVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sıklığı Ayarlayın</Text>
              <TouchableOpacity onPress={() => setIsFrequencyVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.pickerContainer}>
              <View style={styles.selectionIndicator} />
              <PickerWheel items={['Her']} />
              <PickerWheel items={['1','2','3']} />
              <PickerWheel items={['Gün','Saat','Hafta']} />
            </View>
            <TouchableOpacity style={styles.doneBtn} onPress={() => setIsFrequencyVisible(false)}>
              <Text style={styles.doneBtnText}>Tamamlandı</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* takvim */}
      <Modal visible={isCalendarVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setIsCalendarVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tarih Seçin</Text>
              <TouchableOpacity onPress={() => setIsCalendarVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Calendar
              current={selectedDate}
              onDayPress={onDayPress}
              markedDates={{ [selectedDate]: { selected: true, selectedColor: "#005CEE" } }}
              theme={{ todayTextColor: "#005CEE", selectedDayBackgroundColor: "#005CEE", arrowColor: "#005CEE", textMonthFontWeight: "bold" }}
              style={styles.calendarStyle}
            />
            <TouchableOpacity style={styles.doneBtn} onPress={() => setIsCalendarVisible(false)}>
              <Text style={styles.doneBtnText}>Tamamlandı</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'white' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  mainCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 20, marginBottom: 25, elevation: 1 },
  medImage: { width: 50, height: 50, borderRadius: 12, marginRight: 15 },
  medName: { flex: 1, fontSize: 18, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#333' },
  row: { flexDirection: 'row', marginBottom: 10 },
  infoCard: { backgroundColor: 'white', padding: 15, borderRadius: 15, marginBottom: 10, elevation: 1 },
  infoCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { fontSize: 12, color: '#999', fontWeight: '500' },
  infoContent: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#333' },
  summaryBar: { flexDirection: 'row', backgroundColor: '#F2F2F7', padding: 12, borderRadius: 12, marginTop: 20, justifyContent: 'center', alignItems: 'center' },
  summaryItem: { flexDirection: 'row', alignItems: 'center' },
  summaryDivider: { width: 1, height: 15, backgroundColor: '#DDD', marginHorizontal: 15 },
  summaryText: { fontSize: 12, color: '#666', fontWeight: '500' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 25 },
  modalHandle: { width: 40, height: 5, backgroundColor: '#E5E5EA', borderRadius: 3, alignSelf: 'center', marginBottom: 15 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  calendarStyle: { borderRadius: 10, marginBottom: 10 },
  doneBtn: { backgroundColor: '#005CEE', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  doneBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  
  pickerContainer: { flexDirection: 'row', height: 160, marginVertical: 20, justifyContent: 'center' },
  pickerColumn: { flex: 1, alignItems: 'center' },
  pickerItem: { fontSize: 18, color: '#C7C7CC', marginVertical: 8 },
  pickerItemActive: { fontSize: 22, color: '#000', fontWeight: '600' },
  selectionIndicator: { position: 'absolute', top: 60, left: 20, right: 20, height: 40, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F2F2F7' },
  
  noteInputContainer: { marginVertical: 20, padding: 15, backgroundColor: '#F8F9FB', borderRadius: 15, borderWidth: 1, borderColor: '#E5E5EA' },
  noteInput: { fontSize: 16, color: '#333', minHeight: 60, textAlignVertical: 'top' },

  
  deleteMainBtn: { marginTop: 30, padding: 15, alignItems: 'center' },
  deleteMainBtnText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' },
  deleteModalContent: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, paddingBottom: 40, alignItems: 'center' },
  deleteTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 10, marginTop: 10 },
  deleteSubTitle: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 25 },
  deleteActionRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  cancelBtn: { flex: 1, backgroundColor: '#F2F2F7', padding: 18, borderRadius: 15, marginRight: 10, alignItems: 'center' },
  cancelBtnText: { color: '#8E8E93', fontSize: 16, fontWeight: '700' },
  confirmDeleteBtn: { flex: 1, backgroundColor: '#FF3B30', padding: 18, borderRadius: 15, marginLeft: 10, alignItems: 'center' },
  confirmDeleteBtnText: { color: 'white', fontSize: 16, fontWeight: '700' }
});