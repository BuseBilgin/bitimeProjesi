import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Platform,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, LocaleConfig } from "react-native-calendars";


LocaleConfig.locales["tr"] = {
  monthNames: [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ],
  monthNamesShort: [
    "Oca.",
    "Şub.",
    "Mar.",
    "Nis.",
    "May.",
    "Haz.",
    "Tem.",
    "Ağu.",
    "Eyl.",
    "Eki.",
    "Kas.",
    "Ara.",
  ],
  dayNames: [
    "Pazar",
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi",
  ],
  dayNamesShort: ["Pz", "P", "S", "Ç", "P", "C", "Ct"],
  today: "Bugün",
};
LocaleConfig.defaultLocale = "tr";

const { height } = Dimensions.get("window");
const ITEM_HEIGHT = 50;

const NUMBERS = Array.from({ length: 30 }, (_, i) => (i + 1).toString());
const UNITS = ["Gün", "Saat", "Hafta", "Ay"];

export default function FrequencyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string | string[]; dosage?: string | string[] }>();
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [selectedNum, setSelectedNum] = useState("1");
  const [selectedUnit, setSelectedUnit] = useState("Gün");


  const [selectedDate, setSelectedDate] = useState("2026-07-25");
  const [displayDate, setDisplayDate] = useState("25 Temmuz 2026");
  const medicationName = Array.isArray(params.name) ? params.name[0] : params.name || '';
  const dosage = Array.isArray(params.dosage) ? params.dosage[0] : params.dosage || '';

  const onScrollNum = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    if (NUMBERS[index]) setSelectedNum(NUMBERS[index]);
  };

  const onScrollUnit = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    if (UNITS[index]) setSelectedUnit(UNITS[index]);
  };

  const onDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    const months = LocaleConfig.locales["tr"].monthNames;
    const dateParts = day.dateString.split("-"); 
    const year = dateParts[0];
    const monthName = months[parseInt(dateParts[1]) - 1];
    const dayNum = parseInt(dateParts[2]);
    setDisplayDate(`${dayNum} ${monthName} ${year}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* progress bar */}
      <View style={styles.header}>
        <View style={styles.progressWrapper}>
          <View style={[styles.progressStep, styles.completedStep]} />
          <View style={[styles.progressStep, styles.completedStep]} />
          <View style={[styles.progressStep, styles.activeStep]} />
          <View style={styles.progressStep} />
        </View>

        <View style={styles.titleRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sıklık</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <View style={styles.content}>
        {/* picker */}
        <View style={styles.pickerWrapper}>
          <View style={styles.selectionIndicator} />

          <View style={styles.pickerColumn}>
            <View style={styles.itemContainer}>
              <Text style={styles.pickerTextMain}>Her</Text>
            </View>
          </View>

          <View style={styles.pickerColumn}>
            <FlatList
              data={NUMBERS}
              keyExtractor={(item) => item}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              onMomentumScrollEnd={onScrollNum}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
              renderItem={({ item }) => (
                <View style={styles.itemContainer}>
                  <Text
                    style={[
                      styles.pickerText,
                      selectedNum === item
                        ? styles.activeText
                        : styles.inactiveText,
                    ]}
                  >
                    {item}
                  </Text>
                </View>
              )}
            />
          </View>

          <View style={styles.pickerColumn}>
            <FlatList
              data={UNITS}
              keyExtractor={(item) => item}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              onMomentumScrollEnd={onScrollUnit}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
              renderItem={({ item }) => (
                <View style={styles.itemContainer}>
                  <Text
                    style={[
                      styles.pickerText,
                      selectedUnit === item
                        ? styles.activeText
                        : styles.inactiveText,
                    ]}
                  >
                    {item}
                  </Text>
                </View>
              )}
            />
          </View>
        </View>

        {/* başlangıç tarihi */}
        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setCalendarVisible(true)}
        >
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

      {/* takvim */}
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
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: "#005CEE" },
              }}
              theme={{
                todayTextColor: "#005CEE",
                selectedDayBackgroundColor: "#005CEE",
                arrowColor: "#005CEE",
                textMonthFontWeight: "bold",
              }}
            />
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => setCalendarVisible(false)}
            >
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
  progressWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  progressStep: {
    height: 3,
    flex: 1,
    backgroundColor: "#E5E5EA",
    marginHorizontal: 2,
    borderRadius: 2,
  },
  completedStep: { backgroundColor: "#005CEE", opacity: 0.4 },
  activeStep: { backgroundColor: "#005CEE" },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 40 },
  pickerWrapper: {
    flexDirection: "row",
    height: ITEM_HEIGHT * 3,
    marginBottom: 50,
    alignItems: "center",
  },
  selectionIndicator: {
    position: "absolute",
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F2F2F2",
    zIndex: -1,
  },
  pickerColumn: { flex: 1, height: "100%" },
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerTextMain: { fontSize: 20, fontWeight: "600", color: "#333" },
  pickerText: { fontSize: 20 },
  activeText: { color: "#005CEE", fontWeight: "bold" },
  inactiveText: { color: "#E5E5EA" },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#F2F2F2",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  dateLeft: { flexDirection: "row", alignItems: "center" },
  dateLabel: { marginLeft: 10, fontSize: 16, fontWeight: "500" },
  dateRight: { flexDirection: "row", alignItems: "center" },
  dateValue: { marginRight: 8, fontSize: 16, color: "#333" },
  footer: { padding: 20, paddingBottom: Platform.OS === "ios" ? 30 : 20 },
  nextBtn: {
    backgroundColor: "#005CEE",
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  nextBtnText: { color: "white", fontSize: 18, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  doneBtn: {
    backgroundColor: "#005CEE",
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },
  doneBtnText: { color: "white", fontSize: 18, fontWeight: "600" },
});
