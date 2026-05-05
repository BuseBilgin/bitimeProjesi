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
import { registerRequest } from '@/src/lib/api';
import { NETWORK_TROUBLESHOOTING_STEPS } from '@/src/lib/debug';

export default function SignUp() {
  const navigation = useNavigation();
 
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
 
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

 
  const validateEmail = (text: string) => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    return reg.test(text);
  };

  const handleSignUp = async () => {
    // 1. Boş Alan Kontrolü
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      triggerError("Lütfen tüm alanları eksiksiz doldurun.");
      return;
    }

    // 2. Email Format Kontrolü
    if (!validateEmail(email)) {
      triggerError("Geçerli bir e-posta adresi giriniz.");
      return;
    }

    // 3. Şifre Uzunluk Kontrolü
    if (password.length < 6) {
      triggerError("Şifreniz en az 6 karakter olmalıdır.");
      return;
    }

    try {
      setIsLoading(true);
      await registerRequest(fullName.trim(), email.trim(), password);

      setShowError(false);
      setIsSuccess(true);
      
      // Form alanlarını temizle
      setFullName('');
      setEmail('');
      setPassword('');
      setShowPassword(false);

      setTimeout(() => {
        setIsSuccess(false);
        router.replace('/login');
      }, 1500);
    } catch (error) {
      let message = 'Kayıt sırasında bir hata oluştu.';
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('already exists')) {
          message = 'Bu e-posta adresi zaten kayıtlı. Lütfen başka bir e-posta kullanın.';
        } else if (errorMsg.includes('network') || errorMsg.includes('sunucuya')) {
          message = 'Sunucuya bağlanılamadı. Backend servisinin çalıştığını kontrol edin.';
        } else if (errorMsg.includes('timeout') || errorMsg.includes('time out')) {
          message = 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
        } else {
          message = error.message;
        }
      }
      
      console.log('[SignUp] Error:', message);
      triggerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // hata kutusunu tetikleyen yardımcı fonksiyon
  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setShowError(true);
    setIsSuccess(false);
    // hata kutusunu  kapat
    setTimeout(() => setShowError(false), 3000);
  };

  return (
    <SafeAreaView style={styles.container}>
      
      
      {isSuccess && (
        <View style={styles.successBox}>
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark-sharp" size={24} color="#28A745" />
          </View>
          <View style={styles.successTextContainer}>
            <Text style={styles.successTitle}>Kayıt işlemi tamamlandı!</Text>
            <Text style={styles.successSubTitle}>Hesap başarıyla oluşturuldu!</Text>
          </View>
        </View>
      )}

      
      {showError && (
        <View style={[styles.successBox, styles.errorBox]}>
          <View style={[styles.successIconCircle, styles.errorIconCircle]}>
            <Ionicons name="alert-circle" size={24} color="#DC3545" />
          </View>
          <View style={styles.successTextContainer}>
            <Text style={[styles.successTitle, styles.errorTitleText]}>Hata oluştu!</Text>
            <Text style={[styles.successSubTitle, styles.errorTitleText]}>{errorMessage}</Text>
            {errorMessage.includes('Sunucuya') && (
              <TouchableOpacity onPress={showNetworkHelp} style={styles.helpButtonInBox}>
                <Text style={styles.helpButtonTextInBox}>Yardım Amaçlı İpuçları Göster</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
     
        <TouchableOpacity onPress={() => {
          if (navigation.canGoBack?.()) {
            navigation.goBack();
          } else {
            router.push('/login');
          }
        }} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>

    
        <View style={styles.header}>
          <Text style={styles.title}>Üye Ol</Text>
          <Text style={styles.subtitle}>Hesabınızı oluşturmak için bilgileri doldurun.</Text>
        </View>

    
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ad-Soyad</Text>
            <TextInput 
              style={[styles.input, focusedField === 'name' && styles.inputFocused]} 
              placeholder="Ayşe Yılmaz" 
              placeholderTextColor="#C7C7CD" 
              value={fullName}
              onChangeText={setFullName}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput 
              style={[styles.input, focusedField === 'email' && styles.inputFocused]} 
              placeholder="ayse.yilmaz@gmail.com" 
              placeholderTextColor="#C7C7CD"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şifre</Text>
            <View style={[styles.passwordInputWrapper, focusedField === 'password' && styles.inputFocused]}>
              <TextInput 
                style={styles.flexInput} 
                placeholder="En az 6 karakter" 
                placeholderTextColor="#C7C7CD"
                secureTextEntry={!showPassword} 
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)} 
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color="#A1A1A1" 
                />
              </TouchableOpacity>
            </View>
            {password.length > 0 && (
              <View style={styles.passwordStrengthContainer}>
                <View style={[
                  styles.passwordStrengthBar,
                  { 
                    width: password.length >= 6 ? '100%' : `${(password.length / 6) * 100}%`,
                    backgroundColor: password.length >= 6 ? '#28A745' : password.length >= 4 ? '#FFC107' : '#DC3545'
                  }
                ]} />
                <Text style={styles.passwordStrengthText}>
                  {password.length >= 6 ? '✓ Güçlü' : password.length >= 4 ? '△ Orta' : '✗ Zayıf'}
                </Text>
              </View>
            )}
          </View>

         
          <TouchableOpacity 
            style={[styles.signUpButton, isLoading && styles.buttonDisabled]} 
            onPress={handleSignUp} 
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signUpButtonText}>Hesap Oluştur</Text>}
          </TouchableOpacity>

          <Text style={styles.termsText}>
            Kayıt olarak <Text style={styles.linkText}>Hizmet Şartları</Text> ve <Text style={styles.linkText}>Gizlilik Politikası</Text> kabul etmiş olursunuz.
          </Text>
        </View>

        
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

       
        <View style={styles.footer}>
          <Text style={styles.footerText}>Zaten hesabınız var mı? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.footerLink}>Giriş Yapın</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
  

  successBox: {
    position: 'absolute', top: 50, left: 20, right: 20,
    backgroundColor: '#EFFFF4', borderWidth: 1, borderColor: '#28A745',
    borderRadius: 15, padding: 15, flexDirection: 'row', alignItems: 'center',
    zIndex: 1000, elevation: 5, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  successIconCircle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'white',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
    borderWidth: 2, borderColor: '#28A745',
  },
  successTextContainer: { flex: 1 },
  successTitle: { fontSize: 15, fontWeight: 'bold', color: '#155724' },
  successSubTitle: { fontSize: 13, color: '#155724' },

  
  errorBox: { backgroundColor: '#FFF5F5', borderColor: '#DC3545' },
  errorIconCircle: { borderColor: '#DC3545' },
  errorTitleText: { color: '#DC3545' },
  helpButtonInBox: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FFF3CD',
    borderRadius: 6,
    borderLeftWidth: 2,
    borderLeftColor: '#FFC107',
    alignSelf: 'flex-start',
  },
  helpButtonTextInBox: { color: '#856404', fontSize: 11, fontWeight: '600' },

  backButton: { marginTop: 10, marginBottom: 20 },
  header: { marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 8 },
  form: { gap: 15 },
  inputGroup: { gap: 8 },
  label: { fontSize: 16, fontWeight: '600', color: '#333' },
  input: {
    borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 12,
    padding: 16, fontSize: 16, backgroundColor: '#FAFAFA',
  },
  inputFocused: {
    borderColor: '#005CEE',
    backgroundColor: '#F5FAFF',
  },
  passwordInputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA',
    borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 12, height: 56,
  },
  flexInput: { flex: 1, paddingHorizontal: 16, fontSize: 16 },
  eyeIcon: { paddingHorizontal: 16 },
  passwordStrengthContainer: {
    marginTop: 8,
    gap: 4,
  },
  passwordStrengthBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E8E8E8',
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  signUpButton: {
    backgroundColor: '#005CEE', padding: 18, borderRadius: 15,
    alignItems: 'center', marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  signUpButtonText: { color: 'white', fontSize: 18, fontWeight: '600' },
  termsText: { textAlign: 'center', color: '#666', fontSize: 12, marginTop: 5 },
  linkText: { color: '#005CEE', fontWeight: 'bold' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8E8E8' },
  dividerText: { marginHorizontal: 10, color: '#999', fontSize: 12, fontWeight: 'bold' },
  socialContainer: { gap: 12 },
  socialButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E8E8E8', gap: 10,
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