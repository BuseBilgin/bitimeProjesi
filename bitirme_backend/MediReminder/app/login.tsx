import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { loginRequest } from '@/src/lib/api';
import { saveToken } from '@/src/lib/auth';
import { NETWORK_TROUBLESHOOTING_STEPS } from '@/src/lib/debug';

export default function Login() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Kullanıcı adı ve şifre eşleşmiyor.');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async () => {
    if (email.trim() === '' || password.trim() === '') {
      setErrorMessage('Lütfen email ve şifre girin.');
      setHasError(true);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    try {
      const response = await loginRequest(email.trim(), password);

      if (!response?.token) {
        throw new Error('Giriş başarılı göründü ancak oturum anahtarı alınamadı.');
      }

      try {
        await saveToken(response.token);
        router.replace('/home');
      } catch {
        throw new Error('Giriş başarılı, ancak oturum açılırken uygulama içi bir hata oluştu.');
      }
    } catch (error) {
      const message = getLoginErrorMessage(error);
      setErrorMessage(message);
      setHasError(true);
      Alert.alert('Giriş Hatası', message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* geri*/}
        <TouchableOpacity onPress={() => {
          if (navigation.canGoBack?.()) {
            navigation.goBack();
          } else {
            router.push('/');
          }
        }} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>

        {/* başlık */}
        <View style={styles.header}>
          <Text style={styles.title}>Giriş</Text>
          <Text style={styles.subtitle}>Hesabınıza giriş yapmak için bilgilerinizi doldurun.</Text>
        </View>

        {/* form */}
        <View style={styles.form}>
          
          {/* email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
          <View style={[styles.inputWrapper, hasError && styles.inputError, focusedField === 'email' && styles.inputFocused]}>
              <TextInput 
                style={styles.flexInput} 
                placeholder="Email adresiniz" 
                placeholderTextColor="#C7C7CD"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if(hasError) setHasError(false);
                }}
                autoCapitalize="none"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
              {hasError && (
                <Ionicons name="alert-circle-outline" size={22} color="#FF0000" style={{paddingRight: 10}} />
              )}
            </View>
          </View>

          {/* şifre */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şifre</Text>
            <View style={[styles.inputWrapper, hasError && styles.inputError, focusedField === 'password' && styles.inputFocused]}>
              <TextInput 
                style={styles.flexInput} 
                placeholder="Şifre girin" 
                placeholderTextColor="#C7C7CD"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if(hasError) setHasError(false);
                }}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color={hasError ? "#FF0000" : "#A1A1A1"} 
                />
              </TouchableOpacity>
            </View>
            {/* hata mesajı */}
            {hasError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
                {errorMessage.includes('Sunucuya') && (
                  <TouchableOpacity onPress={showNetworkHelp} style={styles.helpButton}>
                    <Text style={styles.helpButtonText}>Yardım</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* giriş */}
          <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.buttonDisabled]} 
            onPress={handleLogin} 
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Giriş</Text>}
          </TouchableOpacity>

          {/* şifremi unuttum */}
          <View style={styles.forgotPasswordRow}>
            <Text style={styles.forgotText}>Şifrenizi mi unuttunuz? </Text>
            <TouchableOpacity onPress={() => router.push('/forgetpassword')}>
              <Text style={styles.linkText}>Buraya Tıklayın</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ya da */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>YA DA</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialContainer}>
          <View style={[styles.socialButton, styles.socialButtonDisabled]}>
            <Ionicons name="logo-apple" size={24} color="#CCCCCC" />
            <Text style={[styles.socialButtonText, styles.socialButtonTextDisabled]}>Apple ile devam et</Text>
            <Text style={styles.comingSoonBadge}>Çok Yakında</Text>
          </View>

          <View style={[styles.socialButton, styles.socialButtonDisabled]}>
            <Ionicons name="logo-google" size={24} color="#CCCCCC" />
            <Text style={[styles.socialButtonText, styles.socialButtonTextDisabled]}>Google ile devam et</Text>
            <Text style={styles.comingSoonBadge}>Çok Yakında</Text>
          </View>
        </View>

        {/* üye ol */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Hesabınız yok mu? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.footerLink}>Üye Olun</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function getLoginErrorMessage(error: unknown) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (
      message.includes('network request failed') ||
      message.includes('failed to fetch') ||
      message.includes('load failed') ||
      message.includes('sunucuya bağlanılamadı')
    ) {
      return 'Sunucuya ulaşılamadı. Lütfen:\n• Backend servisinin 3004 portunda çalıştığını\n• Cihazınızın bilgisayarınızla aynı ağda olduğunu kontrol edin';
    }

    if (message.includes('invalid credentials') || message.includes('eşleşmiyor')) {
      return 'E-posta veya şifre yanlış. Lütfen kontrol edin.';
    }

    if (message.includes('timeout') || message.includes('time out')) {
      return 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
    }

    console.log('[Login] Error message:', error.message);
    return error.message;
  }

  return 'Giriş başarısız. Lütfen tekrar deneyin.';
}

function showNetworkHelp() {
  Alert.alert(
    'Ağ Bağlantısı Sorunları',
    NETWORK_TROUBLESHOOTING_STEPS,
    [
      { text: 'Tamam', onPress: () => {} },
    ],
    { cancelable: true }
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  scrollContent: { padding: 24 },
  backButton: { marginTop: 10, marginBottom: 20 },
  header: { marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 8 },
  form: { gap: 15 },
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
  inputError: {
    borderColor: '#FF0000', 
  },
  inputFocused: {
    borderColor: '#005CEE',
    backgroundColor: '#F5FAFF',
  },
  flexInput: { flex: 1, paddingHorizontal: 16, fontSize: 16, color: '#333' },
  eyeIcon: { paddingHorizontal: 16 },
  errorContainer: { marginTop: 4, gap: 8 },
  errorText: { color: '#FF0000', fontSize: 13 },
  helpButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
    alignSelf: 'flex-start',
  },
  helpButtonText: { color: '#856404', fontSize: 12, fontWeight: '600' },
  loginButton: {
    backgroundColor: '#005CEE',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  loginButtonText: { color: 'white', fontSize: 18, fontWeight: '600' },
  forgotPasswordRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  forgotText: { color: '#666', fontSize: 14 },
  linkText: { color: '#005CEE', fontSize: 14, fontWeight: 'bold' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8E8E8' },
  dividerText: { marginHorizontal: 10, color: '#999', fontSize: 12, fontWeight: 'bold' },
  socialContainer: { gap: 12 },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    gap: 10,
  },
  socialButtonDisabled: {
    backgroundColor: '#F8F8F8',
    borderColor: '#E0E0E0',
    opacity: 0.6,
  },
  socialButtonText: { fontSize: 16, fontWeight: '500', color: '#333' },
  socialButtonTextDisabled: { color: '#999' },
  comingSoonBadge: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
    marginLeft: 'auto',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40, marginBottom: 40 },
  footerText: { color: '#666', fontSize: 14 },
  footerLink: { color: '#005CEE', fontSize: 14, fontWeight: 'bold' },
});