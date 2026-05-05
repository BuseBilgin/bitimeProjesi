import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 

export default function Onboarding1() {
  const router = useRouter();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (navigation.canGoBack?.()) {
            navigation.goBack();
          } else {
            router.push('/');
          }
        }}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/signup')} style={styles.skipBtn}>
         <Text style={styles.skipText}>Atla</Text>
        </TouchableOpacity>
      </View>

      

      <View style={styles.content}>
     
        <Image 
          source={require('../assets/images/doctor.png')} 
          style={styles.image}
          resizeMode="contain" 
        />
        
        <View style={styles.pagination}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <Text style={styles.title}>Sağlığınızın kontrolü sizin elinizde</Text>
        <Text style={styles.desc}>İlaç hatırlatıcılarıyla sağlığınızın kontrolünü elinize alın.</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/onboarding2')}>
        <Text style={styles.buttonText}>Sonraki</Text>
      </TouchableOpacity>
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

  skipBtn: 
  { 
    alignSelf: 'flex-end', 
   
  },

  skipText: 
  { 
    color: '#666', 
    fontSize: 16,
  },

  content: 
  { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },

  header: { 
    marginTop: 40,
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
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

  button: 
  { 
    backgroundColor: '#005CEE', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginBottom: 20 
  },

  buttonText: 
  { 
    color: 'white', 
  fontSize: 18, 
  fontWeight: '600' 
  },

  image: {
    width: 250,  
    height: 250, 
    resizeMode: 'contain',
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
  
});