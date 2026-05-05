import React, { useState } from 'react';
import { Feather } from "@expo/vector-icons";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { height } = Dimensions.get('window');

export default function SettingsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('');

  const renderSettingItem = (icon: any, title: string, subtitle: string, onPress: () => void) => (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
      <View style={styles.itemIconWrapper}>
        <Ionicons name={icon} size={22} color="#333" />
      </View>
      <View style={styles.itemTextContent}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#333" />
    </TouchableOpacity>
  );

  const handleItemPress = (title: string) => {
    setActiveTab(title);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ayarlar</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Profil Bölümü */}
          <View style={styles.profileSection}>
            <Feather name="user" size={40} color="#999" />
            <View style={styles.profileInfo}>
              <Text style={styles.greeting}>Merhaba, Ayşe</Text>
              <TouchableOpacity onPress={() => handleItemPress('Profili Düzenle')}>
                <Text style={styles.editProfileText}>Profili Düzenle</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Profil */}
          <Text style={styles.sectionTitle}>Profil</Text>
          {renderSettingItem('person-outline', 'Hesap Merkezi', 'Hesap ayrıntılarınızı yönetin.', () => handleItemPress('Hesap Merkezi'))}

          {/* Hatırlatıcılar */}
          <Text style={styles.sectionTitle}>Hatırlatıcılar & Alarm</Text>
          {renderSettingItem('notifications-outline', 'Bildirim Ayarları', 'Çeşitli uygulama bildirimlerini etkinleştirin veya devre dışı bırakın.', () => handleItemPress('Bildirim Ayarları'))}
          {renderSettingItem('volume-medium-outline', 'Hatırlatma Tercihleri', 'İlaç hatırlatıcıları için uyarı sesini seçin.', () => handleItemPress('Hatırlatma Tercihleri'))}

          {/* Genel */}
          <Text style={styles.sectionTitle}>Genel</Text>
          {renderSettingItem('globe-outline', 'Dil', 'Tercih ettiğiniz uygulama dilini seçin.', () => handleItemPress('Dil Seçimi'))}
          {renderSettingItem('eye-outline', 'Dış görünüş', 'Uygulama için tercih ettiğiniz yakınlaştırma seviyesini seçin.', () => handleItemPress('Dış Görünüş'))}

          {/* Güvenlik */}
          <Text style={styles.sectionTitle}>Güvenlik</Text>
          {renderSettingItem('lock-closed-outline', 'Gizlilik & Güvenlik', 'Uygulama şifrelerini ve güvenliğini yönetin.', () => handleItemPress('Gizlilik & Güvenlik'))}

          {/* Hakkımızda */}
          <Text style={styles.sectionTitle}>Hakkımızda</Text>
          {renderSettingItem('information-circle-outline', 'Hakkımızda', 'Uygulama ve sürüm detayları hakkında daha fazla bilgi edinin.', () => handleItemPress('Hakkımızda'))}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* ✅ HOME İLE AYNI BOTTOM NAV */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push("/home")}>
            <Ionicons name="home-outline" size={26} color="#9E9E9E" />
            <Text style={styles.navText}>Bugün</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push("/medications")}>
            <MaterialCommunityIcons
              name="pill"
              size={26}
              color="#9E9E9E"
              style={{ transform: [{ rotate: "45deg" }] }}
            />
            <Text style={styles.navText}>İlaçlarım</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push("/add")}>
            <Ionicons name="add-circle-outline" size={26} color="#9E9E9E" />
            <Text style={styles.navText}>İlaç Ekle</Text>
          </TouchableOpacity>

          {/* AKTİF */}
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="settings" size={26} color="#005CEE" />
            <Text style={[styles.navText, { color: "#005CEE" }]}>Ayarlar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{activeTab}</Text>
            <Text style={styles.modalDescription}>
              Bu sayfa şu an geliştirilme aşamasındadır. Yakında burada detaylı ayarları yönetebileceksiniz.
            </Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },

  scrollContent: { paddingHorizontal: 20 },

  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#F0F0F0' },
  profileInfo: { marginLeft: 15 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  editProfileText: { fontSize: 16, color: '#005CEE', marginTop: 4, fontWeight: '500' },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },

  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F2F2F2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemTextContent: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  itemSubtitle: { fontSize: 12, color: '#777', marginTop: 2 },

  /* ✅ HOME İLE AYNI */
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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    minHeight: height * 0.3,
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 2.5,
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  modalDescription: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 25 },
  closeButton: {
    backgroundColor: '#005CEE',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  closeButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});