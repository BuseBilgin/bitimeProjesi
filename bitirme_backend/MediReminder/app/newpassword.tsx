import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function NewPassword() {
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = () => {
    if (!password || !confirmPassword) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }
  
    if (password !== confirmPassword) {
      alert("Şifreler birbiriyle eşleşmiyor.");
      return;
    }
  

    alert("Şifreniz başarıyla güncellendi!");
    router.replace('/login'); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.content}
      >
        {/* geri */}
        <TouchableOpacity onPress={() => {
          if (navigation.canGoBack?.()) {
            navigation.goBack();
          } else {
            router.push('/otp');
          }
        }} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>

        {/* başlık */}
        <View style={styles.header}>
          <Text style={styles.title}>Yeni Şifre</Text>
          <Text style={styles.subtitle}>Yeni şifrenizi buraya girin.</Text>
        </View>

        {/* form */}
        <View style={styles.form}>
          
          {/* yeni şifre */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Yeni Şifre</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.flexInput} 
                placeholder="Yeni Şifrenizi Girin" 
                placeholderTextColor="#C7C7CD"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color="#A1A1A1" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* onay */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Yeni Şifreyi Onayla</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.flexInput} 
                placeholder="Yeni şifrenizi tekrar girin." 
                placeholderTextColor="#C7C7CD"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <Ionicons 
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color="#A1A1A1" 
                />
              </TouchableOpacity>
            </View>
          </View>

        </View>

        {/* şifre oluştur */}
        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>Yeni Şifre Oluştur</Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  content: { padding: 24, flex: 1 },
  backButton: { marginTop: 10, marginBottom: 20 },
  header: { marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 8 },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 16, fontWeight: '600', color: '#333' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    height: 56,
  },
  flexInput: { flex: 1, paddingHorizontal: 16, fontSize: 16, color: '#333' },
  eyeIcon: { paddingHorizontal: 16 },
  button: {
    backgroundColor: '#005CEE',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 'auto', 
    marginBottom: 20
  },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '600' },
});