import { useRouter } from "expo-router";
import { Link } from "expo-router";
import { Feather } from "@expo/vector-icons";


import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const ITEM_WIDTH = 58;

const generateYearData = (year: number) => {
  const days = [];
  const months = [
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
  ];
  const dayLabels = ["Pz", "P", "S", "Ç", "P", "C", "Ct"];

  for (let month = 0; month < 12; month++) {
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      days.push({
        id: `${year}-${month + 1}-${date.getDate()}`,
        label: dayLabels[date.getDay()],
        num: date.getDate().toString(),
        monthName: months[month],
        year: year,
      });
      date.setDate(date.getDate() + 1);
    }
  }
  return days;
};

const ALL_DAYS = generateYearData(2026);

export default function Home() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const today = new Date();
const initialDayId = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const initialIndex = ALL_DAYS.findIndex((d) => d.id === initialDayId);

  const [selectedDay, setSelectedDay] = useState(ALL_DAYS[initialIndex]);
  const [headerTitle, setHeaderTitle] = useState(
    `${selectedDay.num} ${selectedDay.monthName} ${selectedDay.year}`,
  );

  const handleSelectDay = (item: (typeof ALL_DAYS)[0]) => {
    setSelectedDay(item);
    setHeaderTitle(`${item.num} ${item.monthName} ${item.year}`);

    const index = ALL_DAYS.indexOf(item);
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
  };

  const handleArrowScroll = (direction: "next" | "prev") => {
    const currentIndex = ALL_DAYS.indexOf(selectedDay);
    const newIndex = direction === "next" ? currentIndex + 3 : currentIndex - 3;

    if (newIndex >= 0 && newIndex < ALL_DAYS.length) {
      handleSelectDay(ALL_DAYS[newIndex]);
    }
  };

  const renderDayItem = ({ item }: { item: (typeof ALL_DAYS)[0] }) => {
    const isActive = item.id === selectedDay.id;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleSelectDay(item)}
        style={[styles.dayBox, isActive && styles.activeDayBox]}
      >
        <Text style={[styles.dayLabel, isActive && styles.activeDayText]}>
          {item.label}
        </Text>
        <Text style={[styles.dayNum, isActive && styles.activeDayText]}>
          {item.num}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Feather name="user" size={40} color="#999" />
        <View style={styles.headerTextContainer}>
          <Text style={styles.welcomeText}>Merhaba, Ayşe</Text>
          <Text style={styles.subWelcomeText}>Hoşgeldin !</Text>
        </View>
      </View>

      <View style={styles.calendarSection}>
        <Text style={styles.todayTitle}>{headerTitle}</Text>

        <View style={styles.calendarRow}>
          <TouchableOpacity
            onPress={() => handleArrowScroll("prev")}
            style={styles.arrowBtn}
          >
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>

          <FlatList
            ref={flatListRef}
            data={ALL_DAYS}
            renderItem={renderDayItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            snapToInterval={ITEM_WIDTH}
            decelerationRate="fast"
            disableIntervalMomentum={true}
            snapToAlignment="center"
            scrollEventThrottle={16}
            getItemLayout={(_, index) => ({
              length: ITEM_WIDTH,
              offset: ITEM_WIDTH * index,
              index,
            })}
            initialScrollIndex={initialIndex > 2 ? initialIndex - 2 : 0}
          />

          <TouchableOpacity
            onPress={() => handleArrowScroll("next")}
            style={styles.arrowBtn}
          >
            <Ionicons name="chevron-forward" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.emptyContent}>
        <Image
          source={{ uri: "https://i.ibb.co/L6v3ZpX/medicine-bottle.png" }}
          style={styles.emptyImg}
        />
        <Text style={styles.emptyTitle}>Bugün için planlanmış ilaç yok.</Text>
        <TouchableOpacity
          style={styles.mainAddBtn}
          onPress={() => router.push("/add")}
        >
          <Ionicons name="add" size={28} color="white" />
          <Text style={styles.mainAddBtnText}>İlaç Ekle</Text>
        </TouchableOpacity>
      </View>

      {/* tab bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={26} color="#005CEE" />
          <Text style={[styles.navText, { color: "#005CEE" }]}>Bugün</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/medications")}
        >
          <MaterialCommunityIcons
            name="pill"
            size={26}
            color="#9E9E9E"
            style={{ transform: [{ rotate: "45deg" }] }}
          />
          <Text style={styles.navText}>İlaçlarım</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/add")}
        >
          <Ionicons name="add-circle-outline" size={26} color="#9E9E9E" />
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
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
    marginTop: 15,
    marginBottom: 20,
  },
  profileImg: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  headerTextContainer: { justifyContent: "center" },
  welcomeText: { fontSize: 20, fontWeight: "bold", color: "#1A1A1A" },
  subWelcomeText: { fontSize: 14, color: "#8E8E93" },
  calendarSection: { paddingVertical: 10 },
  todayTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginLeft: 20,
    marginBottom: 15,
  },
  calendarRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  arrowBtn: { padding: 5, paddingHorizontal: 10 },
  flatListContent: { paddingHorizontal: 0 },
  dayBox: {
    width: 48,
    height: 65,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
    borderRadius: 12,
  },
  activeDayBox: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#005CEE",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayLabel: { fontSize: 12, color: "#666" },
  dayNum: { fontSize: 18, fontWeight: "bold", marginTop: 4, color: "#333" },
  activeDayText: { color: "#005CEE" },
  emptyContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyImg: {
    width: 140,
    height: 140,
    resizeMode: "contain",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1A1A1A",
  },
  mainAddBtn: {
    backgroundColor: "#005CEE",
    flexDirection: "row",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  mainAddBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  bottomNav: {
    flexDirection: "row",
    height: Platform.OS === "ios" ? 85 : 70,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F2",
    backgroundColor: "#FFF",
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
    alignItems: "center",
  },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center" },
  navText: { fontSize: 11, marginTop: 4, color: "#9E9E9E" },
});
