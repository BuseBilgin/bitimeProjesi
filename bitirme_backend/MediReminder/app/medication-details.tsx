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
  Platform,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { getToken } from '@/src/lib/auth';
import { deleteMedicationRequest, updateMedicationRequest } from '@/src/lib/api';

LocaleConfig.locales['tr'] = {
  monthNames: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
  monthNamesShort: ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],
  dayNames: ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'],
  dayNamesShort: ['Pz','Pt','Sa','Ça','Pe','Cu','Ct'],
  today: 'Bugün',
};
LocaleConfig.defaultLocale = 'tr';

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

export default function MedicationDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string | string[];
    name?: string | string[];
    image?: string | string[];
    dosage?: string | string[];
    frequency?: string | string[];
    scheduleTime?: string | string[];
    startDate?: string | string[];
    note?: string | string[];
  }>();

  const id = Array.isArray(params.id) ? params.id[0] : params.id || '';
  const name = Array.isArray(params.name) ? params.name[0] : params.name || '';
  const image = Array.isArray(params.image) ? params.image[0] : params.image || '';
  const initDosage = Array.isArray(params.dosage) ? params.dosage[0] : params.dosage || '';
  const initFrequency = Array.isArray(params.frequency) ? params.frequency[0] : params.frequency || '';
  const initScheduleTime = Array.isArray(params.scheduleTime) ? params.scheduleTime[0] : params.scheduleTime || '';
  const todayLocal = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();
  const rawStartDate = (Array.isArray(params.startDate) ? params.startDate[0] : params.startDate) || '';
  const initStartDate = rawStartDate ? rawStartDate.split('T')[0].split(' ')[0] : todayLocal;
  const initNote = Array.isArray(params.note) ? params.note[0] : params.note || '';

  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Kaydedilen değerler
  const [dosage, setDosage] = useState(initDosage);
  const [frequency, setFrequency] = useState(initFrequency);
  const [note, setNote] = useState(initNote);
  const [selectedDate, setSelectedDate] = useState(initStartDate);
  const [selectedHour, setSelectedHour] = useState(initScheduleTime.split(':')[0] || '08');
  const [selectedMinute, setSelectedMinute] = useState(initScheduleTime.split(':')[1] || '00');

  // Modal taslak değerleri
  const [draftDosage, setDraftDosage] = useState(initDosage);
  const [draftFrequency, setDraftFrequency] = useState(initFrequency);
  const [draftNote, setDraftNote] = useState(initNote);
  const [draftDate, setDraftDate] = useState(initStartDate);
  const [draftHour, setDraftHour] = useState(initScheduleTime.split(':')[0] || '08');
  const [draftMinute, setDraftMinute] = useState(initScheduleTime.split(':')[1] || '00');

  // Modal görünürlükleri
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [isTimeVisible, setIsTimeVisible] = useState(false);
  const [isFrequencyVisible, setIsFrequencyVisible] = useState(false);
  const [isDosageVisible, setIsDosageVisible] = useState(false);
  const [isNoteVisible, setIsNoteVisible] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (onDone: () => void) => {
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
      onDone();
    }, 1800);
  };

  const getFormattedDate = (dateStr: string) => {
    if (!dateStr) return 'Belirtilmedi';
    const datePart = dateStr.split('T')[0].split(' ')[0];
    const parts = datePart.split('-');
    if (parts.length !== 3) return 'Belirtilmedi';
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return 'Belirtilmedi';
    const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
    return `${day} ${months[month]} ${year}`;
  };

  const scheduleTimeDisplay = selectedHour && selectedMinute ? `${selectedHour}:${selectedMinute}` : 'Belirtilmedi';

  const handleSave = async () => {
    if (!id) {
      Alert.alert('Hata', 'İlaç kimliği bulunamadı.');
      return;
    }
    try {
      setIsSaving(true);
      const token = await getToken();
      if (!token) {
        Alert.alert('Oturum Hatası', 'Lütfen yeniden giriş yapın.');
        router.replace('/login');
        return;
      }
      await updateMedicationRequest(token, id, {
        dosage,
        frequency,
        schedule_time: `${selectedHour}:${selectedMinute}`,
        start_date: selectedDate,
        note,
      });
      showToast(() => router.replace('/medications'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Güncelleme başarısız.';
      Alert.alert('Hata', message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
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
      await deleteMedicationRequest(token, id);
      setIsDeleteVisible(false);
      router.replace('/medications');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'İlaç silinemedi.';
      Alert.alert('Hata', message);
    } finally {
      setIsDeleting(false);
    }
  };

  const InfoCard = ({ label, value, icon, onPress }: any) => (
    <TouchableOpacity style={styles.infoCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.infoCardHeader}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Ionicons name="chevron-forward" size={14} color="#C7C7CC" />
      </View>
      <View style={styles.infoContent}>
        <View style={styles.iconContainer}>{icon}</View>
        <Text style={styles.infoValue} numberOfLines={2}>{value || 'Belirtilmedi'}</Text>
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
          <Image
            source={{ uri: image || 'https://cdn-icons-png.flaticon.com/512/883/883356.png' }}
            style={styles.medImage}
          />
          <Text style={styles.medName}>{name}</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: '#E5E5EA', true: '#005CEE' }}
          />
        </View>

        <Text style={styles.sectionTitle}>Takvim</Text>
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <InfoCard
              label="Başlangıç tarihi"
              value={getFormattedDate(selectedDate)}
              icon={<Ionicons name="calendar-outline" size={18} color="#666" />}
              onPress={() => { setDraftDate(selectedDate); setIsCalendarVisible(true); }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <InfoCard
              label="Zaman"
              value={scheduleTimeDisplay}
              icon={<Ionicons name="time-outline" size={18} color="#666" />}
              onPress={() => {
                setDraftHour(selectedHour);
                setDraftMinute(selectedMinute);
                setIsTimeVisible(true);
              }}
            />
          </View>
        </View>

        <InfoCard
          label="Sıklık"
          value={frequency}
          icon={<Ionicons name="sync-outline" size={18} color="#666" />}
          onPress={() => { setDraftFrequency(frequency); setIsFrequencyVisible(true); }}
        />

        <Text style={styles.sectionTitle}>Doz</Text>
        <InfoCard
          label="Doz miktarı"
          value={dosage}
          icon={<MaterialCommunityIcons name="pill" size={18} color="#666" />}
          onPress={() => { setDraftDosage(dosage); setIsDosageVisible(true); }}
        />

        <InfoCard
          label="Not"
          value={note || 'İlaçla ilgili isteğe bağlı not'}
          icon={<Ionicons name="document-text-outline" size={18} color="#666" />}
          onPress={() => { setDraftNote(note); setIsNoteVisible(true); }}
        />

        <TouchableOpacity style={styles.deleteMainBtn} onPress={() => setIsDeleteVisible(true)}>
          <Text style={styles.deleteMainBtnText}>İlacı sil</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
          {isSaving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>Değişiklikleri Kaydet</Text>
          }
        </TouchableOpacity>
      </View>

      {/* Silme onayı */}
      <Modal visible={isDeleteVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setIsDeleteVisible(false)} activeOpacity={1} />
          <View style={styles.deleteModalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.deleteTitle}>{name} silinsin mi?</Text>
            <Text style={styles.deleteSubTitle}>Bu ilaca ilişkin tüm veriler kaybolacaktır.</Text>
            <View style={styles.deleteActionRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsDeleteVisible(false)}>
                <Text style={styles.cancelBtnText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmDeleteBtn} onPress={handleDelete} disabled={isDeleting}>
                {isDeleting ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmDeleteBtnText}>Sil</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Not */}
      <Modal visible={isNoteVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setIsNoteVisible(false)} activeOpacity={1} />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Not</Text>
              <TouchableOpacity onPress={() => setIsNoteVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInputField}
                placeholder="İlaçla ilgili isteğe bağlı not"
                value={draftNote}
                onChangeText={setDraftNote}
                multiline
              />
            </View>
            <TouchableOpacity style={styles.doneBtn} onPress={() => { setNote(draftNote); setIsNoteVisible(false); }}>
              <Text style={styles.doneBtnText}>Tamamlandı</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Dozaj */}
      <Modal visible={isDosageVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setIsDosageVisible(false)} activeOpacity={1} />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Doz Miktarı</Text>
              <TouchableOpacity onPress={() => setIsDosageVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInputField}
                placeholder="Örn: 1.0 Kapsül, 500mg Hap"
                value={draftDosage}
                onChangeText={setDraftDosage}
              />
            </View>
            <TouchableOpacity style={styles.doneBtn} onPress={() => { setDosage(draftDosage); setIsDosageVisible(false); }}>
              <Text style={styles.doneBtnText}>Tamamlandı</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sıklık */}
      <Modal visible={isFrequencyVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setIsFrequencyVisible(false)} activeOpacity={1} />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sıklık</Text>
              <TouchableOpacity onPress={() => setIsFrequencyVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInputField}
                placeholder="Örn: Her 1 gün, Her 8 saat"
                value={draftFrequency}
                onChangeText={setDraftFrequency}
              />
            </View>
            <TouchableOpacity style={styles.doneBtn} onPress={() => { setFrequency(draftFrequency); setIsFrequencyVisible(false); }}>
              <Text style={styles.doneBtnText}>Tamamlandı</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Zaman */}
      <Modal visible={isTimeVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setIsTimeVisible(false)} activeOpacity={1} />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Zamanı Ayarlayın</Text>
              <TouchableOpacity onPress={() => setIsTimeVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.quickTimesRow}>
              {['08:00', '12:00', '18:00', '21:00'].map(t => {
                const [h, m] = t.split(':');
                const active = draftHour === h && draftMinute === m;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[styles.quickTimeChip, active && styles.quickTimeChipActive]}
                    onPress={() => { setDraftHour(h); setDraftMinute(m); }}
                  >
                    <Text style={[styles.quickTimeText, active && styles.quickTimeTextActive]}>{t}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.timeStepperRow}>
              <View style={styles.timeStepper}>
                <TouchableOpacity onPress={() => setDraftHour(HOURS[(HOURS.indexOf(draftHour) + 1) % 24])}>
                  <Ionicons name="chevron-up" size={32} color="#005CEE" />
                </TouchableOpacity>
                <Text style={styles.timeStepValue}>{draftHour}</Text>
                <TouchableOpacity onPress={() => setDraftHour(HOURS[(HOURS.indexOf(draftHour) - 1 + 24) % 24])}>
                  <Ionicons name="chevron-down" size={32} color="#005CEE" />
                </TouchableOpacity>
              </View>
              <Text style={styles.timeSeparator}>:</Text>
              <View style={styles.timeStepper}>
                <TouchableOpacity onPress={() => setDraftMinute(MINUTES[(MINUTES.indexOf(draftMinute) + 1) % 60])}>
                  <Ionicons name="chevron-up" size={32} color="#005CEE" />
                </TouchableOpacity>
                <Text style={styles.timeStepValue}>{draftMinute}</Text>
                <TouchableOpacity onPress={() => setDraftMinute(MINUTES[(MINUTES.indexOf(draftMinute) - 1 + 60) % 60])}>
                  <Ionicons name="chevron-down" size={32} color="#005CEE" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => { setSelectedHour(draftHour); setSelectedMinute(draftMinute); setIsTimeVisible(false); }}
            >
              <Text style={styles.doneBtnText}>Tamamlandı</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Takvim */}
      <Modal visible={isCalendarVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setIsCalendarVisible(false)} activeOpacity={1} />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tarih Seçin</Text>
              <TouchableOpacity onPress={() => setIsCalendarVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Calendar
              current={draftDate}
              onDayPress={(day: any) => setDraftDate(day.dateString)}
              markedDates={{ [draftDate]: { selected: true, selectedColor: '#005CEE' } }}
              theme={{ todayTextColor: '#005CEE', selectedDayBackgroundColor: '#005CEE', arrowColor: '#005CEE', textMonthFontWeight: 'bold' }}
              style={styles.calendarStyle}
            />
            <TouchableOpacity style={styles.doneBtn} onPress={() => { setSelectedDate(draftDate); setIsCalendarVisible(false); }}>
              <Text style={styles.doneBtnText}>Tamamlandı</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {toastVisible && (
        <View style={styles.toast} pointerEvents="none">
          <Ionicons name="checkmark-circle" size={20} color="white" />
          <Text style={styles.toastText}>Kaydedildi</Text>
        </View>
      )}
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
  infoValue: { fontSize: 15, fontWeight: '600', color: '#333', flex: 1 },

  footer: { padding: 16, paddingBottom: Platform.OS === 'ios' ? 30 : 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#F0F0F5' },
  saveBtn: { backgroundColor: '#005CEE', padding: 18, borderRadius: 15, alignItems: 'center' },
  saveBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 25 },
  modalHandle: { width: 40, height: 5, backgroundColor: '#E5E5EA', borderRadius: 3, alignSelf: 'center', marginBottom: 15 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  calendarStyle: { borderRadius: 10, marginBottom: 10 },
  doneBtn: { backgroundColor: '#005CEE', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  doneBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },

  textInputContainer: { marginVertical: 20, padding: 15, backgroundColor: '#F8F9FB', borderRadius: 15, borderWidth: 1, borderColor: '#E5E5EA' },
  textInputField: { fontSize: 16, color: '#333', minHeight: 48, textAlignVertical: 'top' },

  quickTimesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  quickTimeChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E5EA', backgroundColor: 'white' },
  quickTimeChipActive: { backgroundColor: '#005CEE', borderColor: '#005CEE' },
  quickTimeText: { fontSize: 14, fontWeight: '600', color: '#666' },
  quickTimeTextActive: { color: 'white' },
  timeStepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
  timeStepper: { alignItems: 'center', paddingHorizontal: 24 },
  timeStepValue: { fontSize: 52, fontWeight: '700', color: '#005CEE', marginVertical: 6, minWidth: 70, textAlign: 'center' },
  timeSeparator: { fontSize: 36, fontWeight: 'bold', color: '#333', marginBottom: 6 },

  deleteMainBtn: { marginTop: 10, padding: 15, alignItems: 'center' },
  deleteMainBtnText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' },
  deleteModalContent: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, paddingBottom: 40, alignItems: 'center' },
  deleteTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 10, marginTop: 10 },
  deleteSubTitle: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 25 },
  deleteActionRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  cancelBtn: { flex: 1, backgroundColor: '#F2F2F7', padding: 18, borderRadius: 15, marginRight: 10, alignItems: 'center' },
  cancelBtnText: { color: '#8E8E93', fontSize: 16, fontWeight: '700' },
  confirmDeleteBtn: { flex: 1, backgroundColor: '#FF3B30', padding: 18, borderRadius: 15, marginLeft: 10, alignItems: 'center' },
  confirmDeleteBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },

  toast: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: '#1A9E5C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  toastText: { color: 'white', fontSize: 16, fontWeight: '700', marginLeft: 8 },
});
