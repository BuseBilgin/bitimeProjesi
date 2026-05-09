import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { createMedicationRequest } from '@/src/lib/api';
import { getToken } from '@/src/lib/auth';

export default function NotesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name?: string | string[];
    dosage?: string | string[];
    frequency?: string | string[];
    startDate?: string | string[];
    scheduleTime?: string | string[];
  }>();
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);
  const [responseAlerts, setResponseAlerts] = useState<{ description?: string; severity?: string; type?: string }[] | null>(null);
  const [responseNote, setResponseNote] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (onDone: () => void) => {
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
      onDone();
    }, 1800);
  };

  const medicationName = Array.isArray(params.name) ? params.name[0] : params.name || '';
  const dosage = Array.isArray(params.dosage) ? params.dosage[0] : params.dosage || '';
  const frequency = Array.isArray(params.frequency) ? params.frequency[0] : params.frequency || '';
  const startDate = Array.isArray(params.startDate) ? params.startDate[0] : params.startDate || '';
  const scheduleTime = Array.isArray(params.scheduleTime) ? params.scheduleTime[0] : params.scheduleTime || '';

  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'high':
      case 'severe':
        return '#B00020';
      case 'medium':
        return '#FF9500';
      case 'low':
        return '#006400';
      default:
        return '#005CEE';
    }
  };

  const handleSave = async () => {
    if (savingRef.current) return;
    if (!medicationName) {
      Alert.alert('Hata', 'İlaç adı bulunamadı. Lütfen akışı tekrar başlatın.');
      return;
    }

    savingRef.current = true;
    try {
      setIsSaving(true);
      const token = await getToken();

      if (!token) {
        Alert.alert('Oturum Hatası', 'Lütfen yeniden giriş yapın.');
        router.replace('/login');
        return;
      }

      const response = await createMedicationRequest(token, {
        name: medicationName,
        dosage,
        frequency,
        start_date: startDate,
        schedule_time: scheduleTime,
        note,
      });

      if (response.alerts?.length) {
        setResponseAlerts(response.alerts);
        setResponseNote(response.note || 'Uyarılar bulundu. Lütfen dikkatlice kontrol edin.');
      } else {
        showToast(() => router.replace('/medications'));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'İlaç eklenemedi.';
      Alert.alert('Hata', message);
    } finally {
      setIsSaving(false);
      savingRef.current = false;
    }
  };

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
              <View style={[styles.progressStep, styles.completedStep]} />
              <View style={[styles.progressStep, styles.completedStep]} />
              <View style={[styles.progressStep, styles.completedStep]} />
              <View style={[styles.progressStep, styles.completedStep]} />
              <View style={[styles.progressStep, styles.activeStep]} />
            </View>

            <View style={styles.titleRow}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Not</Text>
              <View style={{ width: 24 }} />
            </View>
          </View>

          <View style={styles.content}>
            {/* not giriş */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="İlaçla ilgili isteğe bağlı not"
                placeholderTextColor="#C7C7CD"
                multiline
                value={note}
                onChangeText={setNote}
                autoFocus={false}
              />
            </View>

            {responseAlerts && responseAlerts.length > 0 ? (
              <View style={styles.alertsContainer}>
                <Text style={styles.alertsTitle}>Uyarılar</Text>
                {responseNote ? <Text style={styles.alertsNote}>{responseNote}</Text> : null}
                <FlatList
                  data={responseAlerts}
                  keyExtractor={(item, index) => `${item.type || 'alert'}-${index}`}
                  renderItem={({ item }) => (
                    <View style={styles.alertCard}>
                      <View style={[styles.alertBadge, { backgroundColor: getSeverityColor(item.severity) }]} />
                      <View style={styles.alertTextWrapper}>
                        <Text style={styles.alertType}>{item.type?.toUpperCase() || 'UYARI'}</Text>
                        <Text style={styles.alertDescription}>{item.description || 'Detay yok.'}</Text>
                      </View>
                    </View>
                  )}
                  scrollEnabled={false}
                />
                <TouchableOpacity
                  style={styles.alertContinueBtn}
                  onPress={() => router.replace('/medications')}
                >
                  <Text style={styles.alertContinueText}>Uyarıları gördüm</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          {/* alt buton */}
          <View style={styles.footer}>
            {responseAlerts && responseAlerts.length > 0 ? (
              <TouchableOpacity
                style={styles.alertContinueBtn}
                onPress={() => router.replace('/medications')}
              >
                <Text style={styles.alertContinueText}>Uyarıları gördüm</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionBtnText}>Kaydet</Text>}
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>

      {toastVisible && (
        <View style={styles.toast} pointerEvents="none">
          <Ionicons name="checkmark-circle" size={20} color="white" />
          <Text style={styles.toastText}>İlaç eklendi</Text>
        </View>
      )}
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
  
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  inputWrapper: {
    backgroundColor: 'white',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#F2F2F2',
    minHeight: 60,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
  },
  alertsContainer: {
    marginTop: 20,
    backgroundColor: '#FFF7E6',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FFEBCC',
    padding: 16,
  },
  alertsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#B35A00',
    marginBottom: 8,
  },
  alertsNote: {
    fontSize: 14,
    color: '#715A20',
    marginBottom: 12,
    lineHeight: 20,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F2E1C9',
  },
  alertBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
    marginRight: 10,
  },
  alertTextWrapper: {
    flex: 1,
  },
  alertType: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  alertContinueBtn: {
    marginTop: 10,
    backgroundColor: '#005CEE',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  alertContinueText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },

  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  actionBtn: {
    backgroundColor: '#005CEE',
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },

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