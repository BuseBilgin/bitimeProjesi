import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getToken } from '@/src/lib/auth';
import { getDrugInteractionsRequest, DrugInteraction, MedicationDto } from '@/src/lib/api';

const getSeverityColor = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'severe':
      return '#FF3B30';
    case 'high':
      return '#FF9500';
    case 'medium':
      return '#FFCC00';
    case 'low':
      return '#34C759';
    default:
      return '#999';
  }
};

const getSeverityLabel = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'severe':
      return 'Çok Ciddi';
    case 'high':
      return 'Ciddi';
    case 'medium':
      return 'Orta';
    case 'low':
      return 'Hafif';
    default:
      return 'Bilinmiyor';
  }
};

export default function DrugInteractionsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [medications, setMedications] = useState<MedicationDto[]>([]);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [expandedInteraction, setExpandedInteraction] = useState<number | null>(null);

  useEffect(() => {
    loadInteractions();
  }, []);

  const loadInteractions = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        Alert.alert('Hata', 'Kimlik doğrulama başarısız');
        return;
      }

      const data = await getDrugInteractionsRequest(token);
      setMedications(data.medications);
      setInteractions(data.interactions);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Etkileşimler yüklenemedi';
      Alert.alert('Hata', message);
    } finally {
      setLoading(false);
    }
  };

  const renderInteractionCard = (interaction: DrugInteraction, index: number) => {
    const isExpanded = expandedInteraction === index;
    const color = getSeverityColor(interaction.severity);

    return (
      <TouchableOpacity
        key={index}
        style={styles.interactionCard}
        onPress={() => setExpandedInteraction(isExpanded ? null : index)}
        activeOpacity={0.7}
      >
        <View style={styles.interactionHeader}>
          <View style={styles.medicationPair}>
            <View style={styles.medicationBadge}>
              <Text style={styles.medicationName}>{interaction.medication1.name}</Text>
              <Text style={styles.medicationDosage}>{interaction.medication1.dosage || 'Dozaj belirtilmedi'}</Text>
            </View>

            <View style={[styles.interactionIndicator, { backgroundColor: color }]}>
              <Ionicons name="alert-circle" size={20} color="white" />
            </View>

            <View style={styles.medicationBadge}>
              <Text style={styles.medicationName}>{interaction.medication2.name}</Text>
              <Text style={styles.medicationDosage}>{interaction.medication2.dosage || 'Dozaj belirtilmedi'}</Text>
            </View>
          </View>

          <View style={styles.severityBadge}>
            <Text style={[styles.severityText, { color }]}>
              {getSeverityLabel(interaction.severity)}
            </Text>
          </View>
        </View>

        {isExpanded && (
          <View style={styles.interactionDetails}>
            <View style={styles.detailsSection}>
              <Text style={styles.detailsLabel}>Etkileşim Açıklaması:</Text>
              <Text style={styles.detailsText}>{interaction.description}</Text>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.detailsLabel}>İlaç 1 - Etken Madde:</Text>
              <Text style={styles.detailsText}>{interaction.medication1.active_ingredient}</Text>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.detailsLabel}>İlaç 2 - Etken Madde:</Text>
              <Text style={styles.detailsText}>{interaction.medication2.active_ingredient}</Text>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.detailsLabel}>Kaynak:</Text>
              <Text style={styles.detailsText}>{interaction.source}</Text>
            </View>

            <View style={styles.warningBox}>
              <Ionicons name="warning" size={18} color="#FF9500" style={{ marginRight: 10 }} />
              <Text style={styles.warningText}>
                Lütfen bu etkileşim hakkında doktor veya eczacıya danışınız.
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#005CEE" />
          <Text style={styles.loadingText}>Etkileşimler yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#005CEE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İlaç Etkileşimleri</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* İlaçlar Özeti */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Toplam İlaç</Text>
            <Text style={styles.summaryValue}>{medications.length}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Etkileşim Sayısı</Text>
            <Text style={styles.summaryValue}>{interactions.length}</Text>
          </View>
        </View>

        {/* Etkileşimler Listesi */}
        {interactions.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="checkmark-circle" size={64} color="#34C759" />
            <Text style={styles.emptyStateTitle}>İyi Habercik!</Text>
            <Text style={styles.emptyStateText}>
              Kullanmakta olduğunuz ilaçlar arasında {'\n'}herhangi bir etkileşim tespit edilmedi.
            </Text>
          </View>
        ) : (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tespit Edilen Etkileşimler</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{interactions.length}</Text>
              </View>
            </View>
            {interactions.map((interaction, index) => renderInteractionCard(interaction, index))}
          </View>
        )}

        {/* İlaçlar Listesi */}
        <View style={styles.medicationsListSection}>
          <Text style={styles.sectionTitle}>Kullanılan İlaçlar</Text>
          <View style={styles.medicationsGrid}>
            {medications.map((med) => (
              <View key={med.id} style={styles.medListItem}>
                <Text style={styles.medListName}>{med.name}</Text>
                <Text style={styles.medListInfo}>{med.dosage || 'Dozaj belirtilmedi'}</Text>
                <Text style={styles.medListInfo}>{med.frequency || 'Frekans belirtilmedi'}</Text>
                <Text style={styles.medListIngredient}>
                  Etken: {med.active_ingredient?.substring(0, 20)}...
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bilgilendirme */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#005CEE" />
          <Text style={styles.infoText}>
            Bu bilgiler OpenFDA veritabanı tarafından sağlanmaktadır. Tıbbi tavsiye için lütfen doktor veya eczacıya danışınız.
          </Text>
        </View>
      </ScrollView>

      {/* Yenile Butonu */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={loadInteractions}
        activeOpacity={0.7}
      >
        <Ionicons name="refresh" size={20} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    justifyContent: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#F2F2F2',
    marginHorizontal: 15,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#005CEE',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  badge: {
    backgroundColor: '#005CEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 15,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  interactionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  interactionHeader: {
    padding: 15,
  },
  medicationPair: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationBadge: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  medicationName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  medicationDosage: {
    fontSize: 11,
    color: '#999',
    marginTop: 3,
    textAlign: 'center',
  },
  interactionIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  severityBadge: {
    position: 'absolute',
    top: 12,
    right: 15,
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  interactionDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
    padding: 15,
    backgroundColor: '#FAFBFC',
  },
  detailsSection: {
    marginBottom: 15,
  },
  detailsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  detailsText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  warningText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    lineHeight: 16,
  },
  medicationsListSection: {
    marginTop: 25,
  },
  medicationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  medListItem: {
    width: '48%',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
  },
  medListName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  medListInfo: {
    fontSize: 11,
    color: '#999',
    marginBottom: 3,
  },
  medListIngredient: {
    fontSize: 10,
    color: '#005CEE',
    marginTop: 5,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 12,
    marginTop: 25,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 12,
    color: '#1565C0',
    marginLeft: 10,
    flex: 1,
    lineHeight: 16,
  },
  refreshButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#005CEE',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});
