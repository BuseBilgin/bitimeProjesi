import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 

export default function Onboarding3() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (navigation.canGoBack?.()) {
            navigation.goBack();
          } else {
            router.push('/onboarding2');
          }
        }}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
       
        <View style={styles.imageContainer}>
         
          <View style={styles.circleGraphic}>
          <Image 
          source={require('../assets/images/onboarding3.png')} 
          style={styles.image}
          resizeMode="contain" 
        />
          </View>
        </View>
        
       
        <View style={styles.pagination}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
        </View>

        <Text style={styles.title}>Kendiniz, aileniz ve arkadaşlarınız için</Text>
        <Text style={styles.desc}>
          Profiller arasında sorunsuz geçiş yaparak, önem verdiğiniz herkesin ilaçlarını kolayca yönetin.
        </Text>
      </View>

     
      <View style={styles.footer}>
      <TouchableOpacity 
        style={styles.primaryButton} 
        onPress={() => router.push('/signup')} 
      >
        <Text style={styles.primaryButtonText}>Hesap Oluştur</Text>
      </TouchableOpacity>

      <TouchableOpacity 
      style={styles.secondaryButton} 
      onPress={() => router.push('/login')} 
    >
      <Text style={styles.secondaryButtonText}>Giriş</Text>
    </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: 
    { 
      flex: 1, 
      backgroundColor: 'white', 
      padding: 24 
    },

    header: 
    { 
      marginTop: 40 
    },

    content: 
    { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },

  imageContainer: 
  { 
    marginBottom: 40, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },

  circleGraphic: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E9F5'
  },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D1D1', 
    marginHorizontal: 4,
  },
  
  activeDot: {
    width: 24, 
    backgroundColor: '#005CEE', 
  },

  title: 
  { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    color: '#333' 
  },

  desc: 
  { 
    fontSize: 16, 
    textAlign: 'center', 
    color: '#666', 
    marginTop: 10 
  },

  footer: 
  { 
    gap: 12, 
    marginBottom: 20 
  },

  primaryButton: { 
    backgroundColor: '#005CEE', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center' 
  },

  image: {
    width: 300,  
    height: 300, 
    resizeMode: 'contain', 
    marginBottom: 10
  },

  primaryButtonText: 
  { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: '600' 
  },

  secondaryButton: { 
    backgroundColor: '#F8F9FA', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE'
  },

  secondaryButtonText: 
  { 
    color: '#AAAAAA', 
    fontSize: 18, 
    fontWeight: '600' 
 }
 
});