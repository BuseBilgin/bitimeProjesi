import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Modal, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, LocaleConfig } from "react-native-calendars";

LocaleConfig.locales["tr"] = {
  monthNames: ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"],
  monthNamesShort: ["Oca.","Şub.","Mar.","Nis.","May.","Haz.","Tem.","Ağu.","Eyl.","Eki.","Kas.","Ara."],
  dayNames: ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"],
  dayNamesShort: ["Pz","P","S","Ç","P","C","Ct"],
  today: "Bugün",
};
LocaleConfig.defaultLocale = "tr";

const NUMBERS = Array.from({ length: 30 }, (_, i) => (i + 1).toString());
const UNITS = ["Gün", "Saat", "Hafta", "Ay"];

export default function FrequencyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string | string[]; dosage?: string | string[] }>();
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [selectedNum, setSelectedNum] = useState("1");
  const [selectedUnit, setSelectedUnit] = useState("Gün");

  const getLocalDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const getInitialDate = () => getLocalDateString();
  const getInitialDisplayDate = () => {
    const today = new Date();
    const months = LocaleConfig.locales["tr"].monthNames;
    return `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
  };
  const [selectedDate, setSelectedDate] = useState(getInitialDate());
  const [displayDate, setDisplayDate] = useState(getInitialDisplayDate());

  const medicationName = Array.isArray(params.name) ? params.name[0] : params.name || '';
  const dosage = Array.isArray(params.dosage) ? params.dosage[0] : params.dosage || '';

  const numIndex = NUMBERS.indexOf(selectedNum);
  const decreaseNum = () => { if (numIndex > 0) setSelectedNum(NUMBERS[numIndex - 1]); };
  const increaseNum = () => { if (numIndex < NUMBERS.length - 1) setSelectedNum(NUMBERS[numIndex + 1]); };

  const onDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    const months = LocaleConfig.locales["tr"].monthNames;
    const parts = day.dateString.split("-");
    setDisplayDate(`${parseInt(parts[2])} ${months[parseInt(parts[1]) - 1]} ${parts[0]}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.progressWrapper}>
          <View style={[styles.progressStep, styles.completedStep]} />
          <View style={[styles.progressStep, styles.completedStep]} />
          <View style={[styles.progressStep, styles.activeStep]} />
          <View style={styles.progressStep} />
          <View style={styles.progressStep} />
        </View>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sıklık</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <View style={styles.content}>
        {/* Sıklık seçici */}
        <View style={styles.frequencyCard}>
          <Text style={styles.everyLabel}>Her</Text>

          {/* Sayı +/− */}
          <View style={styles.stepperRow}>
            <TouchableOpacity
              onPress={decreaseNum}
              style={[styles.stepBtn, numIndex === 0 && styles.stepBtnDisabled]}
              disabled={numIndex === 0}
            >
              <Text style={styles.stepBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.numValue}>{selectedNum}</Text>
            <TouchableOpacity
              onPress={increaseNum}
              style={[styles.stepBtn, numIndex === NUMBERS.length - 1 && styles.stepBtnDisabled]}
              disabled={numIndex === NUMBERS.length - 1}
            >
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Birim seçimi */}
          <View style={styles.unitsRow}>
            {UNITS.map((unit) => (
              <TouchableOpacity
                key={unit}
                onPress={() => setSelectedUnit(unit)}
                style={[styles.unitChip, selectedUnit === unit && styles.unitChipActive]}
              >
                <Text style={[styles.unitChipText, selectedUnit === unit && styles.unitChipTextActive]}>
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Başlangıç tarihi */}
        <TouchableOpacity style={styles.dateSelector} onPress={() => setCalendarVisible(true)}>
          <View style={styles.dateLeft}>
            <Ionicons name="calendar-outline" size={20} color="#333" />
            <Text style={styles.dateLabel}>Başlangıç Tarihi</Text>
          </View>
          <View style={styles.dateRight}>
            <Text style={styles.dateValue}>{displayDate}</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={() => router.push({
            pathname: "/schedule",
            params: {
              name: medicationName,
              dosage,
              frequency: `Her ${selectedNum} ${selectedUnit.toLowerCase()}`,
              startDate: selectedDate,
            }
          })}
        >
          <Text style={styles.nextBtnText}>Sonraki</Text>
        </TouchableOpacity>
      </View>

      {/* Takvim modal */}
      <Modal visible={isCalendarVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tarih Seçin</Text>
              <TouchableOpacity onPress={() => setCalendarVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Calendar
              current={selectedDate}
              onDayPress={onDayPress}
              markedDates={{ [selectedDate]: { selected: true, selectedColor: "#005CEE" } }}
              theme={{ todayTextColor: "#005CEE", selectedDayBackgroundColor: "#005CEE", arrowColor: "#005CEE", textMonthFontWeight: "bold" }}
            />
            <TouchableOpacity style={styles.doneBtn} onPress={() => setCalendarVisible(false)}>
              <Text style={styles.doneBtnText}>Tamamlandı</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: { paddingHorizontal: 20, paddingTop: 10 },
  progressWrapper: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  progressStep: { height: 3, flex: 1, backgroundColor: "#E5E5EA", marginHorizontal: 2, borderRadius: 2 },
  completedStep: { backgroundColor: "#005CEE", opacity: 0.4 },
  activeStep: { backgroundColor: "#005CEE" },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },

  frequencyCard: {
    backgroundColor: '#F8F9FB',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0F0F5',
  },
  everyLabel: { fontSize: 16, color: '#999', fontWeight: '500', marginBottom: 16 },

  stepperRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  stepBtn: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: '#EEF3FF',
    justifyContent: 'center', alignItems: 'center',
  },
  stepBtnDisabled: { opacity: 0.3 },
  stepBtnText: { fontSize: 28, color: '#005CEE', fontWeight: '300', lineHeight: 34 },
  numValue: { fontSize: 52, fontWeight: '700', color: '#005CEE', marginHorizontal: 28, minWidth: 60, textAlign: 'center' },

  unitsRow: { flexDirection: 'row', gap: 8 },
  unitChip: {
    paddingVertical: 8, paddingHorizontal: 18,
    borderRadius: 20, backgroundColor: 'white',
    borderWidth: 1.5, borderColor: '#E5E5EA',
  },
  unitChipActive: { backgroundColor: '#005CEE', borderColor: '#005CEE' },
  unitChipText: { fontSize: 14, fontWeight: '600', color: '#666' },
  unitChipTextActive: { color: 'white' },

  dateSelector: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "white", padding: 16, borderRadius: 15,
    borderWidth: 1, borderColor: "#F2F2F2",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  dateLeft: { flexDirection: "row", alignItems: "center" },
  dateLabel: { marginLeft: 10, fontSize: 16, fontWeight: "500" },
  dateRight: { flexDirection: "row", alignItems: "center" },
  dateValue: { marginRight: 8, fontSize: 16, color: "#333" },

  footer: { padding: 20, paddingBottom: Platform.OS === "ios" ? 30 : 20 },
  nextBtn: { backgroundColor: "#005CEE", height: 55, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  nextBtnText: { color: "white", fontSize: 18, fontWeight: "600" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "white", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  doneBtn: { backgroundColor: "#005CEE", height: 55, borderRadius: 15, justifyContent: "center", alignItems: "center", marginTop: 25 },
  doneBtnText: { color: "white", fontSize: 18, fontWeight: "600" },
});
