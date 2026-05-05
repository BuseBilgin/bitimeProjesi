import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function ForgetPassword() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* geri */}
        <TouchableOpacity onPress={() => {
          if (navigation.canGoBack?.()) {
            navigation.goBack();
          } else {
            router.push('/login');
          }
        }} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>

        {/* başlık */}
        <View style={styles.header}>
          <Text style={styles.title}>Parolanızı mı unuttunuz</Text>
          <Text style={styles.subtitle}>
            Hesabınızı kurtarmak için bilgileri doldurun.
          </Text>
        </View>

        {/* input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Adresi</Text>
          <TextInput 
            style={styles.input} 
            placeholder="ayse.yilmaz@gmail.com" 
            placeholderTextColor="#C7C7CD"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* kurtar butonu */}
        <TouchableOpacity 
            style={styles.sendButton}
            onPress={() => router.push('/otp')} 
            >
            <Text style={styles.sendButtonText}>Kurtar</Text>
            </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  content: { padding: 24 },
  backButton: { marginTop: 10, marginBottom: 20 },
  header: { marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 8, lineHeight: 22 },
  inputGroup: { gap: 8, marginBottom: 25 },
  label: { fontSize: 16, fontWeight: '600', color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  sendButton: {
    backgroundColor: '#005CEE',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  sendButtonText: { color: 'white', fontSize: 18, fontWeight: '600' },
});