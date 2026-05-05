import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function OTP() {
  const navigation = useNavigation();
  const [code, setCode] = useState(['', '', '', '', '']); 

  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    
    if (text.length !== 0 && index < 4) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    
    if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
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
            router.push('/forgetpassword');
          }
        }} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>

        {/* başlık */}
        <View style={styles.header}>
          <Text style={styles.title}>Kodu Girin</Text>
          <Text style={styles.subtitle}>
            E-posta adresinize bir doğrulama kodu gönderdik.{"\n"}
            <Text style={styles.emailText}>ayse.yilmaz@gmail.com </Text> 
            <TouchableOpacity onPress={() => {
              if (navigation.canGoBack?.()) {
                navigation.goBack();
              } else {
                router.push('/forgetpassword');
              }
            }} style={styles.editButton}>
              <Text style={styles.editLink}>Düzenle</Text>
            </TouchableOpacity>
          </Text>
        </View>

       
        <View style={styles.otpContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el) => { inputs.current[index] = el; }} 
              style={styles.otpInput}
              keyboardType="number-pad"
              maxLength={1}
              selectionColor="#005CEE"
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              value={digit}
            />
          ))}
        </View>

        
        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Kod almadınız mı? </Text>
          <TouchableOpacity onPress={() => alert("Kod tekrar gönderildi!")}>
            <Text style={styles.resendLink}>Kodu yeniden gönder</Text>
          </TouchableOpacity>
        </View>


        <TouchableOpacity 
        style={styles.continueButton}
        onPress={ () => {
           
            if (code.join('').length === 5) {
            router.push('/newpassword');
            } else {
            alert("Lütfen 5 haneli kodu tam giriniz.");
            }
        }}
        >
        <Text style={styles.continueButtonText}>Devam Et</Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'white' 
  },
  content: { 
    padding: 24, 
    flex: 1 
  },
  backButton: { 
    marginTop: 10, 
    marginBottom: 20 
  },
  header: { 
    marginBottom: 30 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#666', 
    marginTop: 8, 
    lineHeight: 22 
  },
  emailText: { 
    color: '#333', 
    fontWeight: '500' 
  },
  editButton: {
   
  },
  editLink: { 
    color: '#005CEE', 
    fontWeight: 'bold',
    textDecorationLine: 'underline' 
  },
  otpContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginVertical: 30 
  },
  otpInput: {
    width: (width - 100) / 5, 
    height: 60,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  resendRow: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginBottom: 40 
  },
  resendText: { 
    color: '#666', 
    fontSize: 14 
  },
  resendLink: { 
    color: '#005CEE', 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
  continueButton: {
    backgroundColor: '#005CEE',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 'auto', 
    marginBottom: 20
  },
  continueButtonText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: '600' 
  },
});