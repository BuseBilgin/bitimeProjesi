import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { searchMedicationsRequest, getAllDrugsRequest, OpenFDADrug } from '@/src/lib/api';
import { getToken } from '@/src/lib/auth';

export default function AddMedicine() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [allDrugs, setAllDrugs] = useState<OpenFDADrug[]>([]);
  const [filteredDrugs, setFilteredDrugs] = useState<OpenFDADrug[]>([]);
  const [loadingDrugs, setLoadingDrugs] = useState(true);
  const [searching, setSearching] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const authToken = await getToken();
      setToken(authToken);
      if (authToken) {
        loadAllDrugs(authToken);
      }
    } catch (error) {
      console.error('[Add] Failed to load token:', error);
      setLoadingDrugs(false);
    }
  };

  const loadAllDrugs = async (authToken: string) => {
    try {
      console.log('[Add] Loading all drugs from API...');
      const data = await getAllDrugsRequest(authToken);
      console.log('[Add] Drugs loaded:', data.drugs.length);
      setAllDrugs(data.drugs);
      setFilteredDrugs(data.drugs);
    } catch (error) {
      console.error('[Add] Failed to load drugs:', error);
      // Fallback: Genişletilmiş ilaç listesi
      const fallbackDrugs: OpenFDADrug[] = [
        { name: 'Parol', genericName: 'Parasetamol', activeIngredients: ['parasetamol'], manufacturer: 'Glaxo' },
        { name: 'Aspirin', genericName: 'Acetylsalicylic Acid', activeIngredients: ['asetilsalisilik asit'], manufacturer: 'Bayer' },
        { name: 'Ibuprofen', genericName: 'Ibuprofen', activeIngredients: ['ibuprofen'], manufacturer: 'Various' },
        { name: 'Voltaren', genericName: 'Diclofenac', activeIngredients: ['diklofenaç'], manufacturer: 'Novartis' },
        { name: 'Metpamid', genericName: 'Metoclopramide', activeIngredients: ['metoklopramid'], manufacturer: 'Various' },
        { name: 'Nexium', genericName: 'Esomeprazole', activeIngredients: ['esomeprazol'], manufacturer: 'AstraZeneca' },
        { name: 'Augmentin', genericName: 'Amoxicillin-Clavulanic Acid', activeIngredients: ['amoksisilin'], manufacturer: 'GSK' },
        { name: 'Cipro', genericName: 'Ciprofloxacin', activeIngredients: ['siprofloksasin'], manufacturer: 'Bayer' },
        { name: 'Sudafed', genericName: 'Pseudoephedrine', activeIngredients: ['pseudoefedrin'], manufacturer: 'McNeil' },
        { name: 'Tavegil', genericName: 'Clemastine', activeIngredients: ['klematistin'], manufacturer: 'Novartis' },
        { name: 'Lisinopril', genericName: 'Lisinopril', activeIngredients: ['lisinopril'], manufacturer: 'AstraZeneca' },
        { name: 'Metformin', genericName: 'Metformin', activeIngredients: ['metformin'], manufacturer: 'Various' },
        { name: 'Atorvastatin', genericName: 'Atorvastatin', activeIngredients: ['atorvastatin'], manufacturer: 'Pfizer' },
        { name: 'Lipitor', genericName: 'Atorvastatin', activeIngredients: ['atorvastatin'], manufacturer: 'Pfizer' },
        { name: 'Amoxil', genericName: 'Amoxicillin', activeIngredients: ['amoksisilin'], manufacturer: 'GSK' },
        { name: 'Loratadine', genericName: 'Loratadine', activeIngredients: ['loratadine'], manufacturer: 'Schering-Plough' },
        { name: 'Allegra', genericName: 'Fexofenadine', activeIngredients: ['fexofenadine'], manufacturer: 'Sanofi' },
        { name: 'Claritine', genericName: 'Loratadine', activeIngredients: ['loratadine'], manufacturer: 'Various' },
        { name: 'Omeprazole', genericName: 'Omeprazole', activeIngredients: ['omeprazol'], manufacturer: 'Various' },
        { name: 'Prilosec', genericName: 'Omeprazole', activeIngredients: ['omeprazol'], manufacturer: 'AstraZeneca' },
        { name: 'Lansoprazole', genericName: 'Lansoprazole', activeIngredients: ['lansoprazol'], manufacturer: 'Various' },
        { name: 'Prevacid', genericName: 'Lansoprazole', activeIngredients: ['lansoprazol'], manufacturer: 'Takeda' },
        { name: 'Ranitidine', genericName: 'Ranitidine', activeIngredients: ['rantidin'], manufacturer: 'Various' },
        { name: 'Zantac', genericName: 'Ranitidine', activeIngredients: ['rantidin'], manufacturer: 'GSK' },
        { name: 'Fluoxetine', genericName: 'Fluoxetine', activeIngredients: ['fluoxetin'], manufacturer: 'Various' },
        { name: 'Prozac', genericName: 'Fluoxetine', activeIngredients: ['fluoxetin'], manufacturer: 'Eli Lilly' },
        { name: 'Sertraline', genericName: 'Sertraline', activeIngredients: ['sertralin'], manufacturer: 'Various' },
        { name: 'Zoloft', genericName: 'Sertraline', activeIngredients: ['sertralin'], manufacturer: 'Pfizer' },
        { name: 'Amitriptyline', genericName: 'Amitriptyline', activeIngredients: ['amitriptilin'], manufacturer: 'Various' },
        { name: 'Elavil', genericName: 'Amitriptyline', activeIngredients: ['amitriptilin'], manufacturer: 'Merck' },
        { name: 'Cetirizine', genericName: 'Cetirizine', activeIngredients: ['setirisin'], manufacturer: 'Various' },
        { name: 'Zyrtec', genericName: 'Cetirizine', activeIngredients: ['setirisin'], manufacturer: 'Pfizer' },
        { name: 'Diphenhydramine', genericName: 'Diphenhydramine', activeIngredients: ['difenhidramin'], manufacturer: 'Various' },
        { name: 'Benadryl', genericName: 'Diphenhydramine', activeIngredients: ['difenhidramin'], manufacturer: 'McNeil' },
        { name: 'Naproxen', genericName: 'Naproxen', activeIngredients: ['naproxen'], manufacturer: 'Various' },
        { name: 'Aleve', genericName: 'Naproxen', activeIngredients: ['naproxen'], manufacturer: 'Bayer' },
        { name: 'Acetaminophen', genericName: 'Acetaminophen', activeIngredients: ['parasetamol'], manufacturer: 'Various' },
        { name: 'Tylenol', genericName: 'Acetaminophen', activeIngredients: ['parasetamol'], manufacturer: 'McNeil' },
        { name: 'Ketoprofen', genericName: 'Ketoprofen', activeIngredients: ['ketoprofen'], manufacturer: 'Various' },
        { name: 'Orudis', genericName: 'Ketoprofen', activeIngredients: ['ketoprofen'], manufacturer: 'Abbott' },
        { name: 'Loperamide', genericName: 'Loperamide', activeIngredients: ['loperamid'], manufacturer: 'Various' },
        { name: 'Imodium', genericName: 'Loperamide', activeIngredients: ['loperamid'], manufacturer: 'McNeil' },
        { name: 'Meclizine', genericName: 'Meclizine', activeIngredients: ['meklizin'], manufacturer: 'Various' },
        { name: 'Antivert', genericName: 'Meclizine', activeIngredients: ['meklizin'], manufacturer: 'Pfizer' },
        { name: 'Promethazine', genericName: 'Promethazine', activeIngredients: ['prometazin'], manufacturer: 'Various' },
        { name: 'Phenergan', genericName: 'Promethazine', activeIngredients: ['prometazin'], manufacturer: 'Wyeth' },
        { name: 'Prednisone', genericName: 'Prednisone', activeIngredients: ['prednizon'], manufacturer: 'Various' },
        { name: 'Deltasone', genericName: 'Prednisone', activeIngredients: ['prednizon'], manufacturer: 'Merck' },
        { name: 'Dexamethasone', genericName: 'Dexamethasone', activeIngredients: ['deksamethason'], manufacturer: 'Various' },
        { name: 'Decadron', genericName: 'Dexamethasone', activeIngredients: ['deksamethason'], manufacturer: 'Merck' },
        { name: 'Hydrocortisone', genericName: 'Hydrocortisone', activeIngredients: ['hidrokortison'], manufacturer: 'Various' },
        { name: 'Cortef', genericName: 'Hydrocortisone', activeIngredients: ['hidrokortison'], manufacturer: 'Pfizer' },
        { name: 'Loratadine HCl', genericName: 'Loratadine', activeIngredients: ['loratadin hcl'], manufacturer: 'Various' },
        { name: 'Desloratadine', genericName: 'Desloratadine', activeIngredients: ['desloratadin'], manufacturer: 'Schering-Plough' },
        { name: 'Aerius', genericName: 'Desloratadine', activeIngredients: ['desloratadin'], manufacturer: 'Schering-Plough' },
        { name: 'Fluticasone', genericName: 'Fluticasone', activeIngredients: ['flutikazon'], manufacturer: 'Various' },
        { name: 'Flonase', genericName: 'Fluticasone', activeIngredients: ['flutikazon'], manufacturer: 'GSK' },
        { name: 'Mometasone', genericName: 'Mometasone', activeIngredients: ['mometason'], manufacturer: 'Various' },
        { name: 'Asmanex', genericName: 'Mometasone', activeIngredients: ['mometason'], manufacturer: 'Schering-Plough' },
        { name: 'Triamcinolone', genericName: 'Triamcinolone', activeIngredients: ['triamsinolon'], manufacturer: 'Various' },
        { name: 'Azmacort', genericName: 'Triamcinolone', activeIngredients: ['triamsinolon'], manufacturer: 'Aventis' },
        { name: 'Albuterol', genericName: 'Albuterol', activeIngredients: ['albuterol'], manufacturer: 'Various' },
        { name: 'Ventolin', genericName: 'Albuterol', activeIngredients: ['albuterol'], manufacturer: 'GSK' },
        { name: 'Salbutamol', genericName: 'Salbutamol', activeIngredients: ['salbutamol'], manufacturer: 'Various' },
        { name: 'Terbutaline', genericName: 'Terbutaline', activeIngredients: ['terbutalin'], manufacturer: 'Various' },
        { name: 'Brethine', genericName: 'Terbutaline', activeIngredients: ['terbutalin'], manufacturer: 'Novartis' },
        { name: 'Ipratropium', genericName: 'Ipratropium', activeIngredients: ['ipratropium'], manufacturer: 'Various' },
        { name: 'Atrovent', genericName: 'Ipratropium', activeIngredients: ['ipratropium'], manufacturer: 'Boehringer Ingelheim' },
        { name: 'Theophylline', genericName: 'Theophylline', activeIngredients: ['teofilin'], manufacturer: 'Various' },
        { name: 'Theolair', genericName: 'Theophylline', activeIngredients: ['teofilin'], manufacturer: 'Various' },
        { name: 'Montelukast', genericName: 'Montelukast', activeIngredients: ['montelukast'], manufacturer: 'Various' },
        { name: 'Singulair', genericName: 'Montelukast', activeIngredients: ['montelukast'], manufacturer: 'Merck' },
        { name: 'Zafirlukast', genericName: 'Zafirlukast', activeIngredients: ['zafirlukast'], manufacturer: 'Various' },
        { name: 'Accolate', genericName: 'Zafirlukast', activeIngredients: ['zafirlukast'], manufacturer: 'AstraZeneca' },
        { name: 'Zileuton', genericName: 'Zileuton', activeIngredients: ['zileuton'], manufacturer: 'Various' },
        { name: 'Zyflo', genericName: 'Zileuton', activeIngredients: ['zileuton'], manufacturer: 'Chiron' },
        { name: 'Formoterol', genericName: 'Formoterol', activeIngredients: ['formoterol'], manufacturer: 'Various' },
        { name: 'Foradil', genericName: 'Formoterol', activeIngredients: ['formoterol'], manufacturer: 'Novartis' },
        { name: 'Salmeterol', genericName: 'Salmeterol', activeIngredients: ['salmeterol'], manufacturer: 'Various' },
        { name: 'Seretide', genericName: 'Salmeterol/Fluticasone', activeIngredients: ['salmeterol', 'flutikazon'], manufacturer: 'GSK' },
        { name: 'Advair', genericName: 'Salmeterol/Fluticasone', activeIngredients: ['salmeterol', 'flutikazon'], manufacturer: 'GSK' },
      ];
      setAllDrugs(fallbackDrugs);
      setFilteredDrugs(fallbackDrugs);
    } finally {
      setLoadingDrugs(false);
    }
  };

  const goToDosage = (name: string) => {
    if (!name.trim()) return;

    router.push({
      pathname: '/dosage',
      params: { name: name.trim() }
    });
  };

  // Arama fonksiyonu
  const handleSearch = async (text: string) => {
    setSearchQuery(text);

    if (text.length === 0) {
      setFilteredDrugs(allDrugs);
      return;
    }

    if (text.length >= 3 && token) {
      setSearching(true);
      try {
        const searchResult = await searchMedicationsRequest(token, text);
        if (searchResult.found && searchResult.data) {
          const resultDrug: OpenFDADrug = {
            name: searchResult.data.name,
            genericName: searchResult.data.generic_name || '',
            activeIngredients: searchResult.data.active_ingredients || [],
            manufacturer: searchResult.data.source === 'openfda' ? 'OpenFDA' : 'Kullanıcı girişi',
          };
          setFilteredDrugs([resultDrug]);
          return;
        }
      } catch (error) {
        console.error('[Add] search failed:', error);
      } finally {
        setSearching(false);
      }
    }

    // Lokal olarak filtrele
    const filtered = allDrugs.filter(drug =>
      drug.name.toLowerCase().includes(text.toLowerCase()) ||
      drug.genericName?.toLowerCase().includes(text.toLowerCase()) ||
      drug.activeIngredients?.some(ing => ing.toLowerCase().includes(text.toLowerCase()))
    );

    setFilteredDrugs(filtered);
  };

  const renderDrugItem = (drug: OpenFDADrug, index: number) => (
    <TouchableOpacity
      key={`${drug.name}-${index}`}
      style={styles.drugCard}
      onPress={() => goToDosage(drug.name)}
    >
      <View style={styles.drugCardContent}>
        <Text style={styles.drugName}>{drug.name}</Text>
        {drug.genericName && (
          <Text style={styles.drugGeneric}>{drug.genericName}</Text>
        )}
        {drug.activeIngredients && drug.activeIngredients.length > 0 && (
          <Text style={styles.drugIngredient}>
            Etken: {drug.activeIngredients[0]}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#005CEE" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        {/* progress bar */}
        <View style={styles.header}>
          <View style={styles.progressWrapper}>
            <View style={[styles.progressStep, styles.activeStep]} />
            <View style={styles.progressStep} />
            <View style={styles.progressStep} />
            <View style={styles.progressStep} />
            <View style={styles.progressStep} />
          </View>
          
          <View style={styles.titleRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>İlaç Adı</Text>
            <View style={{ width: 24 }} /> 
          </View>
        </View>

        {/* arama çubuğu */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="İlaç adı veya bileşeni ile arayın..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus={true}
            />
          </View>
        </View>

        {/* İçerik */}
        {loadingDrugs ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#005CEE" />
            <Text style={styles.loadingText}>İlaçlar yükleniyor...</Text>
          </View>
        ) : (
          <View style={styles.content}>
            {filteredDrugs.length > 0 ? (
              <>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultCount}>
                    {filteredDrugs.length} ilaç bulundu
                  </Text>
                  {searching ? <Text style={styles.searchingText}>Aranıyor...</Text> : null}
                </View>
                <FlatList
                  data={filteredDrugs}
                  keyExtractor={(item, index) => `${item.name}-${index}`}
                  renderItem={({ item, index }) => renderDrugItem(item, index)}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContent}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
              </>
            ) : (
              <ScrollView contentContainerStyle={styles.emptyContainer}>
                <View style={styles.emptyState}>
                  <Ionicons name="alert-circle-outline" size={48} color="#999" />
                  <Text style={styles.emptyTitle}>İlaç Bulunamadı</Text>
                  <Text style={styles.emptyText}>
                    “{searchQuery}” ile eşleşen ilaç yok.{'\n'}Lütfen farklı bir adla arayın.
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        )}

        {/* alt menü */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
            <Ionicons name="home-outline" size={24} color="#9E9E9E" />
            <Text style={styles.navText}>Bugün</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/medications')}>
            <MaterialCommunityIcons 
              name="pill" 
              size={24} 
              color="#9E9E9E" 
              style={{ transform: [{ rotate: '45deg' }] }} 
            />
            <Text style={styles.navText}>İlaçlarım</Text>
          </TouchableOpacity>
        
          <TouchableOpacity style={styles.navItem}>
            <View style={styles.activeAddTab}>
              <Ionicons name="add" size={20} color="white" />
            </View>
            <Text style={[styles.navText, { color: '#005CEE', fontWeight: '600' }]}>İlaç Ekle</Text>
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
      </KeyboardAvoidingView>
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
  activeStep: { backgroundColor: '#005CEE' },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  searchContainer: { paddingHorizontal: 20, marginBottom: 15 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#000' },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  resultHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resultCount: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  searchingText: {
    fontSize: 12,
    color: '#005CEE',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  drugCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FB',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#005CEE',
  },
  drugCardContent: {
    flex: 1,
    marginRight: 10,
  },
  drugName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  drugGeneric: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  drugIngredient: {
    fontSize: 11,
    color: '#005CEE',
    fontWeight: '500',
  },
  separator: { height: 1, backgroundColor: '#F2F2F2', marginVertical: 5 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    minHeight: 300,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  bottomNav: {
    height: 80,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
  },
  navItem: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  navText: { fontSize: 11, color: '#999', marginTop: 4 },
  activeAddTab: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#005CEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
